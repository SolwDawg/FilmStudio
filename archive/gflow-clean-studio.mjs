// ============================================================
//  G-FLOW FILM STUDIO — Unified Google Flow Film Production Suite
//  Kết hợp gflow-cli và flow-tool-clean (MLT Ultra Elite V2.7 Clean)
// ============================================================
import fs from "fs";
import path from "path";
import { spawn, execSync } from "child_process";
import http from "http";

const DATA_URL_PATH = path.resolve("c:/learning/Film/flow-tool-clean/dist/app.dataurl.txt");
const FLOW_URL = "https://flow.google.com/?pli=1";
const RETRY_MS = 2000;

// Chrome executable discovery
function findChromeExecutable() {
  const candidates = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    process.env.LOCALAPPDATA + "\\Google\\Chrome\\Application\\chrome.exe"
  ];
  return candidates.find(c => fs.existsSync(c)) || "chrome.exe";
}

// Check CDP 9222
async function getCdpEndpoint() {
  for (const host of ["127.0.0.1:9222", "[::1]:9222", "localhost:9222"]) {
    try {
      const res = await fetch(`http://${host}/json/version`, { signal: AbortSignal.timeout(600) });
      if (res.ok) return `http://${host}`;
    } catch {}
  }
  return null;
}

// WebSocket CDP wrapper
function cdp(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    let id = 0;
    const pending = new Map();
    ws.addEventListener("open", () => resolve({
      send(method, params = {}) {
        return new Promise((res, rej) => {
          const mid = ++id;
          pending.set(mid, { res, rej });
          ws.send(JSON.stringify({ id: mid, method, params }));
        });
      },
      close() { try { ws.close(); } catch {} },
    }));
    ws.addEventListener("message", (ev) => {
      const msg = JSON.parse(ev.data.toString());
      if (msg.id && pending.has(msg.id)) {
        const { res, rej } = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) rej(new Error(JSON.stringify(msg.error))); else res(msg.result);
      }
    });
    ws.addEventListener("error", (err) => reject(err));
    ws.addEventListener("close", () => reject(new Error("ws closed")));
  });
}

// Find frames
async function listFrames(endpoint) {
  const ep = endpoint || await getCdpEndpoint();
  if (!ep) return [];
  const res = await fetch(ep + "/json/list");
  return await res.json();
}

// Injects the clean applet bundle into the frame with #root
async function injectCleanApplet(target, dataUrl, force = false) {
  const c = await cdp(target.webSocketDebuggerUrl);
  try {
    await c.send("Runtime.enable");
    const script = `(async () => {
      try {
        const rootEl = document.getElementById("root");
        if (!rootEl) return JSON.stringify({ state: "SKIPPED_NO_ROOT" });

        if (!${force} && window.__isCleanAppActive) {
          return JSON.stringify({ state: "ALREADY_ACTIVE", plan: "ULTRA ELITE (CLEAN)", maxScenes: 999 });
        }
        
        const dataUrl = ${JSON.stringify(dataUrl)};
        const cleanModule = await import(dataUrl);
        const CleanApp = cleanModule.default || cleanModule.App;
        if (!CleanApp) return JSON.stringify({ state: "ERROR", error: "CleanApp not exported" });

        const React = await import("react");
        const { createRoot } = await import("react-dom/client");

        if (window.__cleanAppRoot) {
          window.__cleanAppRoot.render(React.createElement(CleanApp));
        } else {
          rootEl.innerHTML = "";
          const root = createRoot(rootEl);
          window.__cleanAppRoot = root;
          root.render(React.createElement(CleanApp));
        }

        window.__isCleanAppActive = true;
        return JSON.stringify({ state: "CLEAN_INJECTED", plan: "ULTRA ELITE (CLEAN)", maxScenes: 999 });
      } catch (e) {
        return JSON.stringify({ state: "EXCEPTION", error: String((e && e.stack) || e) });
      }
    })()`;

    const out = await c.send("Runtime.evaluate", { expression: script, awaitPromise: true, returnByValue: true });
    return out.result?.value ?? JSON.stringify(out);
  } finally {
    c.close();
  }
}

// Scan and inject
async function runScan(force = false) {
  if (!fs.existsSync(DATA_URL_PATH)) {
    console.error(`[ERROR] Bundle data URL not found at ${DATA_URL_PATH}. Run build first!`);
    return { success: false, error: "Bundle not found" };
  }
  const dataUrl = fs.readFileSync(DATA_URL_PATH, "utf8").trim();

  const ep = await getCdpEndpoint();
  if (!ep) return { success: false, error: "CDP not reachable on 9222" };

  const targets = await listFrames(ep);
  const appletCandidates = targets.filter(t => t.type === "iframe" && t.url?.includes("scf.usercontent.goog"));

  for (const f of appletCandidates) {
    try {
      const res = await injectCleanApplet(f, dataUrl, force);
      const parsed = JSON.parse(res);
      if (parsed.state === "CLEAN_INJECTED") {
        console.log(`[${new Date().toLocaleTimeString()}] ✅ Đã nạp thành công Clean Film Studio vào Google Flow! (999 scenes, High Quality, No Lock)`);
        return { success: true, frameId: f.id, state: "CLEAN_INJECTED" };
      } else if (parsed.state === "ALREADY_ACTIVE") {
        return { success: true, frameId: f.id, state: "ALREADY_ACTIVE" };
      }
    } catch (err) {
      // frame might be compiling or busy
    }
  }

  return { success: false, error: "Applet frame with #root not yet found" };
}

// Launch Chrome with CDP
function launchChrome() {
  const chromePath = findChromeExecutable();
  console.log(`[LAUNCH] Khởi chạy Chrome với port CDP 9222: ${chromePath}`);
  const args = [
    "--remote-debugging-port=9222",
    "--remote-allow-origins=*",
    "--no-first-run",
    "--no-default-browser-check",
    FLOW_URL
  ];
  const child = spawn(chromePath, args, { detached: true, stdio: "ignore" });
  child.unref();
}

// Convert Studio Project JSON to gflow-cli pipeline YAML
function convertProjectToYaml(jsonPath, yamlPath) {
  if (!fs.existsSync(jsonPath)) {
    console.error(`File không tồn tại: ${jsonPath}`);
    return;
  }
  const raw = fs.readFileSync(jsonPath, "utf8");
  const data = JSON.parse(raw);

  const activeProject = data.subProjects ? (data.subProjects.find(p => p.id === data.activeProjectId) || data.subProjects[0]) : null;
  const projectData = activeProject ? activeProject.data : data;
  const scenes = projectData.scenes || [];
  const settings = projectData.settings || {};

  console.log(`[CONVERT] Tìm thấy ${scenes.length} phân cảnh trong dự án: ${activeProject?.name || "Dự án"}`);

  let yaml = `# G-Flow Film Studio Batch Pipeline\n`;
  yaml += `# Xuất từ dự án: ${activeProject?.name || "Film Project"}\n`;
  yaml += `jobs:\n`;

  scenes.forEach((s, idx) => {
    const sceneNum = String(idx + 1).padStart(2, "0");
    const jobId = `scene-${sceneNum}`;
    const prompt = (s.visualPrompt || s.prompt || s.audioPrompt || "").replace(/"/g, '\\"').replace(/\n/g, " ");
    const model = s.model || settings.selectedModel || "Omni Flash";
    const duration = parseInt(s.duration, 10) || parseInt(settings.globalDuration, 10) || 8;
    const ratio = s.aspectRatio || settings.aspectRatio || "16:9";

    yaml += `  - id: ${jobId}\n`;
    yaml += `    type: video\n`;
    yaml += `    prompt: "${prompt}"\n`;
    yaml += `    ratio: "${ratio}"\n`;
    yaml += `    duration: ${duration}\n`;
    yaml += `    model: "${model}"\n\n`;
  });

  const out = yamlPath || path.resolve("c:/learning/Film/generated_pipeline.yaml");
  fs.writeFileSync(out, yaml, "utf8");
  console.log(`[SUCCESS] Đã tạo file batch YAML: ${out}`);
  console.log(`Bạn có thể chạy batch bằng lệnh: npx --prefix c:/learning/gflow-cli gflow batch "${out}"`);
}

// Stitch videos with native FFmpeg
function stitchVideos(videoPaths, outputPath) {
  if (!videoPaths || videoPaths.length === 0) {
    console.error("[ERROR] Không có file video nào để ghép.");
    return;
  }
  const out = outputPath || path.resolve("c:/learning/Film/final_movie.mp4");
  const listFile = path.resolve("c:/learning/Film/inputs_stitch.txt");
  const fileContent = videoPaths.map(p => `file '${p.replace(/\\/g, "/")}'`).join("\n");
  fs.writeFileSync(listFile, fileContent, "utf8");

  console.log(`[FFMPEG] Bắt đầu ghép ${videoPaths.length} video bằng native FFmpeg...`);
  try {
    execSync(`ffmpeg -f concat -safe 0 -i "${listFile}" -c copy -y "${out}"`, { stdio: "inherit" });
    console.log(`[SUCCESS] Phim đã được xuất thành công: ${out}`);
    fs.unlinkSync(listFile);
  } catch (e) {
    console.error("[ERROR] Lỗi khi chạy FFmpeg ghép video:", e.message);
  }
}

// Main CLI dispatch
async function main() {
  const args = process.argv.slice(2);
  const cmd = args[0] || "--watch";

  console.log("============================================================");
  console.log("  G-FLOW FILM STUDIO — Google Flow Film Production Suite");
  console.log("============================================================");

  if (cmd === "launch") {
    launchChrome();
    console.log("[WAIT] Đang chờ Google Flow khởi động trên cổng 9222...");
    await new Promise(r => setTimeout(r, 4000));
    await runScan(true);
    // Enter watch
    console.log("[WATCH] Đang theo dõi và tự động nạp Clean Studio...");
    for (;;) {
      await runScan(false);
      await new Promise(r => setTimeout(r, RETRY_MS));
    }
  } else if (cmd === "inject") {
    const force = args.includes("--force");
    const res = await runScan(force);
    if (!res.success) {
      console.log(`[NOTICE] ${res.error}. Nếu Chrome chưa mở với port 9222, hãy dùng 'node gflow-clean-studio.mjs launch'`);
    }
  } else if (cmd === "to-batch") {
    const jsonPath = args[1];
    const yamlPath = args[2];
    if (!jsonPath) {
      console.log("Cách dùng: node gflow-clean-studio.mjs to-batch <project.json> [output.yaml]");
      return;
    }
    convertProjectToYaml(jsonPath, yamlPath);
  } else if (cmd === "stitch") {
    const target = args[1];
    if (!target) {
      console.log("Cách dùng: node gflow-clean-studio.mjs stitch <folder-or-file-list> [output.mp4]");
      return;
    }
    if (fs.statSync(target).isDirectory()) {
      const files = fs.readdirSync(target)
        .filter(f => f.endsWith(".mp4") && !f.includes("final_movie"))
        .sort()
        .map(f => path.join(target, f));
      stitchVideos(files, args[2]);
    } else {
      console.log("Mục tiêu không phải thư mục.");
    }
  } else if (cmd === "--watch" || cmd === "watch") {
    const endpoint = await getCdpEndpoint();
    if (!endpoint) {
      console.log("[WAIT] Chrome chưa bật cổng CDP 9222. Bạn có thể chạy: 'node gflow-clean-studio.mjs launch'");
    }
    console.log("[WATCH] Bắt đầu chế độ Daemon. Đang quét và tự động nạp Clean Studio...");
    for (;;) {
      await runScan(false);
      await new Promise(r => setTimeout(r, RETRY_MS));
    }
  } else {
    console.log("Các lệnh hỗ trợ:");
    console.log("  node gflow-clean-studio.mjs launch                 : Mở Chrome và nạp Clean Studio");
    console.log("  node gflow-clean-studio.mjs inject [--force]       : Nạp ngay vào tab Flow đang mở");
    console.log("  node gflow-clean-studio.mjs watch                  : Quét daemon tự nạp khi F5 (mặc định)");
    console.log("  node gflow-clean-studio.mjs to-batch <file.json>   : Chuyển dự án sang YAML cho gflow-cli");
    console.log("  node gflow-clean-studio.mjs stitch <folder>        : Ghép video bằng Native FFmpeg cực nhanh");
  }
}

main().catch(err => {
  console.error("Fatal error:", err);
});
