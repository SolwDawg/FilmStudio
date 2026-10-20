// Edits the dashboard (or any other front end) makes to a film and its render state. Pure
// functions over Film/FilmState: callers load, apply, and save.
import { buildActorDnaImagePrompt, buildLocationDnaImagePrompt } from "./dna.js";
import { genrePreset } from "./genres.js";
import {
  type Film,
  type FilmCharacter,
  type FilmLocation,
  type FilmScene,
  filmSchema,
  type FilmState,
  type ProjectPaths
} from "./project.js";
import { DEFAULT_STORYBOARD_PROMPT } from "./prompts.js";

// A parsed JSON request body.
export type Fields = Record<string, unknown>;

// Settings a front end may change. Everything else in film.json (scenes, cast, Flow project id)
// has its own edit below.
export const FILM_CONFIG_KEYS = [
  "title", "ratio", "duration", "continuity", "continuityMode", "model", "imageModel", "resolution",
  "videoGenMode", "startFrameSource", "endFrameSource", "skipImageGen", "renderFromShotOnly",
  "autoMerge", "isStoryboardCropEnabled", "storyboardRows", "storyboardCols", "storyboardPrompt",
  "isAutoHealEnabled", "healInstruction", "isCelebrityCheckEnabled", "renderTimeout", "retryDelay",
  "maxRetries", "maxAutoRetries", "isAutoLoopEnabled", "autoLoopLimit", "loopRewritePrompt",
  "isLoopAllEnabled", "loopAllLimit", "maxConcurrentRenders", "dnaMaxConcurrent", "storyChunkSize",
  "storyConcurrency", "storyDelay", "imageProductionRule", "directionalPrompt", "locationDirectionalPrompt",
  "style", "strictActorMatch", "strictLocationMatch", "renderDelay", "dnaDelay", "sceneScale"
] as const;

// Applies the known settings in `fields` and validates the result, so a bad value is rejected here
// instead of making film.json unreadable on the next load.
export function applyFilmConfig(film: Film, fields: Fields): Film {
  const patch = Object.fromEntries(FILM_CONFIG_KEYS.filter((key) => fields[key] !== undefined).map((key) => [key, fields[key]]));
  return filmSchema.parse({ ...film, ...patch });
}

function list(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string");
  return typeof value === "string" ? value.split(/[,;]/).map((item) => item.trim()).filter(Boolean) : [];
}
const text = (value: unknown): string | undefined => (typeof value === "string" ? value : undefined);
const sameName = (a: string, b: string): boolean => a.toLowerCase() === b.toLowerCase();

export function upsertCharacter(film: Film, fields: Fields): FilmCharacter {
  const name = text(fields.name);
  if (!name) throw new Error("name is required");
  const character: FilmCharacter = {
    name,
    description: text(fields.description) ?? "",
    aliases: list(fields.aliases),
    images: Array.isArray(fields.images) ? list(fields.images) : [],
    voiceMediaId: text(fields.voiceMediaId),
    voiceName: text(fields.voiceName)
  };
  film.characters = [...film.characters.filter((c) => !sameName(c.name, name)), character];
  return character;
}

export function upsertLocation(film: Film, fields: Fields): FilmLocation {
  const name = text(fields.name);
  if (!name) throw new Error("name is required");
  const location: FilmLocation = {
    name,
    description: text(fields.description) ?? "",
    aliases: list(fields.aliases),
    images: Array.isArray(fields.images) ? list(fields.images) : []
  };
  film.locations = [...(film.locations ?? []).filter((l) => !sameName(l.name, name)), location];
  return location;
}

export function removeCharacter(film: Film, name: string): void {
  film.characters = film.characters.filter((c) => !sameName(c.name, name));
}

export function removeLocation(film: Film, name: string): void {
  film.locations = (film.locations ?? []).filter((l) => !sameName(l.name, name));
}

export function addScene(film: Film, fields: Fields): FilmScene {
  const number = film.scenes.length + 1;
  const scene: FilmScene = {
    id: text(fields.id) || `scene-${String(number).padStart(2, "0")}`,
    title: text(fields.title) || `Scene ${number}`,
    prompt: text(fields.prompt) || "Cảnh mới...",
    duration: Number(fields.duration) || film.duration || 8,
    characters: Array.isArray(fields.characters) ? list(fields.characters) : [],
    locationName: text(fields.locationName),
    dialogue: text(fields.dialogue),
    cut: Boolean(fields.cut),
    shotImages: [],
    connectShot: false,
    healHistory: []
  };
  film.scenes.push(scene);
  return scene;
}

// Returns the updated scene, or undefined when there is no scene with that id.
export function updateScene(film: Film, sceneId: string, fields: Fields): FilmScene | undefined {
  const scene = film.scenes.find((s) => s.id === sceneId);
  if (!scene) return undefined;
  if (typeof fields.prompt === "string") scene.prompt = fields.prompt;
  if (typeof fields.title === "string") scene.title = fields.title;
  if (fields.cut !== undefined) scene.cut = Boolean(fields.cut);
  if (fields.duration !== undefined) scene.duration = Number(fields.duration);
  if (fields.connectShot !== undefined) scene.connectShot = Boolean(fields.connectShot);
  if (Array.isArray(fields.characters)) scene.characters = list(fields.characters);
  return scene;
}

export function deleteScene(film: Film, sceneId: string): boolean {
  const index = film.scenes.findIndex((s) => s.id === sceneId);
  if (index === -1) return false;
  film.scenes.splice(index, 1);
  return true;
}

// Records an image file (in renders/) as the scene's storyboard, start or last frame.
export function setSceneImage(film: Film, sceneId: string, slot: string, file: string): void {
  const scene = film.scenes.find((s) => s.id === sceneId);
  if (!scene) return;
  if (slot === "storyboard") scene.storyboardImage = file;
  else if (slot === "start") scene.startFrameImage = file;
  else if (slot === "last") scene.lastFrameImage = file;
}

// A stopped render leaves its scene "running"; put it back in the queue.
export function requeueRunning(state: FilmState): void {
  for (const scene of Object.values(state.scenes)) {
    if (scene.status === "running") scene.status = "pending";
  }
}

// Forget everything but finished scenes, so failed and pending ones render again.
export function keepFinishedOnly(state: FilmState): void {
  for (const [id, scene] of Object.entries(state.scenes)) {
    if (scene.status !== "done") delete state.scenes[id];
  }
}

// The reference-sheet prompts exactly as dna.ts builds them, for the dashboard to show.
export function referencePrompts(film: Film): { characters: Record<string, string>; locations: Record<string, string> } {
  return {
    characters: Object.fromEntries(
      film.characters.map((c) => [c.name, buildActorDnaImagePrompt({ name: c.name, traits: c.description }, film.directionalPrompt)])
    ),
    locations: Object.fromEntries(
      (film.locations ?? []).map((l) => [l.name, buildLocationDnaImagePrompt({ name: l.name, traits: l.description }, film.locationDirectionalPrompt)])
    )
  };
}

// What "reset" returns a prompt field to: the project's genre preset, not the generic default.
export function promptDefaults(film: Film): { directionalPrompt: string; locationDirectionalPrompt: string; storyboardPrompt: string; style: string } {
  const preset = genrePreset(film.genre);
  return {
    directionalPrompt: preset.directionalPrompt,
    locationDirectionalPrompt: preset.locationDirectionalPrompt,
    storyboardPrompt: DEFAULT_STORYBOARD_PROMPT,
    style: preset.style
  };
}

// Path of a shot image relative to the project folder, with forward slashes (as the UI uses it).
export function projectRelative(paths: ProjectPaths, file: string): string {
  return file.replace(paths.dir, "").replace(/^[\\/]+/, "").replace(/\\/g, "/");
}
