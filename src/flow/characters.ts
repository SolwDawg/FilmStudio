import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { BrowserContext, Page } from "playwright";
import { GenerationBlockedError, GenerationFailedError, projectSubUrl, UiContractError } from "../core/index.js";
import type { CharacterAutomation, CharacterResult, CharacterSummary, CreateCharacterInput } from "../core/index.js";
import { confirmPicker, navigateToProject, pickModel, waitForUploadConsent } from "./ui.js";
import { flowLocators } from "./locators.js";

const PRESET_LABEL: Record<NonNullable<CreateCharacterInput["preset"]>, RegExp> = {
  familiar: /The Familiar/i,
  eccentric: /The Eccentric/i,
  professional: /The Professional/i,
  wildcard: /The Wildcard/i,
  wicked: /The Wicked/i,
  fantastical: /The Fantastical/i
};

export class CharacterPage implements CharacterAutomation {
  constructor(private readonly page: Page) {}

  // Live-verified (Oct 2026): the "New character" page lives at /project/<id>/character. Its
  // "Upload" button opens the file chooser directly; "Add from project" opens the shared
  // <flow-add-menu-popover-content> picker confirmed with "Add media"; "Start generation" creates.
  async createCharacter(input: CreateCharacterInput): Promise<CharacterResult> {
    const projectId = await navigateToProject(this.page, input.project);
    await this.page.goto(projectSubUrl(projectId, "character"), { waitUntil: "domcontentloaded" });
    const locators = flowLocators(this.page);
    await locators.characterPrompt.first().waitFor({ state: "visible", timeout: 20000 }).catch(() => {
      throw new UiContractError("the New character page did not open");
    });

    if (input.preset) {
      await this.page.getByText(PRESET_LABEL[input.preset]).first().click();
      await this.page.waitForTimeout(300);
    }
    if (input.model) await pickModel(this.page, input.model);

    for (const file of input.images) await this.uploadImage(file);
    for (const ref of input.fromProject) await this.addFromProject(ref);

    const box = locators.characterPrompt.first();
    await box.click();
    await box.press("ControlOrMeta+a").catch(() => undefined);
    await box.press("Backspace").catch(() => undefined);
    await this.page.keyboard.insertText(input.prompt);

    await this.assertNotBlocked();
    const before = new Set(await this.characterThumbs());
    await locators.characterCreateButton.first().click();

    const added = await this.waitForNewCharacter(before, (input.timeout ?? 600) * 1000);

    await this.configureCharacter(input);

    let thumbnailPath: string | undefined;
    if (added) {
      thumbnailPath = await this.saveThumb(this.page.context(), added, input.outDir, input.name);
    }
    return { name: input.name, thumbnailPath, flowUrl: this.page.url() };
  }

  private async uploadImage(filePath: string): Promise<void> {
    const upload = this.page.getByRole("button").filter({ hasText: /^\s*upload\s*Upload\s*$/ }).first();
    const [chooser] = await Promise.all([this.page.waitForEvent("filechooser", { timeout: 15000 }), upload.click()]);
    await chooser.setFiles(filePath);
    await waitForUploadConsent(this.page);
  }

  private async addFromProject(name: string): Promise<void> {
    await this.page.getByRole("button").filter({ hasText: /add from project/i }).first().click();
    const picker = this.page.locator("flow-add-menu-popover-content, [role=dialog]").filter({ visible: true }).first();
    await picker.waitFor({ state: "visible", timeout: 10000 });
    const option = picker.getByRole("option").filter({ hasText: name }).first();
    await option.waitFor({ state: "visible", timeout: 15000 }).catch(() => {
      throw new UiContractError(`"${name}" is not among this project's media`);
    });
    if ((await option.getAttribute("aria-selected")) !== "true") await option.click();
    await confirmPicker(this.page, picker);
  }

  // Live-verified (Oct 2026): the project's "Characters" filter shows one <flow-character-tile> per
  // character (name in .character-tile-name); with no characters it opens the New character page.
  async listCharacters(project?: string): Promise<CharacterSummary[]> {
    const projectId = await navigateToProject(this.page, project);
    await this.page.goto(projectSubUrl(projectId, ""), { waitUntil: "domcontentloaded" });
    const filter = this.page.locator("button").filter({ hasText: /^\s*(accessibility_new\s*)?Characters\s*$/ }).first();
    await filter.waitFor({ state: "visible", timeout: 20000 });
    await filter.click();
    await this.page
      .locator("flow-character-tile, [role=textbox]")
      .first()
      .waitFor({ state: "visible", timeout: 10000 })
      .catch(() => undefined);
    return this.page.evaluate(() => {
      const results: Array<{ name: string; thumbnailUrl?: string }> = [];
      for (const tile of [...document.querySelectorAll("flow-character-tile")]) {
        const name = (tile.querySelector(".character-tile-name")?.textContent || "").trim();
        if (!name) continue;
        const img = tile.querySelector("img") as HTMLImageElement | null;
        const thumbnailUrl = img?.currentSrc || img?.src || undefined;
        results.push(thumbnailUrl ? { name, thumbnailUrl } : { name });
      }
      return results;
    });
  }

  private async configureCharacter(input: CreateCharacterInput): Promise<void> {
    // Live-verified (Oct 2026): the character page (/project/<id>/character/<uuid>) opens as soon
    // as generation starts, with an <input placeholder="Character name">, "Select a voice", the
    // "Character info" <textarea> and a "Done" button that saves and returns to the project.
    const nameInput = this.page.locator('input[placeholder="Character name" i]').first();
    await nameInput.waitFor({ state: "visible", timeout: 30000 }).catch(() => undefined);
    await this.page.waitForTimeout(500);

    // Set the character name via the input field
    if (await nameInput.count()) {
      await nameInput.click();
      await nameInput.fill(input.name);
      await nameInput.press("Enter");
      await this.page.waitForTimeout(300);
    }

    // Select a voice if specified. The voice picker shows [role=option] items
    // with names like "Zephyr" and a confirm button "Add to Character".
    if (input.voice) {
      const voiceBtn = this.page.locator("button").filter({ hasText: /Select a voice/i }).first();
      if (await voiceBtn.count()) {
        await voiceBtn.click();
        await this.page.waitForTimeout(800);
        const voiceOption = this.page.locator("[role=option]").filter({ hasText: input.voice }).first();
        await voiceOption.waitFor({ state: "visible", timeout: 10000 }).catch(() => undefined);
        await voiceOption.click().catch(() => undefined);
        await this.page.waitForTimeout(300);
        const addBtn = this.page.locator("button").filter({ hasText: /Add to Character/i }).first();
        await addBtn.click().catch(() => undefined);
        await this.page.waitForTimeout(500);
      }
    }

    // Fill in character description if provided
    if (input.description) {
      const descField = this.page.locator('textarea[placeholder="Describe how your character acts..."]').first();
      if (await descField.count()) {
        await descField.click();
        await descField.fill(input.description);
        await this.page.waitForTimeout(200);
      }
    }

    // Click "Done" to save the character configuration
    const doneBtn = this.page.locator("button").filter({ hasText: /^Done$/i }).first();
    if (await doneBtn.count()) {
      await doneBtn.click();
      await this.page.waitForURL((url) => !/\/character\//.test(url.pathname), { timeout: 15000 }).catch(() => undefined);
    }
  }

  // The finished portrait is an <img alt="Generated character image">; while generating, the page
  // shows a blurred placeholder and a percentage instead.
  private async characterThumbs(): Promise<string[]> {
    return this.page.$$eval('img[alt="Generated character image"], img[src*="getMediaUrlRedirect"]', (imgs) =>
      imgs.map((i) => (i as HTMLImageElement).currentSrc || (i as HTMLImageElement).src).filter(Boolean)
    );
  }

  private async waitForNewCharacter(before: Set<string>, timeoutMs: number): Promise<string | undefined> {
    const deadline = Date.now() + timeoutMs;
    const locators = flowLocators(this.page);
    while (Date.now() < deadline) {
      if (await locators.blockedMarker.first().isVisible().catch(() => false)) {
        throw new GenerationBlockedError("Flow blocked the character generation (content policy).");
      }
      if (await locators.failedMarker.first().isVisible().catch(() => false)) {
        throw new GenerationFailedError("Flow reported the character generation failed.");
      }
      const added = (await this.characterThumbs()).filter((s) => !before.has(s));
      if (added.length > 0) return added[0];
      await this.page.waitForTimeout(1500);
    }
    return undefined;
  }

  private async assertNotBlocked(): Promise<void> {
    const locators = flowLocators(this.page);
    if (await locators.blockedMarker.first().isVisible().catch(() => false)) {
      throw new GenerationBlockedError("Flow blocked this character prompt.");
    }
  }

  private async saveThumb(context: BrowserContext, src: string, outDir: string, name: string): Promise<string | undefined> {
    try {
      const response = await context.request.get(src);
      if (!response.ok()) return undefined;
      await mkdir(outDir, { recursive: true });
      const path = join(outDir, `character-${name.replace(/[^a-zA-Z0-9._-]+/g, "_")}.png`);
      await writeFile(path, Buffer.from(await response.body()));
      return path;
    } catch {
      return undefined;
    }
  }
}
