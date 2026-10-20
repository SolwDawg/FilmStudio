import esbuild from "esbuild";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

export async function buildApplet(entryPath?: string, outBundlePath?: string): Promise<{ bundlePath: string; dataUrlPath: string; sizeKb: number }> {
  const root = process.cwd();
  const entry = entryPath ?? resolve(root, "archive/flow-tool-clean/App.tsx");
  const bundle = outBundlePath ?? resolve(root, "dist/applet.bundle.js");
  const dataUrlPath = resolve(dirname(bundle), "applet.dataurl.txt");

  if (!existsSync(entry)) {
    throw new Error(`Entry App.tsx not found at: ${entry}`);
  }

  const result = await esbuild.build({
    entryPoints: [entry],
    bundle: true,
    format: "esm",
    target: "es2022",
    external: [
      "react",
      "react/*",
      "react-dom",
      "react-dom/*",
      "flow-sdk",
      "@ffmpeg/util"
    ],
    write: false
  });

  const bundledCode = result.outputFiles[0].text;
  mkdirSync(dirname(bundle), { recursive: true });
  writeFileSync(bundle, bundledCode, "utf8");

  const base64Bundle = Buffer.from(bundledCode).toString("base64");
  const dataUrl = `data:text/javascript;base64,${base64Bundle}`;
  writeFileSync(dataUrlPath, dataUrl, "utf8");

  const sizeKb = Number((bundledCode.length / 1024).toFixed(2));
  return { bundlePath: bundle, dataUrlPath, sizeKb };
}

// Direct execution CLI runner
if (process.argv[1]?.endsWith("build.ts") || process.argv[1]?.endsWith("build.js")) {
  buildApplet()
    .then((res) => {
      console.log(`[Applet Build] Success: ${res.sizeKb} KB`);
      console.log(`[Applet Build] Bundle: ${res.bundlePath}`);
      console.log(`[Applet Build] DataURL: ${res.dataUrlPath}`);
    })
    .catch((err) => {
      console.error("[Applet Build] Failed:", err);
      process.exit(1);
    });
}
