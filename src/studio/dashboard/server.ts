import { type ChildProcess, spawn } from "node:child_process";
import { createReadStream, existsSync, statSync } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import type { AddressInfo } from "node:net";
import { extname, join, resolve, sep } from "node:path";
import { stitchFilm } from "../render/index.js";
import {
  assertSlug,
  buildActorDnaImagePrompt,
  buildLocationDnaImagePrompt,
  buildSelfHealingPrompt,
  chunkStory,
  createProject,
  createSlidingSceneWindows,
  DEFAULT_GENRE,
  DEFAULT_HEAL_INSTRUCTION,
  DEFAULT_STORYBOARD_PROMPT,
  type FilmCharacter,
  type FilmLocation,
  type FilmScene,
  genrePreset,
  GENRES,
  isGenreId,
  listProjects,
  loadFilm,
  loadState,
  mergeDiscoveredActors,
  parseStructuredScript,
  projectPaths,
  saveFilm,
  saveState
} from "../domain/index.js";
import { DASHBOARD_HTML } from "./html.js";
import { cropStoryboardGrid } from "../media/index.js";

const MIME: Record<string, string> = {
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".png": "image/png",
  ".jpg": "image/jpeg"
};

export interface Dashboard {
  url: string;
  close(): Promise<void>;
}

export async function startDashboard(requestedPort = 3333): Promise<Dashboard> {
  let port = requestedPort;
  const logs: string[] = [];
  const listeners = new Set<ServerResponse>();
  const running = new Map<string, ChildProcess>();

  const addLog = (line: string): void => {
    const entry = `[${new Date().toLocaleTimeString()}] ${line}`;
    logs.push(entry);
    if (logs.length > 500) logs.shift();
    for (const res of listeners) res.write(`data: ${JSON.stringify(entry)}\n\n`);
  };

  const json = (res: ServerResponse, status: number, body: unknown): void => {
    res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(body));
  };

  const readBody = (req: IncomingMessage): Promise<any> =>
    new Promise((resolvePromise, rejectPromise) => {
      let data = "";
      req.on("data", (chunk) => (data += chunk.toString()));
      req.on("end", () => {
        try {
          resolvePromise(data ? JSON.parse(data) : {});
        } catch (e) {
          rejectPromise(e);
        }
      });
      req.on("error", rejectPromise);
    });

  const trusted = (req: IncomingMessage): boolean => {
    const host = req.headers.host ?? "";
    if (host !== `127.0.0.1:${port}` && host !== `localhost:${port}`) return false;
    const origin = req.headers.origin;
    return origin === undefined || origin === `http://${host}`;
  };

  const spawnRender = (slug: string, force: boolean): void => {
    const args = [...process.execArgv, process.argv[1], "render", slug, ...(force ? ["--force"] : [])];
    // The IPC channel lets "stop" end the render gracefully (scene back to pending, browser
    // disconnected) instead of killing it mid-write.
    const child = spawn(process.execPath, args, {
      cwd: process.cwd(),
      stdio: ["ignore", "pipe", "pipe", "ipc"],
      env: { ...process.env, FILM_RENDER_IPC: "1" }
    });
    running.set(slug, child);
    addLog(`${slug}: render pipeline started`);
    const forward = (chunk: Buffer): void => {
      for (const line of chunk.toString().split(/\r?\n/).filter(Boolean)) addLog(`${slug}: ${line}`);
    };
    child.stdout?.on("data", forward);
    child.stderr?.on("data", forward);
    child.on("close", (code) => {
      if (running.get(slug) === child) running.delete(slug);
      addLog(`${slug}: render pipeline exited with code ${code}`);
    });
  };

  const stopRender = (slug: string): boolean => {
    const child = running.get(slug);
    if (!child) return false;
    running.delete(slug);
    if (child.connected) child.send("stop");
    // Give it a moment to put the scene back to pending, then make sure it is gone.
    const timer = setTimeout(() => {
      if (child.exitCode === null && child.signalCode === null) child.kill();
    }, 10_000);
    timer.unref();
    child.once("close", () => clearTimeout(timer));
    return true;
  };

  const serveMedia = (req: IncomingMessage, res: ServerResponse, slug: string, rest: string): void => {
    const paths = projectPaths(slug);
    const file = resolve(paths.dir, decodeURIComponent(rest));
    const allowed = file === paths.final || file.startsWith(paths.renders + sep);
    if (!allowed || !existsSync(file) || !statSync(file).isFile()) {
      res.writeHead(404).end();
      return;
    }
    const size = statSync(file).size;
    const type = MIME[extname(file).toLowerCase()] ?? "application/octet-stream";
    const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range ?? "");
    if (range) {
      const start = range[1] ? Number.parseInt(range[1], 10) : 0;
      const end = range[2] ? Math.min(Number.parseInt(range[2], 10), size - 1) : size - 1;
      res.writeHead(206, {
        "content-type": type,
        "content-range": `bytes ${start}-${end}/${size}`,
        "accept-ranges": "bytes",
        "content-length": end - start + 1
      });
      createReadStream(file, { start, end }).pipe(res);
    } else {
      res.writeHead(200, { "content-type": type, "content-length": size, "accept-ranges": "bytes" });
      createReadStream(file).pipe(res);
    }
  };

  const handle = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    if (!trusted(req)) {
      res.writeHead(403).end("forbidden");
      return;
    }
    const url = new URL(req.url ?? "/", `http://${req.headers.host}`);
    const parts = url.pathname.split("/").filter(Boolean);

    // Serve HTML
    if (req.method === "GET" && url.pathname === "/") {
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" }).end(DASHBOARD_HTML);
      return;
    }

    // SSE Log Stream
    if (req.method === "GET" && url.pathname === "/api/logs") {
      res.writeHead(200, {
        "content-type": "text/event-stream",
        "cache-control": "no-cache",
        connection: "keep-alive"
      });
      for (const entry of logs) res.write(`data: ${JSON.stringify(entry)}\n\n`);
      listeners.add(res);
      req.on("close", () => listeners.delete(res));
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/genres") {
      return json(res, 200, Object.entries(GENRES).map(([id, preset]) => ({ id, label: preset.label, description: preset.description })));
    }

    // Import Project JSON
    if (parts[0] === "api" && parts[1] === "projects" && parts[2] === "import-json" && req.method === "POST") {
      const body = await readBody(req);
      const title = body.film?.title || body.title || "Imported Project";
      const { slug, paths } = await createProject(title);
      const film = { ...body.film, title };
      await saveFilm(paths, film);
      if (body.state) await saveState(paths, body.state);
      addLog(`Imported project from JSON: "${title}" (${slug})`);
      return json(res, 201, { slug, film });
    }

    // Projects list & create
    if (parts[0] === "api" && parts[1] === "projects" && parts.length === 2) {
      if (req.method === "GET") {
        const slugs = await listProjects();
        const items = await Promise.all(
          slugs.map(async (s) => {
            const paths = projectPaths(s);
            const [film, state] = await Promise.all([loadFilm(paths), loadState(paths)]);
            const done = film.scenes.filter((sc) => state.scenes[sc.id]?.status === "done").length;
            return {
              slug: s,
              title: film.title,
              scenes: film.scenes.length,
              done,
              running: running.has(s)
            };
          })
        );
        return json(res, 200, items);
      }
      if (req.method === "POST") {
        const body = await readBody(req);
        if (!body.title) return json(res, 400, { error: "title is required" });
        if (body.genre !== undefined && !isGenreId(body.genre)) return json(res, 400, { error: `unknown genre: ${body.genre}` });
        const { slug, paths } = await createProject(body.title, undefined, body.genre ?? DEFAULT_GENRE);
        const film = await loadFilm(paths);
        if (body.ratio) film.ratio = body.ratio;
        if (body.duration) film.duration = Number(body.duration);
        if (body.continuity !== undefined) film.continuity = Boolean(body.continuity);
        if (body.model) film.model = body.model;
        await saveFilm(paths, film);
        addLog(`Created new film project: "${film.title}" (${slug})`);
        return json(res, 201, { slug, film });
      }
    }

    // Single Project APIs
    if (parts[0] === "api" && parts[1] === "projects" && parts[2]) {
      const slug = assertSlug(parts[2]);
      const paths = projectPaths(slug);

      // Export Project JSON
      if (req.method === "GET" && parts[3] === "export") {
        const [film, state] = await Promise.all([loadFilm(paths), loadState(paths)]);
        res.writeHead(200, {
          "content-type": "application/json",
          "content-disposition": `attachment; filename="${slug}-project.json"`
        });
        res.end(JSON.stringify({ slug, film, state }, null, 2));
        return;
      }

      // DELETE Project
      if (req.method === "DELETE" && parts.length === 3) {
        const child = running.get(slug);
        if (child) {
          running.delete(slug);
          child.kill();
        }
        await rm(paths.dir, { recursive: true, force: true });
        addLog(`Deleted project "${slug}"`);
        return json(res, 200, { success: true, slug });
      }

      // GET Project detail
      if (req.method === "GET" && parts.length === 3) {
        const [film, state] = await Promise.all([loadFilm(paths), loadState(paths)]);
        // Reference-sheet prompts are built here so the dashboard shows exactly what dna.ts generates.
        const referencePrompts = {
          characters: Object.fromEntries(
            film.characters.map((c) => [c.name, buildActorDnaImagePrompt({ name: c.name, traits: c.description }, film.directionalPrompt)])
          ),
          locations: Object.fromEntries(
            (film.locations ?? []).map((l) => [l.name, buildLocationDnaImagePrompt({ name: l.name, traits: l.description }, film.locationDirectionalPrompt)])
          )
        };
        // "Reset" on the dashboard returns to the project's genre preset, not the generic default.
        const preset = genrePreset(film.genre);
        const defaults = {
          directionalPrompt: preset.directionalPrompt,
          locationDirectionalPrompt: preset.locationDirectionalPrompt,
          storyboardPrompt: DEFAULT_STORYBOARD_PROMPT,
          style: preset.style
        };
        return json(res, 200, { slug, film, state, running: running.has(slug), referencePrompts, defaults });
      }

      if (req.method === "POST" && parts[3] === "config") {
        const body = await readBody(req);
        const film = await loadFilm(paths);
        const keys = [
          "title", "ratio", "duration", "continuity", "continuityMode", "model", "imageModel", "resolution",
          "videoGenMode", "startFrameSource", "endFrameSource", "skipImageGen", "renderFromShotOnly",
          "autoMerge", "isStoryboardCropEnabled", "storyboardRows", "storyboardCols", "storyboardPrompt",
          "isAutoHealEnabled", "healInstruction", "isCelebrityCheckEnabled", "renderTimeout", "retryDelay",
          "maxRetries", "maxAutoRetries", "isAutoLoopEnabled", "autoLoopLimit", "loopRewritePrompt",
          "isLoopAllEnabled", "loopAllLimit", "maxConcurrentRenders", "dnaMaxConcurrent", "storyChunkSize",
          "storyConcurrency", "storyDelay", "imageProductionRule", "directionalPrompt", "locationDirectionalPrompt",
          "style", "strictActorMatch", "strictLocationMatch", "renderDelay", "dnaDelay", "sceneScale"
        ] as const;
        for (const k of keys) {
          if (body[k] !== undefined) (film as any)[k] = body[k];
        }
        await saveFilm(paths, film);
        addLog(`${slug}: configuration updated`);
        return json(res, 200, film);
      }

      // Emergency Stop
      if (req.method === "POST" && parts[3] === "stop") {
        if (stopRender(slug)) {
          addLog(`${slug}: 🛑 EMERGENCY STOP - render process stopping`);
        }
        const state = await loadState(paths);
        for (const s of Object.values(state.scenes)) {
          if (s.status === "running") s.status = "pending";
        }
        await saveState(paths, state);
        return json(res, 200, { stopped: true });
      }

      // Reset Pending/Failed Queue
      if (req.method === "POST" && parts[3] === "reset-queue") {
        const state = await loadState(paths);
        for (const [id, s] of Object.entries(state.scenes)) {
          if (s.status !== "done") {
            delete state.scenes[id];
          }
        }
        await saveState(paths, state);
        addLog(`${slug}: reset pending & failed queue (preserved done scenes)`);
        return json(res, 200, { reset: true, state });
      }

      // Reset All Scenes Progress
      if (req.method === "POST" && parts[3] === "reset-all") {
        await saveState(paths, { scenes: {} });
        addLog(`${slug}: reset entire timeline progress`);
        return json(res, 200, { reset: true });
      }

      // 1-Click All-In-One Automation Runner
      if (req.method === "POST" && parts[3] === "auto-run") {
        const body = await readBody(req);
        addLog(`${slug}: [1-Click Full Auto] Triggered...`);

        // Step 1: Breakdown if story text provided
        if (body.storyText) {
          const wordsPerChunk = Number(body.wordsPerChunk) || 150;
          const chunks = chunkStory(body.storyText, wordsPerChunk);
          const parsedScenes = parseStructuredScript(body.storyText);
          const film = await loadFilm(paths);

          if (parsedScenes.length > 0) {
            film.scenes = parsedScenes.map((s) => ({
              id: s.id,
              title: `Scene ${s.sceneNumber}`,
              prompt: s.rawText,
              characters: s.characters,
              cut: s.cut,
              shotImages: [],
              connectShot: false
            }));
          } else {
            const width = Math.max(2, String(chunks.length).length);
            film.scenes = chunks.map((chunk, idx) => ({
              id: `scene-${String(idx + 1).padStart(width, "0")}`,
              title: `Scene ${idx + 1}`,
              prompt: chunk,
              characters: [],
              cut: false,
              shotImages: [],
              connectShot: false
            }));
          }
          await saveFilm(paths, film);
          addLog(`${slug}: [Step 1: Auto-Story] ${film.scenes.length} scenes generated`);
        }

        // Step 2: Auto-DNA Scan
        const film = await loadFilm(paths);
        const windows = createSlidingSceneWindows(film.scenes);
        const discoveredActors: any[] = [];
        for (const w of windows) {
          const charLine = w.current.prompt.match(/(?:Nhân vật|Characters?|Diễn viên)\s*[:–-]\s*([^\n]+)/i);
          if (charLine?.[1]) {
            const names = charLine[1].split(/[,;&]/).map((s) => s.trim()).filter(Boolean);
            for (const n of names) {
              if (!discoveredActors.some((a) => a.name.toLowerCase() === n.toLowerCase())) {
                discoveredActors.push({
                  name: n,
                  aliases: [],
                  roles: ["Diễn viên"],
                  traits: "Ngoại hình điện ảnh, phong thái tự nhiên",
                  referencePrompt: buildActorDnaImagePrompt({ name: n, traits: "Ngoại hình điện ảnh" }, film.directionalPrompt)
                });
              }
            }
          }
        }
        film.characters = mergeDiscoveredActors(film.characters, discoveredActors);
        await saveFilm(paths, film);
        addLog(`${slug}: [Step 2: Auto-DNA] Discovered ${discoveredActors.length} characters`);

        // Step 3: Trigger Render Pipeline
        if (running.has(slug)) return json(res, 409, { error: "render already running" });
        spawnRender(slug, false);
        addLog(`${slug}: [Step 3: Auto-Render] Render pipeline started with I2V Continuity`);
        return json(res, 202, { started: true, mode: "all-in-one" });
      }

      // Pause / Resume Queue
      if (req.method === "POST" && parts[3] === "pause") {
        const film = await loadFilm(paths);
        film.isPaused = true;
        await saveFilm(paths, film);
        addLog(`${slug}: render queue PAUSED by user`);
        return json(res, 200, { isPaused: true });
      }
      if (req.method === "POST" && parts[3] === "resume") {
        const film = await loadFilm(paths);
        film.isPaused = false;
        await saveFilm(paths, film);
        addLog(`${slug}: render queue RESUMED`);
        return json(res, 200, { isPaused: false });
      }

      // Story Breakdown Engine
      if (req.method === "POST" && parts[3] === "breakdown") {
        const body = await readBody(req);
        const storyText = body.storyText || "";
        if (!storyText.trim()) return json(res, 400, { error: "storyText is required" });

        const wordsPerChunk = Number(body.wordsPerChunk) || 150;
        const chunks = chunkStory(storyText, wordsPerChunk);
        addLog(`${slug}: story broken into ${chunks.length} chunks (~${wordsPerChunk} words each)`);

        const parsedScenes = parseStructuredScript(storyText);
        const film = await loadFilm(paths);

        if (parsedScenes.length > 0) {
          film.scenes = parsedScenes.map((s) => ({
            id: s.id,
            title: `Scene ${s.sceneNumber}`,
            prompt: s.rawText,
            characters: s.characters,
            cut: s.cut,
            shotImages: [],
            connectShot: false
          }));
        } else {
          const width = Math.max(2, String(chunks.length).length);
          film.scenes = chunks.map((chunk, idx) => ({
            id: `scene-${String(idx + 1).padStart(width, "0")}`,
            title: `Scene ${idx + 1}`,
            prompt: chunk,
            characters: [],
            cut: false,
            shotImages: [],
            connectShot: false
          }));
        }

        await saveFilm(paths, film);
        await saveState(paths, { scenes: {} });
        addLog(`${slug}: imported ${film.scenes.length} scenes into project`);
        return json(res, 200, { success: true, count: film.scenes.length, scenes: film.scenes });
      }

      // DNA Scanning
      if (req.method === "POST" && parts[3] === "dna" && parts[4] === "scan") {
        const film = await loadFilm(paths);
        const windows = createSlidingSceneWindows(film.scenes);
        addLog(`${slug}: scanning 3-scene sliding windows across ${film.scenes.length} scenes...`);

        const discoveredActors: any[] = [];
        const discoveredLocations: any[] = [];

        for (const w of windows) {
          const prompt = w.current.prompt;
          const charLine = prompt.match(/(?:Nhân vật|Characters?|Diễn viên)\s*[:–-]\s*([^\n]+)/i);
          if (charLine?.[1]) {
            const names = charLine[1].split(/[,;&]/).map((s) => s.trim()).filter(Boolean);
            for (const n of names) {
              if (!discoveredActors.some((a) => a.name.toLowerCase() === n.toLowerCase())) {
                discoveredActors.push({
                  name: n,
                  aliases: [],
                  roles: ["Diễn viên chính"],
                  traits: "Ngoại hình điện ảnh, phong thái tự nhiên",
                  referencePrompt: buildActorDnaImagePrompt({ name: n, traits: "Ngoại hình điện ảnh" }, film.directionalPrompt)
                });
              }
            }
          }
          const locLine = prompt.match(/(?:Bối cảnh|Location|Địa điểm)\s*[:–-]\s*([^\n]+)/i);
          if (locLine?.[1]) {
            const locName = locLine[1].trim();
            if (!discoveredLocations.some((l) => l.name.toLowerCase() === locName.toLowerCase())) {
              discoveredLocations.push({
                name: locName,
                traits: "Góc rộng điện ảnh, bố cục chiều sâu, ánh sáng tự nhiên",
                referencePrompt: buildLocationDnaImagePrompt({ name: locName, traits: "Góc rộng điện ảnh" }, film.locationDirectionalPrompt)
              });
            }
          }
        }

        film.characters = mergeDiscoveredActors(film.characters, discoveredActors);
        await saveFilm(paths, film);
        addLog(`${slug}: discovered ${discoveredActors.length} actor(s) and ${discoveredLocations.length} location(s)`);
        return json(res, 200, { actors: film.characters, locations: discoveredLocations });
      }

      // DNA Character Add/Update (supports Voice Media ID)
      if (req.method === "POST" && parts[3] === "dna" && parts[4] === "character") {
        const body = await readBody(req);
        if (!body.name) return json(res, 400, { error: "name is required" });
        const film = await loadFilm(paths);
        const existing = film.characters.filter((c) => c.name.toLowerCase() !== body.name.toLowerCase());
        const entry: FilmCharacter = {
          name: body.name,
          description: body.description || "",
          aliases: Array.isArray(body.aliases) ? body.aliases : (body.aliases || "").split(/[,;]/).map((s: string) => s.trim()).filter(Boolean),
          images: Array.isArray(body.images) ? body.images : [],
          voiceMediaId: body.voiceMediaId,
          voiceName: body.voiceName
        };
        film.characters = [...existing, entry];
        await saveFilm(paths, film);
        const dnaPrompt = buildActorDnaImagePrompt({ name: entry.name, traits: entry.description }, film.directionalPrompt);
        addLog(`${slug}: saved DNA profile for character "${entry.name}"`);
        return json(res, 200, { character: entry, dnaPrompt });
      }

      // DNA Location Add/Update (Architectural Reference Sheet)
      if (req.method === "POST" && parts[3] === "dna" && parts[4] === "location") {
        const body = await readBody(req);
        if (!body.name) return json(res, 400, { error: "name is required" });
        const film = await loadFilm(paths);
        film.locations = film.locations || [];
        const existing = film.locations.filter((l) => l.name.toLowerCase() !== body.name.toLowerCase());
        const entry: FilmLocation = {
          name: body.name,
          description: body.description || "",
          aliases: Array.isArray(body.aliases) ? body.aliases : (body.aliases || "").split(/[,;]/).map((s: string) => s.trim()).filter(Boolean),
          images: Array.isArray(body.images) ? body.images : []
        };
        film.locations = [...existing, entry];
        await saveFilm(paths, film);
        const locPrompt = buildLocationDnaImagePrompt({ name: entry.name, traits: entry.description }, film.locationDirectionalPrompt);
        addLog(`${slug}: saved Location sheet for "${entry.name}"`);
        return json(res, 200, { location: entry, locPrompt });
      }

      // DNA Character Delete
      if (req.method === "DELETE" && parts[3] === "dna" && parts[4] === "character" && parts[5]) {
        const charName = decodeURIComponent(parts[5]).toLowerCase();
        const film = await loadFilm(paths);
        film.characters = film.characters.filter((c) => c.name.toLowerCase() !== charName);
        await saveFilm(paths, film);
        addLog(`${slug}: removed character "${charName}"`);
        return json(res, 200, { success: true });
      }

      // DNA Location Delete
      if (req.method === "DELETE" && parts[3] === "dna" && parts[4] === "location" && parts[5]) {
        const locName = decodeURIComponent(parts[5]).toLowerCase();
        const film = await loadFilm(paths);
        film.locations = (film.locations || []).filter((l) => l.name.toLowerCase() !== locName);
        await saveFilm(paths, film);
        addLog(`${slug}: removed location "${locName}"`);
        return json(res, 200, { success: true });
      }

      // Add New Scene
      if (req.method === "POST" && parts[3] === "scenes" && parts.length === 4) {
        const body = await readBody(req);
        const film = await loadFilm(paths);
        const sceneNum = film.scenes.length + 1;
        const newScene: FilmScene = {
          id: body.id || `scene-${String(sceneNum).padStart(2, "0")}`,
          title: body.title || `Scene ${sceneNum}`,
          prompt: body.prompt || "Cảnh mới...",
          duration: Number(body.duration) || film.duration || 8,
          characters: Array.isArray(body.characters) ? body.characters : [],
          locationName: body.locationName,
          dialogue: body.dialogue,
          cut: Boolean(body.cut),
          shotImages: [],
          connectShot: false,
          healHistory: []
        };
        film.scenes.push(newScene);
        await saveFilm(paths, film);
        addLog(`${slug}: added new scene "${newScene.id}"`);
        return json(res, 201, newScene);
      }

      // Delete Scene
      if (req.method === "DELETE" && parts[3] === "scenes" && parts[4]) {
        const sceneId = parts[4];
        const film = await loadFilm(paths);
        const idx = film.scenes.findIndex((s) => s.id === sceneId);
        if (idx === -1) return json(res, 404, { error: "scene not found" });
        film.scenes.splice(idx, 1);
        await saveFilm(paths, film);
        addLog(`${slug}: deleted scene "${sceneId}"`);
        return json(res, 200, { success: true, sceneId });
      }

      // Auto-Heal Single Scene with Word-count-preserving synonym rewrite
      if (req.method === "POST" && parts[3] === "scenes" && parts[4] && parts[5] === "heal") {
        const sceneId = parts[4];
        const body = await readBody(req);
        const film = await loadFilm(paths);
        const scene = film.scenes.find((s) => s.id === sceneId);
        if (!scene) return json(res, 404, { error: "scene not found" });

        const reason = body.reason || "Phát hiện từ khóa nhạy cảm / vi phạm an toàn";
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

      // Loop Rewrite / Alternate Dramatic Take
      if (req.method === "POST" && parts[3] === "scenes" && parts[4] && parts[5] === "loop-rewrite") {
        const sceneId = parts[4];
        const film = await loadFilm(paths);
        const scene = film.scenes.find((s) => s.id === sceneId);
        if (!scene) return json(res, 404, { error: "scene not found" });

        const altTake = `${scene.prompt}\n[Take thay thế: Đổi sang góc máy cận cảnh đặc tả cảm xúc, chuyển động lia máy chậm (slow pan), tăng nhịp độ kịch tính và chiều sâu không gian]`;
        scene.prompt = altTake;
        scene.isRewritten = true;

        await saveFilm(paths, film);
        addLog(`${slug}: [Loop Rewrite] Created alternate dramatic take for scene "${sceneId}"`);
        return json(res, 200, { success: true, scene });
      }

      // Upload Frame / Image Directly to Scene Slot
      if (req.method === "POST" && parts[3] === "scenes" && parts[4] && parts[5] === "upload-frame") {
        const sceneId = parts[4];
        const body = await readBody(req);
        const slot = body.slot || "keyframe"; // storyboard | shot | start | last | keyframe
        const base64Data = body.base64;
        if (!base64Data) return json(res, 400, { error: "base64 is required" });

        const buffer = Buffer.from(base64Data.replace(/^data:image\/\w+;base64,/, ""), "base64");
        const filename = `${sceneId}.${slot}.png`;
        const filePath = join(paths.renders, filename);
        await mkdir(paths.renders, { recursive: true });
        await writeFile(filePath, buffer);

        const film = await loadFilm(paths);
        const scene = film.scenes.find((s) => s.id === sceneId);
        if (scene) {
          if (slot === "storyboard") scene.storyboardImage = filename;
          else if (slot === "start") scene.startFrameImage = filename;
          else if (slot === "last") scene.lastFrameImage = filename;
          await saveFilm(paths, film);
        }

        addLog(`${slug}: uploaded ${slot} frame for ${sceneId}`);
        return json(res, 200, { success: true, file: filename, relativePath: `renders/${filename}` });
      }

      // Slice Storyboard Grid into Shots
      if (req.method === "POST" && parts[3] === "scenes" && parts[4] && parts[5] === "slice-grid") {
        const sceneId = parts[4];
        const body = await readBody(req);
        const rows = Number(body.rows) || 2;
        const cols = Number(body.cols) || 2;
        const film = await loadFilm(paths);
        const scene = film.scenes.find((s) => s.id === sceneId);
        if (!scene) return json(res, 404, { error: "scene not found" });

        const sbFile = scene.storyboardImage || `${sceneId}.storyboard.png`;
        const sbPath = join(paths.renders, sbFile);
        if (!existsSync(sbPath)) return json(res, 404, { error: `Storyboard image not found at: ${sbPath}` });

        const outDir = join(paths.renders, "shots");
        const slices = await cropStoryboardGrid(sbPath, { rows, cols }, outDir, `${sceneId}_shot`);
        scene.shotImages = slices.map((s) => s.replace(paths.dir + sep, "").replace(/\\/g, "/"));
        await saveFilm(paths, film);
        addLog(`${slug}: sliced storyboard for ${sceneId} into ${slices.length} shots`);
        return json(res, 200, { success: true, count: slices.length, shots: scene.shotImages });
      }

      // Global Storyboard Grid Slice
      if (req.method === "POST" && parts[3] === "storyboard" && parts[4] === "slice") {
        const body = await readBody(req);
        const rows = Number(body.rows) || 2;
        const cols = Number(body.cols) || 2;
        const base64Data = body.base64;
        let sbPath = join(paths.renders, "storyboard_global.png");
        await mkdir(paths.renders, { recursive: true });

        if (base64Data) {
          const buffer = Buffer.from(base64Data.replace(/^data:image\/\w+;base64,/, ""), "base64");
          await writeFile(sbPath, buffer);
        } else if (!existsSync(sbPath)) {
          const film = await loadFilm(paths);
          const firstSb = film.scenes.find((s) => s.storyboardImage)?.storyboardImage;
          if (firstSb) sbPath = join(paths.renders, firstSb);
          else return json(res, 400, { error: "Vui lòng tải ảnh Storyboard lên trước khi cắt!" });
        }

        const outDir = join(paths.renders, "shots");
        const slices = await cropStoryboardGrid(sbPath, { rows, cols }, outDir, "global_shot");
        const relativeSlices = slices.map((s) => s.replace(paths.dir + sep, "").replace(/\\/g, "/"));
        addLog(`${slug}: sliced global storyboard into ${slices.length} shots`);
        return json(res, 200, { success: true, count: slices.length, shots: relativeSlices });
      }

      // Scene update
      if (req.method === "POST" && parts[3] === "scenes" && parts[4]) {
        const sceneId = parts[4];
        const body = await readBody(req);
        const film = await loadFilm(paths);
        const scene = film.scenes.find((s) => s.id === sceneId);
        if (!scene) return json(res, 404, { error: "scene not found" });

        if (body.prompt !== undefined) scene.prompt = body.prompt;
        if (body.title !== undefined) scene.title = body.title;
        if (body.cut !== undefined) scene.cut = Boolean(body.cut);
        if (body.duration !== undefined) scene.duration = Number(body.duration);
        if (body.connectShot !== undefined) scene.connectShot = Boolean(body.connectShot);
        if (Array.isArray(body.characters)) scene.characters = body.characters;

        await saveFilm(paths, film);
        addLog(`${slug}: updated scene "${sceneId}"`);
        return json(res, 200, scene);
      }

      // Render execution
      if (req.method === "POST" && parts[3] === "render") {
        if (running.has(slug)) return json(res, 409, { error: "render already running" });
        spawnRender(slug, url.searchParams.get("force") === "1");
        return json(res, 202, { started: true });
      }

      // Master Stitching
      if (req.method === "POST" && parts[3] === "stitch") {
        const normalize = url.searchParams.get("normalize") === "1";
        addLog(`${slug}: assembling final master movie (normalization: ${normalize})...`);
        const result = await stitchFilm(paths, undefined, { normalize });
        addLog(`${slug}: master video generated (${result.clips} scenes, mode: ${result.mode}) -> ${result.output}`);
        return json(res, 200, result);
      }
    }

    // Media Serving
    if (req.method === "GET" && parts[0] === "media" && parts[1] && parts.length > 2) {
      serveMedia(req, res, assertSlug(parts[1]), parts.slice(2).join("/"));
      return;
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
      for (const child of running.values()) child.kill();
      await new Promise<void>((done) => server.close(() => done()));
    }
  };
}
