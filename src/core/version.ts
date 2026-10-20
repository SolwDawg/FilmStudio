import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Read the version from package.json so `--version` never drifts from the package. Dev runs this
// file from src/core/ (package.json two levels up); the build runs it from dist/src/core/ (three
// levels up), so try both anchors relative to this module.
export function resolveVersion(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  for (const rel of ["../../package.json", "../../../package.json"]) {
    try {
      return (JSON.parse(readFileSync(join(here, rel), "utf8")) as { version: string }).version;
    } catch {
      // try the next candidate
    }
  }
  return "0.0.0";
}
