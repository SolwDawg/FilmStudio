import { mkdir, writeFile } from "node:fs/promises";
import { dirname, extname, join } from "node:path";
import type { BrowserContext, Download, Locator, Page } from "playwright";
import { DownloadError, GenerationFailedError, ManualActionRequiredError } from "../core/index.js";

export type DownloadQuality = "original" | "2k" | "4k";

// How long a Download click may take to start a browser download. A click that starts nothing
// falls through to the direct-fetch paths, so this only bounds the wasted wait.
export const DOWNLOAD_EVENT_TIMEOUT_MS = 30_000;

export function mediaIdFromSrc(src: string): string | undefined {
  const m = src.match(/[?&]name=([0-9a-f-]+)/i);
  return m ? m[1] : undefined;
}

export function qualityMenuPattern(quality: DownloadQuality): RegExp {
  if (quality === "2k") return /2K/i;
  if (quality === "4k") return /4K/i;
  return /original/i;
}

export function extensionFor(type: "image" | "video", contentType: string | undefined): string {
  if (contentType?.includes("jpeg")) return ".jpg";
  if (contentType?.includes("png")) return ".png";
  if (contentType?.includes("webp")) return ".webp";
  if (contentType?.includes("mp4") || contentType?.includes("video")) return ".mp4";
  return type === "video" ? ".mp4" : ".png";
}

export interface DownloadInput {
  page: Page;
  context: BrowserContext;
  src: string;
  type: "image" | "video";
  quality: DownloadQuality;
  outDir: string;
  basename: string;
}

export interface DownloadOutput {
  assetPath: string;
}

export async function downloadResult(input: DownloadInput): Promise<DownloadOutput> {
  await mkdir(input.outDir, { recursive: true });
  const { page, context, src, type, outDir, basename } = input;

  if (type === "video") {
    // Open viewer by clicking flow-video-tile or video element
    const opened = await openViewerForVideo(page, src);
    if (opened) {
      const viaMenu = await downloadViaMenu(input);
      if (viaMenu) return viaMenu;
    }

    // Poll for the <video> element to mount and expose its signed stream URL
    let videoUrl: string | null = null;
    const deadline = Date.now() + 15000;
    while (Date.now() < deadline) {
      videoUrl = await page.evaluate(() => {
        const v = document.querySelector("video") as HTMLVideoElement | null;
        return v && (v.currentSrc || v.src) ? (v.currentSrc || v.src) : null;
      });
      if (videoUrl && (videoUrl.includes("flow-content.google") || videoUrl.includes(".mp4") || videoUrl.startsWith("blob:"))) {
        break;
      }
      await page.waitForTimeout(500);
    }

    if (videoUrl) {
      console.log(`[gflow] Detected video stream URL: ${videoUrl}`);
      await page.keyboard.press("Escape").catch(() => undefined);
      await page.waitForTimeout(300);

      if (videoUrl.startsWith("blob:")) {
        return await fallbackFetch({ ...input, src: videoUrl });
      }

      const assetPath = join(outDir, `${basename}.mp4`);
      const response = await context.request.get(videoUrl, { timeout: 120000 });
      if (response.ok()) {
        await writeFile(assetPath, Buffer.from(await response.body()));
        console.log(`[gflow] Saved full MP4: ${assetPath}`);
        return { assetPath };
      }
    }

    // The image fallback below would click an arbitrary image and could save a thumbnail as .mp4.
    if (isVideoSource(src)) return fallbackFetch(input);
    throw new DownloadError(opened ? "the video viewer opened but exposed no downloadable stream" : "could not find the generated video's tile on the page");
  }

  // Image or fallback
  let opened = false;
  try {
    if (await openViewerForImage(page, src)) {
      opened = true;
      const viaMenu = await downloadViaMenu(input);
      if (viaMenu) return viaMenu;
    }
    return await fallbackFetch(input);
  } finally {
    if (opened) {
      await page.keyboard.press("Escape").catch(() => undefined);
      await page.waitForTimeout(500);
    }
  }
}

async function openViewerForVideo(page: Page, src: string): Promise<boolean> {
  const matched = page.locator("flow-video-tile, video, #results video").filter({
    has: page.locator(`img[src="${src}"], video[src="${src}"]`)
  }).first();

  if (await matched.count()) {
    await matched.click({ force: true }).catch(() => undefined);
    return true;
  }

  const bySrc = page.locator(`video[src="${src}"]`).first();
  if (await bySrc.count()) {
    await bySrc.click({ force: true }).catch(() => undefined);
    return true;
  }

  // Deliberately no "first video on the page" fallback: that can be an older clip, and a wrong
  // clip silently breaks frame continuity for every scene after it.
  return false;
}

// A video result's `src` is usually its tile's thumbnail image; only these point at the video itself.
function isVideoSource(src: string): boolean {
  return src.startsWith("data:video") || src.startsWith("blob:") || /\.(mp4|webm|mov)(\?|$)/i.test(src) || src.includes("flow-content.google");
}

async function openViewerForImage(page: Page, src: string): Promise<boolean> {
  const bySrc = page.locator(`img[src="${src}"]`).first();
  if (await bySrc.count()) {
    await bySrc.click({ force: true }).catch(() => undefined);
    return true;
  }

  const tile = page.locator("flow-image-tile, img.image, #results img, [data-project] ~ #results img, img").first();
  if (await tile.count()) {
    await tile.click({ force: true }).catch(() => undefined);
    return true;
  }
  return false;
}

function downloadButton(page: Page): Locator {
  return page
    .locator("button, [role=button]")
    .filter({ hasText: /download|t[eé]l[eé]charger/i })
    .or(page.locator('button[aria-label*="download" i], button[aria-label*="télécharger" i], button[aria-label*="telecharger" i]'))
    .first();
}

async function downloadViaMenu(input: DownloadInput): Promise<DownloadOutput | undefined> {
  const { page } = input;
  const btn = downloadButton(page);
  const hasMenu = await btn.getAttribute("aria-haspopup").then((v) => v === "menu").catch(() => false);

  if (!hasMenu) {
    const [download] = await Promise.all([
      page.waitForEvent("download", { timeout: DOWNLOAD_EVENT_TIMEOUT_MS }).catch(() => null),
      btn.click().catch(() => null)
    ]);
    if (download) return saveDownload(input, download);
    return undefined;
  }

  await btn.click().catch(() => undefined);
  await page.waitForTimeout(500);

  const pattern = qualityMenuPattern(input.quality);
  const marked = await page.evaluate(
    ({ source, flags }) => {
      const re = new RegExp(source, flags);
      const items = [...document.querySelectorAll("[role=menuitem],[role=menuitemradio],[role=option],[data-radix-collection-item]")];
      const el = items.find((e) => re.test((e.textContent || "").trim()));
      if (!el) return "none";
      if (/upgrade/i.test(el.textContent || "")) return "gated";
      el.setAttribute("data-gflow-dl", "1");
      return "ok";
    },
    { source: pattern.source, flags: pattern.flags }
  );
  if (marked === "gated") {
    throw new ManualActionRequiredError(
      "That download tier requires a Flow plan upgrade. Use --upscale 2k or omit --upscale."
    );
  }
  if (marked !== "ok") {
    await page.keyboard.press("Escape").catch(() => undefined);
    return undefined;
  }
  const [download] = await Promise.all([
    page.waitForEvent("download", { timeout: DOWNLOAD_EVENT_TIMEOUT_MS }).catch(() => null),
    page.locator('[data-gflow-dl="1"]').first().click().catch(() => null)
  ]);
  if (download) return saveDownload(input, download);
  return undefined;
}

async function saveDownload(input: DownloadInput, download: Download): Promise<DownloadOutput> {
  const ext = extname(download.suggestedFilename()) || (input.type === "video" ? ".mp4" : ".png");
  const assetPath = join(input.outDir, `${input.basename}${ext}`);
  await download.saveAs(assetPath);
  return { assetPath };
}

async function fallbackFetch(input: DownloadInput): Promise<DownloadOutput> {
  const { page, context, src, type, outDir, basename } = input;
  if (src.startsWith("data:")) {
    const comma = src.indexOf(",");
    const meta = src.slice(5, comma);
    const payload = src.slice(comma + 1);
    const bytes = meta.includes("base64") ? Buffer.from(payload, "base64") : Buffer.from(decodeURIComponent(payload), "utf8");
    const assetPath = join(outDir, `${basename}${extensionFor(type, meta.split(";")[0])}`);
    await mkdir(dirname(assetPath), { recursive: true });
    await writeFile(assetPath, bytes);
    return { assetPath };
  }
  if (src.startsWith("blob:")) {
    const base64Data = await page.evaluate(async (blobUrl) => {
      const resp = await fetch(blobUrl);
      const blob = await resp.blob();
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const res = reader.result as string;
          const comma = res.indexOf(",");
          resolve(res.slice(comma + 1));
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }, src);
    const assetPath = join(outDir, `${basename}${type === "video" ? ".mp4" : ".png"}`);
    await mkdir(dirname(assetPath), { recursive: true });
    await writeFile(assetPath, Buffer.from(base64Data, "base64"));
    return { assetPath };
  }
  const response = await context.request.get(src);
  if (!response.ok()) throw new GenerationFailedError(`Failed to download a result (HTTP ${response.status()}).`);
  const contentType = response.headers()["content-type"];
  const assetPath = join(outDir, `${basename}${extensionFor(type, contentType)}`);
  await mkdir(dirname(assetPath), { recursive: true });
  await writeFile(assetPath, Buffer.from(await response.body()));
  return { assetPath };
}
