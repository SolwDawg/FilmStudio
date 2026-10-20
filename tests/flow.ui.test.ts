import { describe, expect, it } from "vitest";
import { englishUrl, isFlowProjectId, projectIdFromUrl, projectSubUrl } from "../src/flow/ui.js";
import { MODE_LABEL, characterLabel, isProjectGridUrl, mediaKey, newResults } from "../src/flow/page.js";

describe("project url helpers", () => {
  it("extracts the project id from a flow url", () => {
    expect(projectIdFromUrl("https://labs.google/fx/tools/flow/project/e7f6d6ef-61cf-478e-b7e0-31a09aac0f9f/characters"))
      .toBe("e7f6d6ef-61cf-478e-b7e0-31a09aac0f9f");
  });
  it("returns undefined when there is no project segment", () => {
    expect(projectIdFromUrl("https://labs.google/fx/tools/flow")).toBeUndefined();
  });
  it("builds a project sub-url", () => {
    expect(projectSubUrl("abc", "character")).toBe("https://labs.google/fx/tools/flow/project/abc/character?hl=en");
    expect(projectSubUrl("abc", "")).toBe("https://labs.google/fx/tools/flow/project/abc?hl=en");
  });

  it("recognises a Flow project id", () => {
    expect(isFlowProjectId("1a7565fa-d1c2-4536-b58c-7cff5c3b0d3d")).toBe(true);
    expect(isFlowProjectId("My Film")).toBe(false);
  });

  it("tells the project page apart from a clip viewer", () => {
    expect(isProjectGridUrl("https://flow.google.com/project/fa75251b-b4ea-4c50-898c-bfbf9a20dc22")).toBe(true);
    expect(isProjectGridUrl("https://flow.google.com/project/fa75251b-b4ea-4c50-898c-bfbf9a20dc22?hl=en")).toBe(true);
    expect(isProjectGridUrl("https://flow.google.com/project/fa75251b-b4ea-4c50-898c-bfbf9a20dc22/edit/f0a91064-7f4a")).toBe(false);
  });

  it("compares result media by path, ignoring rotating URL signatures", () => {
    const before = new Set([mediaKey("https://flow-content.google/image/aaa?Expires=1&Signature=x")]);
    const current = [
      "https://flow-content.google/image/aaa?Expires=2&Signature=y", // same media, re-signed
      "https://flow-content.google/image/bbb?Expires=2&Signature=z",
      "https://flow-content.google/image/bbb?Expires=3&Signature=w" // duplicate of the new one
    ];
    expect(newResults(current, before)).toEqual(["https://flow-content.google/image/bbb?Expires=2&Signature=z"]);
  });

  it("forces the English UI on any Flow URL", () => {
    expect(englishUrl("https://flow.google.com/?pli=1")).toBe("https://flow.google.com/?pli=1&hl=en");
    expect(englishUrl("https://flow.google.com/?hl=es")).toBe("https://flow.google.com/?hl=en");
  });

  it("matches a character tile by whole name", () => {
    expect(characterLabel("Minwoo").test("Minwoo Character")).toBe(true);
    expect(characterLabel("minwoo").test("Minwoo")).toBe(true);
    expect(characterLabel("Min").test("Minwoo Character")).toBe(false);
    expect(characterLabel("Seo-yeon (2)").test("Seo-yeon (2) Character")).toBe(true);
  });

  it("matches the mode radios but not the sidebar filters", () => {
    expect(MODE_LABEL.frames.test("crop_freeFrames")).toBe(true);
    expect(MODE_LABEL.ingredients.test("chrome_extensionIngredients")).toBe(true);
    expect(MODE_LABEL.video.test("videocamVideo")).toBe(true);
    expect(MODE_LABEL.image.test("imageImage")).toBe(true);
    for (const sidebar of ["imageImages", "videocamVideos", "dashboardAll media"]) {
      expect(Object.values(MODE_LABEL).some((label) => label.test(sidebar))).toBe(false);
    }
  });
});
