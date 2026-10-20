// ============================================================
//  EXTRACT & SAVE VIDEOS DIRECTLY TO DISK
// ============================================================
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

async function main() {
  const res = await fetch("http://127.0.0.1:9222/json/list");
  const targets = await res.json();
  const iframe = targets.find(t => t.id === "C9CC3D2E27E51CB80E407FDB91E2DFED");
  if (!iframe) return;

  const ws = new WebSocket(iframe.webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener("open", r));

  const extractScript = `(() => {
    const videoTags = Array.from(document.querySelectorAll("video"));
    return {
      count: videoTags.length,
      sources: videoTags.map(v => v.src)
    };
  })()`;

  ws.send(JSON.stringify({
    id: 1,
    method: "Runtime.evaluate",
    params: { expression: extractScript, returnByValue: true }
  }));

  ws.addEventListener("message", async ev => {
    const data = JSON.parse(ev.data);
    const result = data.result?.result?.value;
    console.log("Tìm thấy", result?.count, "video tags trên giao diện.");

    const outDir = path.resolve("c:/learning/Film/rendered_videos");
    fs.mkdirSync(outDir, { recursive: true });

    if (result?.sources) {
      for (let i = 0; i < result.sources.length; i++) {
        const src = result.sources[i];
        if (src.startsWith("blob:") || src.startsWith("http")) {
          console.log("Video " + (i + 1) + " URL: " + src.slice(0, 80));
        }
      }
    }

    ws.close();
  });
}

main();
