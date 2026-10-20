import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Script } from "node:vm";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { CreditLimitError, GenerationBlockedError, GenerationFailedError } from "../src/errors.js";
import type { FlowAutomation, FlowAutomationRunInput } from "../src/flow/types.js";
import { planBatch, renderFilm } from "../src/studio/pipeline.js";
import { createProject, loadFilm, loadState, saveFilm, slugify } from "../src/studio/project.js";
import { buildScenePrompt, parseScript, scenesFromScript, videoShotText } from "../src/studio/script.js";
import { startDashboard } from "../src/studio/server.js";
import { DASHBOARD_HTML } from "../src/studio/dashboard.js";
import { GENRES } from "../src/studio/genres.js";
import { buildStoryChunkPrompt } from "../src/studio/breakdown.js";
import { DURATION_PLACEHOLDER } from "../src/studio/prompts.js";

const SCRIPT = `SCENE 1:
Min-woo steps out of a car in the rain.

SCENE 2: [CUT]
Seo-yeon drops her umbrella.

Scene 3 -
Min-woo runs to her. Seo-yeon smiles.`;

describe("script parsing", () => {
  it("splits SCENE sections and strips cut markers", () => {
    const scenes = parseScript(SCRIPT);
    expect(scenes.map((scene) => scene.number)).toEqual([1, 2, 3]);
    expect(scenes[1]).toMatchObject({ prompt: "Seo-yeon drops her umbrella.", cut: true });
    expect(scenes[0].cut).toBe(false);
  });

  it("accepts Vietnamese headers", () => {
    const scenes = parseScript("CẢNH 1: Một.\nPHÂN CẢNH 2: Hai [CẮT CẢNH]");
    expect(scenes).toHaveLength(2);
    expect(scenes[1]).toMatchObject({ prompt: "Hai", cut: true });
  });

  it("detects characters by name or alias", () => {
    const scenes = scenesFromScript(SCRIPT, [
      { name: "Minwoo", aliases: ["Min-woo"], description: "28, beige coat", images: [] },
      { name: "Seoyeon", aliases: ["Seo-yeon"], description: "", images: [] }
    ]);
    expect(scenes.map((scene) => scene.characters)).toEqual([["Minwoo"], ["Seoyeon"], ["Minwoo", "Seoyeon"]]);
    expect(scenes.map((scene) => scene.id)).toEqual(["scene-01", "scene-02", "scene-03"]);
  });

  it("injects style and cast descriptions into the Flow prompt", () => {
    const prompt = buildScenePrompt(
      {
        title: "t", ratio: "16:9", duration: 8, continuity: true, style: "Korean drama, 35mm",
        characters: [{ name: "Minwoo", description: "28, beige coat", aliases: [], images: [] }],
        scenes: []
      },
      { id: "scene-01", prompt: "He walks.", characters: ["Minwoo"], cut: false }
    );
    expect(prompt).toBe("Korean drama, 35mm\nCharacters — Minwoo: 28, beige coat.\nHe walks.");
  });

  it("slugifies Vietnamese titles", () => {
    expect(slugify("Mùa Thu Seoul!")).toBe("mua-thu-seoul");
  });
});

describe("render pipeline", () => {
  let root: string;

  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), "film-studio-"));
    process.env.FILM_HOME = root;
  });

  afterEach(async () => {
    delete process.env.FILM_HOME;
    await rm(root, { recursive: true, force: true });
  });

  async function setup() {
    const { paths } = await createProject("Test Film");
    const film = await loadFilm(paths);
    film.characters = [{ name: "Minwoo", aliases: ["Min-woo"], description: "beige coat", images: [], flowName: "Minwoo-Flow" }];
    film.scenes = scenesFromScript(SCRIPT, film.characters);
    await saveFilm(paths, film);
    return paths;
  }

  function fakeFlow(calls: FlowAutomationRunInput[], failOn?: string): FlowAutomation {
    return {
      async runJob(input) {
        calls.push(input);
        if (input.job.id === failOn) throw new Error("boom");
        const video = join(input.outDir, `${input.job.id}-001.mp4`);
        await mkdir(input.outDir, { recursive: true });
        await writeFile(video, `video:${input.job.id}:${input.job.prompt}`);
        return { jobId: input.job.id, artifacts: [{ path: video, metadataPath: `${video}.json` }], flowUrl: "https://flow.test" };
      }
    };
  }

  const fakeExtract = async (_video: string, png: string): Promise<void> => {
    await writeFile(png, "png");
  };

  it("keeps film.json fields it does not know when saving", async () => {
    const { paths } = await createProject("Future Film");
    const raw = JSON.parse(await readFile(paths.film, "utf8"));
    await writeFile(paths.film, JSON.stringify({ ...raw, futureSetting: "keep me" }));
    await saveFilm(paths, await loadFilm(paths));
    expect(JSON.parse(await readFile(paths.film, "utf8")).futureSetting).toBe("keep me");
  });

  it("chains last frames into the next scene except across a hard cut", async () => {
    const paths = await setup();
    const calls: FlowAutomationRunInput[] = [];
    await renderFilm(paths, { automation: fakeFlow(calls), extractFrame: fakeExtract });

    const starts = calls.map((call) => (call.job.type === "video" ? call.job.startFrame : undefined));
    expect(starts[0]).toBeUndefined();
    expect(starts[1]).toBeUndefined(); // scene-02 is a [CUT]
    expect(starts[2]).toMatch(/scene-02\.last\.png$/);

    const first = calls[0].job;
    expect(first.character).toEqual(["Minwoo-Flow"]);
    // scene-03 also has Minwoo but continues from scene-02's last frame: Flow's Frames mode
    // cannot take characters, so the frame carries the look instead.
    const third = calls[2].job;
    expect(third.character).toEqual([]);
    const state = await loadState(paths);
    expect(Object.values(state.scenes).every((scene) => scene.status === "done")).toBe(true);
  });

  it("continues in Ingredients mode with the cast's Flow characters when continuityMode is ingredients", async () => {
    const paths = await setup();
    const film = await loadFilm(paths);
    film.continuityMode = "ingredients";
    await saveFilm(paths, film);
    const calls: FlowAutomationRunInput[] = [];
    await renderFilm(paths, { automation: fakeFlow(calls), extractFrame: fakeExtract });

    const third = calls[2].job;
    if (third.type !== "video") throw new Error("expected a video job");
    expect(third.startFrame).toBeUndefined();
    expect(third.character).toEqual(["Minwoo-Flow"]);
    expect(third.ingredients).toHaveLength(1);
    expect(third.ingredients[0]).toMatch(/scene-02\.last\.png$/);
    expect(third.prompt).toContain("opens on the reference image");

    // A continuing scene without Flow characters keeps the exact frame cut.
    film.characters[0].flowName = undefined;
    await saveFilm(paths, film);
    const plain: FlowAutomationRunInput[] = [];
    await renderFilm(paths, { automation: fakeFlow(plain), extractFrame: fakeExtract, force: true });
    const continued = plain[2].job;
    if (continued.type !== "video") throw new Error("expected a video job");
    expect(continued.startFrame).toMatch(/scene-02\.last\.png$/);
    expect(continued.ingredients).toEqual([]);
  });

  it("resumes: skips finished scenes and retries the failed one", async () => {
    const paths = await setup();
    const first: FlowAutomationRunInput[] = [];
    await expect(renderFilm(paths, { automation: fakeFlow(first, "scene-02"), extractFrame: fakeExtract })).rejects.toThrow("boom");
    expect(first.map((call) => call.job.id)).toEqual(["scene-01", "scene-02"]);
    expect((await loadState(paths)).scenes["scene-02"]).toMatchObject({ status: "failed", error: "boom" });

    const second: FlowAutomationRunInput[] = [];
    await renderFilm(paths, { automation: fakeFlow(second), extractFrame: fakeExtract });
    expect(second.map((call) => call.job.id)).toEqual(["scene-02", "scene-03"]);
  });

  // A fake Flow whose behaviour per call is scripted: `fail(input, n)` may throw for the n-th call
  // of that scene id (0-based); otherwise it "renders" a video file.
  function scriptedFlow(calls: FlowAutomationRunInput[], fail: (input: FlowAutomationRunInput, n: number) => void): FlowAutomation {
    const seen = new Map<string, number>();
    return {
      async runJob(input) {
        calls.push(input);
        const n = seen.get(input.job.id) ?? 0;
        seen.set(input.job.id, n + 1);
        fail(input, n);
        const video = join(input.outDir, `${input.job.id}-001.mp4`);
        await mkdir(input.outDir, { recursive: true });
        await writeFile(video, `video:${input.job.id}:${input.job.prompt}`);
        return { jobId: input.job.id, artifacts: [{ path: video, metadataPath: `${video}.json` }], flowUrl: "https://flow.test" };
      }
    };
  }

  const noSleep = async (): Promise<void> => undefined;

  it("does not re-render a policy-blocked prompt", async () => {
    const paths = await setup();
    const calls: FlowAutomationRunInput[] = [];
    const flow = scriptedFlow(calls, (input) => {
      if (input.job.id === "scene-01") throw new GenerationBlockedError("policy");
    });
    await expect(renderFilm(paths, { automation: flow, extractFrame: fakeExtract, sleep: noSleep })).rejects.toThrow("blocked");
    expect(calls.map((call) => call.job.id)).toEqual(["scene-01"]);
    expect((await loadState(paths)).scenes["scene-01"].status).toBe("failed");
  });

  it("retries transient failures with the configured delay, up to maxRetries", async () => {
    const paths = await setup();
    const calls: FlowAutomationRunInput[] = [];
    const waits: number[] = [];
    const flow = scriptedFlow(calls, (input, n) => {
      if (input.job.id === "scene-01" && n === 0) throw new GenerationFailedError("timed out");
      if (input.job.id === "scene-02") throw new GenerationFailedError("always");
    });
    await expect(
      renderFilm(paths, {
        automation: flow,
        extractFrame: fakeExtract,
        maxRetries: 2,
        retryDelayMs: 1234,
        sleep: async (ms) => void waits.push(ms)
      })
    ).rejects.toThrow("always");
    expect(calls.map((call) => call.job.id)).toEqual(["scene-01", "scene-01", "scene-02", "scene-02", "scene-02"]);
    expect(waits).toEqual([1234, 1234, 1234]);
    expect((await loadState(paths)).scenes["scene-01"].status).toBe("done");
  });

  it("continueOnError skips only the scenes chained to a failed one", async () => {
    const paths = await setup();
    const calls: FlowAutomationRunInput[] = [];
    const flow = scriptedFlow(calls, (input) => {
      if (input.job.id === "scene-02") throw new GenerationBlockedError("policy");
    });
    const result = await renderFilm(paths, { automation: flow, extractFrame: fakeExtract, continueOnError: true, sleep: noSleep });
    expect(result.failed).toEqual(["scene-02"]);
    expect(result.skipped).toEqual(["scene-03"]); // scene-03 continues from scene-02
    expect(calls.map((call) => call.job.id)).toEqual(["scene-01", "scene-02"]);

    // scene-01 failing does not stop scene-02, which starts after a hard cut.
    const paths2 = (await createProject("Second Film")).paths;
    const film = await loadFilm(paths);
    await saveFilm(paths2, { ...film, title: "Second Film" });
    const calls2: FlowAutomationRunInput[] = [];
    const flow2 = scriptedFlow(calls2, (input) => {
      if (input.job.id === "scene-01") throw new Error("boom");
    });
    const result2 = await renderFilm(paths2, { automation: flow2, extractFrame: fakeExtract, continueOnError: true, sleep: noSleep });
    expect(result2.failed).toEqual(["scene-01"]);
    expect(result2.skipped).toEqual([]);
    expect(calls2.map((call) => call.job.id)).toEqual(["scene-01", "scene-02", "scene-03"]);
  });

  it("stops the whole run on credit errors even with continueOnError", async () => {
    const paths = await setup();
    const calls: FlowAutomationRunInput[] = [];
    const flow = scriptedFlow(calls, () => {
      throw new CreditLimitError("quota");
    });
    await expect(
      renderFilm(paths, { automation: flow, extractFrame: fakeExtract, continueOnError: true, sleep: noSleep })
    ).rejects.toThrow("quota");
    expect(calls).toHaveLength(1);
  });

  it("waits while the project is paused", async () => {
    const paths = await setup();
    const film = await loadFilm(paths);
    await saveFilm(paths, { ...film, isPaused: true });
    const calls: FlowAutomationRunInput[] = [];
    const logs: string[] = [];
    const sleep = async (): Promise<void> => {
      expect(calls).toHaveLength(0);
      const current = await loadFilm(paths);
      await saveFilm(paths, { ...current, isPaused: false });
    };
    await renderFilm(paths, { automation: scriptedFlow(calls, () => undefined), extractFrame: fakeExtract, sleep, log: (m) => logs.push(m) });
    expect(logs.some((line) => line.includes("paused"))).toBe(true);
    expect(calls).toHaveLength(3);
  });

  it("applies film.json edits made while an earlier scene renders", async () => {
    const paths = await setup();
    const calls: FlowAutomationRunInput[] = [];
    const flow: FlowAutomation = {
      async runJob(input) {
        if (input.job.id === "scene-01") {
          const film = await loadFilm(paths);
          film.scenes[2].prompt = "EDITED DURING RENDER";
          await saveFilm(paths, film);
        }
        return scriptedFlow(calls, () => undefined).runJob(input);
      }
    };
    await renderFilm(paths, { automation: flow, extractFrame: fakeExtract });
    expect(calls[2].job.prompt).toContain("EDITED DURING RENDER");
  });

  it("uses render settings from film.json", async () => {
    const paths = await setup();
    const film = await loadFilm(paths);
    await saveFilm(paths, { ...film, renderTimeout: 900, maxRetries: 0 });
    const calls: FlowAutomationRunInput[] = [];
    const flow = scriptedFlow(calls, (input) => {
      if (input.job.id === "scene-02") throw new GenerationFailedError("flaky");
    });
    await expect(renderFilm(paths, { automation: flow, extractFrame: fakeExtract, sleep: noSleep })).rejects.toThrow("flaky");
    expect(calls[0].job.timeout).toBe(900);
    expect(calls.filter((call) => call.job.id === "scene-02")).toHaveLength(1); // maxRetries 0
  });

  it("re-extracts a missing last frame instead of dropping continuity", async () => {
    const paths = await setup();
    const extracted: string[] = [];
    const extract = async (video: string, png: string): Promise<void> => {
      extracted.push(video);
      await writeFile(png, "png");
    };
    await renderFilm(paths, { automation: scriptedFlow([], () => undefined), extractFrame: extract });
    // Simulate an earlier run whose frame extraction failed for scene-02.
    const state = await loadState(paths);
    await rm(join(paths.dir, state.scenes["scene-02"].lastFrame as string));
    extracted.length = 0;

    const calls: FlowAutomationRunInput[] = [];
    await renderFilm(paths, { automation: scriptedFlow(calls, () => undefined), extractFrame: extract, only: ["scene-03"], force: true });
    expect(extracted[0]).toMatch(/scene-02-001\.mp4$/);
    const start = calls[0].job.type === "video" ? calls[0].job.startFrame : undefined;
    expect(start).toMatch(/scene-02\.last\.png$/);
  });

  it("fails a scene whose download is identical to another scene's clip", async () => {
    const paths = await setup();
    const sameBytes: FlowAutomation = {
      async runJob(input) {
        const video = join(input.outDir, `${input.job.id}-001.mp4`);
        await mkdir(input.outDir, { recursive: true });
        await writeFile(video, "the same old clip");
        return { jobId: input.job.id, artifacts: [{ path: video, metadataPath: `${video}.json` }], flowUrl: "https://flow.test" };
      }
    };
    await expect(renderFilm(paths, { automation: sameBytes, extractFrame: fakeExtract, sleep: noSleep })).rejects.toThrow(
      "identical to scene-01"
    );
    const state = await loadState(paths);
    expect(state.scenes["scene-01"].status).toBe("done");
    expect(state.scenes["scene-02"].status).toBe("failed");
  });

  it("remembers the Flow project the first scene created and reuses it", async () => {
    const paths = await setup();
    const projectId = "1a7565fa-d1c2-4536-b58c-7cff5c3b0d3d";
    const calls: FlowAutomationRunInput[] = [];
    const flow: FlowAutomation = {
      async runJob(input) {
        const result = await scriptedFlow(calls, () => undefined).runJob(input);
        return { ...result, flowUrl: `https://flow.google.com/project/${projectId}/edit/0d171ba5-4491-45be-b16e-73225531baad` };
      }
    };
    await renderFilm(paths, { automation: flow, extractFrame: fakeExtract });
    expect(calls.map((call) => call.job.project)).toEqual([undefined, projectId, projectId]);
    expect((await loadFilm(paths)).flowProjectId).toBe(projectId);
  });

  it("rejects unknown scene ids", async () => {
    const paths = await setup();
    await expect(renderFilm(paths, { automation: fakeFlow([]), only: ["nope"] })).rejects.toThrow("Unknown scene");
  });

  it("exports a batch pipeline", async () => {
    const paths = await setup();
    const yaml = await planBatch(paths);
    expect(yaml).toContain("id: scene-01");
    expect(yaml).toContain("type: video");
    expect(yaml).not.toContain("startFrame");
  });

  it("starts a project from a genre preset", async () => {
    const { paths } = await createProject("Truc Lam", undefined, "wuxia");
    const film = await loadFilm(paths);
    expect(film.genre).toBe("wuxia");
    expect(film.style).toBe(GENRES.wuxia.style);
    expect(film.storyPrompt).toBe(GENRES.wuxia.storyPrompt);
    expect(film.directionalPrompt).toBe(GENRES.wuxia.directionalPrompt);

    // The default genre stores only its style, so it keeps following the default prompts.
    const drama = await loadFilm((await createProject("Plain")).paths);
    expect(drama.genre).toBe("drama");
    expect(drama.style).toBe(GENRES.drama.style);
    expect(drama.storyPrompt).toBeUndefined();
    expect(drama.directionalPrompt).toBeUndefined();

    // Every genre's story prompt keeps the scene format the script parser reads.
    for (const preset of Object.values(GENRES)) {
      const prompt = buildStoryChunkPrompt("chunk", preset.storyPrompt, 8);
      expect(prompt).toContain("SCENE <số>:");
      expect(prompt).not.toContain(DURATION_PLACEHOLDER);
    }
  });

  it("parses the wuxia example script and finds its cast", async () => {
    const script = await readFile("examples/kiem-hiep-truc-lam.md", "utf8");
    const cast = [
      { name: "Lăng Phong", aliases: [], description: "", images: [] },
      { name: "Mộ Dung Tuyết", aliases: [], description: "", images: [] }
    ];
    const scenes = scenesFromScript(script, cast);
    expect(scenes).toHaveLength(7);
    expect(scenes.map((scene) => scene.cut)).toEqual([false, false, false, false, false, true, false]);
    expect(scenes[0].characters).toEqual(["Lăng Phong"]);
    expect(scenes[1].characters).toEqual(["Lăng Phong", "Mộ Dung Tuyết"]);
    expect(scenes[5].characters).toEqual(["Mộ Dung Tuyết"]);
  });

  it("sends only the Shot text of a structured scene to the video model", () => {
    const [scene] = parseScript(`SCENE 1:
Nhân vật: Lăng Phong
Bối cảnh: Rừng trúc dưới mưa
Shot: (Wide shot) Misty bamboo forest. Lăng Phong waits. Lăng Phong: "Ai đó?"`);
    expect(videoShotText(scene.prompt)).toBe('(Wide shot) Misty bamboo forest. Lăng Phong waits. Lăng Phong: "Ai đó?"');
    // Free-form prompts, and prose that merely mentions a label word, pass through unchanged.
    expect(videoShotText("(Wide shot) Rain. Location: unknown.")).toBe("(Wide shot) Rain. Location: unknown.");
  });

  it("ships dashboard JavaScript that parses", () => {
    // A single missing brace once made the browser drop the whole script, so no button worked.
    const scripts = [...DASHBOARD_HTML.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((match) => match[1]);
    expect(scripts.length).toBeGreaterThan(0);
    for (const source of scripts) expect(() => new Script(source)).not.toThrow();
  });

  it("serves the dashboard only to its own origin and confines media to renders/", async () => {
    const paths = await setup();
    await mkdir(paths.renders, { recursive: true });
    await writeFile(join(paths.renders, "a.mp4"), "video");
    await writeFile(paths.film, await readFile(paths.film, "utf8"));
    const dash = await startDashboard(0);
    try {
      const list = await fetch(`${dash.url}/api/projects`);
      expect((await list.json()) as unknown[]).toHaveLength(1);


      const genres = (await (await fetch(`${dash.url}/api/genres`)).json()) as Array<{ id: string }>;
      expect(genres.map((genre) => genre.id)).toEqual(Object.keys(GENRES));
      const local = { "content-type": "application/json", origin: dash.url };
      const bad = await fetch(`${dash.url}/api/projects`, { method: "POST", headers: local, body: JSON.stringify({ title: "X", genre: "noir" }) });
      expect(bad.status).toBe(400);
      const created = await fetch(`${dash.url}/api/projects`, { method: "POST", headers: local, body: JSON.stringify({ title: "Kiem", genre: "wuxia" }) });
      expect(created.status).toBe(201);
      const detail = (await (await fetch(`${dash.url}/api/projects/kiem`)).json()) as { defaults: { style: string } };
      expect(detail.defaults.style).toBe(GENRES.wuxia.style);

      const media = await fetch(`${dash.url}/media/test-film/renders/a.mp4`);
      expect(media.status).toBe(200);
      const secret = await fetch(`${dash.url}/media/test-film/film.json`);
      expect(secret.status).toBe(404);

      const foreign = await fetch(`${dash.url}/api/projects/test-film/render`, { method: "POST", headers: { origin: "http://evil.example" } });
      expect(foreign.status).toBe(403);
    } finally {
      await dash.close();
    }
  });
});
