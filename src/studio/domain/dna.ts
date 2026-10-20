import { DEFAULT_DIRECTIONAL_PROMPT, DEFAULT_LOCATION_DIRECTIONAL_PROMPT } from "./prompts.js";
import type { FilmCharacter, FilmScene } from "./project.js";

export interface DiscoveredActor {
  name: string;
  aliases: string[];
  roles: string[];
  traits: string;
  referencePrompt: string;
}

export interface DiscoveredLocation {
  name: string;
  aliases: string[];
  traits: string;
  referencePrompt: string;
}

export interface DnaScanResult {
  actors: DiscoveredActor[];
  locations: DiscoveredLocation[];
}

/**
 * Creates sliding window triplets of scenes: [i-1, i, i+1]
 * This provides the full surrounding context needed to extract relationship and identity.
 */
export function createSlidingSceneWindows(scenes: FilmScene[]): Array<{ prev?: FilmScene; current: FilmScene; next?: FilmScene }> {
  return scenes.map((current, i) => ({
    prev: scenes[i - 1],
    current,
    next: scenes[i + 1]
  }));
}

/**
 * Builds the LLM prompt for extracting actors and locations from a 3-scene sliding window.
 */
export function buildAssetExtractionPrompt(prev?: FilmScene, current?: FilmScene, next?: FilmScene): string {
  const contextParts = [
    prev ? `[SCENE TRƯỚC: ${prev.id}]\n${prev.prompt}` : "",
    current ? `[SCENE HIỆN TẠI (TRỌNG TÂM): ${current.id}]\n${current.prompt}` : "",
    next ? `[SCENE TIẾP THEO: ${next.id}]\n${next.prompt}` : ""
  ].filter(Boolean).join("\n\n");

  return `Bạn là Giám đốc Casting và Đạo diễn Thiết kế Bối cảnh Hollywood.
Hãy phân tích đoạn kịch bản 3 cảnh liên tiếp dưới đây và trích xuất danh sách nhân vật (Actors) và bối cảnh (Locations).

Yêu cầu xuất ra DUY NHẤT một khối JSON hợp lệ theo schema sau (không kèm giải thích markdown):
{
  "actors": [
    {
      "name": "Tên chuẩn",
      "aliases": ["biệt danh", "tên gọi khác"],
      "roles": ["vai trò trong kịch bản"],
      "traits": "Mô tả nhân trắc học, độ tuổi, vóc dáng, gương mặt, trang phục, phong thái"
    }
  ],
  "locations": [
    {
      "name": "Tên bối cảnh chính xác",
      "aliases": ["tên khác nếu có"],
      "traits": "Kiến trúc, nội thất, ánh sáng, màu sắc, vật liệu chủ đạo"
    }
  ]
}

--- DỮ LIỆU KỊCH BẢN ---
${contextParts}
`;
}

/**
 * Builds the 360° Character DNA Bible image generation prompt.
 * Generates front, 3/4, profile, back, and close-up views on Chroma key green.
 */
export function buildActorDnaImagePrompt(actor: { name: string; traits?: string; roles?: string[] }, customPrompt?: string): string {
  // An empty project setting (e.g. a cleared dashboard field) falls back to the default.
  const instructions = customPrompt?.trim() ? customPrompt : DEFAULT_DIRECTIONAL_PROMPT;
  return `${instructions.trim()}

--- THÔNG TIN NHÂN VẬT THIẾT KẾ ---
Tên nhân vật: ${actor.name}
${actor.roles && actor.roles.length > 0 ? `Vai trò: ${actor.roles.join(", ")}` : ""}
${actor.traits ? `Đặc điểm nhận diện & phục trang: ${actor.traits}` : ""}
`;
}

/**
 * Builds the Architectural Location Reference Sheet image generation prompt.
 * Generates an ultra-wide cinema architectural sheet with no characters present.
 */
export function buildLocationDnaImagePrompt(location: { name: string; traits?: string }, customPrompt?: string): string {
  const instructions = customPrompt?.trim() ? customPrompt : DEFAULT_LOCATION_DIRECTIONAL_PROMPT;
  return `${instructions.trim()}

--- THÔNG TIN BỐI CẢNH THIẾT KẾ ---
Tên bối cảnh: ${location.name}
${location.traits ? `Chi tiết không gian, nội thất & ánh sáng: ${location.traits}` : ""}
`;
}

/**
 * Merges discovered actors into the Film project characters array, avoiding duplicates.
 */
export function mergeDiscoveredActors(existing: FilmCharacter[], discovered: DiscoveredActor[]): FilmCharacter[] {
  const map = new Map<string, FilmCharacter>();
  for (const char of existing) {
    map.set(char.name.toLowerCase(), { ...char });
  }

  for (const actor of discovered) {
    const key = actor.name.toLowerCase();
    const current = map.get(key);
    if (!current) {
      map.set(key, {
        name: actor.name,
        description: actor.traits,
        aliases: actor.aliases || [],
        images: []
      });
    } else {
      // Merge aliases and traits
      const mergedAliases = Array.from(new Set([...current.aliases, ...(actor.aliases || [])]));
      map.set(key, {
        ...current,
        description: current.description || actor.traits,
        aliases: mergedAliases
      });
    }
  }

  return Array.from(map.values());
}
