import fs from "fs";
import path from "path";

async function main() {
  const outDir = path.resolve("output_movie");
  fs.mkdirSync(outDir, { recursive: true });

  const res = await fetch("http://127.0.0.1:9222/json/list");
  const targets = await res.json();
  const iframe = targets.find(t => t.id === "C9CC3D2E27E51CB80E407FDB91E2DFED");
  const ws = new WebSocket(iframe.webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener("open", r));

  console.log("Đang lấy video base64 của 3 scene từ browser memory...");

  for (let idx = 0; idx < 3; idx++) {
    const p = new Promise(resolve => {
      const reqId = 200 + idx;
      const onMsg = (ev) => {
        const data = JSON.parse(ev.data);
        if (data.id === reqId) {
          ws.removeEventListener("message", onMsg);
          resolve(data.result?.result?.value);
        }
      };
      ws.addEventListener("message", onMsg);
      ws.send(JSON.stringify({
        id: reqId,
        method: "Runtime.evaluate",
        params: {
          expression: `(() => {
            const scenes = window.__CLEAN_APP__?.getScenes() || [];
            const s = scenes[${idx}];
            return {
              idx: ${idx + 1},
              hasVideo: !!s?.videoBase64,
              videoBase64: s?.videoBase64,
              videoMediaId: s?.videoMediaId,
              lastFrameMediaId: s?.lastFrameMediaId
            };
          })()`,
          returnByValue: true
        }
      }));
    });

    const sceneData = await p;
    if (sceneData?.videoBase64) {
      const buffer = Buffer.from(sceneData.videoBase64, "base64");
      const filePath = path.join(outDir, `kdrama_seamless_scene${idx + 1}.mp4`);
      fs.writeFileSync(filePath, buffer);
      console.log(`[V] Lưu Scene ${idx + 1}: ${filePath} (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`);
      console.log(`    MediaId: ${sceneData.videoMediaId}`);
      console.log(`    LastFrameMediaId: ${sceneData.lastFrameMediaId}`);
    } else {
      console.error(`[X] Không tìm thấy video cho Scene ${idx + 1}`);
    }
  }

  ws.close();
}

main();
