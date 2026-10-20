// ============================================================
//  DOWNLOAD K-DRAMA SCENES & STITCH MASTER (NATIVE FFMPEG 9.0)
// ============================================================
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

async function main() {
  const res = await fetch("http://127.0.0.1:9222/json/list");
  const targets = await res.json();
  const iframe = targets.find(t => t.id === "C9CC3D2E27E51CB80E407FDB91E2DFED");
  if (!iframe) { console.error("Iframe not found"); return; }

  const ws = new WebSocket(iframe.webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener("open", r));

  const script = `(async () => {
    const videos = Array.from(document.querySelectorAll("video"));
    const data = [];
    for (let i = 0; i < videos.length; i++) {
      const v = videos[i];
      if (v.src) {
        try {
          const resp = await fetch(v.src);
          const blob = await resp.blob();
          const reader = new FileReader();
          const b64 = await new Promise(resolve => {
            reader.onload = () => resolve(reader.result.split(",")[1]);
            reader.readAsDataURL(blob);
          });
          data.push({ index: i + 1, base64: b64, size: blob.size });
        } catch (e) {
          data.push({ index: i + 1, error: e.message });
        }
      }
    }
    return data;
  })()`;

  ws.send(JSON.stringify({
    id: 1,
    method: "Runtime.evaluate",
    params: { expression: script, awaitPromise: true, returnByValue: true }
  }));

  ws.addEventListener("message", async ev => {
    const msg = JSON.parse(ev.data);
    const results = msg.result?.result?.value || [];
    console.log("Đã tìm thấy", results.length, "video từ Clean Studio.");

    const outDir = path.resolve("c:/learning/Film/output_kdrama");
    fs.mkdirSync(outDir, { recursive: true });

    const savedFiles = [];
    for (const item of results) {
      if (item.base64) {
        const filePath = path.join(outDir, "kdrama_shot_" + item.index + ".mp4");
        fs.writeFileSync(filePath, Buffer.from(item.base64, "base64"));
        savedFiles.push(filePath);
        console.log("Đã lưu Shot " + item.index + ":", filePath, "(" + (item.size / 1024 / 1024).toFixed(2) + " MB)");
      } else {
        console.error("Lỗi tải shot", item.index, ":", item.error);
      }
    }

    if (savedFiles.length > 0) {
      const finalMovie = path.join(outDir, "Seoul_Autumn_Promise_Master.mp4");
      const listPath = path.join(outDir, "stitch_kdrama_list.txt");
      fs.writeFileSync(listPath, savedFiles.map(f => "file '" + f.replace(/\\/g, "/") + "'").join("\n"));
      
      console.log("\n[FFMPEG] Đang ghép", savedFiles.length, "shots thành phim K-Drama hoàn chỉnh...");
      try {
        execSync("ffmpeg -f concat -safe 0 -i \"" + listPath + "\" -c copy -y \"" + finalMovie + "\"", { stdio: "inherit" });
        console.log("\n🎬 [HOÀN TẤT!] Phim Drama Hàn Quốc đã xuất xưởng thành công tại:");
        console.log("👉 " + finalMovie);
      } catch (err) {
        console.error("FFmpeg stitch error:", err.message);
      }
    }

    ws.close();
  });
}

main();
