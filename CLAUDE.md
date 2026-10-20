# Film Studio 3.0

AI film studio: write a script, render scenes in Google Flow with frame-to-frame continuity, and stitch the final movie.

## Commands

```bash
npm install          # Install dependencies
npm run build        # Build TypeScript (tsc -p tsconfig.json)
npm run dev          # Run studio CLI (tsx src/studio/index.ts)
npm run gflow        # Run gflow CLI (tsx src/index.ts)
npm test             # Run test suite (vitest run)
npm run lint         # Lint codebase (eslint .)
npm run dashboard    # Start Web Studio Dashboard on port 3333
```

## Architecture

Modules, each with an `index.ts` that states its purpose and allowed dependencies. Other modules import only through that `index.js`; ESLint `no-restricted-imports` (eslint.config.js) enforces it.

- `src/core/`: shared contracts: errors, job schemas (`jobs.ts`), automation interfaces (`automation.ts`), Flow URLs/project ids (`flow-urls.ts`), paths, version. Depends on nothing.
- `src/browser/`: Playwright session & Chrome profile management. -> core
- `src/flow/`: Google Flow automation. Exports only the page classes (FlowPage, CharacterPage, ...); selectors and UI helpers stay internal. -> core
- `src/gflow/`: `gflow` CLI and batch runner. -> core, browser, flow
- `src/studio/domain/`: film data and text: `project.ts` (`film.json`, `state.json`), `script.ts`, `genres.ts`, `prompts.ts`, `breakdown.ts`, `dna.ts`, `film-edits.ts` (config/cast/scene edits used by the dashboard). -> core
- `src/studio/media/`: ffmpeg (frame extraction, stitching, storyboard crops). Standalone.
- `src/studio/render/`: `pipeline.ts`: render pipeline with frame-to-frame continuity (`continuityMode` frames/ingredients). Re-reads `film.json` before each scene; retries only transient/rate-limit errors (`classifyRenderError`), never policy blocks. Talks to Flow only through `FlowAutomation`. -> core, domain, media
- `src/studio/dashboard/`: `server.ts` (routes only), `http.ts`, `render-process.ts`, and the UI as static files in `public/` (copied to dist by `npm run build`). -> core, domain, media, render
- `src/studio/cli.ts`: `film` CLI, wires the modules together.
- `examples/`: Sample scripts and batch pipelines (`kdrama-autumn.md`, `pipeline.yaml`).
- `fixtures/`: Test fixtures and mock pages.
