import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { FlowAutomation, FlowAutomationRunInput } from "../src/flow/types.js";
import { planBatch, renderFilm } from "../src/studio/pipeline.js";
import { createProject, loadFilm, loadState, saveFilm, slugify } from "../src/studio/project.js";
import { buildScenePrompt, parseScript, scenesFromScript } from "../src/studio/script.js";
import { startDashboard } from "../src/studio/server.js";

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
        await writeFile(video, "video");
        return { jobId: input.job.id, artifacts: [{ path: video, metadataPath: `${video}.json` }], flowUrl: "https://flow.test" };
      }
    };
  }

  const fakeExtract = async (_video: string, png: string): Promise<void> => {
    await writeFile(png, "png");
  };

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
    const state = await loadState(paths);
    expect(Object.values(state.scenes).every((scene) => scene.status === "done")).toBe(true);
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

  it("serves the dashboard only to its own origin and confines media to renders/", async () => {
    const paths = await setup();
    await mkdir(paths.renders, { recursive: true });
    await writeFile(join(paths.renders, "a.mp4"), "video");
    await writeFile(paths.film, await readFile(paths.film, "utf8"));
    const dash = await startDashboard(0);
    try {
      const list = await fetch(`${dash.url}/api/projects`);
      expect((await list.json()) as unknown[]).toHaveLength(1);

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
