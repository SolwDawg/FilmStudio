import { DEFAULT_HEAL_INSTRUCTION } from "./prompts.js";

export interface HealAttemptResult {
  healedText: string;
  wordCountOriginal: number;
  wordCountHealed: number;
}

/**
 * Calculates exponential backoff with jitter for retries.
 * T = 2^attempt * 2000ms + random(0, 1000ms)
 */
export function calculateExponentialBackoff(attempt: number, baseMs = 2000): number {
  const exp = Math.min(attempt, 6);
  const backoff = Math.pow(2, exp) * baseMs;
  const jitter = Math.floor(Math.random() * 1000);
  return backoff + jitter;
}

/**
 * Builds the prompt for Gemini to heal a scene prompt that was rejected by content moderation filters.
 */
export function buildSelfHealingPrompt(
  originalScript: string,
  errorReason: string,
  healInstruction = DEFAULT_HEAL_INSTRUCTION
): string {
  const words = originalScript.trim().split(/\s+/).length;

  return `NHIỆM VỤ: ${healInstruction.trim()}
LÝ DO CẦN SỬA: Lỗi kiểm duyệt chính sách: "${errorReason}".
RÀNG BUỘC KỸ THUẬT:
1. Tuyệt đối giữ nguyên 100% cốt truyện, nhân vật, bối cảnh và ý đồ điện ảnh.
2. Thay thế các từ ngữ nhạy cảm/bị cấm bằng các từ đồng nghĩa mô tả gián tiếp, nghệ thuật, ẩn dụ điện ảnh.
3. Độ dài kịch bản mới phải xấp xỉ ${words} từ (bằng độ dài kịch bản cũ).
4. Chỉ xuất duy nhất nội dung kịch bản SCENE, không thêm bất kỳ lời chào hay giải thích nào.

KỊCH BẢN GỐC CẦN CHỮA LÀNH:
"""
${originalScript.trim()}
"""
`;
}

/**
 * Counts words in a string.
 */
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Formats a clean healed script response from LLM, stripping quotes and markdown wrappers.
 */
export function cleanHealedResponse(rawResponse: string): string {
  let cleaned = rawResponse.trim();
  // Strip code block backticks if present
  if (cleaned.startsWith("```") && cleaned.endsWith("```")) {
    cleaned = cleaned.replace(/^```[a-z]*\n?/i, "").replace(/\n?```$/i, "");
  }
  // Strip leading/trailing double quotes
  if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
    cleaned = cleaned.slice(1, -1);
  }
  return cleaned.trim();
}
