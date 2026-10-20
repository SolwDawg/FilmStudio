// ============================================================
//  G-FLOW STUDIO COMPANION — Web UI Dashboard & Bridge Server
// ============================================================
import http from "http";
import fs from "fs";
import path from "path";
import { spawn, execSync } from "child_process";

const PORT = 3333;
const DATA_URL_PATH = path.resolve("c:/learning/Film/flow-tool-clean/dist/app.dataurl.txt");
const logListeners = new Set();
const logs = [];

function addLog(msg) {
  const entry = `[${new Date().toLocaleTimeString()}] ${msg}`;
  logs.push(entry);
  if (logs.length > 200) logs.shift();
  for (const res of logListeners) {
    res.write(`data: ${JSON.stringify({ log: entry })}\n\n`);
  }
}

// Check CDP status
async function getStatus() {
  let cdpOk = false;
  let flowTab = null;
  let studioInjected = false;

  try {
    const res = await fetch("http://127.0.0.1:9222/json/version", { signal: AbortSignal.timeout(600) });
    if (res.ok) cdpOk = true;
  } catch {}

  if (cdpOk) {
    try {
      const res = await fetch("http://127.0.0.1:9222/json/list");
      const list = await res.json();
      flowTab = list.find(t => t.type === "page" && t.url?.includes("flow.google.com"));
      const iframes = list.filter(t => t.type === "iframe" && t.url?.includes("scf.usercontent.goog"));
      
      for (const iframe of iframes) {
        try {
          const ws = new WebSocket(iframe.webSocketDebuggerUrl);
          await new Promise(r => ws.addEventListener("open", r));
          ws.send(JSON.stringify({
            id: 1,
            method: "Runtime.evaluate",
            params: { expression: "window.__isCleanAppActive === true", returnByValue: true }
          }));
          const out = await new Promise(r => {
            ws.addEventListener("message", ev => {
              ws.close();
              r(JSON.parse(ev.data).result?.result?.value);
            });
          });
          if (out === true) studioInjected = true;
        } catch {}
      }
    } catch {}
  }

  return { cdpOk, flowTab: !!flowTab, studioInjected };
}

// Trigger injection
async function doInject(force = true) {
  addLog("Bắt đầu nạp Clean Studio bundle vào Flow...");
  try {
    const out = execSync("node gflow-clean-studio.mjs inject --force", { cwd: "c:/learning/Film" }).toString();
    addLog(out.trim());
    return { success: true, message: out.trim() };
  } catch (err) {
    addLog("Lỗi nạp bundle: " + err.message);
    return { success: false, error: err.message };
  }
}

// Trigger launch
async function doLaunch() {
  addLog("Đang khởi chạy Chrome với cổng remote debugging 9222...");
  try {
    const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
    const args = [
      "--remote-debugging-port=9222",
      "--remote-allow-origins=*",
      "--no-first-run",
      "--no-default-browser-check",
      "https://flow.google.com/?pli=1"
    ];
    const child = spawn(chromePath, args, { detached: true, stdio: "ignore" });
    child.unref();
    addLog("Đã mở Google Flow. Chờ 3 giây để hệ thống ổn định...");
    setTimeout(() => {
      doInject(true);
    }, 4000);
    return { success: true };
  } catch (err) {
    addLog("Lỗi mở Chrome: " + err.message);
    return { success: false, error: err.message };
  }
}

// Server
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (url.pathname === "/api/status") {
    const status = await getStatus();
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(status));
  }

  if (url.pathname === "/api/inject") {
    const result = await doInject(true);
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(result));
  }

  if (url.pathname === "/api/launch") {
    const result = await doLaunch();
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(result));
  }

  if (url.pathname === "/api/logs") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive"
    });
    res.write(`data: ${JSON.stringify({ logs })}\n\n`);
    logListeners.add(res);
    req.on("close", () => logListeners.delete(res));
    return;
  }

  // Dashboard HTML
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(`<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>G-Flow Film Studio — Unified Suite Dashboard</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #090d16;
      --card-bg: rgba(18, 26, 44, 0.7);
      --card-border: rgba(255, 255, 255, 0.08);
      --accent: #06b6d4;
      --accent-glow: rgba(6, 182, 212, 0.35);
      --purple: #8b5cf6;
      --green: #10b981;
      --text: #f1f5f9;
      --text-muted: #94a3b8;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Outfit', sans-serif;
      background-color: var(--bg);
      background-image: 
        radial-gradient(at 0% 0%, rgba(6, 182, 212, 0.15) 0px, transparent 50%),
        radial-gradient(at 100% 100%, rgba(139, 92, 246, 0.15) 0px, transparent 50%);
      color: var(--text);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    header {
      padding: 1.5rem 2rem;
      border-bottom: 1px solid var(--card-border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      backdrop-filter: blur(12px);
      background: rgba(9, 13, 22, 0.8);
      position: sticky;
      top: 0;
      z-index: 50;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: linear-gradient(135deg, var(--accent), var(--purple));
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      box-shadow: 0 0 20px var(--accent-glow);
    }
    .brand-title {
      font-size: 1.35rem;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    .badge {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 9999px;
      background: rgba(16, 185, 129, 0.2);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.4);
    }
    main {
      flex: 1;
      max-width: 1200px;
      width: 100%;
      margin: 0 auto;
      padding: 2rem;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 1.5rem;
      backdrop-filter: blur(16px);
      transition: all 0.25s ease;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .card:hover {
      border-color: rgba(6, 182, 212, 0.3);
      transform: translateY(-2px);
      box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
    }
    .card-title {
      font-size: 1.1rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .status-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    .status-item:last-child { border-bottom: none; }
    .status-pill {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.85rem;
      font-weight: 500;
    }
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #ef4444;
    }
    .dot.active {
      background: #10b981;
      box-shadow: 0 0 10px #10b981;
    }
    .btn {
      padding: 0.75rem 1.25rem;
      border-radius: 10px;
      border: none;
      font-family: inherit;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.2s ease;
    }
    .btn-primary {
      background: linear-gradient(135deg, var(--accent), #0284c7);
      color: #0b0f17;
      box-shadow: 0 4px 15px var(--accent-glow);
    }
    .btn-primary:hover {
      filter: brightness(1.1);
      transform: translateY(-1px);
    }
    .btn-secondary {
      background: rgba(255, 255, 255, 0.08);
      color: var(--text);
      border: 1px solid var(--card-border);
    }
    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.14);
    }
    .features-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      font-size: 0.9rem;
      color: var(--text-muted);
    }
    .features-list li {
      list-style: none;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .features-list li::before {
      content: "✦";
      color: var(--accent);
    }
    .console-box {
      background: #050811;
      border: 1px solid var(--card-border);
      border-radius: 14px;
      padding: 1.25rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.82rem;
      height: 220px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 6px;
      color: #38bdf8;
    }
    .console-line { word-break: break-all; }
  </style>
</head>
<body>
  <header>
    <div class="brand">
      <div class="brand-icon">🎬</div>
      <div>
        <div class="brand-title">G-Flow Film Studio</div>
        <div style="font-size: 0.75rem; color: var(--text-muted);">Unified Google Flow Studio + gflow-cli Suite</div>
      </div>
    </div>
    <div style="display: flex; gap: 10px; align-items: center;">
      <span class="badge">999 SCENES UNLOCKED</span>
      <span class="badge" style="background: rgba(139, 92, 246, 0.2); color: #c084fc; border-color: rgba(139, 92, 246, 0.4);">CLEAN V2.7</span>
    </div>
  </header>

  <main>
    <div class="grid">
      <!-- Status Card -->
      <div class="card">
        <div class="card-title"><span>📡</span> Trạng thái kết nối</div>
        <div>
          <div class="status-item">
            <span>Chrome CDP Port (9222)</span>
            <div class="status-pill"><span class="dot" id="dot-cdp"></span><span id="txt-cdp">Đang kiểm tra...</span></div>
          </div>
          <div class="status-item">
            <span>Google Flow Tab</span>
            <div class="status-pill"><span class="dot" id="dot-tab"></span><span id="txt-tab">Đang kiểm tra...</span></div>
          </div>
          <div class="status-item">
            <span>Clean Studio Applet</span>
            <div class="status-pill"><span class="dot" id="dot-injected"></span><span id="txt-injected">Đang kiểm tra...</span></div>
          </div>
        </div>
        <div style="margin-top: auto; display: flex; flex-direction: column; gap: 8px;">
          <button class="btn btn-primary" onclick="launchFlow()">🚀 Mở Google Flow & Nạp Studio</button>
          <button class="btn btn-secondary" onclick="forceInject()">⚡ Nạp lại ngay (Force Inject)</button>
        </div>
      </div>

      <!-- Feature Card -->
      <div class="card">
        <div class="card-title"><span>✨</span> Tính Năng Đã Mở Khóa</div>
        <ul class="features-list">
          <li><strong>Giới hạn phân cảnh:</strong> Mở khóa tối đa 999 Scenes (Gốc 20-50).</li>
          <li><strong>Chất lượng video:</strong> Veo 3.1 Quality, Fast & Omni Flash không bị khóa.</li>
          <li><strong>Hệ thống AI Actor DNA:</strong> Tự động sửa diện mạo khi vướng filter người nổi tiếng.</li>
          <li><strong>Auto-Healing Prompt:</strong> Tự phát hiện và viết lại prompt an toàn với Gemini.</li>
          <li><strong>Master Stitching:</strong> Hỗ trợ ghép phim trong trình duyệt & Native FFmpeg 9.0 GPU.</li>
        </ul>
      </div>

      <!-- Automation CLI Card -->
      <div class="card">
        <div class="card-title"><span>⚙️</span> Tích Hợp CLI (gflow-cli)</div>
        <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.5;">
          Bạn có thể xuất dự án từ giao diện Flow Studio thành file JSON, sau đó dùng CLI để tạo hàng loạt video ở chế độ nền (Headless).
        </p>
        <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 8px; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; color: #a5f3fc;">
          node gflow-clean-studio.mjs to-batch project.json
        </div>
        <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 8px; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; color: #a5f3fc;">
          node gflow-clean-studio.mjs stitch ./videos/
        </div>
      </div>
    </div>

    <!-- Live Console -->
    <div class="card" style="padding: 1.25rem;">
      <div class="card-title" style="justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span>📟</span> Nhật ký hoạt động hệ thống (Live Logs)
        </div>
        <button class="btn btn-secondary" style="padding: 4px 10px; font-size: 0.75rem;" onclick="clearLogs()">Xóa log</button>
      </div>
      <div class="console-box" id="console"></div>
    </div>
  </main>

  <script>
    async function updateStatus() {
      try {
        const res = await fetch('/api/status');
        const data = await res.json();
        
        document.getElementById('dot-cdp').className = 'dot ' + (data.cdpOk ? 'active' : '');
        document.getElementById('txt-cdp').textContent = data.cdpOk ? 'Đã kết nối' : 'Chưa bật';

        document.getElementById('dot-tab').className = 'dot ' + (data.flowTab ? 'active' : '');
        document.getElementById('txt-tab').textContent = data.flowTab ? 'Đang mở' : 'Chưa mở';

        document.getElementById('dot-injected').className = 'dot ' + (data.studioInjected ? 'active' : '');
        document.getElementById('txt-injected').textContent = data.studioInjected ? 'Đã kích hoạt (Clean)' : 'Chưa nạp';
      } catch (e) {}
    }

    async function launchFlow() {
      await fetch('/api/launch');
    }

    async function forceInject() {
      await fetch('/api/inject');
    }

    function clearLogs() {
      document.getElementById('console').innerHTML = '';
    }

    function appendLog(line) {
      const box = document.getElementById('console');
      const div = document.createElement('div');
      div.className = 'console-line';
      div.textContent = line;
      box.appendChild(div);
      box.scrollTop = box.scrollHeight;
    }

    const evtSource = new EventSource('/api/logs');
    evtSource.onmessage = function(e) {
      const data = JSON.parse(e.data);
      if (data.logs) {
        data.logs.forEach(appendLog);
      } else if (data.log) {
        appendLog(data.log);
      }
    };

    setInterval(updateStatus, 2500);
    updateStatus();
  </script>
</body>
</html>`);
});

server.listen(PORT, () => {
  addLog(`G-Flow Film Studio Web Dashboard đang chạy tại: http://localhost:${PORT}`);
  console.log(`[STUDIO] Companion Dashboard running at: http://localhost:${PORT}`);
});
