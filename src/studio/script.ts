import type { Film, FilmCharacter, FilmScene } from "./project.js";

// "SCENE 1:", "Scene 2 -", "CẢNH 3." or "PHÂN CẢNH 4:" starts a scene; the prompt may follow on
// the same line or on the lines below it.
const SCENE_HEADER = /^[ \t]*(?:PH[ÂA]N\s+C[ẢA]NH|C[ẢA]NH|SCENE)\s+(\d+)[ \t]*[:.\-–][ \t]*/gimu;
const CUT_MARKER = /\[(?:CUT|CẮT CẢNH)\]/giu;

export interface ParsedScene {
  number: number;
  prompt: string;
  cut: boolean;
}

export function parseScript(text: string): ParsedScene[] {
  const matches = [...text.matchAll(SCENE_HEADER)];
  const scenes: ParsedScene[] = [];

  for (const [index, match] of matches.entries()) {
    const start = (match.index ?? 0) + match[0].length;
    const end = matches[index + 1]?.index ?? text.length;
    const body = text.slice(start, end);
    const cut = new RegExp(CUT_MARKER.source, "iu").test(body);
    const prompt = body.replace(CUT_MARKER, " ").replace(/\s+/g, " ").trim();
    if (prompt) scenes.push({ number: Number.parseInt(match[1], 10), prompt, cut });
  }

  return scenes;
}

function mentions(text: string, character: FilmCharacter): boolean {
  const haystack = text.toLowerCase();
  return [character.name, ...character.aliases].some((alias) => haystack.includes(alias.toLowerCase()));
}

export function scenesFromScript(text: string, characters: FilmCharacter[]): FilmScene[] {
  const parsed = parseScript(text);
  const width = Math.max(2, String(parsed.length).length);
  return parsed.map((scene, index) => ({
    id: `scene-${String(index + 1).padStart(width, "0")}`,
    prompt: scene.prompt,
    cut: scene.cut,
    characters: characters.filter((character) => mentions(scene.prompt, character)).map((character) => character.name)
  }));
}

// What Flow actually receives: style + who is in the shot (so faces and outfits stay consistent
// across scenes) + location architecture + the scene description.
export function buildScenePrompt(film: Film, scene: FilmScene): string {
  let relevantCharacters = scene.characters;

  if (film.strictActorMatch) {
    relevantCharacters = scene.characters.filter((charName) => {
      const char = film.characters.find((c) => c.name === charName);
      return char ? mentions(scene.prompt, char) : false;
    });
  }

  const cast = relevantCharacters
    .map((name) => film.characters.find((character) => character.name === name))
    .filter((character): character is FilmCharacter => Boolean(character?.description))
    .map((character) => `${character.name}: ${character.description}`);

  let locationText = "";
  if (film.locations && film.locations.length > 0) {
    const matchedLocs = film.locations.filter((loc) => {
      if (film.strictLocationMatch) {
        const hay = scene.prompt.toLowerCase();
        return [loc.name, ...loc.aliases].some((a) => hay.includes(a.toLowerCase()));
      }
      return scene.prompt.toLowerCase().includes(loc.name.toLowerCase());
    });
    if (matchedLocs.length > 0) {
      locationText = `Location — ${matchedLocs.map((l) => `${l.name}: ${l.description}`).join("; ")}.`;
    }
  }

  return [
    film.style.trim(),
    cast.length > 0 ? `Characters — ${cast.join("; ")}.` : "",
    locationText,
    scene.prompt.trim()
  ]
    .filter(Boolean)
    .join("\n");
}
