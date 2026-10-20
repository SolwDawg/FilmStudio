import { basename, join } from "node:path";
import type { Locator, Page } from "playwright";
import {
  CreditLimitError,
  GenerationBlockedError,
  GenerationFailedError,
  LoginRequiredError,
  ManualActionRequiredError,
  RateLimitedError,
  UiContractError
} from "../errors.js";
import { artifactBasename, writeArtifactMetadata } from "../output/artifacts.js";
import { downloadResult, type DownloadQuality } from "./download.js";
import type { GFlowJob } from "../jobs/schema.js";
import type { FlowAutomation, FlowAutomationRunInput, FlowJobResult } from "./types.js";
import { flowLocators } from "./locators.js";
import { dismissOpenLayers, pickOption, pickModel, confirmPicker, navigateToProject, projectIdFromUrl, projectSubUrl } from "./ui.js";

// The project's own page (/project/<id>), as opposed to a clip viewer (/edit/<tile>) or a scene.
export function isProjectGridUrl(url: string): boolean {
  return /\/project\/[0-9a-f-]+\/?(?:[?#]|$)/i.test(url);
}

// Result thumbnails are signed URLs whose ?Expires=&Signature= change on every page load, so the
// same media must be compared by its path (flow-content.google/image/<id>), not the full URL.
export function mediaKey(src: string): string {
  return /^https?:/i.test(src) ? src.split(/[?#]/)[0] : src;
}

// Sources on the page now whose media was not there before submitting, one per media item.
export function newResults(current: string[], beforeKeys: Set<string>): string[] {
  const seen = new Set<string>();
  return current.filter((src) => {
    const key = mediaKey(src);
    if (beforeKeys.has(key) || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// hl=en: the engine matches English UI text; see englishUrl() in ui.ts.
export const FLOW_URL = "https://flow.google.com/?pli=1&hl=en";

// Flow's aspect-ratio buttons render a Material icon ligature prefix; this maps the visible
// ratio label to that ligature so we can target the right popover button.
const RATIO_ICON: Record<string, string> = {
  "16:9": "crop_16_9",
  "9:16": "crop_9_16",
  "4:3": "crop_landscape",
  "1:1": "crop_square",
  "3:4": "crop_portrait"
};


export class FlowPage implements FlowAutomation {
  constructor(private readonly page: Page, private readonly flowUrl = FLOW_URL) {}

  async open(): Promise<void> {
    try {
      await this.page.goto(this.flowUrl, { waitUntil: "commit", timeout: 60000 });
      await this.page.waitForLoadState("domcontentloaded", { timeout: 60000 }).catch(() => undefined);
    } catch {
      await this.page.goto(this.flowUrl, { timeout: 60000 }).catch(() => undefined);
    }
    const locators = flowLocators(this.page);
    await locators.promptBox
      .first()
      .or(locators.dashboardMarker.first())
      .waitFor({ state: "visible", timeout: 30000 })
      .catch(() => undefined);
  }

  async assertReady(): Promise<void> {
    const locators = flowLocators(this.page);
    for (let i = 0; i < 15; i++) {
      const url = this.page.url();
      if (url.includes("accounts.google.com")) {
        throw new LoginRequiredError();
      }
      const dashboardReady = await locators.dashboardMarker.first().isVisible().catch(() => false);
      const promptReady = (await locators.promptBox.count()) > 0;
      const isFlowDashboard = url.includes("flow.google.com") && (await this.page.locator("button, a, [contenteditable]").count()) > 5;
      if (dashboardReady || promptReady || isFlowDashboard) return;
      await this.page.waitForTimeout(1000);
    }

    if (await locators.manualActionMarker.first().isVisible().catch(() => false)) {
      throw new ManualActionRequiredError("Flow requires login, consent, or verification.");
    }
    throw new LoginRequiredError();
  }

  async runJob(input: FlowAutomationRunInput): Promise<FlowJobResult> {
    const locators = flowLocators(this.page);
    if (input.job.project) {
      await navigateToProject(this.page, input.job.project);
      await locators.promptBox.first().waitFor({ state: "visible", timeout: 20000 }).catch(() => undefined);
    } else {
      // A frame left in the Start/End slot by the previous job survives in-page, so frame jobs
      // start from a freshly loaded project page (a reload empties the slots).
      const usesFrames = input.job.type === "video" && Boolean(input.job.startFrame || input.job.endFrame);
      await this.ensureProject(usesFrames);
    }
    await this.assertReady();
    await this.applySettings(input.job);

    if (input.job.type === "video") {
      if (input.job.startFrame) await this.uploadFrame("Start", input.job.startFrame);
      if (input.job.endFrame) await this.uploadFrame("End", input.job.endFrame);
    }

    if ((await locators.promptBox.count()) === 0) {
      throw new GenerationFailedError("Could not find the Flow prompt box. Open or create a project first.");
    }

    for (const name of input.job.character ?? []) {
      await this.referenceCharacter(name);
    }

    await this.showAllMedia();
    const before = await this.settledResultKeys(input.job.type);
    await this.fillPrompt(input.job.prompt);
    await this.submit();

    const generationTimeoutSeconds = input.job.timeout ?? (input.job.type === "video" ? 1800 : 900);
    const newSrcs = await this.waitForResults(before, input.job.outputs, generationTimeoutSeconds * 1000, input.job.type);

    const context = this.page.context();
    const quality: DownloadQuality = input.job.upscale ?? "original";
    const artifacts = [];
    for (let index = 0; index < Math.min(input.job.outputs, newSrcs.length); index += 1) {
      const basename = artifactBasename(input.job.id, index + 1);
      const { assetPath } = await downloadResult({
        page: this.page,
        context,
        src: newSrcs[index],
        type: input.job.type,
        quality,
        outDir: input.outDir,
        basename
      });
      const metadataPath = join(input.outDir, `${basename}.json`);
      await writeArtifactMetadata(metadataPath, {
        jobId: input.job.id,
        type: input.job.type,
        prompt: input.job.prompt,
        project: input.job.project,
        model: input.job.model,
        ratio: input.job.ratio,
        duration: input.job.type === "video" ? input.job.duration : undefined,
        requestedOutputs: input.job.outputs,
        quality,
        characters: input.job.character?.length ? input.job.character : undefined,
        downloadedAt: new Date().toISOString(),
        source: "google-flow-browser",
        flowUrl: this.page.url(),
        status: "downloaded"
      });
      artifacts.push({ path: assetPath, metadataPath });
    }

    if (artifacts.length === 0) {
      throw new GenerationFailedError("No downloadable results appeared.");
    }

    return {
      jobId: input.job.id,
      artifacts,
      flowUrl: this.page.url()
    };
  }

  // Result media currently on the page (authenticated media URLs, or data: in fixtures).
  // On flow.google.com, videos render as <flow-video-tile> with thumbnail img; images as <flow-image-tile>.
  private async resultSrcs(type: "image" | "video"): Promise<string[]> {
    if (type === "video") {
      return this.page.$$eval("flow-video-tile, video", (elements) =>
        elements.map((el) => {
          if (el.tagName.toLowerCase() === "video") {
            return (el as HTMLVideoElement).currentSrc || (el as HTMLVideoElement).src || "";
          }
          const img = el.querySelector("img") as HTMLImageElement | null;
          return img?.currentSrc || img?.src || "";
        }).filter(Boolean)
      );
    }
    return this.page.$$eval("flow-image-tile, img", (elements) =>
      elements.map((el) => {
        if (el.tagName.toLowerCase() === "img") {
          return (el as HTMLImageElement).currentSrc || (el as HTMLImageElement).src || "";
        }
        const img = el.querySelector("img") as HTMLImageElement | null;
        return img?.currentSrc || img?.src || "";
      }).filter((src) => {
        if (!src || src.includes("about:blank")) return false;
        if (src.startsWith("data:")) return true;
        if (src.includes("gstatic.com") || src.includes("/ogw/")) return false;
        if (src.includes("/asb/")) return true;
        return /media\.getMediaUrlRedirect/.test(src);
      })
    );
  }

  // Uploading a frame switches the project's media filter to "Images" (live-verified), where a new
  // video tile would never show up. Switch back to "All media" before watching for results.
  private async showAllMedia(): Promise<void> {
    const allMedia = this.page.getByRole("button", { name: /all media/i }).first();
    if ((await allMedia.count()) === 0) return;
    await allMedia.click({ timeout: 5000 }).catch(() => undefined);
    await this.page.waitForTimeout(500);
  }

  // Existing results, read once two consecutive reads agree (max ~3s): thumbnails that are
  // still lazy-loading when we snapshot would otherwise count as "new" after submitting.
  private async settledResultKeys(type: "image" | "video"): Promise<Set<string>> {
    let previous = (await this.resultSrcs(type)).map(mediaKey).sort().join("\n");
    for (let i = 0; i < 6; i += 1) {
      await this.page.waitForTimeout(500);
      const current = (await this.resultSrcs(type)).map(mediaKey).sort().join("\n");
      if (current === previous) break;
      previous = current;
    }
    return new Set(previous ? previous.split("\n") : []);
  }

  // Enter a project so the prompt box exists. If the editor is already showing (real Flow
  // project or the test fixture), do nothing; otherwise open a fresh project from the dashboard.
  private async ensureProject(reload = false): Promise<void> {
    const locators = flowLocators(this.page);
    // Downloading a result leaves the page on that clip's viewer (/project/<id>/edit/<tile>),
    // whose prompt box is "Describe how to edit this video". Submitting there EDITS the previous
    // clip instead of generating a new one, so always go back to the project's own page first.
    const projectId = projectIdFromUrl(this.page.url());
    if (projectId && (reload || !isProjectGridUrl(this.page.url()))) {
      await this.page.goto(projectSubUrl(projectId, ""), { waitUntil: "domcontentloaded" });
      await locators.promptBox.first().waitFor({ state: "visible", timeout: 20000 }).catch(() => undefined);
    }
    if ((await locators.promptBox.count()) > 0) return;
    const newProject = this.page.locator("button, [role='button'], div").filter({ hasText: /new project/i }).first();
    if (await newProject.count()) {
      await newProject.click().catch(() => undefined);
      await locators.promptBox.first().waitFor({ state: "visible", timeout: 20000 }).catch(() => undefined);
    }
    if ((await locators.promptBox.count()) === 0) {
      // Fallback: click first project card or link
      const projectCard = this.page.locator("a[href*='/project/'], div[role='button']").first();
      if (await projectCard.count()) {
        await projectCard.click().catch(() => undefined);
        await locators.promptBox.first().waitFor({ state: "visible", timeout: 20000 }).catch(() => undefined);
      }
    }
  }

  // Best-effort: open the settings popover and set mode/model/ratio/duration/outputs. The
  // controls live in a portal and are driven by React, so each option must be picked with a
  // real (trusted) Playwright click — a DOM .click() in page.evaluate is ignored and leaves
  // the mode on Image. When the popover is absent (e.g. the fixture) we leave current settings.
  private async applySettings(job: GFlowJob): Promise<void> {
    const settings = flowLocators(this.page).settingsButton.first();
    if (!(await settings.count())) return;

    // A layer left open by a previous (failed) command would make this click TOGGLE the
    // popover closed and every pick below silently miss — start from a clean slate.
    await dismissOpenLayers(this.page);
    await settings.click({ force: true }).catch(() => undefined);
    await this.page.waitForTimeout(700);

    // Mode first — switching it changes which ratios/durations/models are offered.
    await pickOption(this.page, job.type === "video" ? /Vid[eé]o/i : /Image/i);
    await this.page.waitForTimeout(400);

    // Video input mode: Frames (first/last frame images) vs Ingredients (text-to-video).
    if (job.type === "video") {
      const wantsFrames = Boolean(job.startFrame || job.endFrame);
      await pickOption(this.page, wantsFrames ? /(Frames|Images)$/i : /Ingr[eé]dients$/i);
      await this.page.waitForTimeout(300);
    }

    if (job.ratio && RATIO_ICON[job.ratio]) await pickOption(this.page, new RegExp(`^${RATIO_ICON[job.ratio]}`));
    if (job.type === "video" && job.duration) await pickOption(this.page, new RegExp(`^${job.duration}\\s*s$`, "i"));
    await pickOption(this.page, new RegExp(`^(1x|x1|x?${job.outputs})$`, "i"));
    if (job.model) {
      // pickModel's retry dismisses every layer, including this popover — hand it a way back in.
      await pickModel(this.page, job.model, async () => {
        await settings.click({ force: true }).catch(() => undefined);
        await this.page.waitForTimeout(700);
      });
    }

    // The model dropdown and the settings popover are separate layers; a single Escape can
    // leave one of them open over the prompt box, so close them all.
    await dismissOpenLayers(this.page);
  }

  // Frames mode: fill the Start/End frame slot. Live-verified (Oct 2026): clicking the slot opens
  // a "Select a frame image" popover (<flow-add-menu-popover-content>, NOT role=dialog);
  // "Upload media" opens a file chooser; Flow may then ask "Rights to use this image"; the upload
  // appears as a selected [role=option] named after the file; "Add to prompt" assigns it to the
  // slot, whose "Start"/"End" label is then replaced by the image.
  //
  // Every failure here throws BEFORE the prompt is submitted: generating without the requested
  // frame spends credits on a clip that does not continue from the previous scene.
  private async uploadFrame(slot: "Start" | "End", filePath: string): Promise<void> {
    const slotLabel = (): Locator => this.page.getByText(slot, { exact: true }).first();
    if ((await slotLabel().count()) === 0) {
      throw new UiContractError(`the ${slot} frame slot is not on the page (Frames mode not selected?)`);
    }
    await slotLabel().click();

    const picker = this.page.locator("flow-add-menu-popover-content, [role=dialog], [aria-modal=true]").filter({ visible: true }).first();
    await picker.waitFor({ state: "visible", timeout: 10000 }).catch(() => {
      throw new UiContractError(`clicking the ${slot} frame slot did not open the frame picker`);
    });

    const uploadButton = picker.locator("button").filter({ hasText: /upload media/i }).first();
    const [chooser] = await Promise.all([
      this.page.waitForEvent("filechooser", { timeout: 15000 }),
      uploadButton.click()
    ]);
    await chooser.setFiles(filePath);
    await this.waitForUploadConsent();

    // The new upload shows up selected; prefer the option carrying this file's name.
    const uploaded = picker
      .locator("[role=option]")
      .filter({ hasText: basename(filePath) })
      .or(picker.locator('[role=option][aria-selected="true"]'))
      .first();
    await uploaded.waitFor({ state: "visible", timeout: 60000 }).catch(() => {
      throw new UiContractError(`the uploaded ${slot} frame never appeared in the frame picker`);
    });
    if ((await uploaded.getAttribute("aria-selected")) !== "true") await uploaded.click();

    await confirmPicker(this.page, picker);
    if ((await slotLabel().count()) > 0) {
      throw new UiContractError(`the ${slot} frame slot is still empty after adding the uploaded image`);
    }
  }

  // Flow asks "Rights to use this image" before accepting an upload (at least the first time).
  // That is the account owner's attestation to make, so we never click it: we wait for the user
  // to answer it in the Chrome window, and stop if they don't.
  private async waitForUploadConsent(): Promise<void> {
    const consent = this.page.getByText(/rights to use this image/i).first();
    const appeared = await consent.waitFor({ state: "visible", timeout: 3000 }).then(() => true, () => false);
    if (!appeared) return;
    console.log('[gflow] Flow asks you to confirm "Rights to use this image" — answer it in the Chrome window to continue (waiting up to 5 minutes).');
    await consent.waitFor({ state: "hidden", timeout: 5 * 60_000 }).catch(() => {
      throw new ManualActionRequiredError('Flow is waiting for you to confirm "Rights to use this image" for the uploaded frame.');
    });
  }

  // Reference a saved character in the current generation.
  // Live-verified: the "add_2 Create" button opens a media-picker dialog with a
  // "Characters" tab; we click the tab, pick the named tile, then confirm.
  private async referenceCharacter(name: string): Promise<void> {
    // Open the ingredient picker (aria-haspopup="dialog", text "add_2Create")
    const addBtn = this.page.locator('button[aria-haspopup="dialog"]').filter({ hasText: /add_2/i }).first();
    if ((await addBtn.count()) === 0) return;
    await addBtn.click().catch(() => undefined);

    const dialog = this.page.locator("[role=dialog],[aria-modal=true]").first();
    await dialog.waitFor({ state: "visible", timeout: 10000 }).catch(() => undefined);

    // Switch to the Characters tab
    const charsTab = dialog.locator("button,[role=tab]").filter({ hasText: /Characters/i }).first();
    await charsTab.click().catch(() => undefined);
    await this.page.waitForTimeout(400);

    // Pick the tile by name
    const tile = dialog.getByText(name, { exact: true }).first();
    await tile.waitFor({ state: "visible", timeout: 10000 }).catch(() => undefined);
    await tile.click().catch(() => undefined);

    // Confirm
    const confirm = dialog.locator("button").filter({ hasText: /add to prompt/i }).first();
    await confirm.click().catch(() => undefined);
    await dialog.waitFor({ state: "hidden", timeout: 10000 }).catch(() => undefined);
  }

  private async fillPrompt(prompt: string): Promise<void> {
    const box = flowLocators(this.page).promptBox.first();
    await dismissOpenLayers(this.page);
    await box.click({ timeout: 2000 }).catch(async () => {
      await dismissOpenLayers(this.page);
      await box.click({ timeout: 5000 }).catch(() => box.evaluate((el) => (el as HTMLElement).focus()));
    });
    await this.page.waitForTimeout(300);
    const clear = async (): Promise<void> => {
      await box.press("ControlOrMeta+a").catch(() => undefined);
      await box.press("Backspace").catch(() => undefined);
    };
    const textPresent = (): Promise<boolean> =>
      box.evaluate((el) => ((el as HTMLTextAreaElement).value ?? el.textContent ?? "").trim().length > 0).catch(() => false);

    // Paste the whole prompt as one trusted input event. Typing it key by key took 30-60s for a
    // scene prompt (style + cast + location + action is often 2,000+ characters).
    await clear();
    await this.page.keyboard.insertText(prompt);
    await this.page.waitForTimeout(300);

    if (!(await textPresent())) {
      console.log("[gflow] Fallback: typing the prompt key by key");
      await clear();
      await box.pressSequentially(prompt, { delay: 12 });
      await this.page.waitForTimeout(500);
    }

    if (!(await textPresent())) {
      console.log("[gflow] Fallback: setting innerText of prompt box directly");
      await box.evaluate((el, p) => {
        el.textContent = p;
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      }, prompt);
    }
  }

  private async submit(): Promise<void> {
    const submit = flowLocators(this.page).submitButton.first();
    await submit.waitFor({ state: "visible", timeout: 15000 });
    const deadline = Date.now() + 15000;
    while (Date.now() < deadline) {
      const enabled = await submit.evaluate((b) => !((b as HTMLButtonElement).disabled || b.getAttribute("aria-disabled") === "true")).catch(() => false);
      if (enabled) break;
      await this.page.waitForTimeout(300);
    }
    await submit.click({ timeout: 2000 }).catch(async () => {
      await dismissOpenLayers(this.page);
      await submit.click();
    });
  }

  private async waitForResults(before: Set<string>, expected: number, timeoutMs: number, type: "image" | "video"): Promise<string[]> {
    const locators = flowLocators(this.page);
    const deadline = Date.now() + timeoutMs;
    let lastLog = 0;
    const startTime = Date.now();

    while (Date.now() < deadline) {
      if (await locators.rateLimitMarker.first().isVisible().catch(() => false)) {
        throw new RateLimitedError("Flow displayed a rate limit or unusual activity message.");
      }
      if (await locators.creditMarker.first().isVisible().catch(() => false)) {
        throw new CreditLimitError("Flow displayed a credit or quota message.");
      }
      if (await locators.blockedMarker.first().isVisible().catch(() => false)) {
        throw new GenerationBlockedError("Flow displayed a policy block message.");
      }
      if (await locators.failedMarker.first().isVisible().catch(() => false)) {
        throw new GenerationFailedError("Flow displayed a generation failed message.");
      }

      const allCurrent = await this.resultSrcs(type);
      const added = newResults(allCurrent, before);
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      if (elapsed - lastLog >= 10) {
        console.log(`[gflow] Waiting for ${type} result... (${elapsed}s elapsed, detected ${allCurrent.length} total, ${added.length} new)`);
        lastLog = elapsed;
      }
      if (added.length >= expected) return added.slice(0, expected);
      await this.page.waitForTimeout(1500);
    }

    const added = newResults(await this.resultSrcs(type), before);
    if (added.length > 0) return added;
    throw new GenerationFailedError(`Timed out waiting for ${expected} result(s).`);
  }
}
