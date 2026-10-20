import { mkdir, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { z } from "zod";
import { DEFAULT_VIDEO_STYLE } from "./prompts.js";

const slugPattern = /^[a-z0-9][a-z0-9-]*$/;
const idPattern = /^[a-zA-Z0-9._-]+$/;

export const filmCharacterSchema = z.object({
  name: z.string().min(1),
  description: z.string().default(""),
  aliases: z.array(z.string().min(1)).default([]),
  images: z.array(z.string().min(1)).default([]),
  flowName: z.string().min(1).optional(),
  voiceMediaId: z.string().optional(),
  voiceName: z.string().optional()
});

export const filmSceneSchema = z.object({
  id: z.string().regex(idPattern),
  title: z.string().optional(),
  prompt: z.string().min(1),
  duration: z.number().int().min(1).max(30).optional(),
  characters: z.array(z.string().min(1)).default([]),
  cut: z.boolean().default(false),
  storyboardImage: z.string().optional(),
  shotImages: z.array(z.string()).optional(),
  startFrameImage: z.string().optional(),
  lastFrameImage: z.string().optional(),
  connectShot: z.boolean().optional(),
  locationName: z.string().optional(),
  dialogue: z.string().optional(),
  isRewritten: z.boolean().optional(),
  healHistory: z.array(z.string()).optional()
});

export const filmLocationSchema = z.object({
  name: z.string().min(1),
  description: z.string().default(""),
  aliases: z.array(z.string().min(1)).default([]),
  images: z.array(z.string().min(1)).default([]),
  flowName: z.string().min(1).optional()
});

export const filmSchema = z.object({
  title: z.string().min(1),
  model: z.string().min(1).optional(),
  imageModel: z.string().optional(),
  ratio: z.string().min(1).default("16:9"),
  duration: z.number().int().min(1).max(30).default(8),
  resolution: z.string().optional(),
  videoGenMode: z.string().optional(),
  startFrameSource: z.string().optional(),
  endFrameSource: z.string().optional(),
  continuity: z.boolean().default(true),
  skipImageGen: z.boolean().optional(),
  renderFromShotOnly: z.boolean().optional(),
  autoMerge: z.boolean().optional(),
  isStoryboardCropEnabled: z.boolean().optional(),
  storyboardRows: z.number().optional(),
  storyboardCols: z.number().optional(),
  storyboardPrompt: z.string().optional(),
  isAutoHealEnabled: z.boolean().optional(),
  healInstruction: z.string().optional(),
  isCelebrityCheckEnabled: z.boolean().optional(),
  renderTimeout: z.number().optional(),
  retryDelay: z.number().optional(),
  maxRetries: z.number().optional(),
  maxAutoRetries: z.number().optional(),
  isAutoLoopEnabled: z.boolean().optional(),
  autoLoopLimit: z.number().optional(),
  loopRewritePrompt: z.string().optional(),
  isLoopAllEnabled: z.boolean().optional(),
  loopAllLimit: z.number().optional(),
  maxConcurrentRenders: z.number().optional(),
  dnaMaxConcurrent: z.number().optional(),
  storyChunkSize: z.number().optional(),
  storyConcurrency: z.number().optional(),
  storyDelay: z.number().optional(),
  imageProductionRule: z.string().optional(),
  directionalPrompt: z.string().optional(),
  locationDirectionalPrompt: z.string().optional(),
  style: z.string().default(""),
  flowProject: z.string().min(1).optional(),
  // Id of the Flow project the first render created; later renders reuse it instead of creating
  // a new Flow project every run. Ignored when `flowProject` (a project name) is set.
  flowProjectId: z.string().regex(/^[0-9a-f-]{36}$/i).optional(),
  characters: z.array(filmCharacterSchema).default([]),
  locations: z.array(filmLocationSchema).optional(),
  scenes: z.array(filmSceneSchema).default([]),
  strictActorMatch: z.boolean().optional(),
  strictLocationMatch: z.boolean().optional(),
  renderDelay: z.number().optional(),
  dnaDelay: z.number().optional(),
  sceneScale: z.number().optional(),
  isPaused: z.boolean().optional()
});

export type FilmCharacter = z.infer<typeof filmCharacterSchema>;
export type FilmLocation = z.infer<typeof filmLocationSchema>;
export type FilmScene = z.infer<typeof filmSceneSchema>;
export type Film = z.infer<typeof filmSchema>;

export type SceneStatus = "pending" | "running" | "done" | "failed";

export interface SceneState {
  status: SceneStatus;
  video?: string;
  lastFrame?: string;
  error?: string;
  updatedAt?: string;
}

export interface FilmState {
  scenes: Record<string, SceneState>;
  final?: string;
}

export function projectsRoot(): string {
  return resolve(process.env.FILM_HOME ?? join(process.cwd(), "projects"));
}

export function slugify(title: string): string {
  const slug = title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "film";
}

export function assertSlug(slug: string): string {
  if (!slugPattern.test(slug)) throw new Error(`Invalid project name: ${slug}`);
  return slug;
}

export interface ProjectPaths {
  dir: string;
  film: string;
  state: string;
  script: string;
  renders: string;
  final: string;
}

export function projectPaths(slug: string, root = projectsRoot()): ProjectPaths {
  const dir = join(root, assertSlug(slug));
  return {
    dir,
    film: join(dir, "film.json"),
    state: join(dir, "state.json"),
    script: join(dir, "script.md"),
    renders: join(dir, "renders"),
    final: join(dir, "final.mp4")
  };
}

export async function listProjects(root = projectsRoot()): Promise<string[]> {
  if (!existsSync(root)) return [];
  const entries = await readdir(root, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory() && slugPattern.test(entry.name) && existsSync(join(root, entry.name, "film.json")))
    .map((entry) => entry.name)
    .sort();
}

export async function createProject(title: string, root = projectsRoot()): Promise<{ slug: string; paths: ProjectPaths }> {
  const slug = slugify(title);
  const paths = projectPaths(slug, root);
  if (existsSync(paths.film)) throw new Error(`Project already exists: ${slug}`);
  await mkdir(paths.renders, { recursive: true });
  await saveFilm(paths, filmSchema.parse({ title, style: DEFAULT_VIDEO_STYLE }));
  return { slug, paths };
}

export async function loadFilm(paths: ProjectPaths): Promise<Film> {
  if (!existsSync(paths.film)) throw new Error(`Project not found: ${paths.dir}`);
  return filmSchema.parse(JSON.parse(await readFile(paths.film, "utf8")));
}

// The render process and the dashboard both write these files; writing a temp file and renaming
// it over the target means a reader never sees a half-written JSON document.
async function writeJsonAtomic(file: string, value: unknown): Promise<void> {
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(tmp, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  for (let attempt = 0; ; attempt += 1) {
    try {
      await rename(tmp, file);
      return;
    } catch (error) {
      // Windows refuses the rename while another process briefly holds the target open.
      const code = (error as NodeJS.ErrnoException).code;
      if (attempt >= 5 || (code !== "EPERM" && code !== "EBUSY" && code !== "EACCES")) {
        await rm(tmp, { force: true });
        throw error;
      }
      await new Promise((resolveDelay) => setTimeout(resolveDelay, 50 * (attempt + 1)));
    }
  }
}

export async function saveFilm(paths: ProjectPaths, film: Film): Promise<void> {
  await mkdir(paths.dir, { recursive: true });
  await writeJsonAtomic(paths.film, film);
}

export async function loadState(paths: ProjectPaths): Promise<FilmState> {
  if (!existsSync(paths.state)) return { scenes: {} };
  return JSON.parse(await readFile(paths.state, "utf8")) as FilmState;
}

export async function saveState(paths: ProjectPaths, state: FilmState): Promise<void> {
  await mkdir(paths.dir, { recursive: true });
  await writeJsonAtomic(paths.state, state);
}

// Re-reads state.json and changes one scene only, so concurrent writers (dashboard resets,
// another scene's update) are not overwritten by a stale in-memory copy.
export async function updateSceneState(paths: ProjectPaths, sceneId: string, entry: SceneState): Promise<FilmState> {
  const state = await loadState(paths);
  state.scenes[sceneId] = entry;
  await saveState(paths, state);
  return state;
}
