import { describe, expect, it } from "vitest";
import { chunkStory, buildStoryChunkPrompt, parseStructuredScript } from "../src/studio/breakdown.js";
import {
  createSlidingSceneWindows,
  buildAssetExtractionPrompt,
  buildActorDnaImagePrompt,
  buildLocationDnaImagePrompt,
  mergeDiscoveredActors
} from "../src/studio/dna.js";
import { isSafetyViolation, isCelebrityViolation, buildAdversarialMutationPrompt } from "../src/studio/adversarial.js";
import {
  calculateExponentialBackoff,
  buildSelfHealingPrompt,
  cleanHealedResponse,
  countWords
} from "../src/studio/healing.js";
import { calculateGridSlices } from "../src/studio/storyboard.js";

describe("Script Breakdown Engine", () => {
  it("chunks story into approximate word limits respecting sentence boundaries", () => {
    const sentence = "Đây là một câu văn tiếng Việt để kiểm tra phân đoạn kịch bản điện ảnh.";
    const longStory = Array(30).fill(sentence).join(" ");
    const chunks = chunkStory(longStory, 50);

    expect(chunks.length).toBeGreaterThan(1);
    for (const chunk of chunks) {
      const words = chunk.split(/\s+/).length;
      expect(words).toBeGreaterThan(0);
    }
  });

  it("builds story chunk prompt with system instruction", () => {
    const prompt = buildStoryChunkPrompt("Nam và Lan gặp nhau ở bờ hồ.");
    expect(prompt).toContain("Phân tích truyện");
    expect(prompt).toContain("Nam và Lan gặp nhau ở bờ hồ.");
  });

  it("parses structured SCENE format into scene nodes", () => {
    const raw = `
SCENE 1:
Nhân vật: Nam, Lan
Bối cảnh: Quán Cafe Cổ Hà Nội
Shot 1: Nam bước vào quán, vẻ mặt ngập ngừng. "Nam: Chào em, anh đến muộn."
Shot 2: Camera hướng về Lan, Lan mỉm cười nhẹ.

SCENE 2: [CUT]
Nhân vật: Nam
Bối cảnh: Đường phố mưa
Shot 1: Nam chạy dưới mưa.
`;
    const scenes = parseStructuredScript(raw);
    expect(scenes).toHaveLength(2);
    expect(scenes[0].id).toBe("scene-01");
    expect(scenes[0].characters).toEqual(["Nam", "Lan"]);
    expect(scenes[0].location).toBe("Quán Cafe Cổ Hà Nội");
    expect(scenes[0].shots).toHaveLength(2);
    expect(scenes[0].cut).toBe(false);

    expect(scenes[1].id).toBe("scene-02");
    expect(scenes[1].cut).toBe(true);
  });
});

describe("Visual DNA & Identity Engine", () => {
  it("creates sliding window triplets", () => {
    const dummyScenes = [
      { id: "s1", prompt: "p1", characters: [], cut: false },
      { id: "s2", prompt: "p2", characters: [], cut: false },
      { id: "s3", prompt: "p3", characters: [], cut: false }
    ];
    const windows = createSlidingSceneWindows(dummyScenes);
    expect(windows).toHaveLength(3);
    expect(windows[0].prev).toBeUndefined();
    expect(windows[0].current.id).toBe("s1");
    expect(windows[0].next?.id).toBe("s2");

    expect(windows[1].prev?.id).toBe("s1");
    expect(windows[1].current.id).toBe("s2");
    expect(windows[1].next?.id).toBe("s3");
  });

  it("builds 360 chroma key prompt for actor", () => {
    const prompt = buildActorDnaImagePrompt({ name: "Minh", traits: "25 tuổi, áo sơ mi trắng", roles: ["Nhân vật chính"] });
    expect(prompt).toContain("Phông nền xanh chroma key");
    expect(prompt).toContain("Toàn thân chính diện");
    expect(prompt).toContain("Góc 3/4");
    expect(prompt).toContain("Minh");
  });

  it("builds architectural location sheet prompt", () => {
    const prompt = buildLocationDnaImagePrompt({ name: "Penthouse Sang Trọng", traits: "Kính kịch trần, tone xám đen" });
    expect(prompt).toContain("KHÔNG có nhân vật đứng trong ảnh");
    expect(prompt).toContain("Penthouse Sang Trọng");
  });

  it("merges discovered actors without duplicating", () => {
    const existing = [{ name: "Minh", description: "Áo sơ mi", aliases: ["Anh Minh"], images: [] }];
    const discovered = [
      { name: "Minh", aliases: ["Minh Lee"], roles: ["Nam chính"], traits: "25 tuổi", referencePrompt: "" },
      { name: "Lan", aliases: [], roles: ["Nữ chính"], traits: "22 tuổi", referencePrompt: "" }
    ];
    const merged = mergeDiscoveredActors(existing, discovered);
    expect(merged).toHaveLength(2);
    const minh = merged.find((m) => m.name === "Minh");
    expect(minh?.aliases).toContain("Anh Minh");
    expect(minh?.aliases).toContain("Minh Lee");
  });
});

describe("Adversarial Celebrity Bypass", () => {
  it("detects safety violation keywords", () => {
    expect(isSafetyViolation("Request blocked due to safety policy")).toBe(true);
    expect(isSafetyViolation("Nội dung vi phạm chính sách bộ lọc")).toBe(true);
    expect(isSafetyViolation("Render completed successfully")).toBe(false);
  });

  it("detects celebrity violation keywords", () => {
    expect(isCelebrityViolation("Safety celebrity filter detected")).toBe(true);
    expect(isCelebrityViolation("Phát hiện người nổi tiếng trong khung hình")).toBe(true);
    expect(isCelebrityViolation("Generic error 500")).toBe(false);
  });

  it("generates adversarial mutation prompt", () => {
    const prompt = buildAdversarialMutationPrompt("Tom", "Dark hair, blue suit");
    expect(prompt).toContain("Redesign facial features to be 100% unique");
    expect(prompt).toContain("MUST RETAIN identical hair style");
  });
});

describe("Self-Healing Resilience Engine", () => {
  it("calculates exponential backoff with jitter", () => {
    const t0 = calculateExponentialBackoff(0);
    expect(t0).toBeGreaterThanOrEqual(2000);
    expect(t0).toBeLessThanOrEqual(3000);

    const t2 = calculateExponentialBackoff(2);
    // 2^2 * 2000 = 8000 + jitter(0..1000)
    expect(t2).toBeGreaterThanOrEqual(8000);
    expect(t2).toBeLessThanOrEqual(9000);
  });

  it("builds self-healing prompt preserving word count", () => {
    const original = "Cảnh sát rút súng bắn vào kẻ cướp.";
    const prompt = buildSelfHealingPrompt(original, "Bạo lực / vũ khí");
    expect(prompt).toContain("NHIỆM VỤ:");
    expect(prompt).toContain("LÝ DO CẦN SỬA: Lỗi kiểm duyệt chính sách: \"Bạo lực / vũ khí\"");
    expect(prompt).toContain("KỊCH BẢN GỐC CẦN CHỮA LÀNH:");
  });

  it("cleans healed response", () => {
    expect(cleanHealedResponse('```\n"Nhân vật chạy trốn"\n```')).toBe("Nhân vật chạy trốn");
  });
});

describe("Storyboard Multi-Crop Engine", () => {
  it("calculates 2x2 grid slices", () => {
    const slices = calculateGridSlices(1920, 1080, { rows: 2, cols: 2 }, "/tmp/out");
    expect(slices).toHaveLength(4);
    expect(slices[0].cropFilter).toBe("crop=960:540:0:0");
    expect(slices[1].cropFilter).toBe("crop=960:540:960:0");
    expect(slices[2].cropFilter).toBe("crop=960:540:0:540");
    expect(slices[3].cropFilter).toBe("crop=960:540:960:540");
  });

  it("calculates 3x3 grid slices", () => {
    const slices = calculateGridSlices(3000, 3000, { rows: 3, cols: 3 }, "/tmp/out");
    expect(slices).toHaveLength(9);
    expect(slices[0].cropFilter).toBe("crop=1000:1000:0:0");
    expect(slices[8].cropFilter).toBe("crop=1000:1000:2000:2000");
  });
});
