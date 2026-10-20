import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import YAML from "yaml";
import {
  CreditLimitError,
  DownloadError,
  GenerationBlockedError,
  GenerationFailedError,
  LoginRequiredError,
  ManualActionRequiredError,
  RateLimitedError,
  UiContractError,
  messageForError
} from "../../core/errors.js";
import type { FlowAutomation } from "../../core/automation.js";
import { parseVideoJob, type VideoJob } from "../../core/jobs.js";
import { concatVideos, extractLastFrame, normalizeVideo } from "../media/ffmpeg.js";

import {
  loadFilm,
  loadState,
  saveFilm,
  saveState,
  updateSceneState,
  type Film,
  type FilmScene,
  type FilmState,
  type ProjectPaths,
  type SceneState
} from "../domain/project.js";
import { buildScenePrompt } from "../domain/script.js";
import { projectIdFromUrl } from "../../core/flow-urls.js";

const VIDEO_EXTENSIONS = [".mp4", ".webm", ".mov"];

const DEFAULT_MAX_RETRIES = 2;
const DEFAULT_RETRY_DELAY_MS = 15_000;
const MIN_RATE_LIMIT_DELAY_MS = 60_000;
const MAX_RATE_LIMIT_DELAY_MS = 10 * 60_000;
const DEFAULT_PAUSE_POLL_MS = 2_000;
const NORMALIZE_CONCURRENCY = 3;

export interface RenderOptions {
  automation: FlowAutomation;
  // Render only these scene ids; default is every scene that is not done yet.
  only?: string[];
  force?: boolean;
  // The options below override film.json; leave them undefined to use the project settings.
  continuity?: boolean;
  // Keep going after a failed scene: the scenes that continue from it are skipped until the
  // next hard cut, everything after that still renders.
  continueOnError?: boolean;
  // Retries for transient Flow/UI failures and rate limits. Policy blocks are never retried:
  // the same prompt would be blocked again and every attempt costs credits.
  maxRetries?: number;
  retryDelayMs?: number;
  renderDelayMs?: number;
  timeoutSeconds?: number;
  pausePollMs?: number;
  signal?: AbortSignal;
  log?: (message: string) => void;
  extractFrame?: (video: string, outPng: string) => Promise<void>;
  sleep?: (ms: number, signal?: AbortSignal) => Promise<void>;
}

export interface RenderResult {
  state: FilmState;
  failed: string[];
  skipped: string[];
}

interface RenderSettings {
  continuity: boolean;
  maxRetries: number;
  retryDelayMs: number;
  renderDelayMs: number;
  timeoutSeconds?: number;
}

// How the pipeline reacts to an error thrown while rendering one scene.
// - transient / rate-limited: retry the scene (bounded)
// - blocked / failed: the scene fails; with continueOnError the film carries on
// - stop: nothing else can succeed (login, credits, manual action) — stop the whole run
export type RenderErrorKind = "transient" | "rate-limited" | "blocked" | "failed" | "stop";

export function classifyRenderError(error: unknown): RenderErrorKind {
  if (error instanceof GenerationBlockedError) return "blocked";
  if (error instanceof RateLimitedError) return "rate-limited";
  if (error instanceof CreditLimitError || error instanceof LoginRequiredError || error instanceof ManualActionRequiredError) {
    return "stop";
  }
  if (error instanceof GenerationFailedError || error instanceof UiContractError || error instanceof DownloadError) {
    return "transient";
  }
  // Playwright action/navigation timeouts.
  if (error instanceof Error && error.name === "TimeoutError") return "transient";
  if (error instanceof FrameExtractionError) return "stop";
  return "failed";
}

// The video rendered (credits spent) but its last frame could not be extracted — usually a
// missing or broken ffmpeg. Re-rendering would not help, so this stops the run.
class FrameExtractionError extends Error {
  constructor(sceneId: string, cause: unknown) {
    super(`${sceneId}: rendered, but extracting its last frame failed (is ffmpeg on PATH?): ${messageForError(cause)}`);
    this.name = "FrameExtractionError";
  }
}

function abs(paths: ProjectPaths, file: string): string {
  return resolve(paths.dir, file);
}

function rel(paths: ProjectPaths, file: string): string {
  return relative(paths.dir, file).replace(/\\/g, "/");
}

function secondsToMs(value: number | undefined): number | undefined {
  return value === undefined || !Number.isFinite(value) || value < 0 ? undefined : Math.round(value * 1000);
}

function resolveSettings(film: Film, options: RenderOptions): RenderSettings {
  const timeout = options.timeoutSeconds ?? film.renderTimeout;
  return {
    continuity: options.continuity ?? film.continuity,
    maxRetries: Math.max(0, options.maxRetries ?? film.maxRetries ?? DEFAULT_MAX_RETRIES),
    retryDelayMs: options.retryDelayMs ?? secondsToMs(film.retryDelay) ?? DEFAULT_RETRY_DELAY_MS,
    renderDelayMs: options.renderDelayMs ?? secondsToMs(film.renderDelay) ?? 0,
    timeoutSeconds: timeout && timeout > 0 ? Math.round(timeout) : undefined
  };
}

function abortableSleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolveSleep, rejectSleep) => {
    if (signal?.aborted) return rejectSleep(signal.reason);
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolveSleep();
    }, ms);
    const onAbort = (): void => {
      clearTimeout(timer);
      rejectSleep(signal?.reason);
    };
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

// Flow characters saved for the cast of this scene (characters with a flowName).
export function sceneFlowCharacters(film: Film, scene: FilmScene): string[] {
  return scene.characters
    .map((name) => film.characters.find((character) => character.name === name)?.flowName)
    .filter((name): name is string => Boolean(name));
}

// How a scene that continues from the previous last frame is rendered. Flow takes characters only
// in Ingredients mode, which has no start frame, so there is a choice:
// - "frames": start exactly on the previous last frame (Frames mode, no characters). Seamless,
//   but when that frame does not show the faces clearly, Flow invents new ones.
// - "ingredients": Ingredients mode with the cast's Flow characters plus the previous last frame
//   as a reference image. Faces stay on model; the cut is close but not frame-exact.
// "ingredients" only applies when the scene has Flow characters; otherwise it falls back to frames.
// Scenes without a start frame (first scene, [CUT]) always get their characters.
export function sceneContinuity(film: Film, scene: FilmScene, startFrame?: string): "none" | "frames" | "ingredients" {
  if (!startFrame) return "none";
  const mode = scene.continuityMode ?? film.continuityMode ?? "frames";
  return mode === "ingredients" && sceneFlowCharacters(film, scene).length > 0 ? "ingredients" : "frames";
}

const REFERENCE_CONTINUITY = "The shot opens on the reference image: same place, positions, framing and light.";

export function sceneJob(film: Film, scene: FilmScene, paths: ProjectPaths, startFrame?: string, timeout?: number): VideoJob {
  const continuity = sceneContinuity(film, scene, startFrame);
  const prompt = buildScenePrompt(film, scene);

  return parseVideoJob({
    id: scene.id,
    type: "video",
    project: film.flowProject ?? film.flowProjectId,
    prompt: continuity === "ingredients" ? `${prompt}\n${REFERENCE_CONTINUITY}` : prompt,
    model: film.model,
    ratio: film.ratio,
    duration: scene.duration ?? film.duration,
    outputs: 1,
    out: paths.renders,
    character: continuity === "frames" ? [] : sceneFlowCharacters(film, scene),
    ingredients: continuity === "ingredients" ? [startFrame] : [],
    startFrame: continuity === "frames" ? startFrame : undefined,
    timeout
  });
}

function renderNote(film: Film, scene: FilmScene, startFrame?: string): string {
  const cast = sceneFlowCharacters(film, scene).join(", ");
  switch (sceneContinuity(film, scene, startFrame)) {
    case "ingredients":
      return ` (Ingredients: Flow characters ${cast} + previous last frame as reference)`;
    case "frames":
      return ` (continuing from previous last frame)${cast ? `; Flow characters ${cast} not attached, Frames mode cannot take them (continuityMode "ingredients" can)` : ""}`;
    default:
      return cast ? ` with Flow characters ${cast}` : "";
  }
}

function pickVideo(artifacts: { path: string }[]): string {
  const video = artifacts.find((artifact) => VIDEO_EXTENSIONS.some((ext) => artifact.path.toLowerCase().endsWith(ext)));
  if (!video) throw new GenerationFailedError("Flow finished but produced no video file");
  return video.path;
}

// Without a Flow project in film.json, every `film render` used to open Flow's home page and
// create a brand-new Flow project, scattering one film across many projects. The first scene
// that renders records its project id so every later scene and run goes back to it.
async function rememberFlowProject(paths: ProjectPaths, flowUrl: string, log: (message: string) => void): Promise<void> {
  const projectId = projectIdFromUrl(flowUrl);
  if (!projectId) return;
  const film = await loadFilm(paths);
  if (film.flowProject || film.flowProjectId) return;
  film.flowProjectId = projectId;
  await saveFilm(paths, film);
  log(`using Flow project ${projectId} for this film (saved as flowProjectId in film.json)`);
}

async function fileHash(file: string): Promise<string> {
  return createHash("sha256").update(await readFile(file)).digest("hex");
}

// A clip byte-identical to another scene's means Flow result detection picked up an older clip
// (it happened when a prompt landed in the previous clip's edit view). Marking it done would
// silently chain every later scene from the wrong frame, so the scene fails instead — and is not
// retried, since re-rendering costs credits and may hit the same detection problem.
async function assertNotDuplicate(paths: ProjectPaths, sceneId: string, video: string): Promise<void> {
  const size = (await stat(video)).size;
  let hash: string | undefined;
  for (const [otherId, entry] of Object.entries((await loadState(paths)).scenes)) {
    if (otherId === sceneId || !isDone(paths, entry)) continue;
    const other = abs(paths, entry.video as string);
    if (resolve(other) === resolve(video) || (await stat(other)).size !== size) continue;
    hash ??= await fileHash(video);
    if ((await fileHash(other)) === hash) {
      throw new Error(`${sceneId}: the downloaded video is identical to ${otherId}'s — Flow returned an older clip instead of this scene's`);
    }
  }
}

function isDone(paths: ProjectPaths, entry: SceneState | undefined): boolean {
  return entry?.status === "done" && Boolean(entry.video) && existsSync(abs(paths, entry.video as string));
}

// The start frame for `film.scenes[index]`: the last frame of the scene right before it. If that
// scene's video exists but its frame does not (an earlier run failed after rendering), extract it now.
async function continuitySeed(
  paths: ProjectPaths,
  film: Film,
  index: number,
  extract: (video: string, outPng: string) => Promise<void>,
  log: (message: string) => void
): Promise<string | undefined> {
  const scene = film.scenes[index];
  const previousScene = film.scenes[index - 1];
  if (!previousScene) return undefined;

  const previous = (await loadState(paths)).scenes[previousScene.id];
  if (!isDone(paths, previous)) {
    log(`${scene.id}: previous scene ${previousScene.id} is not rendered, rendering without continuity`);
    return undefined;
  }
  if (previous?.lastFrame && existsSync(abs(paths, previous.lastFrame))) return abs(paths, previous.lastFrame);

  const lastFramePath = join(paths.renders, `${previousScene.id}.last.png`);
  try {
    await extract(abs(paths, previous?.video as string), lastFramePath);
  } catch (error) {
    throw new FrameExtractionError(previousScene.id, error);
  }
  await updateSceneState(paths, previousScene.id, { ...(previous as SceneState), lastFrame: rel(paths, lastFramePath) });
  return lastFramePath;
}

async function waitWhilePaused(
  paths: ProjectPaths,
  sceneId: string,
  options: RenderOptions,
  sleep: (ms: number, signal?: AbortSignal) => Promise<void>,
  log: (message: string) => void
): Promise<void> {
  let announced = false;
  for (;;) {
    options.signal?.throwIfAborted();
    const film = await loadFilm(paths);
    if (!film.isPaused) {
      if (announced) log(`${sceneId}: resumed`);
      return;
    }
    if (!announced) {
      log(`${sceneId}: render queue paused, waiting for resume`);
      announced = true;
    }
    await sleep(options.pausePollMs ?? DEFAULT_PAUSE_POLL_MS, options.signal);
  }
}

// Renders scenes in order. Each finished scene's last frame becomes the next scene's start frame
// (unless the next scene is a hard cut), so the film flows as one continuous take.
// film.json is re-read before every scene, so edits made while a render runs (prompts, pause,
// settings) apply to the scenes that have not started yet.
export async function renderFilm(paths: ProjectPaths, options: RenderOptions): Promise<RenderResult> {
  const log = options.log ?? (() => undefined);
  const extract = options.extractFrame ?? extractLastFrame;
  const sleep = options.sleep ?? abortableSleep;

  const initial = await loadFilm(paths);
  if (initial.scenes.length === 0) throw new Error("Project has no scenes. Import a script first.");
  const unknown = (options.only ?? []).filter((id) => !initial.scenes.some((scene) => scene.id === id));
  if (unknown.length > 0) throw new Error(`Unknown scene id(s): ${unknown.join(", ")}`);

  const visited = new Set<string>();
  const failed: string[] = [];
  const skipped: string[] = [];
  // Set when a scene fails under continueOnError: its successors would need its last frame.
  let brokenChainFrom: string | undefined;
  let renderedAny = false;

  for (;;) {
    let film = await loadFilm(paths);
    const index = film.scenes.findIndex((candidate) => !visited.has(candidate.id));
    if (index === -1) break;
    let scene = film.scenes[index];
    visited.add(scene.id);
    if (scene.cut) brokenChainFrom = undefined;

    const existing = (await loadState(paths)).scenes[scene.id];
    const wanted = options.only ? options.only.includes(scene.id) : true;
    const alreadyDone = isDone(paths, existing);

    if (!wanted || (alreadyDone && !options.force)) {
      if (alreadyDone) {
        log(`${scene.id}: already rendered, skipping`);
        brokenChainFrom = undefined;
      }
      continue;
    }
    if (brokenChainFrom) {
      skipped.push(scene.id);
      log(`${scene.id}: skipped, it continues from failed scene ${brokenChainFrom}`);
      continue;
    }

    await waitWhilePaused(paths, scene.id, options, sleep, log);
    // Pick up edits made while paused (or while the previous scene rendered).
    film = await loadFilm(paths);
    const freshIndex = film.scenes.findIndex((candidate) => candidate.id === scene.id);
    if (freshIndex === -1) {
      log(`${scene.id}: removed from the project, skipping`);
      continue;
    }
    scene = film.scenes[freshIndex];
    const settings = resolveSettings(film, options);

    if (renderedAny && settings.renderDelayMs > 0) await sleep(settings.renderDelayMs, options.signal);

    try {
      const startFrame = settings.continuity && !scene.cut ? await continuitySeed(paths, film, freshIndex, extract, log) : undefined;
      await updateSceneState(paths, scene.id, { status: "running", updatedAt: new Date().toISOString() });
      log(`${scene.id}: rendering${renderNote(film, scene, startFrame)}`);

      const { video, flowUrl } = await renderWithRetries(film, scene, paths, startFrame, settings, options, sleep, log);
      await rememberFlowProject(paths, flowUrl, log);
      await assertNotDuplicate(paths, scene.id, video);
      const lastFramePath = join(paths.renders, `${scene.id}.last.png`);
      let lastFrame: string | undefined;
      let extractError: unknown;
      try {
        await extract(video, lastFramePath);
        lastFrame = rel(paths, lastFramePath);
      } catch (error) {
        extractError = error;
      }
      // The video is kept as done either way; a later run re-extracts the missing frame.
      await updateSceneState(paths, scene.id, {
        status: "done",
        video: rel(paths, video),
        lastFrame,
        updatedAt: new Date().toISOString()
      });
      if (extractError) throw new FrameExtractionError(scene.id, extractError);
      renderedAny = true;
      log(`${scene.id}: done -> ${rel(paths, video)}`);
    } catch (error) {
      if (options.signal?.aborted) {
        await updateSceneState(paths, scene.id, { status: "pending", updatedAt: new Date().toISOString() });
        log(`${scene.id}: stopped`);
        throw error;
      }
      const kind = classifyRenderError(error);
      if (!(error instanceof FrameExtractionError)) {
        await updateSceneState(paths, scene.id, { status: "failed", error: messageForError(error), updatedAt: new Date().toISOString() });
      }
      const hint = kind === "blocked" ? " — edit this scene's prompt, then render again" : "";
      log(`${scene.id}: failed - ${messageForError(error)}${hint}`);
      if (kind === "stop" || !options.continueOnError) throw error;
      failed.push(scene.id);
      if (settings.continuity) brokenChainFrom = scene.id;
    }
  }

  return { state: await loadState(paths), failed, skipped };
}

async function renderWithRetries(
  film: Film,
  scene: FilmScene,
  paths: ProjectPaths,
  startFrame: string | undefined,
  settings: RenderSettings,
  options: RenderOptions,
  sleep: (ms: number, signal?: AbortSignal) => Promise<void>,
  log: (message: string) => void
): Promise<{ video: string; flowUrl: string }> {
  for (let attempt = 0; ; attempt += 1) {
    options.signal?.throwIfAborted();
    try {
      const job = sceneJob(film, scene, paths, startFrame, settings.timeoutSeconds);
      const result = await options.automation.runJob({ job, outDir: paths.renders });
      return { video: pickVideo(result.artifacts), flowUrl: result.flowUrl };
    } catch (error) {
      if (options.signal?.aborted) throw error;
      const kind = classifyRenderError(error);
      if ((kind !== "transient" && kind !== "rate-limited") || attempt >= settings.maxRetries) throw error;

      const wait =
        kind === "rate-limited"
          ? Math.min(Math.max(settings.retryDelayMs, MIN_RATE_LIMIT_DELAY_MS) * 2 ** attempt, MAX_RATE_LIMIT_DELAY_MS)
          : settings.retryDelayMs;
      log(`${scene.id}: ${messageForError(error)} — retry ${attempt + 1}/${settings.maxRetries} in ${Math.round(wait / 1000)}s`);
      await sleep(wait, options.signal);
    }
  }
}

// The same film as a plain `gflow batch` pipeline (no continuity: batch jobs cannot see each
// other's output). Useful for fire-and-forget renders.
export async function planBatch(paths: ProjectPaths): Promise<string> {
  const film = await loadFilm(paths);
  const jobs = film.scenes.map((scene) => {
    const job = sceneJob(film, scene, paths);
    return Object.fromEntries(
      Object.entries({ ...job, out: rel(paths, job.out) }).filter(([, value]) => value !== undefined && !(Array.isArray(value) && value.length === 0))
    );
  });
  return YAML.stringify({ jobs });
}

export interface StitchOptions {
  normalize?: boolean;
  // Join just the scenes rendered so far (in film order) instead of refusing — for previews.
  onlyRendered?: boolean;
}

// Runs `worker` over `items` with at most `limit` in flight, preserving result order.
async function mapLimit<T, R>(items: T[], limit: number, worker: (item: T, index: number) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  const lanes = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const index = next++;
      results[index] = await worker(items[index], index);
    }
  });
  await Promise.all(lanes);
  return results;
}

export async function stitchFilm(
  paths: ProjectPaths,
  output = paths.final,
  options: StitchOptions = {}
): Promise<{ output: string; mode: "copy" | "reencode"; clips: number; skipped: string[] }> {
  const film = await loadFilm(paths);
  const state = await loadState(paths);

  const videos: string[] = [];
  const missing: string[] = [];
  for (const scene of film.scenes) {
    const entry = state.scenes[scene.id];
    if (entry?.status === "done" && entry.video && existsSync(abs(paths, entry.video))) {
      videos.push(abs(paths, entry.video));
    } else {
      missing.push(scene.id);
    }
  }
  if (missing.length > 0 && !options.onlyRendered) {
    throw new Error(`Cannot stitch, scenes not rendered: ${missing.join(", ")} (use --only-rendered for a preview of the rendered ones)`);
  }
  if (videos.length === 0) throw new Error("Cannot stitch, no scenes are rendered yet");

  let finalInputs = videos;
  if (options.normalize) {
    const normalizedDir = join(paths.renders, "normalized");
    finalInputs = await mapLimit(videos, NORMALIZE_CONCURRENCY, async (video, i) => {
      const normPath = join(normalizedDir, `norm_${String(i + 1).padStart(3, "0")}.mp4`);
      await normalizeVideo(video, normPath);
      return normPath;
    });
  }

  const mode = await concatVideos(finalInputs, output);
  const latest = await loadState(paths);
  latest.final = rel(paths, output);
  await saveState(paths, latest);
  return { output, mode, clips: videos.length, skipped: missing };
}
