// Google Flow URLs and project ids. Pure string helpers shared by the browser launcher, the Flow
// automation and the render pipeline, so none of them has to reach into another's internals.

// Start page for a session. hl=en: the engine matches English UI text; see englishUrl().
export const FLOW_URL = "https://flow.google.com/?pli=1&hl=en";

export const FLOW_BASE = "https://labs.google/fx/tools/flow";
export type ProjectSub = "" | "character" | "tools" | "create-tool";

// Flow renders in the Google account's language (Spanish, French, ...), but the selectors in
// this engine match the English UI text ("New project", "Frames", "Add to Prompt", ...).
// `hl=en` forces English for that page load only — it does not persist — so every URL the
// engine navigates to goes through here.
export function englishUrl(url: string): string {
  const parsed = new URL(url);
  parsed.searchParams.set("hl", "en");
  return parsed.toString();
}

export function isFlowProjectId(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

export function projectIdFromUrl(url: string): string | undefined {
  const m = url.match(/\/project\/([0-9a-f-]+)/i);
  return m ? m[1] : undefined;
}

export function projectSubUrl(projectId: string, sub: ProjectSub): string {
  return englishUrl(`${FLOW_BASE}/project/${projectId}${sub ? `/${sub}` : ""}`);
}
