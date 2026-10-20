import * as esbuild from "file:///C:/learning/gflow-cli/node_modules/esbuild/lib/main.js";
import fs from "fs";
import path from "path";

async function build() {
  const result = await esbuild.build({
    entryPoints: ["c:/learning/Film/flow-tool-clean/App.tsx"],
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
  const outPath = "c:/learning/Film/flow-tool-clean/dist/app.bundle.js";
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, bundledCode, "utf8");

  const base64Bundle = Buffer.from(bundledCode).toString("base64");
  const dataUrl = `data:text/javascript;base64,${base64Bundle}`;
  fs.writeFileSync("c:/learning/Film/flow-tool-clean/dist/app.dataurl.txt", dataUrl, "utf8");

  console.log(`Successfully built bundle!`);
  console.log(`Bundle size: ${(bundledCode.length / 1024).toFixed(2)} KB`);
  console.log(`Data URL written to: dist/app.dataurl.txt`);
}

build().catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});
