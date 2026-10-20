import { readFile, writeFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Command, CommanderError, InvalidArgumentError } from "commander";
import { BROWSER_CHANNELS, DEFAULT_BROWSER_CHANNEL, type BrowserChannel } from "../browser/session.js";
import { exitCodeForError, messageForError } from "../errors.js";
import type { FlowAutomation } from "../flow/types.js";
import { resolveVersion } from "../cli.js";
import { planBatch, renderFilm, stitchFilm } from "./pipeline.js";
import {
  createProject,
  listProjects,
  loadFilm,
  loadState,
  projectPaths,
  saveFilm,
  saveState,
  type FilmCharacter
} from "./project.js";
import { scenesFromScript } from "./script.js";
import { startDashboard } from "./server.js";
import { openFlowAutomation } from "./session.js";
import { chunkStory, buildStoryChunkPrompt, parseStructuredScript } from "./breakdown.js";
import { buildActorDnaImagePrompt, buildAssetExtractionPrompt, createSlidingSceneWindows, mergeDiscoveredActors } from "./dna.js";
import { getCdpEndpoint, injectCleanApplet, launchChromeWithCdp, listCdpTargets } from "./cdp.js";
import { buildApplet } from "../applet/build.js";

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
    .action(async (title: string, command: { script?: string }) => {
      const { slug, paths } = await createProject(title);
      console.log(`created project "${slug}" at ${paths.dir}`);
      if (command.script) await importScript(slug, command.script);
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
    .action(async (storyFile: string, command: { output?: string; chunkWords: number }) => {
      const text = await readFile(storyFile, "utf8");
      const chunks = chunkStory(text, command.chunkWords);
      console.log(`Story analyzed: ${chunks.length} chunks generated (~${command.chunkWords} words each).`);

      let fullPromptBundle = "";
      for (let i = 0; i < chunks.length; i++) {
        fullPromptBundle += `\n\n=== CHUNK ${i + 1}/${chunks.length} ===\n${buildStoryChunkPrompt(chunks[i])}`;
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
      const dnaPrompt = buildActorDnaImagePrompt({ name: char.name, traits: char.description });
      console.log(`\n=== 360° VISUAL IDENTITY BIBLE PROMPT FOR ${char.name.toUpperCase()} ===\n`);
      console.log(dnaPrompt);
    });

  program
    .command("launch")
    .description("Launch Google Chrome on remote debugging port 9222 for Google Flow.")
    .option("--port <n>", "debugging port", (val) => Number.parseInt(val, 10), 9222)
    .option("--url <url>", "initial URL", "https://flow.google.com/?pli=1")
    .action((command: { port: number; url: string }) => {
      launchChromeWithCdp(command.port, command.url);
      console.log(`Launched Chrome with remote debugging on port ${command.port} -> ${command.url}`);
    });

  program
    .command("inject")
    .description("Inject clean Studio Applet bundle into Google Flow iframe via CDP.")
    .option("--port <n>", "CDP port", (val) => Number.parseInt(val, 10), 9222)
    .option("--force", "force reinjection", false)
    .action(async (command: { port: number; force: boolean }) => {
      const endpoint = await getCdpEndpoint(command.port);
      if (!endpoint) throw new Error(`Chrome CDP is not running on port ${command.port}. Run \`film launch\` first.`);

      const dataUrlPath = resolve(process.cwd(), "dist/applet.dataurl.txt");
      let dataUrl = "";
      if (!existsSync(dataUrlPath)) {
        console.log("Building clean Applet bundle first...");
        const res = await buildApplet();
        dataUrl = readFileSync(res.dataUrlPath, "utf8");
      } else {
        dataUrl = readFileSync(dataUrlPath, "utf8");
      }

      const targets = await listCdpTargets(endpoint);
      const iframes = targets.filter((t) => t.type === "iframe" && t.url?.includes("scf.usercontent.goog"));
      if (iframes.length === 0) {
        throw new Error("No Google Flow tool iframe found. Open or select a tool in Flow first.");
      }

      let count = 0;
      for (const iframe of iframes) {
        if (iframe.webSocketDebuggerUrl) {
          const res = await injectCleanApplet(iframe.webSocketDebuggerUrl, dataUrl, command.force);
          if (res.success) {
            count++;
            console.log(`Injected into iframe: ${iframe.id} -> ${res.state}`);
          }
        }
      }
      console.log(`Injection completed: ${count} iframe(s) active.`);
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
    .option("--no-heal", "disable auto-healing of safety filtered prompts")
    .option("--max-retries <n>", "max auto-heal retries", (val) => Number.parseInt(val, 10), 5)
    .option("--profile <name>", "browser profile name", "default")
    .option("--browser <name>", "browser channel: chrome or chromium", parseBrowser, DEFAULT_BROWSER_CHANNEL)
    .option("--headed", "show browser", true)
    .option("--no-headed", "run browser headless")
    .action(async (slug: string, command: { scene: string[]; force: boolean; continuity: boolean; heal: boolean; maxRetries: number; profile: string; browser: BrowserChannel; headed: boolean }) => {
      const paths = projectPaths(slug);
      const owned = options.automation
        ? { automation: options.automation, close: async () => undefined }
        : await openFlowAutomation({ profile: command.profile, headed: command.headed, browser: command.browser });
      try {
        await renderFilm(paths, {
          automation: owned.automation,
          only: command.scene.length > 0 ? command.scene : undefined,
          force: command.force,
          continuity: command.continuity,
          autoHeal: command.heal,
          maxAutoRetries: command.maxRetries,
          log: (message) => console.log(message)
        });
      } finally {
        await owned.close();
      }
    });

  program
    .command("stitch")
    .description("Join all rendered scenes into the final movie with ffmpeg.")
    .argument("<project>", "project name")
    .option("-o, --output <file>", "output file (default: <project>/final.mp4)")
    .option("--normalize", "normalize video streams to 30fps/yuv420p before concat", false)
    .action(async (slug: string, command: { output?: string; normalize: boolean }) => {
      const result = await stitchFilm(
        projectPaths(slug),
        command.output ? resolve(command.output) : undefined,
        { normalize: command.normalize }
      );
      console.log(`stitched ${result.clips} scenes (${result.mode}) -> ${result.output}`);
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
