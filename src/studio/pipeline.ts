import { existsSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import YAML from "yaml";
import { messageForError } from "../errors.js";
import type { FlowAutomation } from "../flow/types.js";
import { parseVideoJob, type VideoJob } from "../jobs/schema.js";
import { concatVideos, extractLastFrame, normalizeVideo } from "./ffmpeg.js";
import {
  loadFilm,
  loadState,
  saveFilm,
  saveState,
  type Film,
  type FilmScene,
  type FilmState,
  type ProjectPaths,
  type SceneState
} from "./project.js";
import { buildScenePrompt } from "./script.js";
import { isSafetyViolation } from "./adversarial.js";
import { buildSelfHealingPrompt, calculateExponentialBackoff, cleanHealedResponse } from "./healing.js";

const VIDEO_EXTENSIONS = [".mp4", ".webm", ".mov"];

export interface RenderOptions {
  automation: FlowAutomation;
  // Render only these scene ids; default is every scene that is not done yet.
  only?: string[];
  force?: boolean;
  continuity?: boolean;
  autoHeal?: boolean;
  maxAutoRetries?: number;
  log?: (message: string) => void;
  extractFrame?: (video: string, outPng: string) => Promise<void>;
  healPromptFn?: (prompt: string, errorReason: string) => Promise<string>;
}

function abs(paths: ProjectPaths, file: string): string {
  return resolve(paths.dir, file);
}

function rel(paths: ProjectPaths, file: string): string {
  return relative(paths.dir, file).replace(/\\/g, "/");
}

export function sceneJob(film: Film, scene: FilmScene, paths: ProjectPaths, startFrame?: string): VideoJob {
  const flowNames = scene.characters
    .map((name) => film.characters.find((character) => character.name === name)?.flowName)
    .filter((name): name is string => Boolean(name));

  return parseVideoJob({
    id: scene.id,
    type: "video",
    project: film.flowProject,
    prompt: buildScenePrompt(film, scene),
    model: film.model,
    ratio: film.ratio,
    duration: scene.duration ?? film.duration,
    outputs: 1,
    out: paths.renders,
    character: flowNames,
    startFrame
  });
}

function pickVideo(artifacts: { path: string }[]): string {
  const video = artifacts.find((artifact) => VIDEO_EXTENSIONS.some((ext) => artifact.path.toLowerCase().endsWith(ext)));
  if (!video) throw new Error("Flow finished but produced no video file");
  return video.path;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Renders scenes in order. Each finished scene's last frame becomes the next scene's start frame
// (unless the next scene is a hard cut), so the film flows as one continuous take.
export async function renderFilm(paths: ProjectPaths, options: RenderOptions): Promise<FilmState> {
  const log = options.log ?? (() => undefined);
  const extract = options.extractFrame ?? extractLastFrame;
  const film = await loadFilm(paths);
  const state = await loadState(paths);
  const useContinuity = options.continuity ?? film.continuity;
  const autoHeal = options.autoHeal ?? true;
  const maxAutoRetries = options.maxAutoRetries ?? 5;

  if (film.scenes.length === 0) throw new Error("Project has no scenes. Import a script first.");
  const unknown = (options.only ?? []).filter((id) => !film.scenes.some((scene) => scene.id === id));
  if (unknown.length > 0) throw new Error(`Unknown scene id(s): ${unknown.join(", ")}`);

  let previous: SceneState | undefined;

  for (const scene of film.scenes) {
    const existing = state.scenes[scene.id];
    const wanted = options.only ? options.only.includes(scene.id) : true;
    const alreadyDone = existing?.status === "done" && existing.video && existsSync(abs(paths, existing.video));

    if (!wanted || (alreadyDone && !options.force)) {
      if (alreadyDone) log(`${scene.id}: already rendered, skipping`);
      previous = existing?.status === "done" ? existing : previous;
      continue;
    }

    const seed = useContinuity && !scene.cut ? previous?.lastFrame : undefined;
    const startFrame = seed && existsSync(abs(paths, seed)) ? abs(paths, seed) : undefined;
    if (useContinuity && !scene.cut && previous && !startFrame) {
      log(`${scene.id}: previous scene has no last frame, rendering without continuity`);
    }

    state.scenes[scene.id] = { status: "running", updatedAt: new Date().toISOString() };
    await saveState(paths, state);
    log(`${scene.id}: rendering${startFrame ? " (continuing from previous last frame)" : ""}`);

    let attempt = 0;
    let renderedSuccessfully = false;

    while (!renderedSuccessfully) {
      try {
        const result = await options.automation.runJob({ job: sceneJob(film, scene, paths, startFrame), outDir: paths.renders });
        const video = pickVideo(result.artifacts);
        const lastFramePath = join(paths.renders, `${scene.id}.last.png`);
        await extract(video, lastFramePath);

        state.scenes[scene.id] = {
          status: "done",
          video: rel(paths, video),
          lastFrame: rel(paths, lastFramePath),
          updatedAt: new Date().toISOString()
        };
        await saveState(paths, state);
        previous = state.scenes[scene.id];
        log(`${scene.id}: done -> ${state.scenes[scene.id].video}`);
        renderedSuccessfully = true;
      } catch (error) {
        const errorMsg = messageForError(error);
        const isSafety = isSafetyViolation(errorMsg);

        if (autoHeal && isSafety && attempt < maxAutoRetries) {
          attempt++;
          const waitTime = calculateExponentialBackoff(attempt);
          log(`${scene.id}: safety filter triggered ("${errorMsg}"). Auto-healing prompt (attempt ${attempt}/${maxAutoRetries}) in ${waitTime}ms...`);
          await sleep(waitTime);

          if (options.healPromptFn) {
            try {
              const healed = await options.healPromptFn(scene.prompt, errorMsg);
              scene.prompt = cleanHealedResponse(healed);
              await saveFilm(paths, film);
              log(`${scene.id}: prompt healed successfully. Retrying render...`);
            } catch (healError) {
              log(`${scene.id}: auto-heal rewrite failed: ${messageForError(healError)}`);
            }
          } else {
            log(`${scene.id}: retrying render with backoff...`);
          }
          continue;
        }

        state.scenes[scene.id] = { status: "failed", error: errorMsg, updatedAt: new Date().toISOString() };
        await saveState(paths, state);
        log(`${scene.id}: failed - ${state.scenes[scene.id].error}`);
        throw error;
      }
    }
  }

  return state;
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
}

export async function stitchFilm(
  paths: ProjectPaths,
  output = paths.final,
  options: StitchOptions = {}
): Promise<{ output: string; mode: "copy" | "reencode"; clips: number }> {
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
  if (missing.length > 0) throw new Error(`Cannot stitch, scenes not rendered: ${missing.join(", ")}`);

  let finalInputs = videos;
  if (options.normalize) {
    const normalizedDir = join(paths.renders, "normalized");
    const normalizedVideos: string[] = [];
    for (let i = 0; i < videos.length; i++) {
      const normPath = join(normalizedDir, `norm_${String(i + 1).padStart(3, "0")}.mp4`);
      await normalizeVideo(videos[i], normPath);
      normalizedVideos.push(normPath);
    }
    finalInputs = normalizedVideos;
  }

  const mode = await concatVideos(finalInputs, output);
  state.final = rel(paths, output);
  await saveState(paths, state);
  return { output, mode, clips: videos.length };
}
