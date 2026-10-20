import { homedir } from "node:os";
import { resolve, dirname } from "node:path";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function resolveProfileDir(profile: string): string {
  if (process.env.GFLOW_PROFILE_DIR) return resolve(process.env.GFLOW_PROFILE_DIR, profile);
  const localGflow = resolve(process.cwd(), ".gflow", "profiles", profile);
  if (existsSync(localGflow)) return localGflow;
  const rootGflow = resolve(__dirname, "..", "..", "..", ".gflow", "profiles", profile);
  if (existsSync(rootGflow)) return rootGflow;
  return localGflow;
}

export function resolveOutputDir(outDir: string): string {
  return resolve(process.cwd(), outDir);
}

export function defaultCacheDir(): string {
  return resolve(homedir(), ".cache", "gflow");
}
