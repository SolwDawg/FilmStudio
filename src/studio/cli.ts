import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { Command, CommanderError, InvalidArgumentError } from "commander";
import { BROWSER_CHANNELS, DEFAULT_BROWSER_CHANNEL, type BrowserChannel } from "../browser/session.js";
import { exitCodeForError, messageForError } from "../core/errors.js";
import type { FlowAutomation } from "../core/automation.js";

import { planBatch, renderFilm, stitchFilm } from "./render/pipeline.js";
import {
  createProject,
  listProjects,
  loadFilm,
  loadState,
  projectPaths,
  saveFilm,
  saveState,
  type FilmCharacter
} from "./domain/project.js";
import { scenesFromScript } from "./domain/script.js";
import { startDashboard } from "./dashboard/server.js";
import { openFlowAutomation } from "./session.js";
import { chunkStory, buildStoryChunkPrompt } from "./domain/breakdown.js";
import { buildActorDnaImagePrompt } from "./domain/dna.js";
import { DEFAULT_GENRE, GENRES, genrePreset, isGenreId, type GenreId } from "./domain/genres.js";
import { resolveVersion } from "../core/version.js";

export interface CreateStudioProgramOptions {
  // Tests inject a fake instead of driving a real browser.
  automation?: FlowAutomation;
}

function parseBrowser(value: string): BrowserChannel {
  if (!BROWSER_CHANNELS.includes(value as BrowserChannel)) {
    throw new InvalidArgumentError(`must be one of: ${BROWSER_CHANNELS.join(", ")}`);
  }
  return value as BrowserChannel;
}

function parseCount(value: string): number {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 0) throw new InvalidArgumentError("must be a non-negative integer");
  return parsed;
}

function collect(value: string, previous: string[]): string[] {
  return [...previous, value];
}

export function createStudioProgram(options: CreateStudioProgramOptions = {}): Command {
  const program = new Command();
  program
    .name("film")
    .description("AI film studio: script -> scenes -> Google Flow renders with continuity -> final movie.")
    .version(resolveVersion());
  program.exitOverride();

  program
    .command("new")
    .description("Create a film project (optionally importing a script right away).")
    .argument("<title>", "film title")
    .option("--script <file>", "script file with SCENE 1:, SCENE 2: ... sections")
    .option("--genre <genre>", `genre preset: ${Object.keys(GENRES).join(", ")} (see film genres)`, parseGenre, DEFAULT_GENRE)
    .action(async (title: string, command: { script?: string; genre: GenreId }) => {
      const { slug, paths } = await createProject(title, undefined, command.genre);
      console.log(`created project "${slug}" at ${paths.dir} (genre: ${GENRES[command.genre].label})`);
      if (command.script) await importScript(slug, command.script);
    });

  program
    .command("genres")
    .description("List the genre presets a new project can start from.")
    .action(() => {
      for (const [id, preset] of Object.entries(GENRES)) console.log(`${id}	${preset.label}	${preset.description}`);
    });

  program
    .command("list")
    .description("List film projects.")
    .action(async () => {
      for (const slug of await listProjects()) {
        const film = await loadFilm(projectPaths(slug));
        console.log(`${slug}\t${film.title}\t${film.scenes.length} scenes`);
      }
    });

  program
    .command("import")
    .description("Replace the project's scenes with the ones parsed from a script file.")
    .argument("<project>", "project name")
    .argument("<script>", "script file")
    .action(async (slug: string, script: string) => {
      await importScript(slug, script);
    });

  program
    .command("breakdown")
    .description("Break down a long narrative story into 150-word chunks and prepare structured SCENE prompts.")
    .argument("<story>", "story or prose text file")
    .option("-o, --output <file>", "write breakdown prompts or parsed script to a file")
    .option("--chunk-words <n>", "words per chunk", (val) => Number.parseInt(val, 10), 150)
    .option("--duration <s>", "seconds per scene clip the script is written for", (val) => Number.parseInt(val, 10), 8)
    .option("--genre <genre>", `genre preset whose instructions to use: ${Object.keys(GENRES).join(", ")}`, parseGenre)
    .option("--project <project>", "use this project's story prompt (storyPrompt) and scene duration")
    .action(async (storyFile: string, command: { output?: string; chunkWords: number; duration: number; genre?: GenreId; project?: string }) => {
      let instructions = command.genre ? genrePreset(command.genre).storyPrompt : undefined;
      let duration = command.duration;
      if (command.project) {
        const film = await loadFilm(projectPaths(command.project));
        instructions = film.storyPrompt || genrePreset(film.genre).storyPrompt;
        duration = film.duration;
      }
      const text = await readFile(storyFile, "utf8");
      const chunks = chunkStory(text, command.chunkWords);
      console.log(`Story analyzed: ${chunks.length} chunks generated (~${command.chunkWords} words each).`);

      let fullPromptBundle = "";
      for (let i = 0; i < chunks.length; i++) {
        fullPromptBundle += `\n\n=== CHUNK ${i + 1}/${chunks.length} ===\n${buildStoryChunkPrompt(chunks[i], instructions, duration)}`;
      }

      if (command.output) {
        await writeFile(command.output, fullPromptBundle, "utf8");
        console.log(`Wrote breakdown prompts to ${command.output}`);
      } else {
        console.log(fullPromptBundle);
      }
    });

  const character = program.command("character").description("Manage the project's cast.");
  character
    .command("add")
    .description("Add or update a character; scenes mentioning the name/aliases get its description injected.")
    .argument("<project>", "project name")
    .argument("<name>", "character name")
    .option("--description <text>", "look, age, outfit, distinguishing traits", "")
    .option("--alias <alias>", "other names used in the script (repeatable)", collect, [] as string[])
    .option("--image <path>", "reference image (repeatable)", collect, [] as string[])
    .option("--flow-name <name>", "name of the matching character saved in Flow (gflow character create)")
    .action(async (slug: string, name: string, command: { description: string; alias: string[]; image: string[]; flowName?: string }) => {
      const paths = projectPaths(slug);
      const film = await loadFilm(paths);
      const entry: FilmCharacter = {
        name,
        description: command.description,
        aliases: command.alias,
        images: command.image.map((image) => resolve(image)),
        flowName: command.flowName
      };
      film.characters = [...film.characters.filter((existing) => existing.name !== name), entry];
      await saveFilm(paths, film);
      console.log(`character "${name}" saved (${film.characters.length} in cast). Re-run \`film import\` to re-detect who appears in each scene.`);
    });

  character
    .command("dna")
    .description("Generate 360° Character DNA Bible image generation prompt on Chroma key green.")
    .argument("<project>", "project name")
    .argument("<name>", "character name")
    .action(async (slug: string, name: string) => {
      const paths = projectPaths(slug);
      const film = await loadFilm(paths);
      const char = film.characters.find((c) => c.name.toLowerCase() === name.toLowerCase());
      if (!char) throw new Error(`Character "${name}" not found in project "${slug}"`);
      const dnaPrompt = buildActorDnaImagePrompt({ name: char.name, traits: char.description }, film.directionalPrompt);
      console.log(`\n=== 360° VISUAL IDENTITY BIBLE PROMPT FOR ${char.name.toUpperCase()} ===\n`);
      console.log(dnaPrompt);
    });

  program
    .command("status")
    .description("Show scene render status.")
    .argument("<project>", "project name")
    .action(async (slug: string) => {
      const paths = projectPaths(slug);
      const film = await loadFilm(paths);
      const state = await loadState(paths);
      console.log(`${film.title} — ${film.ratio}, ${film.duration}s/scene, continuity ${film.continuity ? "on" : "off"}`);
      for (const scene of film.scenes) {
        const entry = state.scenes[scene.id];
        const flags = [scene.cut ? "cut" : "", scene.characters.join("+")].filter(Boolean).join(" ");
        console.log(`${scene.id}\t${entry?.status ?? "pending"}\t${flags}${entry?.error ? `\t${entry.error}` : ""}`);
      }
      if (state.final) console.log(`final: ${state.final}`);
    });

  program
    .command("plan")
    .description("Export the project as a `gflow batch` YAML pipeline (no frame continuity).")
    .argument("<project>", "project name")
    .option("-o, --output <file>", "write to a file instead of stdout")
    .action(async (slug: string, command: { output?: string }) => {
      const yaml = await planBatch(projectPaths(slug));
      if (command.output) {
        await writeFile(command.output, yaml, "utf8");
        console.log(`wrote ${command.output}`);
      } else {
        process.stdout.write(yaml);
      }
    });

  program
    .command("render")
    .description("Render scenes in Google Flow, chaining each scene's last frame into the next. Resumable.")
    .argument("<project>", "project name")
    .option("--scene <id>", "render only this scene (repeatable)", collect, [] as string[])
    .option("--force", "re-render scenes that are already done", false)
    .option("--no-continuity", "do not seed scenes with the previous last frame")
    .option("--continue-on-error", "after a failed scene, skip the scenes chained to it and keep rendering from the next [CUT]", false)
    .option("--max-retries <n>", "retries for transient Flow/UI failures (default: film.json maxRetries, else 2)", parseCount)
    .option("--profile <name>", "browser profile name", "default")
    .option("--browser <name>", "browser channel: chrome or chromium", parseBrowser, DEFAULT_BROWSER_CHANNEL)
    .option("--headed", "show browser", true)
    .option("--no-headed", "run browser headless")
    .action(async (slug: string, command: { scene: string[]; force: boolean; continuity: boolean; continueOnError: boolean; maxRetries?: number; profile: string; browser: BrowserChannel; headed: boolean }) => {
      const paths = projectPaths(slug);
      const owned = options.automation
        ? { automation: options.automation, close: async () => undefined }
        : await openFlowAutomation({ profile: command.profile, headed: command.headed, browser: command.browser });

      // Ctrl+C, or "stop" from the dashboard (which spawns this command with an IPC channel):
      // abort, and disconnect the browser so an in-flight Flow wait ends right away.
      const controller = new AbortController();
      const stop = (): void => {
        if (controller.signal.aborted) return;
        console.log("stopping render...");
        controller.abort(new Error("Render stopped"));
        void owned.close().catch(() => undefined);
      };
      const onMessage = (message: unknown): void => {
        if (message === "stop") stop();
      };
      // Only the dashboard's child process owns its IPC channel (test runners fork workers too).
      const dashboardChild = process.env.FILM_RENDER_IPC === "1" && typeof process.send === "function";
      process.once("SIGINT", stop);
      if (dashboardChild) process.on("message", onMessage);

      try {
        const result = await renderFilm(paths, {
          automation: owned.automation,
          only: command.scene.length > 0 ? command.scene : undefined,
          force: command.force,
          // commander defaults the flag to true; only an explicit --no-continuity overrides film.json.
          continuity: command.continuity === false ? false : undefined,
          continueOnError: command.continueOnError,
          maxRetries: command.maxRetries,
          signal: controller.signal,
          log: (message) => console.log(message)
        });
        if (result.failed.length > 0) {
          const skipped = result.skipped.length > 0 ? `; skipped (chained to a failed scene): ${result.skipped.join(", ")}` : "";
          throw new Error(`failed: ${result.failed.join(", ")}${skipped}`);
        }
      } finally {
        process.off("SIGINT", stop);
        if (dashboardChild) {
          process.off("message", onMessage);
          // An open IPC channel would keep this process alive after the render ends.
          process.disconnect?.();
        }
        if (!controller.signal.aborted) await owned.close();
      }
    });

  program
    .command("stitch")
    .description("Join all rendered scenes into the final movie with ffmpeg.")
    .argument("<project>", "project name")
    .option("-o, --output <file>", "output file (default: <project>/final.mp4)")
    .option("--normalize", "normalize video streams to 30fps/yuv420p before concat", false)
    .option("--only-rendered", "join only the scenes rendered so far (preview), skipping the rest", false)
    .action(async (slug: string, command: { output?: string; normalize: boolean; onlyRendered: boolean }) => {
      const result = await stitchFilm(
        projectPaths(slug),
        command.output ? resolve(command.output) : undefined,
        { normalize: command.normalize, onlyRendered: command.onlyRendered }
      );
      const skipped = result.skipped.length > 0 ? `; skipped (not rendered): ${result.skipped.join(", ")}` : "";
      console.log(`stitched ${result.clips} scenes (${result.mode}) -> ${result.output}${skipped}`);
    });

  program
    .command("dashboard")
    .description("Start the local web dashboard (127.0.0.1 only).")
    .option("--port <n>", "port", (value) => Number.parseInt(value, 10), 3333)
    .action(async (command: { port: number }) => {
      const { url } = await startDashboard(command.port);
      console.log(`dashboard running at ${url} (Ctrl+C to stop)`);
      await new Promise(() => undefined);
    });

  return program;
}

async function importScript(slug: string, scriptFile: string): Promise<void> {
  const paths = projectPaths(slug);
  const film = await loadFilm(paths);
  const text = await readFile(scriptFile, "utf8");
  film.scenes = scenesFromScript(text, film.characters);
  if (film.scenes.length === 0) throw new Error(`No "SCENE n:" sections found in ${scriptFile}`);
  await writeFile(paths.script, text, "utf8");
  await saveFilm(paths, film);
  // Scene ids are positional, so progress from a previous script no longer maps onto the new scenes.
  await saveState(paths, { scenes: {} });
  console.log(`imported ${film.scenes.length} scenes into "${slug}"`);
}

export async function runStudioCli(argv: string[], options: CreateStudioProgramOptions = {}): Promise<number> {
  try {
    await createStudioProgram(options).parseAsync(argv);
    return 0;
  } catch (error) {
    if (error instanceof CommanderError) return error.exitCode;
    console.error(messageForError(error));
    return exitCodeForError(error);
  }
}

function parseGenre(value: string): GenreId {
  if (!isGenreId(value)) throw new InvalidArgumentError(`must be one of: ${Object.keys(GENRES).join(", ")}`);
  return value;
}
