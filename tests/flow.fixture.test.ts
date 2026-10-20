import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { chromium } from "playwright";
import { FlowPage } from "../src/flow/page.js";

const FIXTURE = `file://${process.cwd()}/fixtures/flow/index.html`;
const projectFixture = (label: string) => `<!doctype html>
<html lang="en">
  <body>
    <main>
      <div data-project="${label}" role="textbox" contenteditable="true"></div>
      <button id="create" disabled>arrow_forwardCreate</button>
      <section id="results"></section>
    </main>
    <script>
      const prompt = document.querySelector('[role="textbox"]');
      const create = document.getElementById("create");
      prompt.addEventListener("input", () => { create.disabled = prompt.textContent.trim().length === 0; });
      create.addEventListener("click", () => {
        const img = document.createElement("img");
        img.src = "data:text/plain," + document.querySelector('[data-project]').dataset.project;
        img.style.width = "40px";
        img.style.height = "40px";
        img.addEventListener("click", () => {
          const overlay = document.createElement("div");
          overlay.setAttribute("role", "dialog");
          overlay.innerHTML = '<button type="button" aria-haspopup="menu" data-dl>download Download</button><div role="menu" hidden><div role="menuitem" data-q="original">1K Original size</div></div>';
          document.body.appendChild(overlay);
          const menu = overlay.querySelector("[role=menu]");
          overlay.querySelector("[data-dl]").addEventListener("click", () => { menu.hidden = false; });
          overlay.querySelector("[role=menuitem]").addEventListener("click", () => {
            const blob = new Blob([document.querySelector('[data-project]').dataset.project + ":original"], { type: "image/png" });
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = "project.png";
            document.body.appendChild(a);
            a.click();
          });
        });
        document.getElementById("results").appendChild(img);
      });
    </script>
  </body>
</html>`;

// Ingredients-mode composer with the live Flow character picker (Oct 2026): "Add ingredients to the
// prompt box" opens <flow-add-menu-popover-content>; its Characters tab lists [role=option] tiles;
// "Add to prompt" adds a <flow-ingredient-chip> to the ingredient bar.
const CHARACTER_FIXTURE = `<!doctype html>
<html lang="en">
  <body>
    <main>
      <flow-ingredient-bar></flow-ingredient-bar>
      <div role="textbox" contenteditable="true"></div>
      <button aria-label="Add ingredients to the prompt box">add</button>
      <button id="create">arrow_forwardCreate</button>
      <section id="results"></section>
    </main>
    <script>
      // setContent reuses the window, so keep the bindings out of the global scope.
      {
      const bar = document.querySelector("flow-ingredient-bar");
      document.querySelector("[aria-label^=Add]").addEventListener("click", () => {
        const picker = document.createElement("flow-add-menu-popover-content");
        picker.innerHTML = '<div role="tab">dashboard All</div><div role="tab" data-tab="chars">accessibility_new Characters</div><button data-upload>upload Upload media</button><input type="file" hidden><div data-list></div><button data-ok>Add to prompt</button>';
        document.body.appendChild(picker);
        const list = picker.querySelector("[data-list]");
        list.innerHTML = '<button role="option" aria-selected="false">scene-02.last.png Image</button>';
        let picked = null;
        const file = picker.querySelector("input[type=file]");
        picker.querySelector("[data-upload]").addEventListener("click", () => file.click());
        file.addEventListener("change", () => {
          const option = document.createElement("button");
          option.setAttribute("role", "option");
          option.setAttribute("aria-selected", "true");
          option.textContent = file.files[0].name + " Image";
          list.appendChild(option);
          picked = option;
        });
        picker.querySelector("[data-tab=chars]").addEventListener("click", () => {
          list.innerHTML = '<button role="option" aria-selected="false">Minwoo Character</button><button role="option" aria-selected="false">Seoyeon Character</button>';
          list.querySelectorAll("[role=option]").forEach((o) => o.addEventListener("click", () => { picked = o; o.setAttribute("aria-selected", "true"); }));
        });
        picker.querySelector("[data-ok]").addEventListener("click", () => {
          if (picked) {
            const chip = document.createElement("flow-ingredient-chip");
            chip.textContent = picked.textContent;
            bar.appendChild(chip);
          }
          picker.remove();
        });
      });
      document.getElementById("create").addEventListener("click", () => {
        const img = document.createElement("img");
        img.src = "data:text/plain," + [...bar.children].map((c) => c.textContent).join("+");
        img.style.width = "40px";
        img.style.height = "40px";
        document.getElementById("results").appendChild(img);
      });
      }
    </script>
  </body>
</html>`;

describe("FlowPage fixture", () => {
  it("adds ingredient images and saved characters before submitting, and refuses an unknown character", async () => {
    const outDir = await mkdtemp(join(tmpdir(), "gflow-output-"));
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage();
      await page.setContent(CHARACTER_FIXTURE);
      const flow = new FlowPage(page);
      const job = { id: "cast", type: "image" as const, prompt: "Two friends", outputs: 1, out: outDir, ingredients: [] };

      await expect(flow.runJob({ job: { ...job, character: ["Minwoo", "Ghost"] }, outDir })).rejects.toThrow(/"Ghost" is not in this Flow project/);
      expect(await page.locator("#results img").count()).toBe(0); // nothing was submitted

      // The fixture's result has no download viewer, so stop watching once it was submitted.
      await page.setContent(CHARACTER_FIXTURE);
      const frame = join(outDir, "scene-02.last.png");
      await writeFile(frame, "png");
      void flow.runJob({ job: { ...job, character: ["Minwoo", "Seoyeon"], ingredients: [frame] }, outDir }).catch(() => undefined);
      await page.locator("#results img").waitFor({ timeout: 15000 });
      expect(await page.locator("#results img").getAttribute("src")).toBe("data:text/plain,scene-02.last.png Image+Minwoo Character+Seoyeon Character");
    } finally {
      await browser.close();
    }
  }, 30_000);

  it("types a prompt, submits, and downloads the generated result", async () => {
    const profileDir = await mkdtemp(join(tmpdir(), "gflow-profile-"));
    const outDir = await mkdtemp(join(tmpdir(), "gflow-output-"));
    const context = await chromium.launchPersistentContext(profileDir, { headless: true, acceptDownloads: true });

    try {
      const page = context.pages()[0] ?? (await context.newPage());
      await page.goto(FIXTURE);

      const flow = new FlowPage(page);
      const result = await flow.runJob({
        job: { id: "concept-image", type: "image", prompt: "A studio product still", outputs: 1, out: outDir, ingredients: [], character: [] },
        outDir
      });

      expect(result.jobId).toBe("concept-image");
      expect(result.artifacts).toHaveLength(1);
      const saved = result.artifacts[0]!.path;
      expect(saved).toContain("concept-image-001.png");
      // Downloaded through the viewer's Download menu (Original tier); the fixture encodes
      // the result identity in the bytes so we verify the right result reached disk.
      await expect(readFile(saved, "utf8")).resolves.toBe("fixture-gen-1:original");
    } finally {
      await context.close();
    }
  });

  it("detects fresh results per run instead of reusing earlier ones", async () => {
    const profileDir = await mkdtemp(join(tmpdir(), "gflow-profile-"));
    const outDir = await mkdtemp(join(tmpdir(), "gflow-output-"));
    const context = await chromium.launchPersistentContext(profileDir, { headless: true, acceptDownloads: true });

    try {
      const page = context.pages()[0] ?? (await context.newPage());
      await page.goto(`${FIXTURE}?delay=100`);

      const flow = new FlowPage(page);
      const first = await flow.runJob({
        job: { id: "first-image", type: "image", prompt: "First image", outputs: 1, out: outDir, ingredients: [], character: [] },
        outDir
      });
      const second = await flow.runJob({
        job: { id: "second-image", type: "image", prompt: "Second image", outputs: 1, out: outDir, ingredients: [], character: [] },
        outDir
      });

      expect(first.artifacts[0]?.path).toContain("first-image-001.png");
      expect(second.artifacts[0]?.path).toContain("second-image-001.png");
      await expect(readFile(first.artifacts[0]!.path, "utf8")).resolves.toBe("fixture-gen-1:original");
      await expect(readFile(second.artifacts[0]!.path, "utf8")).resolves.toBe("fixture-gen-2:original");
    } finally {
      await context.close();
    }
  });

  it("downloads a video through the viewer's menu-less Download button", async () => {
    const profileDir = await mkdtemp(join(tmpdir(), "gflow-profile-"));
    const outDir = await mkdtemp(join(tmpdir(), "gflow-output-"));
    const context = await chromium.launchPersistentContext(profileDir, { headless: true, acceptDownloads: true });

    try {
      const page = context.pages()[0] ?? (await context.newPage());
      // ?type=video makes the fixture render a <video> result whose viewer has a plain
      // Download button (no tier menu), like real Flow — exercising the direct-download path.
      await page.goto(`${FIXTURE}?type=video`);

      const flow = new FlowPage(page);
      const result = await flow.runJob({
        job: { id: "clip", type: "video", prompt: "A short clip", outputs: 1, out: outDir, ingredients: [], character: [] },
        outDir
      });

      const saved = result.artifacts[0]!.path;
      expect(saved).toContain("clip-001.mp4");
      await expect(readFile(saved, "utf8")).resolves.toBe("fixture-gen-1:original");
    } finally {
      await context.close();
    }
  });

  it("navigates to the requested project before generating", async () => {
    const profileDir = await mkdtemp(join(tmpdir(), "gflow-profile-"));
    const outDir = await mkdtemp(join(tmpdir(), "gflow-output-"));
    const context = await chromium.launchPersistentContext(profileDir, { headless: true, acceptDownloads: true });

    try {
      const page = context.pages()[0] ?? (await context.newPage());
      const targetProjectId = "00000000-0000-4000-8000-000000000000";
      // The engine adds ?hl=en to every Flow URL, so routes allow an optional query string.
      await page.route(/^https:\/\/labs\.google\/fx\/tools\/flow(\?.*)?$/, async (route) => {
        await route.fulfill({
          contentType: "text/html",
          body: `<a href="/fx/tools/flow/project/${targetProjectId}"><span>Target Project</span></a>`
        });
      });
      await page.route(new RegExp(`^https://labs\\.google/fx/tools/flow/project/${targetProjectId}(\\?.*)?$`), async (route) => {
        await route.fulfill({ contentType: "text/html", body: projectFixture("target") });
      });
      await page.route(/^https:\/\/labs\.google\/fx\/tools\/flow\/project\/wrong(\?.*)?$/, async (route) => {
        await route.fulfill({ contentType: "text/html", body: projectFixture("wrong") });
      });
      await page.goto("https://labs.google/fx/tools/flow/project/wrong");

      const flow = new FlowPage(page);
      const result = await flow.runJob({
        job: {
          id: "project-image",
          type: "image",
          project: "Target Project",
          prompt: "Use the requested project",
          outputs: 1,
          out: outDir,
          ingredients: [],
          character: []
        },
        outDir
      });

      expect(result.flowUrl).toContain(`/project/${targetProjectId}`);
      await expect(readFile(result.artifacts[0]!.path, "utf8")).resolves.toBe("target:original");
    } finally {
      await context.close();
    }
  }, 30000);
});
