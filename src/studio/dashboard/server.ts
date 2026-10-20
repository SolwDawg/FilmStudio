import { existsSync } from "node:fs";
import { rm } from "node:fs/promises";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import type { AddressInfo } from "node:net";
import { join } from "node:path";
import {
  addScene,
  applyFilmConfig,
  assertSlug,
  buildActorDnaImagePrompt,
  buildLocationDnaImagePrompt,
  buildSelfHealingPrompt,
  chunkStory,
  createProject,
  DEFAULT_GENRE,
  DEFAULT_HEAL_INSTRUCTION,
  deleteScene,
  discoverCast,
  filmSchema,
  GENRES,
  isGenreId,
  keepFinishedOnly,
  listProjects,
  loadFilm,
  loadState,
  mergeDiscoveredActors,
  type ProjectPaths,
  projectPaths,
  projectRelative,
  promptDefaults,
  referencePrompts,
  removeCharacter,
  removeLocation,
  requeueRunning,
  saveFilm,
  saveState,
  scenesFromStory,
  setSceneImage,
  updateScene,
  upsertCharacter,
  upsertLocation
} from "../domain/index.js";
import { cropStoryboardGrid } from "../media/index.js";
import { stitchFilm } from "../render/index.js";
import { readBody, sendJson as json, serveDashboardFile, serveMedia, writeDataUrl } from "./http.js";
import { RenderProcesses } from "./render-process.js";

export interface Dashboard {
  url: string;
  close(): Promise<void>;
}

// HTTP routes of the dashboard. Each route parses the request, calls into the domain/render
// modules, and answers; the film logic itself lives there, not here.
export async function startDashboard(requestedPort = 3333): Promise<Dashboard> {
  let port = requestedPort;
  const logs: string[] = [];
  const listeners = new Set<ServerResponse>();

  const addLog = (line: string): void => {
    const entry = `[${new Date().toLocaleTimeString()}] ${line}`;
    logs.push(entry);
    if (logs.length > 500) logs.shift();
    for (const res of listeners) res.write(`data: ${JSON.stringify(entry)}\n\n`);
  };
  const renders = new RenderProcesses(addLog);

  // Only the dashboard page itself may call the API: a page on another site could otherwise
  // start renders (spending credits) or delete projects through the user's browser.
  const trusted = (req: IncomingMessage): boolean => {
    const host = req.headers.host ?? "";
    if (host !== `127.0.0.1:${port}` && host !== `localhost:${port}`) return false;
    const origin = req.headers.origin;
    return origin === undefined || origin === `http://${host}`;
  };

  const handle = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    if (!trusted(req)) {
      res.writeHead(403).end("forbidden");
      return;
    }
    const url = new URL(req.url ?? "/", `http://${req.headers.host}`);
    const parts = url.pathname.split("/").filter(Boolean);

    if (req.method === "GET" && serveDashboardFile(res, url.pathname)) return;

    // Live log (server-sent events): replays the recent lines, then streams new ones.
    if (req.method === "GET" && url.pathname === "/api/logs") {
      res.writeHead(200, { "content-type": "text/event-stream", "cache-control": "no-cache", connection: "keep-alive" });
      for (const entry of logs) res.write(`data: ${JSON.stringify(entry)}\n\n`);
      listeners.add(res);
      req.on("close", () => listeners.delete(res));
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/genres") {
      return json(res, 200, Object.entries(GENRES).map(([id, preset]) => ({ id, label: preset.label, description: preset.description })));
    }

    if (req.method === "POST" && url.pathname === "/api/projects/import-json") {
      const body = await readBody(req);
      const imported = (body.film ?? {}) as Record<string, unknown>;
      const title = String(imported.title || body.title || "Imported Project");
      const { slug, paths } = await createProject(title);
      const film = filmSchema.parse({ ...imported, title });
      await saveFilm(paths, film);
      if (body.state) await saveState(paths, body.state as Parameters<typeof saveState>[1]);
      addLog(`Imported project from JSON: "${title}" (${slug})`);
      return json(res, 201, { slug, film });
    }

    if (parts[0] === "api" && parts[1] === "projects" && parts.length === 2) {
      if (req.method === "GET") {
        const items = await Promise.all(
          (await listProjects()).map(async (slug) => {
            const paths = projectPaths(slug);
            const [film, state] = await Promise.all([loadFilm(paths), loadState(paths)]);
            const done = film.scenes.filter((scene) => state.scenes[scene.id]?.status === "done").length;
            return { slug, title: film.title, scenes: film.scenes.length, done, running: renders.has(slug) };
          })
        );
        return json(res, 200, items);
      }
      if (req.method === "POST") {
        const body = await readBody(req);
        if (!body.title) return json(res, 400, { error: "title is required" });
        if (body.genre !== undefined && !isGenreId(body.genre)) return json(res, 400, { error: `unknown genre: ${String(body.genre)}` });
        const { slug, paths } = await createProject(String(body.title), undefined, isGenreId(body.genre) ? body.genre : DEFAULT_GENRE);
        const film = applyFilmConfig(await loadFilm(paths), {
          ratio: body.ratio || undefined,
          duration: body.duration ? Number(body.duration) : undefined,
          continuity: body.continuity === undefined ? undefined : Boolean(body.continuity),
          model: body.model || undefined
        });
        await saveFilm(paths, film);
        addLog(`Created new film project: "${film.title}" (${slug})`);
        return json(res, 201, { slug, film });
      }
    }

    if (parts[0] === "api" && parts[1] === "projects" && parts[2]) {
      const slug = assertSlug(parts[2]);
      return projectRoute(req, res, url, slug, projectPaths(slug), parts.slice(3));
    }

    if (req.method === "GET" && parts[0] === "media" && parts[1] && parts.length > 2) {
      serveMedia(req, res, projectPaths(assertSlug(parts[1])), parts.slice(2).join("/"));
      return;
    }

    res.writeHead(404).end("not found");
  };

  // /api/projects/<slug>/<rest...>
  const projectRoute = async (req: IncomingMessage, res: ServerResponse, url: URL, slug: string, paths: ProjectPaths, rest: string[]): Promise<void> => {
    const [section, id, action] = rest;
    const method = req.method;

    if (method === "GET" && section === "export") {
      const [film, state] = await Promise.all([loadFilm(paths), loadState(paths)]);
      res.writeHead(200, { "content-type": "application/json", "content-disposition": `attachment; filename="${slug}-project.json"` });
      res.end(JSON.stringify({ slug, film, state }, null, 2));
      return;
    }

    if (method === "DELETE" && rest.length === 0) {
      renders.kill(slug);
      await rm(paths.dir, { recursive: true, force: true });
      addLog(`Deleted project "${slug}"`);
      return json(res, 200, { success: true, slug });
    }

    if (method === "GET" && rest.length === 0) {
      const [film, state] = await Promise.all([loadFilm(paths), loadState(paths)]);
      return json(res, 200, { slug, film, state, running: renders.has(slug), referencePrompts: referencePrompts(film), defaults: promptDefaults(film) });
    }

    if (method === "POST" && section === "config") {
      const film = applyFilmConfig(await loadFilm(paths), await readBody(req));
      await saveFilm(paths, film);
      addLog(`${slug}: configuration updated`);
      return json(res, 200, film);
    }

    if (method === "POST" && section === "stop") {
      if (renders.stop(slug)) addLog(`${slug}: 🛑 EMERGENCY STOP - render process stopping`);
      const state = await loadState(paths);
      requeueRunning(state);
      await saveState(paths, state);
      return json(res, 200, { stopped: true });
    }

    if (method === "POST" && section === "reset-queue") {
      const state = await loadState(paths);
      keepFinishedOnly(state);
      await saveState(paths, state);
      addLog(`${slug}: reset pending & failed queue (preserved done scenes)`);
      return json(res, 200, { reset: true, state });
    }

    if (method === "POST" && section === "reset-all") {
      await saveState(paths, { scenes: {} });
      addLog(`${slug}: reset entire timeline progress`);
      return json(res, 200, { reset: true });
    }

    // 1-Click Full Auto: optional story breakdown, cast discovery, then render.
    if (method === "POST" && section === "auto-run") {
      const body = await readBody(req);
      addLog(`${slug}: [1-Click Full Auto] Triggered...`);
      const film = await loadFilm(paths);
      if (typeof body.storyText === "string" && body.storyText) {
        film.scenes = scenesFromStory(body.storyText, Number(body.wordsPerChunk) || 150);
        addLog(`${slug}: [Step 1: Auto-Story] ${film.scenes.length} scenes generated`);
      }
      const { actors } = discoverCast(film);
      film.characters = mergeDiscoveredActors(film.characters, actors);
      await saveFilm(paths, film);
      addLog(`${slug}: [Step 2: Auto-DNA] Discovered ${actors.length} characters`);
      if (renders.has(slug)) return json(res, 409, { error: "render already running" });
      renders.start(slug, false);
      addLog(`${slug}: [Step 3: Auto-Render] Render pipeline started with I2V Continuity`);
      return json(res, 202, { started: true, mode: "all-in-one" });
    }

    if (method === "POST" && (section === "pause" || section === "resume")) {
      const film = await loadFilm(paths);
      film.isPaused = section === "pause";
      await saveFilm(paths, film);
      addLog(`${slug}: render queue ${film.isPaused ? "PAUSED by user" : "RESUMED"}`);
      return json(res, 200, { isPaused: film.isPaused });
    }

    if (method === "POST" && section === "breakdown") {
      const body = await readBody(req);
      const storyText = typeof body.storyText === "string" ? body.storyText : "";
      if (!storyText.trim()) return json(res, 400, { error: "storyText is required" });
      const wordsPerChunk = Number(body.wordsPerChunk) || 150;
      addLog(`${slug}: story broken into ${chunkStory(storyText, wordsPerChunk).length} chunks (~${wordsPerChunk} words each)`);
      const film = await loadFilm(paths);
      film.scenes = scenesFromStory(storyText, wordsPerChunk);
      await saveFilm(paths, film);
      await saveState(paths, { scenes: {} });
      addLog(`${slug}: imported ${film.scenes.length} scenes into project`);
      return json(res, 200, { success: true, count: film.scenes.length, scenes: film.scenes });
    }

    if (section === "dna") return dnaRoute(req, res, slug, paths, id, action);
    if (section === "scenes" || section === "storyboard") return sceneRoute(req, res, slug, paths, rest);

    if (method === "POST" && section === "render") {
      if (renders.has(slug)) return json(res, 409, { error: "render already running" });
      renders.start(slug, url.searchParams.get("force") === "1");
      return json(res, 202, { started: true });
    }

    if (method === "POST" && section === "stitch") {
      const normalize = url.searchParams.get("normalize") === "1";
      addLog(`${slug}: assembling final master movie (normalization: ${normalize})...`);
      const result = await stitchFilm(paths, undefined, { normalize });
      addLog(`${slug}: master video generated (${result.clips} scenes, mode: ${result.mode}) -> ${result.output}`);
      return json(res, 200, result);
    }

    res.writeHead(404).end("not found");
  };

  // /api/projects/<slug>/dna/<scan|character|location>[/<name>]
  const dnaRoute = async (req: IncomingMessage, res: ServerResponse, slug: string, paths: ProjectPaths, kind?: string, name?: string): Promise<void> => {
    const film = await loadFilm(paths);

    if (req.method === "POST" && kind === "scan") {
      addLog(`${slug}: scanning 3-scene sliding windows across ${film.scenes.length} scenes...`);
      const { actors, locations } = discoverCast(film);
      film.characters = mergeDiscoveredActors(film.characters, actors);
      await saveFilm(paths, film);
      addLog(`${slug}: discovered ${actors.length} actor(s) and ${locations.length} location(s)`);
      return json(res, 200, { actors: film.characters, locations });
    }

    if (req.method === "POST" && kind === "character") {
      const body = await readBody(req);
      if (!body.name) return json(res, 400, { error: "name is required" });
      const character = upsertCharacter(film, body);
      await saveFilm(paths, film);
      addLog(`${slug}: saved DNA profile for character "${character.name}"`);
      const dnaPrompt = buildActorDnaImagePrompt({ name: character.name, traits: character.description }, film.directionalPrompt);
      return json(res, 200, { character, dnaPrompt });
    }

    if (req.method === "POST" && kind === "location") {
      const body = await readBody(req);
      if (!body.name) return json(res, 400, { error: "name is required" });
      const location = upsertLocation(film, body);
      await saveFilm(paths, film);
      addLog(`${slug}: saved Location sheet for "${location.name}"`);
      const locPrompt = buildLocationDnaImagePrompt({ name: location.name, traits: location.description }, film.locationDirectionalPrompt);
      return json(res, 200, { location, locPrompt });
    }

    if (req.method === "DELETE" && name && (kind === "character" || kind === "location")) {
      const target = decodeURIComponent(name);
      if (kind === "character") removeCharacter(film, target);
      else removeLocation(film, target);
      await saveFilm(paths, film);
      addLog(`${slug}: removed ${kind} "${target.toLowerCase()}"`);
      return json(res, 200, { success: true });
    }

    res.writeHead(404).end("not found");
  };

  // /api/projects/<slug>/scenes[/<id>[/<action>]] and /storyboard/slice
  const sceneRoute = async (req: IncomingMessage, res: ServerResponse, slug: string, paths: ProjectPaths, rest: string[]): Promise<void> => {
    const [section, sceneId, action] = rest;
    const method = req.method;

    if (method === "POST" && section === "storyboard" && sceneId === "slice") {
      const body = await readBody(req);
      let storyboard = join(paths.renders, "storyboard_global.png");
      if (typeof body.base64 === "string" && body.base64) {
        await writeDataUrl(storyboard, body.base64);
      } else if (!existsSync(storyboard)) {
        const first = (await loadFilm(paths)).scenes.find((s) => s.storyboardImage)?.storyboardImage;
        if (!first) return json(res, 400, { error: "Vui lòng tải ảnh Storyboard lên trước khi cắt!" });
        storyboard = join(paths.renders, first);
      }
      const slices = await cropStoryboardGrid(storyboard, { rows: Number(body.rows) || 2, cols: Number(body.cols) || 2 }, join(paths.renders, "shots"), "global_shot");
      addLog(`${slug}: sliced global storyboard into ${slices.length} shots`);
      return json(res, 200, { success: true, count: slices.length, shots: slices.map((file) => projectRelative(paths, file)) });
    }

    if (section !== "scenes") return void res.writeHead(404).end("not found");

    if (method === "POST" && !sceneId) {
      const film = await loadFilm(paths);
      const scene = addScene(film, await readBody(req));
      await saveFilm(paths, film);
      addLog(`${slug}: added new scene "${scene.id}"`);
      return json(res, 201, scene);
    }

    if (method === "DELETE" && sceneId) {
      const film = await loadFilm(paths);
      if (!deleteScene(film, sceneId)) return json(res, 404, { error: "scene not found" });
      await saveFilm(paths, film);
      addLog(`${slug}: deleted scene "${sceneId}"`);
      return json(res, 200, { success: true, sceneId });
    }

    if (method !== "POST" || !sceneId) return void res.writeHead(404).end("not found");
    const body = await readBody(req);
    const film = await loadFilm(paths);
    const scene = film.scenes.find((s) => s.id === sceneId);

    // Kept as it was: not part of the refactor.
    if (action === "heal") {
      if (!scene) return json(res, 404, { error: "scene not found" });

      const reason = typeof body.reason === "string" && body.reason ? body.reason : "Phát hiện từ khóa nhạy cảm / vi phạm an toàn";
      const instruction = film.healInstruction || DEFAULT_HEAL_INSTRUCTION;
      const healPrompt = buildSelfHealingPrompt(scene.prompt, reason, instruction);

      let healed = scene.prompt
        .replace(/súng|vũ khí|bắn|giết|đâm|máu/gi, "đối đầu kịch tính trong ánh hoàng hôn")
        .replace(/tấn công|đánh nhau|ẩu đả/gi, "giằng co căng thẳng, nhịp thở dồn dập")
        .replace(/chết|tử vong|thi thể/gi, "ngã gục trong tuyệt vọng")
        .replace(/khỏa thân|nude|sex|gợi cảm quá mức/gi, "trang phục thanh lịch, gợi mở cảm xúc sâu lắng");

      if (healed === scene.prompt) {
        healed = `${scene.prompt}\n(Góc máy điện ảnh nghệ thuật, ánh sáng tương phản dịu nhẹ, ngôn từ ẩn dụ sâu sắc)`;
      }

      scene.healHistory = scene.healHistory || [];
      scene.healHistory.push(scene.prompt);
      scene.prompt = healed;
      scene.isRewritten = true;

      await saveFilm(paths, film);
      addLog(`${slug}: [Auto-Heal] Successfully healed scene "${sceneId}" with compliance synonyms`);
      return json(res, 200, { success: true, scene, healPrompt });
    }

    if (action === "loop-rewrite") {
      if (!scene) return json(res, 404, { error: "scene not found" });
      scene.prompt = `${scene.prompt}\n[Take thay thế: Đổi sang góc máy cận cảnh đặc tả cảm xúc, chuyển động lia máy chậm (slow pan), tăng nhịp độ kịch tính và chiều sâu không gian]`;
      scene.isRewritten = true;
      await saveFilm(paths, film);
      addLog(`${slug}: [Loop Rewrite] Created alternate dramatic take for scene "${sceneId}"`);
      return json(res, 200, { success: true, scene });
    }

    if (action === "upload-frame") {
      if (typeof body.base64 !== "string" || !body.base64) return json(res, 400, { error: "base64 is required" });
      const slot = typeof body.slot === "string" && body.slot ? body.slot : "keyframe"; // storyboard | shot | start | last | keyframe
      const filename = `${sceneId}.${slot}.png`;
      await writeDataUrl(join(paths.renders, filename), body.base64);
      setSceneImage(film, sceneId, slot, filename);
      if (scene) await saveFilm(paths, film);
      addLog(`${slug}: uploaded ${slot} frame for ${sceneId}`);
      return json(res, 200, { success: true, file: filename, relativePath: `renders/${filename}` });
    }

    if (action === "slice-grid") {
      if (!scene) return json(res, 404, { error: "scene not found" });
      const storyboard = join(paths.renders, scene.storyboardImage || `${sceneId}.storyboard.png`);
      if (!existsSync(storyboard)) return json(res, 404, { error: `Storyboard image not found at: ${storyboard}` });
      const slices = await cropStoryboardGrid(storyboard, { rows: Number(body.rows) || 2, cols: Number(body.cols) || 2 }, join(paths.renders, "shots"), `${sceneId}_shot`);
      scene.shotImages = slices.map((file) => projectRelative(paths, file));
      await saveFilm(paths, film);
      addLog(`${slug}: sliced storyboard for ${sceneId} into ${slices.length} shots`);
      return json(res, 200, { success: true, count: slices.length, shots: scene.shotImages });
    }

    if (!action) {
      const updated = updateScene(film, sceneId, body);
      if (!updated) return json(res, 404, { error: "scene not found" });
      await saveFilm(paths, film);
      addLog(`${slug}: updated scene "${sceneId}"`);
      return json(res, 200, updated);
    }

    res.writeHead(404).end("not found");
  };

  const server = createServer((req, res) => {
    handle(req, res).catch((error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      addLog(`error: ${message}`);
      if (!res.headersSent) json(res, 500, { error: message });
      else res.end();
    });
  });

  await new Promise<void>((resolveListen, rejectListen) => {
    server.once("error", rejectListen);
    server.listen(requestedPort, "127.0.0.1", resolveListen);
  });
  port = (server.address() as AddressInfo).port;

  return {
    url: `http://127.0.0.1:${port}`,
    close: async () => {
      for (const res of listeners) res.end();
      renders.killAll();
      await new Promise<void>((done) => server.close(() => done()));
    }
  };
}
