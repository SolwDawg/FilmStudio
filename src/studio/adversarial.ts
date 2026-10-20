import { ADVERSARIAL_MUTATION_PROMPT, CELEBRITY_KEYWORDS, SAFETY_KEYWORDS } from "./prompts.js";

/**
 * Checks if an error message returned by Google Flow / Gemini / Veo contains
 * policy or safety violation indicators.
 */
export function isSafetyViolation(errorText: string): boolean {
  const lower = errorText.toLowerCase();
  return SAFETY_KEYWORDS.some((kw) => lower.includes(kw.toLowerCase()));
}

/**
 * Checks specifically if the error is due to celebrity/facial identity matching.
 */
export function isCelebrityViolation(errorText: string): boolean {
  const lower = errorText.toLowerCase();
  return CELEBRITY_KEYWORDS.some((kw) => lower.includes(kw.toLowerCase()));
}

/**
 * Builds the adversarial mutation prompt for Nano Banana Pro.
 * Instructs the diffusion model to mutate biometric facial features while retaining
 * 100% hair, eyes, clothes, lighting and background from the reference image.
 */
export function buildAdversarialMutationPrompt(actorName?: string, baseDescription?: string): string {
  const prefix = actorName ? `Character: ${actorName}. ` : "";
  const desc = baseDescription ? `Existing look: ${baseDescription}. ` : "";
  return `${prefix}${desc}${ADVERSARIAL_MUTATION_PROMPT}`;
}

export interface EarlyProbeConfig {
  model: string;
  duration: number;
  resolution: string;
  prompt: string;
}

/**
 * Configuration for the early safety probe (Fast 4s 360p video via Omni Flash)
 * to detect policy or celebrity triggers before committing heavy rendering resources.
 */
export function getEarlyProbeConfig(testPrompt: string): EarlyProbeConfig {
  return {
    model: "Omni 1.1 Flash",
    duration: 4,
    resolution: "360p",
    prompt: testPrompt
  };
}
