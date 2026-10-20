import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { startDashboard } from "../src/studio/dashboard/index.js";

// Drives the real dashboard page in a browser: the buttons call the API the way a user would, and
// any script error or 5xx answer fails the test.
describe("dashboard in a browser", () => {
  let root: string;
  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), "film-dash-"));
    process.env.FILM_HOME = root;
  });
  afterEach(async () => {
    delete process.env.FILM_HOME;
    await rm(root, { recursive: true, force: true });
  });

  it("creates a project and edits it without script errors or server failures", async () => {
    const dash = await startDashboard(0);
    const browser = await chromium.launch();
    const problems: string[] = [];
    try {
      const page = await browser.newPage();
      page.on("pageerror", (error) => problems.push(`page error: ${error.message}`));
      page.on("dialog", (dialog) => void dialog.accept());
      page.on("response", (response) => {
        if (response.status() >= 500) problems.push(`${response.status()} ${response.request().method()} ${response.url()}`);
      });
      const click = (id: string): Promise<void> => page.$eval(`#${id}`, (el) => (el as HTMLElement).click());
      const answered = (path: RegExp, method = "POST") =>
        page.waitForResponse((r) => path.test(new URL(r.url()).pathname) && r.request().method() === method, { timeout: 10_000 });
      const api = (path: string) => page.evaluate(async (p) => (await fetch(p)).json(), path);

      await page.goto(dash.url);
      await click("btnNewProject");
      await page.waitForFunction(() => document.querySelectorAll("#newGenre option").length > 1);
      await page.selectOption("#newGenre", "wuxia");
      await page.fill("#newTitle", "Smoke Film");
      await Promise.all([answered(/^\/api\/projects$/), click("btnConfirmNewProject")]);
      await page.waitForFunction(() => (document.getElementById("projectSelect") as HTMLSelectElement).value === "smoke-film");

      await Promise.all([answered(/\/config$/), page.selectOption("#cfgContinuityMode", "ingredients")]);

      await page.$eval("#rawStoryInput", (el, text) => ((el as HTMLTextAreaElement).value = text), "SCENE 1:\nNhân vật: An\nBối cảnh: Rừng trúc\nShot: (Wide shot) An waits.\n\nSCENE 2:\nNhân vật: An, Bình\nBối cảnh: Rừng trúc\nShot: (Medium shot) They meet.");
      await Promise.all([answered(/\/breakdown$/), click("btnRunBreakdown")]);
      await Promise.all([answered(/\/dna\/scan$/), click("btnScanDna")]);

      await click("btnAddActor");
      await page.fill("#dnaName", "Bình");
      await page.fill("#dnaTraits", "woman, 25, white robes");
      await Promise.all([answered(/\/dna\/character$/), click("btnSaveDna")]);

      await click("btnAdvancedModal");
      await Promise.all([answered(/\/config$/), click("btnSaveAdvanced")]);
      await Promise.all([answered(/\/pause$/), click("btnPauseResume")]);
      await Promise.all([answered(/\/resume$/), click("btnPauseResume")]);

      const project = (await api("/api/projects/smoke-film")) as {
        film: { genre: string; continuityMode: string; isPaused: boolean; scenes: unknown[]; characters: Array<{ name: string; description: string }> };
        defaults: { style: string };
      };
      expect(project.film.genre).toBe("wuxia");
      expect(project.film.continuityMode).toBe("ingredients");
      expect(project.film.isPaused).toBe(false);
      expect(project.film.scenes).toHaveLength(2);
      expect(project.film.characters.map((c) => c.name).sort()).toEqual(["An", "Bình"]);
      expect(project.defaults.style).toContain("wuxia");
      expect(problems).toEqual([]);
    } finally {
      await browser.close();
      await dash.close();
    }
  }, 60_000);
});
