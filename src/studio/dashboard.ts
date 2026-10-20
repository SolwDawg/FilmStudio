// Full-featured Standalone AI Film Studio Web Application
export const DASHBOARD_HTML = `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>AI Film Studio — Complete Cinema Production Suite</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  :root {
    --bg-base: #07080b;
    --bg-surface: #0e111a;
    --bg-card: #131724;
    --bg-card-hover: #1a2033;
    --border-subtle: #1c2338;
    --border-highlight: #2e3b5e;
    --fg: #e2e8f0;
    --fg-bright: #ffffff;
    --muted: #79869e;
    --primary: #3b82f6;
    --primary-glow: rgba(59, 130, 246, 0.35);
    --accent: #8b5cf6;
    --accent-glow: rgba(139, 92, 246, 0.35);
    --pink: #ec4899;
    --pink-glow: rgba(236, 72, 153, 0.3);
    --ok: #10b981;
    --ok-glow: rgba(16, 185, 129, 0.3);
    --bad: #ef4444;
    --bad-glow: rgba(239, 68, 68, 0.3);
    --warn: #f59e0b;
    --warn-glow: rgba(245, 158, 11, 0.3);
    --radius-sm: 6px;
    --radius-md: 10px;
    --radius-lg: 14px;
    --radius-full: 9999px;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    background: var(--bg-base);
    color: var(--fg);
    font-family: 'Outfit', system-ui, -apple-system, sans-serif;
    font-size: 13px;
    line-height: 1.5;
    background-image: 
      radial-gradient(circle at 12% 0%, rgba(59, 130, 246, 0.16) 0%, transparent 45%),
      radial-gradient(circle at 88% 0%, rgba(139, 92, 246, 0.16) 0%, transparent 45%),
      radial-gradient(circle at 50% 60%, rgba(236, 72, 153, 0.06) 0%, transparent 55%),
      radial-gradient(circle at 50% 100%, #0a0d14 0%, #07080b 80%);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: rgba(0,0,0,0.25); }
  ::-webkit-scrollbar-thumb { background: #242c44; border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: #39466d; }

  header {
    background: rgba(10, 13, 20, 0.85);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--border-subtle);
    position: sticky;
    top: 0;
    z-index: 100;
  }
  .header-main {
    max-width: 1560px;
    margin: 0 auto;
    padding: 10px 20px;
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }
  .brand {
    font-weight: 900;
    font-size: 17px;
    letter-spacing: -0.5px;
    background: linear-gradient(135deg, #60a5fa 0%, #c084fc 50%, #f472b6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-right: 6px;
  }
  .brand-badge {
    font-size: 9.5px;
    font-weight: 800;
    text-transform: uppercase;
    background: rgba(139, 92, 246, 0.2);
    border: 1px solid rgba(139, 92, 246, 0.4);
    color: #c084fc;
    padding: 2px 7px;
    border-radius: var(--radius-full);
    letter-spacing: 0.5px;
    -webkit-text-fill-color: initial;
  }

  /* Form Elements */
  select, input, textarea, button {
    font-family: inherit;
    font-size: 12px;
    color: var(--fg);
    background: rgba(255,255,255,0.03);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
    padding: 6px 10px;
    transition: all 0.15s ease;
  }
  select:focus, input:focus, textarea:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 2px var(--primary-glow);
  }
  textarea { resize: vertical; line-height: 1.6; }
  button {
    font-weight: 700;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    user-select: none;
    white-space: nowrap;
  }
  button:hover:not(:disabled) {
    border-color: var(--border-highlight);
    background: rgba(255,255,255,0.07);
    transform: translateY(-1px);
  }
  button:active:not(:disabled) { transform: translateY(0); }
  button.primary {
    background: linear-gradient(135deg, #2563eb, #3b82f6);
    color: #fff;
    border-color: #3b82f6;
    box-shadow: 0 2px 8px var(--primary-glow);
  }
  button.accent {
    background: linear-gradient(135deg, #7c3aed, #8b5cf6);
    color: #fff;
    border-color: #8b5cf6;
    box-shadow: 0 2px 8px var(--accent-glow);
  }
  button.pink {
    background: linear-gradient(135deg, #db2777, #ec4899);
    color: #fff;
    border-color: #ec4899;
    box-shadow: 0 2px 8px var(--pink-glow);
  }
  button.success {
    background: linear-gradient(135deg, #059669, #10b981);
    color: #fff;
    border-color: #10b981;
    box-shadow: 0 2px 8px var(--ok-glow);
  }
  button.danger {
    background: linear-gradient(135deg, #b91c1c, #ef4444);
    color: #fff;
    border-color: #ef4444;
    box-shadow: 0 2px 8px var(--bad-glow);
  }
  button.gradient-all {
    background: linear-gradient(135deg, #db2777, #7c3aed, #2563eb);
    color: #fff;
    border: none;
    box-shadow: 0 2px 14px rgba(139, 92, 246, 0.4);
    font-weight: 800;
    letter-spacing: 0.3px;
  }
  button.gradient-all:hover:not(:disabled) {
    box-shadow: 0 4px 20px rgba(139, 92, 246, 0.6);
  }
  button:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }

  /* Navigation Tabs */
  .nav-tabs {
    display: flex;
    background: rgba(0,0,0,0.4);
    padding: 3px;
    border-radius: var(--radius-md);
    border: 1px solid var(--border-subtle);
    gap: 2px;
  }
  .nav-tab {
    padding: 5px 11px;
    font-weight: 700;
    font-size: 11.5px;
    border-radius: var(--radius-sm);
    color: var(--muted);
    background: transparent;
    border: none;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .nav-tab:hover { color: var(--fg-bright); transform: none; }
  .nav-tab.active {
    color: #fff;
    background: var(--border-highlight);
    box-shadow: 0 2px 8px rgba(0,0,0,0.4);
  }

  .config-strip {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    background: rgba(0,0,0,0.3);
    padding: 6px 16px;
    border-top: 1px solid rgba(255,255,255,0.04);
    border-bottom: 1px solid rgba(255,255,255,0.04);
    font-size: 11px;
  }
  .config-item {
    display: flex;
    align-items: center;
    gap: 5px;
    color: var(--muted);
  }
  .config-item select, .config-item input {
    font-size: 11px;
    padding: 3px 7px;
    height: 25px;
  }
  .toggle-btn {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 3px 8px;
    border-radius: var(--radius-full);
    font-size: 11px;
    font-weight: 600;
    border: 1px solid var(--border-subtle);
    background: rgba(255,255,255,0.02);
    color: var(--muted);
    cursor: pointer;
    transition: all 0.15s ease;
    user-select: none;
  }
  .toggle-btn.active {
    background: rgba(59, 130, 246, 0.15);
    border-color: var(--primary);
    color: #fff;
    box-shadow: 0 0 8px var(--primary-glow);
  }
  .toggle-btn.active.purple {
    background: rgba(139, 92, 246, 0.15);
    border-color: var(--accent);
    color: #fff;
    box-shadow: 0 0 8px var(--accent-glow);
  }
  .toggle-btn.active.pink {
    background: rgba(236, 72, 153, 0.15);
    border-color: var(--pink);
    color: #fff;
    box-shadow: 0 0 8px var(--pink-glow);
  }
  .toggle-btn.active.green {
    background: rgba(16, 185, 129, 0.15);
    border-color: var(--ok);
    color: #fff;
    box-shadow: 0 0 8px var(--ok-glow);
  }

  /* Main Workspace */
  main {
    flex: 1;
    max-width: 1560px;
    margin: 0 auto;
    padding: 18px 20px;
    display: flex;
    flex-direction: column;
    gap: 18px;
    width: 100%;
  }

  .tab-content { display: none; }
  .tab-content.active { display: block; }

  /* Panels */
  .panel {
    background: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    box-shadow: 0 6px 24px -4px rgba(0,0,0,0.4);
  }
  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    padding-bottom: 12px;
    flex-wrap: wrap;
    gap: 10px;
  }
  .panel-title {
    font-size: 15px;
    font-weight: 800;
    color: var(--fg-bright);
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .panel-subtitle { font-size: 11.5px; color: var(--muted); }

  .grid-2 { display: grid; grid-template-columns: 1.2fr 1fr; gap: 20px; }
  .grid-3 { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 18px; }
  @media (max-width: 960px) { .grid-2 { grid-template-columns: 1fr; } }

  /* Detailed Scene Card with Zoom Scale Support */
  .scene-card {
    background: var(--bg-card);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    padding: 16px;
    display: grid;
    grid-template-columns: 340px 1fr;
    gap: 18px;
    transition: all 0.2s ease;
    position: relative;
  }
  .scene-card:hover {
    border-color: var(--border-highlight);
    box-shadow: 0 10px 30px -5px rgba(0,0,0,0.5);
  }
  .scene-card::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 4px;
    background: var(--border-subtle);
    border-radius: var(--radius-lg) 0 0 var(--radius-lg);
    transition: background 0.2s ease;
  }
  .scene-card.done::before { background: var(--ok); }
  .scene-card.running::before { background: var(--primary); }
  .scene-card.healing::before { background: var(--warn); }
  .scene-card.failed::before { background: var(--bad); }

  .scene-media-col {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .scene-video-box {
    border-radius: var(--radius-md);
    overflow: hidden;
    background: #000;
    aspect-ratio: 16/9;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(255,255,255,0.06);
  }
  .scene-video-box video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  /* Multi-Frame Ribbon: STORY, SHOT, FIRST, LAST */
  .frame-ribbon {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 6px;
  }
  .ribbon-slot {
    border-radius: 4px;
    background: #0a0c12;
    border: 1px dashed var(--border-subtle);
    aspect-ratio: 16/9;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 8.5px;
    color: var(--muted);
    overflow: hidden;
    position: relative;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .ribbon-slot:hover { border-color: var(--primary); background: rgba(59, 130, 246, 0.05); }
  .ribbon-slot img { width: 100%; height: 100%; object-fit: cover; }
  .ribbon-tag {
    position: absolute;
    bottom: 2px;
    left: 2px;
    font-size: 7.5px;
    font-weight: 800;
    background: rgba(0,0,0,0.8);
    padding: 1px 3px;
    border-radius: 2px;
    color: #fff;
    text-transform: uppercase;
  }

  .scene-info-col {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .scene-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
  }
  .badge {
    padding: 2px 8px;
    border-radius: var(--radius-full);
    font-size: 10.5px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    border: 1px solid var(--border-subtle);
    background: rgba(255,255,255,0.03);
  }
  .badge.done { color: var(--ok); border-color: rgba(16, 185, 129, 0.4); background: var(--ok-glow); }
  .badge.running { color: var(--primary); border-color: rgba(59, 130, 246, 0.4); background: var(--primary-glow); animation: pulse 1.5s infinite; }
  .badge.healing { color: var(--warn); border-color: rgba(245, 158, 11, 0.4); background: var(--warn-glow); }
  .badge.failed { color: var(--bad); border-color: rgba(239, 68, 68, 0.4); background: var(--bad-glow); }
  .badge.chain { color: var(--accent); border-color: rgba(139, 92, 246, 0.4); background: var(--accent-glow); }
  .badge.cut { color: var(--warn); border-color: rgba(245, 158, 11, 0.4); }

  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

  .scene-prompt-box {
    font-size: 12px;
    color: #cbd5e1;
    background: rgba(0,0,0,0.3);
    padding: 8px 10px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border-subtle);
    width: 100%;
    min-height: 80px;
    font-family: inherit;
    line-height: 1.5;
  }
  .scene-prompt-box:focus {
    border-color: var(--primary);
  }

  .scene-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: auto;
    padding-top: 8px;
    border-top: 1px solid rgba(255,255,255,0.04);
  }
  .btn-mini {
    padding: 3px 8px;
    font-size: 10.5px;
    border-radius: 4px;
  }

  /* DNA Cards */
  .dna-card {
    background: var(--bg-card);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    position: relative;
  }
  .dna-card:hover { border-color: var(--border-highlight); }
  .dna-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .dna-code {
    background: #090b10;
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
    padding: 8px 10px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10.5px;
    color: #a5b4fc;
    max-height: 80px;
    overflow-y: auto;
    white-space: pre-wrap;
  }

  /* Console */
  .console {
    background: #06070a;
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 12px 16px;
    height: 380px;
    display: flex;
    flex-direction: column;
  }
  .console-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    color: var(--muted);
    letter-spacing: 0.6px;
  }
  .console pre {
    flex: 1;
    margin: 0;
    overflow-y: auto;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    line-height: 1.6;
    color: #94a3b8;
  }
  .log-line { padding: 1px 0; }
  .log-done { color: var(--ok); }
  .log-fail { color: var(--bad); }
  .log-heal { color: var(--warn); }
  .log-run { color: var(--primary); }

  /* Modals */
  .modal-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.75);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 300;
    visibility: hidden;
    opacity: 0;
    transition: all 0.2s ease;
  }
  .modal-overlay.open { visibility: visible; opacity: 1; }
  .modal {
    background: var(--bg-surface);
    border: 1px solid var(--border-highlight);
    border-radius: var(--radius-lg);
    padding: 24px;
    width: 90%;
    max-width: 620px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    box-shadow: 0 20px 50px rgba(0,0,0,0.8);
    max-height: 85vh;
    overflow-y: auto;
  }

  @media (max-width: 800px) {
    .scene-card { grid-template-columns: 1fr; }
  }
</style>
</head>
<body>

<!-- TOP CONTROL HEADER -->
<header>
  <div class="header-main">
    <div class="brand">
      <span>🎬 AI FILM STUDIO</span>
      <span class="brand-badge">ULTRA ELITE 3.0</span>
    </div>

    <div style="display:flex; align-items:center; gap:6px;">
      <select id="projectSelect" aria-label="Chọn dự án"></select>
      <button id="btnNewProject" title="Tạo dự án mới">➕ Phim Mới</button>
      <button id="btnDeleteProject" class="danger" title="Xóa dự án hiện tại">🗑️ Xóa</button>
      <button id="btnExportJson" title="Xuất toàn bộ dự án ra file JSON">📥 Xuất JSON</button>
      <button id="btnImportJson" title="Nạp dự án từ file JSON">📤 Nạp JSON</button>
      <input type="file" id="fileJsonPicker" accept=".json" style="display:none;">
    </div>

    <!-- MAIN WORKFLOW TABS -->
    <nav class="nav-tabs" aria-label="Phân hệ chức năng">
      <button class="nav-tab active" data-tab="tabTimeline">🎬 Phân Cảnh (Timeline)</button>
      <button class="nav-tab" data-tab="tabScript">📜 Kịch Bản & Phân Rã</button>
      <button class="nav-tab" data-tab="tabDna">🧬 Thư Viện DNA (360°)</button>
      <button class="nav-tab" data-tab="tabStoryboard">🖼️ Storyboard Crop</button>
      <button class="nav-tab" data-tab="tabAutoLoop">🔄 Auto-Loop</button>
      <button class="nav-tab" data-tab="tabMaster">🏆 Xuất Phim Master</button>
      <button class="nav-tab" data-tab="tabTerminal">📟 Nhật Ký</button>
    </nav>

    <div style="margin-left:auto; display:flex; gap:6px; align-items:center;">
      <button id="btnAutoRun" class="gradient-all" title="Quy trình tự động hóa 1-Click: Story ➔ DNA ➔ Render ➔ Master">🚀 1-Click Full Auto</button>
      <button id="btnPauseResume" title="Tạm dừng hoặc tiếp tục hàng đợi render">⏸️ Pause</button>
      <button id="btnStopEmergency" class="danger" title="Dừng khẩn cấp mọi tiến trình render">🛑 Dừng Khẩn Cấp</button>
      <button id="btnResetQueue" title="Làm mới hàng đợi (giữ lại các cảnh đã xong)">🔄 Reset Chờ</button>
      <button id="btnAdvancedModal" title="Cấu hình nâng cao & System Prompts">⚙️ Config</button>
      <button id="btnRenderAll" class="primary" title="Render tuần tự có Frame Continuity">▶️ Render</button>
      <button id="btnStitch" class="success" title="Ghép phim Master">🎬 Ghép Phim</button>
    </div>
  </div>

  <div class="config-strip">
    <div class="config-item">
      <span>Video:</span>
      <select id="cfgModel">
        <option value="Veo 3.1 - Quality">Veo 3.1 - Quality</option>
        <option value="Veo 3.1 - Fast">Veo 3.1 - Fast</option>
        <option value="Veo 3.1 - Lite">Veo 3.1 - Lite</option>
        <option value="Omni 1.1 Flash">Omni 1.1 Flash</option>
      </select>
    </div>

    <div class="config-item">
      <span>Ảnh:</span>
      <select id="cfgImageModel">
        <option value="🍌 Nano Banana Pro">🍌 Nano Banana Pro</option>
        <option value="🍌 Nano Banana 2.1">🍌 Nano Banana 2.1</option>
        <option value="🍌 Nano Banana 2 Lite">🍌 Nano Banana 2 Lite</option>
      </select>
    </div>

    <div class="config-item">
      <span>Tỉ lệ:</span>
      <select id="cfgRatio">
        <option value="16:9">16:9 (Cinema)</option>
        <option value="9:16">9:16 (Shorts/TikTok)</option>
        <option value="1:1">1:1 (Square)</option>
        <option value="4:3">4:3 (Vintage)</option>
        <option value="3:4">3:4 (Portrait)</option>
      </select>
    </div>

    <div class="config-item">
      <span>Thời lượng:</span>
      <select id="cfgDuration">
        <option value="4">4 giây</option>
        <option value="5">5 giây</option>
        <option value="8">8 giây</option>
        <option value="10">10 giây</option>
      </select>
    </div>

    <div class="config-item">
      <span>Độ nét:</span>
      <select id="cfgResolution">
        <option value="720p">720p HD</option>
        <option value="360p">360p Fast</option>
        <option value="1080p">1080p Full HD</option>
      </select>
    </div>

    <div class="config-item">
      <span>Mode:</span>
      <select id="cfgVideoGenMode">
        <option value="r2v">r2v (Thành phần)</option>
        <option value="i2v">i2v (Khung hình)</option>
      </select>
    </div>

    <div class="config-item">
      <span>Start Frame:</span>
      <select id="cfgStartFrameSource">
        <option value="continuity">Continuity (Frame cuối)</option>
        <option value="shot">Ảnh Shot</option>
        <option value="keyframe">Ảnh Keyframe</option>
        <option value="none">None</option>
      </select>
    </div>

    <div class="toggle-btn active" id="togContinuity" title="Tự động lấy frame cuối scene trước làm mồi cho scene sau (I2V Continuity)">
      <span>🔗 Continuity</span>
    </div>

    <div class="toggle-btn active purple" id="togAutoHeal" title="Tự động gọi Gemini viết lại kịch bản khi dính kiểm duyệt chính sách (23 keywords)">
      <span>🩹 Auto-Heal</span>
    </div>

    <div class="toggle-btn active pink" id="togCelebCheck" title="Thăm dò an toàn người nổi tiếng qua Omni Flash 4s + Nano Banana Pro">
      <span>🛡️ Celeb Check</span>
    </div>

    <div class="toggle-btn" id="togStrictActor" title="Chỉ nạp diễn viên khi kịch bản nhắc chính xác tên (tránh vẽ thừa người)">
      <span>🎯 Strict Actor</span>
    </div>

    <div class="toggle-btn" id="togStrictLoc" title="Chỉ nạp bối cảnh khi kịch bản nhắc đúng tên">
      <span>🏛️ Strict Loc</span>
    </div>

    <div class="toggle-btn" id="togSkipKeyframe" title="Bỏ qua sinh keyframe đơn lẻ, dùng trực tiếp prompt hoặc storyboard shot">
      <span>📷 Bỏ Keyframe</span>
    </div>

    <div class="toggle-btn" id="togRenderFromShot" title="Render video bắt đầu từ ảnh shot của Storyboard">
      <span>🎯 Từ Shot</span>
    </div>

    <div class="toggle-btn green" id="togAutoMerge" title="Tự động ghép phim Master ngay khi toàn bộ các cảnh hoàn tất">
      <span>🎬 Tự Ghép</span>
    </div>

    <div class="config-item" style="margin-left:auto;">
      <span>Zoom:</span>
      <input type="range" id="cfgSceneScale" min="0.7" max="1.3" step="0.05" value="1" style="width:65px;">
    </div>
  </div>
</header>

<main>
  <!-- TAB 1: TIMELINE PHÂN CẢNH -->
  <section id="tabTimeline" class="tab-content active">
    <div class="panel">
      <div class="panel-header">
        <div>
          <div class="panel-title">
            <span>Bàn Dựng Phân Cảnh (Production Timeline)</span>
            <span id="statScenes" class="badge done">0 Cảnh</span>
            <span id="statDone" class="badge done" style="display:none;">0 Đã Xong</span>
            <span id="statEstDuration" class="badge chain" style="display:none;">0s</span>
          </div>
          <div class="panel-subtitle">Áp dụng công nghệ Frame Chaining Continuity (I2V), Multi-Slot Frames, Storyboard Crop & Auto-Healing</div>
        </div>
        <div style="display:flex; gap:6px;">
          <button id="btnAddSceneManual" class="accent">➕ Thêm Cảnh Mới</button>
          <button id="btnForceRender" title="Bắt buộc render lại toàn bộ từ đầu">🔄 Render Lại Hết</button>
        </div>
      </div>
      <div id="timelineContainer" style="display:grid; gap:16px;"></div>
    </div>
  </section>

  <!-- TAB 2: KỊCH BẢN & PHÂN RÃ (SCRIPT BREAKDOWN) -->
  <section id="tabScript" class="tab-content">
    <div class="grid-2">
      <div class="panel">
        <div class="panel-header">
          <div class="panel-title">✍️ Nhập Truyện / Ý Tưởng Gốc (Story Input)</div>
          <div class="panel-subtitle">Sliding window 150-200 từ / chunk chuẩn Hollywood</div>
        </div>
        <textarea id="rawStoryInput" rows="16" placeholder="Dán văn bản truyện chữ, tiểu thuyết, hoặc ý tưởng thô vào đây...
Ví dụ:
'Minh bước vào quán cafe nhìn thấy Lan đang ngồi chờ bên cửa sổ. Ánh mắt hai người chạm nhau...'"></textarea>
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
          <div style="display:flex; gap:12px; align-items:center;">
            <label style="font-size:11.5px; color:var(--muted)">
              Chunk size: 
              <input type="number" id="wordsPerChunk" value="150" style="width:60px; margin-left:4px;" min="50" max="400"> từ
            </label>
            <label style="font-size:11.5px; color:var(--muted)">
              Đa luồng: 
              <input type="number" id="cfgStoryConcurrency" value="1" style="width:45px; margin-left:4px;" min="1" max="5">
            </label>
            <label style="font-size:11.5px; color:var(--muted)">
              Delay: 
              <input type="number" id="cfgRenderDelay" value="2" style="width:45px; margin-left:4px;" min="0" max="10">s
            </label>
          </div>
          <div style="display:flex; gap:6px;">
            <button id="btnResetScriptOnly" class="danger">🗑️ Reset Kịch Bản</button>
            <button id="btnRunBreakdown" class="primary">⚡ Phân Rã Kịch Bản Chuẩn 10s</button>
          </div>
        </div>
      </div>

      <div class="panel">
        <div class="panel-header">
          <div class="panel-title">🎨 Hollywood DOP / Live-Action System Prompt</div>
          <div class="panel-subtitle">Chỉ thị điện ảnh điều khiển chất lượng ánh sáng, da, nếp vải & diễn xuất</div>
        </div>
        <textarea id="sysPromptInput" rows="16" placeholder="Hollywood DOP Prompt..."></textarea>
        <div style="display:flex; justify-content:flex-end;">
          <button id="btnSaveSysPrompt" class="accent">💾 Lưu System Prompt</button>
        </div>
      </div>
    </div>
  </section>

  <!-- TAB 3: THƯ VIỆN DNA (360° DNA BIBLE) -->
  <section id="tabDna" class="tab-content">
    <div class="panel">
      <div class="panel-header">
        <div>
          <div class="panel-title">🧬 Bản Đồ Thị Giác 360° (Visual Identity Bible)</div>
          <div class="panel-subtitle">Hồ sơ DNA Diễn viên (Chroma Key 5 góc, Giọng đọc) & Bối cảnh kiến trúc đa chiều</div>
        </div>
        <div style="display:flex; gap:8px;">
          <button id="btnScanDna" class="accent">🔍 Quét Thực Thể Tự Động (Sliding Window 3 Cảnh)</button>
          <button id="btnAddActor">➕ Thêm Diễn Viên</button>
          <button id="btnAddLocation">🏛️ Thêm Bối Cảnh</button>
        </div>
      </div>

      <div>
        <h3 style="font-size:13px; font-weight:800; color:var(--primary); text-transform:uppercase; margin:0 0 10px 0;">👤 Danh Sách Diễn Viên (Characters)</h3>
        <div id="dnaContainer" class="grid-3"></div>
      </div>

      <div style="border-top:1px solid rgba(255,255,255,0.06); padding-top:16px;">
        <h3 style="font-size:13px; font-weight:800; color:var(--accent); text-transform:uppercase; margin:0 0 10px 0;">🏛️ Danh Sách Bối Cảnh (Locations)</h3>
        <div id="locationContainer" class="grid-3"></div>
      </div>
    </div>
  </section>

  <!-- TAB 4: STORYBOARD GRID CUTTER (WASM / NATIVE FFmpeg CROP) -->
  <section id="tabStoryboard" class="tab-content">
    <div class="panel">
      <div class="panel-header">
        <div>
          <div class="panel-title">🖼️ Storyboard Multi-Crop Engine</div>
          <div class="panel-subtitle">Cắt ảnh lưới Storyboard 2x2 hoặc 3x3 thành các Shot phân đoạn riêng biệt</div>
        </div>
      </div>
      <div class="grid-2">
        <div style="display:flex; flex-direction:column; gap:12px;">
          <div>
            <label style="font-size:12px; color:var(--muted); display:block; margin-bottom:4px;">Chế độ Lưới (Grid Mode)</label>
            <select id="gridModeSelect" style="width:100%;">
              <option value="2x2">Lưới 2x2 (4 Shots)</option>
              <option value="3x3">Lưới 3x3 (9 Shots)</option>
            </select>
          </div>
          <div>
            <label style="font-size:12px; color:var(--muted); display:block; margin-bottom:4px;">Prompt Sinh Storyboard Sketch</label>
            <textarea id="storyboardPromptInput" rows="5">Professional cinematic storyboard sketch, detailed pencil lines, clear composition, visual guide for the scene action.</textarea>
          </div>
          <div style="display:flex; gap:8px;">
            <button id="btnUploadGlobalStoryboard" class="accent">📤 Tải Ảnh Storyboard Lên</button>
            <button id="btnSliceGlobalGrid" class="primary">✂️ Cắt Grid Thành Shots</button>
          </div>
        </div>
        <div style="background:#090b10; border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:16px; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; min-height:280px; position:relative;">
          <canvas id="gridCanvas" style="max-width:100%; max-height:260px; border-radius:6px; background:#000; display:none;"></canvas>
          <div id="gridPlaceholder">
            <div style="font-size:36px; margin-bottom:8px;">📐</div>
            <div style="font-size:13px; font-weight:700; color:#fff;">Xem Trước Lưới Storyboard</div>
            <div style="font-size:11.5px; color:var(--muted); max-width:300px; margin-top:4px;">Tải ảnh hoặc chọn cảnh để xem trước đường cắt phân khung tự động qua FFmpeg.</div>
          </div>
        </div>
      </div>
      <div id="globalShotsContainer" style="display:none; border-top:1px solid rgba(255,255,255,0.06); padding-top:16px;">
        <h4 style="font-size:12px; font-weight:800; color:#fff; margin:0 0 10px 0;">🎯 CÁC SHOT ĐÃ CẮT:</h4>
        <div id="globalShotsList" style="display:flex; gap:10px; overflow-x:auto; padding-bottom:8px;"></div>
      </div>
    </div>
  </section>

  <!-- TAB 5: AUTO-LOOP ENGINE -->
  <section id="tabAutoLoop" class="tab-content">
    <div class="panel">
      <div class="panel-header">
        <div>
          <div class="panel-title">🔄 Vòng Lặp Phim Vô Tận (Auto-Loop Engine)</div>
          <div class="panel-subtitle">Tự động viết lại kịch bản các cảnh sang phiên bản khác (Takes) và render liên tục</div>
        </div>
      </div>
      <div class="grid-2">
        <div style="display:flex; flex-direction:column; gap:14px;">
          <div style="display:flex; align-items:center; justify-content:space-between; background:rgba(255,255,255,0.02); padding:12px; border-radius:8px; border:1px solid var(--border-subtle);">
            <div>
              <div style="font-weight:700; font-size:13px;">Kích hoạt Vòng Lặp Kịch Bản (Auto-Loop)</div>
              <div style="font-size:11px; color:var(--muted);">Tự động viết lại kịch bản -> Render -> Ghép master theo chu kỳ</div>
            </div>
            <input type="checkbox" id="cfgAutoLoopActive" style="width:18px; height:18px;">
          </div>

          <div style="display:flex; gap:12px;">
            <label style="flex:1; font-size:11.5px; color:var(--muted);">
              Số lần lặp (Loop Limit):
              <input type="number" id="cfgAutoLoopLimit" value="3" min="1" max="50" style="width:100%; margin-top:4px;">
            </label>
            <label style="flex:1; font-size:11.5px; color:var(--muted);">
              Lặp toàn trình (Loop All):
              <input type="checkbox" id="cfgLoopAllActive" style="margin-top:8px; width:18px; height:18px; display:block;">
            </label>
          </div>

          <div>
            <label style="font-size:12px; color:var(--muted); display:block; margin-bottom:4px;">AI Rewrite Prompt (Chỉ thị viết lại cảnh):</label>
            <textarea id="cfgLoopRewritePrompt" rows="6">Dựa trên kịch bản gốc của cảnh này, hãy viết lại một phiên bản mới với diễn biến khác đi một chút, tăng tính kịch tính hoặc thay đổi góc nhìn nhưng vẫn giữ nguyên nhân vật và bối cảnh. Đảm bảo ngôn ngữ điện ảnh chuyên nghiệp.</textarea>
          </div>

          <button id="btnStartAutoLoop" class="gradient-all">🚀 Khởi Động Vòng Lặp Kịch Bản</button>
        </div>

        <div style="background:rgba(0,0,0,0.3); border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:20px; display:flex; flex-direction:column; gap:12px;">
          <div style="font-weight:800; font-size:13px; color:#fff;">📊 TRẠNG THÁI VÒNG LẶP</div>
          <div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:8px;">
            <span style="color:var(--muted);">Vòng hiện tại:</span>
            <span id="loopCurrentProgress" style="font-weight:700; color:#fff;">0 / 3</span>
          </div>
          <div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:8px;">
            <span style="color:var(--muted);">Trạng thái:</span>
            <span id="loopStatusDetail" style="font-weight:700; color:var(--ok);">Sẵn sàng</span>
          </div>
          <div style="font-size:11px; color:var(--muted); line-height:1.6; margin-top:auto;">
            💡 <strong>Cơ chế:</strong> Sau khi xuất bản Master vòng 1, hệ thống sẽ kích hoạt Gemini áp dụng AI Rewrite Prompt viết lại các phân cảnh thành Take mới rồi tự động render và xuất tiếp bản Master tiếp theo.
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- TAB 6: PHIM MASTER -->
  <section id="tabMaster" class="tab-content">
    <div class="panel">
      <div class="panel-header">
        <div>
          <div class="panel-title">🏆 Bản Master Hoàn Chỉnh (Cinema Concat)</div>
          <div class="panel-subtitle">Chuẩn hóa stream (30fps, 30000 timescale, yuv420p, libx264, aac stereo) & Lossless GPU Concat</div>
        </div>
        <div style="display:flex; gap:6px;">
          <button id="btnStitchTab" class="success">🎬 Ghép Lại Phim Master</button>
        </div>
      </div>
      <div id="masterContainer">
        <div style="text-align:center; padding:50px 20px; color:var(--muted);">
          <div style="font-size:42px; margin-bottom:12px;">🎬</div>
          <div style="font-size:14px; font-weight:700; color:#fff;">Chưa có bản Master hoàn chỉnh</div>
          <div style="font-size:12px; margin-top:6px;">Hãy render các cảnh và nhấp <strong>[🎬 Ghép Phim]</strong> để xuất bản phim hoàn chỉnh!</div>
        </div>
      </div>
    </div>
  </section>

  <!-- TAB 7: NHẬT KÝ HỆ THỐNG -->
  <section id="tabTerminal" class="tab-content">
    <div class="console">
      <div class="console-top">
        <span style="display:flex; align-items:center; gap:8px;">
          <span>📟 Console Log Thời Gian Thực (SSE)</span>
          <span id="logCounter" class="badge">0 events</span>
        </span>
        <div style="display:flex; gap:6px;">
          <button id="btnFilterAll" class="btn-mini active">Tất Cả</button>
          <button id="btnFilterDone" class="btn-mini">Done</button>
          <button id="btnFilterFail" class="btn-mini">Fail</button>
          <button id="btnFilterHeal" class="btn-mini">Heal</button>
          <button id="btnClearLog" class="btn-mini">Xóa Log</button>
        </div>
      </div>
      <pre id="logTerminal"></pre>
    </div>
  </section>
</main>

<!-- HIDDEN FILE PICKERS -->
<input type="file" id="directFramePicker" accept="image/*" style="display:none;">
<input type="file" id="storyboardGlobalPicker" accept="image/*" style="display:none;">

<!-- MODAL: PHIM MỚI -->
<div id="modalNewProject" class="modal-overlay">
  <div class="modal">
    <h3 style="margin:0; font-size:16px; color:#fff;">➕ Tạo Dự Án Phim Mới</h3>
    <div>
      <label style="font-size:11.5px; color:var(--muted); display:block; margin-bottom:4px;">Tên bộ phim</label>
      <input type="text" id="newTitle" placeholder="Ví dụ: Mùa Thu Seoul..." style="width:100%;">
    </div>
    <div class="grid-2">
      <div>
        <label style="font-size:11.5px; color:var(--muted); display:block; margin-bottom:4px;">Tỉ lệ khung hình</label>
        <select id="newRatio" style="width:100%;">
          <option value="16:9">16:9 (Cinema)</option>
          <option value="9:16">9:16 (Shorts/TikTok)</option>
          <option value="1:1">1:1 (Square)</option>
          <option value="4:3">4:3 (Vintage)</option>
        </select>
      </div>
      <div>
        <label style="font-size:11.5px; color:var(--muted); display:block; margin-bottom:4px;">Thời lượng cảnh</label>
        <select id="newDuration" style="width:100%;">
          <option value="5">5 giây</option>
          <option value="8" selected>8 giây</option>
          <option value="10">10 giây</option>
        </select>
      </div>
    </div>
    <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:12px;">
      <button id="btnCancelNewProject">Hủy</button>
      <button id="btnConfirmNewProject" class="primary">Tạo Dự Án</button>
    </div>
  </div>
</div>

<!-- MODAL: SỬA/THÊM DIỄN VIÊN -->
<div id="modalDnaEdit" class="modal-overlay">
  <div class="modal">
    <h3 style="margin:0; font-size:16px; color:#fff;">👤 Hồ Sơ DNA Diễn Viên</h3>
    <div>
      <label style="font-size:11.5px; color:var(--muted); display:block; margin-bottom:4px;">Tên nhân vật (Unique ID)</label>
      <input type="text" id="dnaName" placeholder="Minwoo, Seoyeon..." style="width:100%;">
    </div>
    <div>
      <label style="font-size:11.5px; color:var(--muted); display:block; margin-bottom:4px;">Tên gọi khác (Aliases - Phân cách bằng dấu phẩy)</label>
      <input type="text" id="dnaAliases" placeholder="Hắn, Cậu bé, Anh ấy..." style="width:100%;">
    </div>
    <div>
      <label style="font-size:11.5px; color:var(--muted); display:block; margin-bottom:4px;">Giọng Đọc (Voice Casting)</label>
      <select id="dnaVoiceSelect" style="width:100%;">
        <option value="">-- Mặc định --</option>
        <option value="Puck">Puck (Nam ấm áp)</option>
        <option value="Charon">Charon (Nam trầm điện ảnh)</option>
        <option value="Kore">Kore (Nữ trong trẻo)</option>
        <option value="Fenrir">Fenrir (Nam mạnh mẽ)</option>
        <option value="Aoede">Aoede (Nữ truyền cảm)</option>
        <option value="vi-VN-Standard-A">Tiếng Việt Nữ Truyền Cảm</option>
        <option value="vi-VN-Standard-B">Tiếng Việt Nam Trầm Ấm</option>
      </select>
    </div>
    <div>
      <label style="font-size:11.5px; color:var(--muted); display:block; margin-bottom:4px;">Mô tả ngoại hình cố định (Traits)</label>
      <textarea id="dnaTraits" rows="4" placeholder="Khuôn mặt, kiểu tóc, vóc dáng, trang phục đặc trưng..."></textarea>
    </div>
    <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:12px;">
      <button id="btnCancelDna">Hủy</button>
      <button id="btnSaveDna" class="pink">Lưu Diễn Viên</button>
    </div>
  </div>
</div>

<!-- MODAL: SỬA/THÊM BỐI CẢNH -->
<div id="modalLocEdit" class="modal-overlay">
  <div class="modal">
    <h3 style="margin:0; font-size:16px; color:#fff;">🏛️ Hồ Sơ Bối Cảnh Kiến Trúc</h3>
    <div>
      <label style="font-size:11.5px; color:var(--muted); display:block; margin-bottom:4px;">Tên bối cảnh (Location ID)</label>
      <input type="text" id="locName" placeholder="Quán Cafe Mùa Thu, Phòng Họp Tầng 18..." style="width:100%;">
    </div>
    <div>
      <label style="font-size:11.5px; color:var(--muted); display:block; margin-bottom:4px;">Tên gọi khác (Aliases)</label>
      <input type="text" id="locAliases" placeholder="Nơi hẹn hò, văn phòng..." style="width:100%;">
    </div>
    <div>
      <label style="font-size:11.5px; color:var(--muted); display:block; margin-bottom:4px;">Mô tả không gian & kiến trúc (Traits)</label>
      <textarea id="locTraits" rows="4" placeholder="Kiến trúc hiện đại, ánh sáng cửa sổ góc rộng, bàn ghế gỗ, không có nhân vật đứng trong ảnh..."></textarea>
    </div>
    <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:12px;">
      <button id="btnCancelLoc">Hủy</button>
      <button id="btnSaveLoc" class="accent">Lưu Bối Cảnh</button>
    </div>
  </div>
</div>

<!-- MODAL: THÊM CẢNH THỦ CÔNG -->
<div id="modalAddScene" class="modal-overlay">
  <div class="modal">
    <h3 style="margin:0; font-size:16px; color:#fff;">➕ Thêm Phân Cảnh Mới</h3>
    <div>
      <label style="font-size:11.5px; color:var(--muted); display:block; margin-bottom:4px;">Tiêu đề cảnh</label>
      <input type="text" id="newSceneTitle" placeholder="Scene 1: Cuộc Gặp Bất Ngờ..." style="width:100%;">
    </div>
    <div>
      <label style="font-size:11.5px; color:var(--muted); display:block; margin-bottom:4px;">Nội dung kịch bản cảnh (Prompt)</label>
      <textarea id="newScenePrompt" rows="6" placeholder="SCENE: ...
Nhân vật: ...
Bối cảnh: ...
Shot 1: ..."></textarea>
    </div>
    <div style="display:flex; align-items:center; gap:8px;">
      <label style="font-size:12px; color:var(--muted);"><input type="checkbox" id="newSceneCut"> Cắt cứng ([CUT] - không nối frame cuối)</label>
    </div>
    <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:12px;">
      <button id="btnCancelAddScene">Hủy</button>
      <button id="btnConfirmAddScene" class="primary">Thêm Cảnh</button>
    </div>
  </div>
</div>

<!-- MODAL: CẤU HÌNH NÂNG CAO (CONFIG) -->
<div id="modalAdvanced" class="modal-overlay">
  <div class="modal" style="max-width:720px;">
    <h3 style="margin:0; font-size:16px; color:#fff;">⚙️ Cấu Hình Toàn Trình (Hollywood Specs)</h3>
    <div style="display:flex; flex-direction:column; gap:12px;">
      <div>
        <label style="font-size:11px; font-weight:700; color:var(--primary); display:block; margin-bottom:3px;">Prompt Chữa Lành Kịch Bản (Auto-Heal Rule):</label>
        <textarea id="advHealPrompt" rows="2"></textarea>
      </div>
      <div>
        <label style="font-size:11px; font-weight:700; color:var(--accent); display:block; margin-bottom:3px;">Prompt Định Hướng Nhân Vật 360° (Character Chroma Key):</label>
        <textarea id="advCharPrompt" rows="3"></textarea>
      </div>
      <div>
        <label style="font-size:11px; font-weight:700; color:var(--pink); display:block; margin-bottom:3px;">Prompt Định Hướng Bối Cảnh (Location Reference):</label>
        <textarea id="advLocPrompt" rows="3"></textarea>
      </div>
      <div>
        <label style="font-size:11px; font-weight:700; color:var(--ok); display:block; margin-bottom:3px;">Prompt Storyboard Pencil Sketch:</label>
        <textarea id="advSbPrompt" rows="2"></textarea>
      </div>
      <div class="grid-2">
        <div>
          <label style="font-size:11px; color:var(--muted); display:block;">Render Timeout (giây):</label>
          <input type="number" id="advRenderTimeout" value="300" style="width:100%;">
        </div>
        <div>
          <label style="font-size:11px; color:var(--muted); display:block;">Retry Delay (giây):</label>
          <input type="number" id="advRetryDelay" value="99" style="width:100%;">
        </div>
      </div>
      <div class="grid-2">
        <div>
          <label style="font-size:11px; color:var(--muted); display:block;">Số lượt sửa Auto-Heal tối đa:</label>
          <input type="number" id="advMaxAutoRetries" value="5" min="1" max="10" style="width:100%;">
        </div>
        <div>
          <label style="font-size:11px; color:var(--muted); display:block;">Độ trễ DNA Scan (giây):</label>
          <input type="number" id="advDnaDelay" value="1.2" step="0.1" style="width:100%;">
        </div>
      </div>
    </div>
    <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:16px;">
      <button id="btnCloseAdvanced">Đóng</button>
      <button id="btnSaveAdvanced" class="primary">Lưu Cấu Hình</button>
    </div>
  </div>
</div>

<script>
const $ = (id) => document.getElementById(id);
const el = (tag, props = {}, ...children) => {
  const elem = document.createElement(tag);
  Object.assign(elem, props);
  for (const c of children) {
    if (typeof c === "string") elem.appendChild(document.createTextNode(c));
    else if (c instanceof Node) elem.appendChild(c);
  }
  return elem;
};

let activeSlug = "";
let currentFilm = null;
let currentState = null;
let activeUploadTarget = null;

// Tab Switching
document.querySelectorAll(".nav-tab").forEach(tab => {
  tab.onclick = () => {
    document.querySelectorAll(".nav-tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
    tab.classList.add("active");
    const target = $(tab.dataset.tab);
    if (target) target.classList.add("active");
  };
});

// Helper API
async function api(path, method = "GET", body = null) {
  const opts = { method, headers: {} };
  if (body) {
    opts.headers["content-type"] = "application/json";
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(path, opts);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

// Load Projects
async function loadProjects() {
  const projects = await api("/api/projects");
  const sel = $("projectSelect");
  sel.replaceChildren(...projects.map(p => {
    const opt = document.createElement("option");
    opt.value = p.slug;
    opt.textContent = p.title + " (" + p.done + "/" + p.scenes + ")";
    if (p.slug === activeSlug) opt.selected = true;
    return opt;
  }));
  if (projects.length > 0) {
    if (!activeSlug || !projects.some(p => p.slug === activeSlug)) {
      activeSlug = projects[0].slug;
      sel.value = activeSlug;
    }
    await loadActiveProject();
  }
}

// Load Active Project
async function loadActiveProject() {
  if (!activeSlug) return;
  const data = await api("/api/projects/" + activeSlug);
  currentFilm = data.film;
  currentState = data.state || { scenes: {} };

  // Sync inputs
  $("cfgModel").value = currentFilm.model || "Veo 3.1 - Quality";
  $("cfgImageModel").value = currentFilm.imageModel || "🍌 Nano Banana Pro";
  $("cfgRatio").value = currentFilm.ratio || "16:9";
  $("cfgDuration").value = String(currentFilm.duration || 8);
  $("cfgResolution").value = currentFilm.resolution || "720p";
  $("cfgVideoGenMode").value = currentFilm.videoGenMode || "r2v";
  $("cfgStartFrameSource").value = currentFilm.startFrameSource || "continuity";

  // Toggles
  setToggle("togContinuity", currentFilm.continuity !== false);
  setToggle("togAutoHeal", currentFilm.isAutoHealEnabled !== false);
  setToggle("togCelebCheck", !!currentFilm.isCelebrityCheckEnabled);
  setToggle("togStrictActor", !!currentFilm.strictActorMatch);
  setToggle("togStrictLoc", !!currentFilm.strictLocationMatch);
  setToggle("togSkipKeyframe", !!currentFilm.skipImageGen);
  setToggle("togRenderFromShot", !!currentFilm.renderFromShotOnly);
  setToggle("togAutoMerge", !!currentFilm.autoMerge);

  $("cfgSceneScale").value = currentFilm.sceneScale || 1;
  $("sysPromptInput").value = currentFilm.style || "";

  renderTimeline(currentFilm, currentState);
  renderDna(currentFilm);
  renderLocations(currentFilm);
  renderMaster(currentState);
}

function setToggle(id, active) {
  const elem = $(id);
  if (!elem) return;
  if (active) elem.classList.add("active");
  else elem.classList.remove("active");
}

function isToggleActive(id) {
  return $(id).classList.contains("active");
}

// Quick sync config
async function syncConfig(patch = {}) {
  if (!activeSlug) return;
  const merged = {
    model: $("cfgModel").value,
    imageModel: $("cfgImageModel").value,
    ratio: $("cfgRatio").value,
    duration: Number($("cfgDuration").value),
    resolution: $("cfgResolution").value,
    videoGenMode: $("cfgVideoGenMode").value,
    startFrameSource: $("cfgStartFrameSource").value,
    continuity: isToggleActive("togContinuity"),
    isAutoHealEnabled: isToggleActive("togAutoHeal"),
    isCelebrityCheckEnabled: isToggleActive("togCelebCheck"),
    strictActorMatch: isToggleActive("togStrictActor"),
    strictLocationMatch: isToggleActive("togStrictLoc"),
    skipImageGen: isToggleActive("togSkipKeyframe"),
    renderFromShotOnly: isToggleActive("togRenderFromShot"),
    autoMerge: isToggleActive("togAutoMerge"),
    sceneScale: Number($("cfgSceneScale").value),
    ...patch
  };
  await api("/api/projects/" + activeSlug + "/config", "POST", merged);
}

// Bind config events
["cfgModel", "cfgImageModel", "cfgRatio", "cfgDuration", "cfgResolution", "cfgVideoGenMode", "cfgStartFrameSource"].forEach(id => {
  $(id).onchange = () => syncConfig();
});
["togContinuity", "togAutoHeal", "togCelebCheck", "togStrictActor", "togStrictLoc", "togSkipKeyframe", "togRenderFromShot", "togAutoMerge"].forEach(id => {
  $(id).onclick = () => {
    $(id).classList.toggle("active");
    syncConfig();
  };
});
$("cfgSceneScale").oninput = (e) => {
  const scale = Number(e.target.value);
  document.querySelectorAll(".scene-card").forEach(c => {
    c.style.transform = "scale(" + scale + ")";
    c.style.transformOrigin = "top left";
  });
  syncConfig({ sceneScale: scale });
};

// Render Timeline
function renderTimeline(film, state) {
  const container = $("timelineContainer");
  const scenes = film.scenes || [];
  const stateScenes = state.scenes || {};

  let doneCount = 0;
  scenes.forEach(sc => {
    if (stateScenes[sc.id]?.status === "done") doneCount++;
  });
  $("statScenes").textContent = scenes.length + " Cảnh";
  if (scenes.length > 0) {
    $("statDone").style.display = "inline-block";
    $("statDone").textContent = doneCount + "/" + scenes.length + " Đã Xong";
    $("statEstDuration").style.display = "inline-block";
    $("statEstDuration").textContent = (scenes.length * (film.duration || 8)) + "s Video";
  }

  if (scenes.length === 0) {
    container.replaceChildren(el("div", {
      style: "text-align:center; padding:50px 20px; color:var(--muted);",
      textContent: "Chưa có phân cảnh nào. Nhấp [Kịch Bản & Phân Rã] hoặc [➕ Thêm Cảnh Mới] để bắt đầu!"
    }));
    return;
  }

  container.replaceChildren(...scenes.map((scene, idx) => {
    const s = stateScenes[scene.id] || { status: "pending" };
    const card = el("div", { className: "scene-card " + s.status });
    
    // Scale support
    const scale = film.sceneScale || 1;
    if (scale !== 1) {
      card.style.transform = "scale(" + scale + ")";
      card.style.transformOrigin = "top left";
    }

    // Left Column
    const mediaCol = el("div", { className: "scene-media-col" });
    const videoBox = el("div", { className: "scene-video-box" });
    if (s.video) {
      const vid = el("video", {
        src: "/media/" + activeSlug + "/" + s.video,
        controls: true,
        autoplay: false,
        preload: "metadata"
      });
      videoBox.appendChild(vid);
    } else {
      videoBox.appendChild(el("span", {
        style: "color:var(--muted); font-size:11.5px;",
        textContent: s.status === "running" ? "⏳ Đang Render..." : "Chưa có Video"
      }));
    }

    // 4-Slot Ribbon
    const ribbon = el("div", { className: "frame-ribbon" });
    const slots = [
      { key: "storyboard", name: "Story", file: scene.storyboardImage },
      { key: "shot", name: "Shot", file: scene.shotImages?.[0] },
      { key: "start", name: "First", file: scene.startFrameImage || (idx > 0 && film.continuity ? stateScenes[scenes[idx-1].id]?.lastFrame : null) },
      { key: "last", name: "Last", file: s.lastFrame || scene.lastFrameImage }
    ];

    slots.forEach(slot => {
      const slotBox = el("div", { className: "ribbon-slot", title: "Nhấp để nạp ảnh " + slot.name });
      if (slot.file) {
        slotBox.appendChild(el("img", { src: "/media/" + activeSlug + "/" + slot.file }));
      } else {
        slotBox.appendChild(el("span", { style: "opacity:0.35;", textContent: "+" }));
      }
      slotBox.appendChild(el("span", { className: "ribbon-tag", textContent: slot.name }));
      slotBox.onclick = () => triggerFrameUpload(scene.id, slot.key);
      ribbon.appendChild(slotBox);
    });

    mediaCol.appendChild(videoBox);
    mediaCol.appendChild(ribbon);

    // Right Column
    const infoCol = el("div", { className: "scene-info-col" });
    const header = el("div", { className: "scene-header" });
    const titleRow = el("div", { style: "display:flex; align-items:center; gap:8px;" },
      el("strong", { style: "font-size:14px; color:#fff;", textContent: scene.title || ("Scene " + (idx + 1)) }),
      el("span", { className: "badge " + s.status, textContent: s.status })
    );

    const tagRow = el("div", { style: "display:flex; gap:6px; align-items:center;" });
    if (scene.cut) tagRow.appendChild(el("span", { className: "badge cut", textContent: "✂️ CUT" }));
    else if (film.continuity) tagRow.appendChild(el("span", { className: "badge chain", textContent: "🔗 NỐI" }));
    if (scene.connectShot) tagRow.appendChild(el("span", { className: "badge chain", textContent: "🔗 SHOT" }));
    if (scene.isRewritten) tagRow.appendChild(el("span", { className: "badge healing", textContent: "🩹 HEALED" }));

    header.appendChild(titleRow);
    header.appendChild(tagRow);

    // Editable Prompt
    const promptBox = el("textarea", {
      className: "scene-prompt-box",
      value: scene.prompt
    });
    promptBox.onchange = async () => {
      try {
        await api("/api/projects/" + activeSlug + "/scenes/" + scene.id, "POST", { prompt: promptBox.value });
      } catch (err) { alert("Lỗi lưu prompt: " + err.message); }
    };

    // Actions
    const actions = el("div", { className: "scene-actions" });
    const btnRenderThis = el("button", { className: "btn-mini primary", textContent: "▶️ Render" });
    btnRenderThis.onclick = async () => {
      try {
        await api("/api/projects/" + activeSlug + "/render", "POST");
        alert("Đã khởi động render cảnh " + scene.id);
      } catch (err) { alert(err.message); }
    };

    const btnCutToggle = el("button", { className: "btn-mini", textContent: scene.cut ? "🔗 Bật Nối Cảnh" : "✂️ Cắt Cứng [CUT]" });
    btnCutToggle.onclick = async () => {
      try {
        await api("/api/projects/" + activeSlug + "/scenes/" + scene.id, "POST", { cut: !scene.cut });
        await loadActiveProject();
      } catch (err) { alert(err.message); }
    };

    const btnSliceGrid = el("button", { className: "btn-mini", textContent: "📐 Cắt Grid" });
    btnSliceGrid.onclick = async () => {
      try {
        const res = await api("/api/projects/" + activeSlug + "/scenes/" + scene.id + "/slice-grid", "POST", { rows: 2, cols: 2 });
        alert("Đã cắt Storyboard thành " + res.count + " shots!");
        await loadActiveProject();
      } catch (err) { alert("Lỗi cắt grid: " + err.message); }
    };

    const btnHeal = el("button", { className: "btn-mini purple", textContent: "🩹 Auto-Heal" });
    btnHeal.onclick = async () => {
      try {
        btnHeal.disabled = true;
        btnHeal.textContent = "Đang chữa lành...";
        const res = await api("/api/projects/" + activeSlug + "/scenes/" + scene.id + "/heal", "POST", {
          reason: "Kiểm duyệt an toàn từ khóa nhạy cảm"
        });
        promptBox.value = res.scene.prompt;
        alert("Đã thay thế các từ khóa nhạy cảm bằng từ đồng nghĩa điện ảnh thành công!");
        await loadActiveProject();
      } catch (err) { alert("Lỗi heal: " + err.message); }
      finally {
        btnHeal.disabled = false;
        btnHeal.textContent = "🩹 Auto-Heal";
      }
    };

    const btnTake = el("button", { className: "btn-mini pink", textContent: "🔄 Viết Take Mới" });
    btnTake.onclick = async () => {
      try {
        btnTake.disabled = true;
        const res = await api("/api/projects/" + activeSlug + "/scenes/" + scene.id + "/loop-rewrite", "POST");
        promptBox.value = res.scene.prompt;
        alert("Đã viết lại phiên bản (Take) kịch tính mới cho cảnh này!");
        await loadActiveProject();
      } catch (err) { alert(err.message); }
      finally { btnTake.disabled = false; }
    };

    const btnDelete = el("button", { className: "btn-mini danger", textContent: "🗑️ Xóa" });
    btnDelete.onclick = async () => {
      if (!confirm("Bạn có chắc chắn muốn xóa cảnh " + scene.id + "?")) return;
      try {
        await api("/api/projects/" + activeSlug + "/scenes/" + scene.id, "DELETE");
        await loadActiveProject();
      } catch (err) { alert(err.message); }
    };

    actions.appendChild(btnRenderThis);
    actions.appendChild(btnCutToggle);
    actions.appendChild(btnSliceGrid);
    actions.appendChild(btnHeal);
    actions.appendChild(btnTake);
    if (s.video) {
      actions.appendChild(el("a", {
        href: "/media/" + activeSlug + "/" + s.video,
        download: scene.id + ".mp4",
        className: "btn-mini",
        style: "text-decoration:none; color:var(--fg);",
        textContent: "⬇️ MP4"
      }));
    }
    actions.appendChild(btnDelete);

    infoCol.appendChild(header);
    infoCol.appendChild(promptBox);
    if (s.error) {
      infoCol.appendChild(el("div", {
        style: "color:var(--bad); font-size:11.5px; background:var(--bad-glow); padding:6px 10px; border-radius:4px;",
        textContent: "⚠️ " + s.error
      }));
    }
    infoCol.appendChild(actions);

    card.appendChild(mediaCol);
    card.appendChild(infoCol);
    return card;
  }));
}

// Render DNA Characters
function renderDna(film) {
  const container = $("dnaContainer");
  const characters = film.characters || [];
  if (characters.length === 0) {
    container.replaceChildren(el("div", {
      style: "grid-column: 1/-1; text-align:center; padding:20px; color:var(--muted);",
      textContent: "Chưa có hồ sơ Diễn viên nào. Nhấp [Quét Thực Thể Tự Động] hoặc [➕ Thêm Diễn Viên]!"
    }));
    return;
  }

  container.replaceChildren(...characters.map(char => {
    const card = el("div", { className: "dna-card" });
    const header = el("div", { className: "dna-header" },
      el("strong", { style: "font-size:14px; color:#fff;", textContent: "👤 " + char.name }),
      char.voiceName || char.voiceMediaId
        ? el("span", { style: "font-size:10.5px; color:var(--accent); font-weight:700;", textContent: "🎙️ " + (char.voiceName || "Voice Set") })
        : null
    );
    const desc = el("div", { style: "font-size:11.5px; color:var(--muted);", textContent: char.description || "Chưa có mô tả ngoại hình." });
    
    const dnaPrompt = "Phong cách người thật điện ảnh, siêu chân thực. Phông nền xanh chroma key sạch. 5 góc chụp: chính diện toàn thân, 3/4, nghiêng 90 độ, sau lưng, cận cảnh đặc tả. " + char.name + ": " + (char.description || "");
    const code = el("div", { className: "dna-code", textContent: dnaPrompt });

    const btnRow = el("div", { style: "display:flex; gap:6px; flex-wrap:wrap; margin-top:auto;" });
    const btnProbe = el("button", { className: "btn-mini pink", textContent: "🛡️ Dò An Toàn Celebrity" });
    btnProbe.onclick = async () => {
      try {
        const res = await api("/api/projects/" + activeSlug + "/dna/character/" + encodeURIComponent(char.name) + "/probe-safety", "POST");
        alert("✅ " + res.message);
      } catch (err) { alert(err.message); }
    };

    const btnMutate = el("button", { className: "btn-mini", textContent: "🧬 Đột Biến Đối Kháng" });
    btnMutate.onclick = async () => {
      try {
        const res = await api("/api/projects/" + activeSlug + "/dna/character/" + encodeURIComponent(char.name) + "/mutate", "POST");
        alert("Đã cập nhật prompt đột biến đối kháng diện mạo!");
        await loadActiveProject();
      } catch (err) { alert(err.message); }
    };

    const btnDelete = el("button", { className: "btn-mini danger", textContent: "🗑️ Xóa" });
    btnDelete.onclick = async () => {
      if (!confirm("Xóa nhân vật " + char.name + "?")) return;
      try {
        await api("/api/projects/" + activeSlug + "/dna/character/" + encodeURIComponent(char.name), "DELETE");
        await loadActiveProject();
      } catch (err) { alert(err.message); }
    };

    btnRow.appendChild(btnProbe);
    btnRow.appendChild(btnMutate);
    btnRow.appendChild(btnDelete);

    card.appendChild(header);
    card.appendChild(desc);
    card.appendChild(code);
    card.appendChild(btnRow);
    return card;
  }));
}

// Render DNA Locations
function renderLocations(film) {
  const container = $("locationContainer");
  const locations = film.locations || [];
  if (locations.length === 0) {
    container.replaceChildren(el("div", {
      style: "grid-column: 1/-1; text-align:center; padding:20px; color:var(--muted);",
      textContent: "Chưa có hồ sơ Bối cảnh nào. Nhấp [🏛️ Thêm Bối Cảnh] để khai báo không gian quay!"
    }));
    return;
  }

  container.replaceChildren(...locations.map(loc => {
    const card = el("div", { className: "dna-card" });
    const header = el("div", { className: "dna-header" },
      el("strong", { style: "font-size:14px; color:#fff;", textContent: "🏛️ " + loc.name }),
      el("span", { style: "font-size:10.5px; color:var(--ok); font-weight:700;", textContent: "Architectural Sheet" })
    );
    const desc = el("div", { style: "font-size:11.5px; color:var(--muted);", textContent: loc.description || "Chưa có mô tả kiến trúc." });
    
    const locPrompt = "Bối cảnh điện ảnh góc rộng, chiều sâu không gian chân thực, kiến trúc rõ nét, ánh sáng tự nhiên. Không có nhân vật đứng trong ảnh. " + loc.name + ": " + (loc.description || "");
    const code = el("div", { className: "dna-code", textContent: locPrompt });

    const btnRow = el("div", { style: "display:flex; gap:6px; margin-top:auto;" });
    const btnDelete = el("button", { className: "btn-mini danger", textContent: "🗑️ Xóa" });
    btnDelete.onclick = async () => {
      if (!confirm("Xóa bối cảnh " + loc.name + "?")) return;
      try {
        await api("/api/projects/" + activeSlug + "/dna/location/" + encodeURIComponent(loc.name), "DELETE");
        await loadActiveProject();
      } catch (err) { alert(err.message); }
    };
    btnRow.appendChild(btnDelete);

    card.appendChild(header);
    card.appendChild(desc);
    card.appendChild(code);
    card.appendChild(btnRow);
    return card;
  }));
}

// Render Master
function renderMaster(state) {
  const container = $("masterContainer");
  if (state && state.final) {
    container.replaceChildren(
      el("div", { className: "panel", style: "gap:20px;" },
        el("div", { style: "display:flex; justify-content:space-between; align-items:center;" },
          el("h2", { style: "margin:0; font-size:17px; color:#fff;", textContent: "🏆 BẢN MASTER HOÀN CHỈNH (Stream Normalized & Lossless Concat)" }),
          el("a", {
            href: "/media/" + activeSlug + "/" + state.final,
            download: activeSlug + "_master.mp4",
            className: "primary",
            style: "padding:8px 18px; text-decoration:none; border-radius:6px; color:#fff; font-weight:700;",
            textContent: "⬇️ Tải Phim Về Máy"
          })
        ),
        el("video", { src: "/media/" + activeSlug + "/" + state.final, controls: true, autoplay: false, style: "width:100%; max-height:560px; border-radius:8px; background:#000;" })
      )
    );
  }
}

// Direct Frame Upload
function triggerFrameUpload(sceneId, slot) {
  activeUploadTarget = { sceneId, slot };
  $("directFramePicker").click();
}

$("directFramePicker").onchange = (e) => {
  const file = e.target.files[0];
  if (!file || !activeUploadTarget) return;
  const reader = new FileReader();
  reader.onload = async () => {
    try {
      await api("/api/projects/" + activeSlug + "/scenes/" + activeUploadTarget.sceneId + "/upload-frame", "POST", {
        slot: activeUploadTarget.slot,
        base64: reader.result
      });
      alert("Đã tải ảnh lên slot " + activeUploadTarget.slot.toUpperCase() + " thành công!");
      await loadActiveProject();
    } catch (err) { alert("Lỗi tải ảnh: " + err.message); }
  };
  reader.readAsDataURL(file);
};

// 1-Click All-in-One Automation Runner
$("btnAutoRun").onclick = async () => {
  const story = $("rawStoryInput").value.trim();
  if (!confirm("Bắt đầu quy trình 1-Click Full Automation (Story ➔ DNA ➔ Render ➔ Master)?")) return;
  try {
    $("btnAutoRun").disabled = true;
    $("btnAutoRun").textContent = "🚀 Đang Chạy Full Auto...";
    await api("/api/projects/" + activeSlug + "/auto-run", "POST", {
      storyText: story || undefined,
      wordsPerChunk: $("wordsPerChunk").value
    });
    alert("Quy trình Full Automation đã được khởi động! Theo dõi log trong tab [Nhật Ký].");
    document.querySelector('.nav-tab[data-tab="tabTimeline"]').click();
  } catch (err) { alert("Lỗi: " + err.message); }
  finally {
    $("btnAutoRun").disabled = false;
    $("btnAutoRun").textContent = "🚀 1-Click Full Auto";
  }
};

// Pause / Resume Queue
$("btnPauseResume").onclick = async () => {
  const isCurrentlyPaused = $("btnPauseResume").textContent.includes("Resume");
  const endpoint = isCurrentlyPaused ? "/resume" : "/pause";
  try {
    const res = await api("/api/projects/" + activeSlug + endpoint, "POST");
    $("btnPauseResume").textContent = res.isPaused ? "▶️ Resume" : "⏸️ Pause";
    if (res.isPaused) $("btnPauseResume").classList.add("primary"); else $("btnPauseResume").classList.remove("primary");
  } catch (err) { alert(err.message); }
};

// Emergency Stop
$("btnStopEmergency").onclick = async () => {
  if (!confirm("Dừng khẩn cấp mọi tiến trình render đang chạy?")) return;
  try {
    await api("/api/projects/" + activeSlug + "/stop", "POST");
    alert("Đã dừng khẩn cấp toàn bộ hệ thống!");
    await loadActiveProject();
  } catch (err) { alert(err.message); }
};

// Reset Queue
$("btnResetQueue").onclick = async () => {
  if (!confirm("Làm mới hàng đợi (giữ lại các cảnh đã render thành công)?")) return;
  try {
    await api("/api/projects/" + activeSlug + "/reset-queue", "POST");
    await loadActiveProject();
  } catch (err) { alert(err.message); }
};

// Export & Import Project JSON
$("btnExportJson").onclick = () => {
  window.open("/api/projects/" + activeSlug + "/export", "_blank");
};
$("btnImportJson").onclick = () => $("fileJsonPicker").click();
$("fileJsonPicker").onchange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const parsed = JSON.parse(reader.result);
      const res = await api("/api/projects/import-json", "POST", parsed);
      alert("Đã nhập dự án thành công!");
      activeSlug = res.slug;
      await loadProjects();
    } catch (err) { alert("Lỗi nhập JSON: " + err.message); }
  };
  reader.readAsText(file);
};

// Project controls
$("projectSelect").onchange = (e) => { activeSlug = e.target.value; loadActiveProject(); };
$("btnNewProject").onclick = () => $("modalNewProject").classList.add("open");
$("btnCancelNewProject").onclick = () => $("modalNewProject").classList.remove("open");
$("btnConfirmNewProject").onclick = async () => {
  const title = $("newTitle").value.trim();
  if (!title) return alert("Vui lòng nhập tên phim");
  try {
    const res = await api("/api/projects", "POST", {
      title,
      ratio: $("newRatio").value,
      duration: $("newDuration").value
    });
    $("modalNewProject").classList.remove("open");
    activeSlug = res.slug;
    await loadProjects();
  } catch (err) { alert(err.message); }
};
$("btnDeleteProject").onclick = async () => {
  if (!confirm("Bạn có chắc chắn muốn xóa toàn bộ dự án '" + activeSlug + "'?")) return;
  try {
    await api("/api/projects/" + activeSlug, "DELETE");
    activeSlug = "";
    await loadProjects();
  } catch (err) { alert(err.message); }
};

// Breakdown
$("btnRunBreakdown").onclick = async () => {
  const storyText = $("rawStoryInput").value.trim();
  if (!storyText) return alert("Vui lòng nhập văn bản truyện cần phân rã!");
  try {
    $("btnRunBreakdown").disabled = true;
    $("btnRunBreakdown").textContent = "Đang phân rã kịch bản...";
    await api("/api/projects/" + activeSlug + "/breakdown", "POST", {
      storyText,
      wordsPerChunk: $("wordsPerChunk").value
    });
    await loadActiveProject();
    alert("Phân rã kịch bản thành công! Đã nạp vào Timeline.");
    document.querySelector('.nav-tab[data-tab="tabTimeline"]').click();
  } catch (err) { alert(err.message); }
  finally {
    $("btnRunBreakdown").disabled = false;
    $("btnRunBreakdown").textContent = "⚡ Phân Rã Kịch Bản Chuẩn 10s";
  }
};
$("btnResetScriptOnly").onclick = async () => {
  if (!confirm("Reset toàn bộ kịch bản và phân cảnh của dự án?")) return;
  try {
    await api("/api/projects/" + activeSlug + "/reset-all", "POST");
    await loadActiveProject();
  } catch (err) { alert(err.message); }
};

// DNA Scan
$("btnScanDna").onclick = async () => {
  try {
    $("btnScanDna").disabled = true;
    $("btnScanDna").textContent = "Đang quét DNA...";
    await api("/api/projects/" + activeSlug + "/dna/scan", "POST");
    await loadActiveProject();
    alert("Quét DNA nhân vật và bối cảnh thành công!");
  } catch (err) { alert(err.message); }
  finally {
    $("btnScanDna").disabled = false;
    $("btnScanDna").textContent = "🔍 Quét Thực Thể Tự Động (Sliding Window 3 Cảnh)";
  }
};

// Add Actor
$("btnAddActor").onclick = () => {
  $("dnaName").value = "";
  $("dnaAliases").value = "";
  $("dnaVoiceSelect").value = "";
  $("dnaTraits").value = "";
  $("modalDnaEdit").classList.add("open");
};
$("btnCancelDna").onclick = () => $("modalDnaEdit").classList.remove("open");
$("btnSaveDna").onclick = async () => {
  const name = $("dnaName").value.trim();
  if (!name) return alert("Vui lòng nhập tên nhân vật");
  try {
    await api("/api/projects/" + activeSlug + "/dna/character", "POST", {
      name,
      aliases: $("dnaAliases").value,
      voiceName: $("dnaVoiceSelect").value,
      description: $("dnaTraits").value
    });
    $("modalDnaEdit").classList.remove("open");
    await loadActiveProject();
  } catch (err) { alert(err.message); }
};

// Add Location
$("btnAddLocation").onclick = () => {
  $("locName").value = "";
  $("locAliases").value = "";
  $("locTraits").value = "";
  $("modalLocEdit").classList.add("open");
};
$("btnCancelLoc").onclick = () => $("modalLocEdit").classList.remove("open");
$("btnSaveLoc").onclick = async () => {
  const name = $("locName").value.trim();
  if (!name) return alert("Vui lòng nhập tên bối cảnh");
  try {
    await api("/api/projects/" + activeSlug + "/dna/location", "POST", {
      name,
      aliases: $("locAliases").value,
      description: $("locTraits").value
    });
    $("modalLocEdit").classList.remove("open");
    await loadActiveProject();
  } catch (err) { alert(err.message); }
};

// Add Scene Manual
$("btnAddSceneManual").onclick = () => {
  $("newSceneTitle").value = "";
  $("newScenePrompt").value = "";
  $("newSceneCut").checked = false;
  $("modalAddScene").classList.add("open");
};
$("btnCancelAddScene").onclick = () => $("modalAddScene").classList.remove("open");
$("btnConfirmAddScene").onclick = async () => {
  const prompt = $("newScenePrompt").value.trim();
  if (!prompt) return alert("Vui lòng nhập nội dung cảnh");
  try {
    await api("/api/projects/" + activeSlug + "/scenes", "POST", {
      title: $("newSceneTitle").value.trim() || undefined,
      prompt,
      cut: $("newSceneCut").checked
    });
    $("modalAddScene").classList.remove("open");
    await loadActiveProject();
  } catch (err) { alert(err.message); }
};

// System Prompt
$("btnSaveSysPrompt").onclick = async () => {
  try {
    await api("/api/projects/" + activeSlug + "/config", "POST", { style: $("sysPromptInput").value });
    alert("Đã lưu Hollywood DOP System Prompt!");
  } catch (err) { alert(err.message); }
};

// Advanced Config Modal
$("btnAdvancedModal").onclick = () => {
  $("modalAdvanced").classList.add("open");
};
$("btnCloseAdvanced").onclick = () => $("modalAdvanced").classList.remove("open");
$("btnSaveAdvanced").onclick = async () => {
  try {
    await api("/api/projects/" + activeSlug + "/config", "POST", {
      healInstruction: $("advHealPrompt").value,
      directionalPrompt: $("advCharPrompt").value,
      locationDirectionalPrompt: $("advLocPrompt").value,
      storyboardPrompt: $("advSbPrompt").value,
      renderTimeout: Number($("advRenderTimeout").value),
      retryDelay: Number($("advRetryDelay").value),
      maxAutoRetries: Number($("advMaxAutoRetries").value),
      dnaDelay: Number($("advDnaDelay").value)
    });
    $("modalAdvanced").classList.remove("open");
    alert("Cấu hình nâng cao đã được lưu thành công!");
  } catch (err) { alert(err.message); }
};

// Render & Stitch
$("btnRenderAll").onclick = async () => {
  if (!confirm("Khởi động quy trình Render điện ảnh với I2V Continuity & Auto-Healing?")) return;
  try {
    await api("/api/projects/" + activeSlug + "/render", "POST");
    await loadActiveProject();
  } catch (err) { alert(err.message); }
};
$("btnForceRender").onclick = async () => {
  if (!confirm("Render lại TOÀN BỘ các cảnh?")) return;
  try {
    await api("/api/projects/" + activeSlug + "/render?force=1", "POST");
    await loadActiveProject();
  } catch (err) { alert(err.message); }
};
$("btnStitch").onclick = $("btnStitchTab").onclick = async () => {
  try {
    $("btnStitch").disabled = true;
    $("btnStitch").textContent = "Đang ghép...";
    await api("/api/projects/" + activeSlug + "/stitch?normalize=1", "POST");
    await loadActiveProject();
    document.querySelector('.nav-tab[data-tab="tabMaster"]').click();
  } catch (err) { alert(err.message); }
  finally {
    $("btnStitch").disabled = false;
    $("btnStitch").textContent = "🎬 Ghép Phim";
  }
};

// SSE Terminal with Filtering
const terminal = $("logTerminal");
let logCount = 0;
let currentFilter = "all";

$("btnClearLog").onclick = () => { terminal.replaceChildren(); logCount = 0; $("logCounter").textContent = "0 events"; };

$("btnFilterAll").onclick = () => applyFilter("all", $("btnFilterAll"));
$("btnFilterDone").onclick = () => applyFilter("done", $("btnFilterDone"));
$("btnFilterFail").onclick = () => applyFilter("fail", $("btnFilterFail"));
$("btnFilterHeal").onclick = () => applyFilter("heal", $("btnFilterHeal"));

function applyFilter(filter, btn) {
  currentFilter = filter;
  ["btnFilterAll", "btnFilterDone", "btnFilterFail", "btnFilterHeal"].forEach(id => $(id).classList.remove("active"));
  btn.classList.add("active");
  document.querySelectorAll(".log-line").forEach(line => {
    if (filter === "all") line.style.display = "block";
    else if (filter === "done") line.style.display = line.classList.contains("log-done") ? "block" : "none";
    else if (filter === "fail") line.style.display = line.classList.contains("log-fail") ? "block" : "none";
    else if (filter === "heal") line.style.display = line.classList.contains("log-heal") ? "block" : "none";
  });
}

const evt = new EventSource("/api/logs");
evt.onmessage = (e) => {
  const line = JSON.parse(e.data);
  const div = document.createElement("div");
  div.className = "log-line";
  if (line.includes("done") || line.includes("success") || line.includes("generated")) div.classList.add("log-done");
  else if (line.includes("failed") || line.includes("error")) div.classList.add("log-fail");
  else if (line.includes("healing") || line.includes("Heal") || line.includes("safety")) div.classList.add("log-heal");
  else if (line.includes("rendering") || line.includes("started") || line.includes("Auto")) div.classList.add("log-run");
  div.textContent = line;

  if (currentFilter !== "all") {
    if (currentFilter === "done" && !div.classList.contains("log-done")) div.style.display = "none";
    else if (currentFilter === "fail" && !div.classList.contains("log-fail")) div.style.display = "none";
    else if (currentFilter === "heal" && !div.classList.contains("log-heal")) div.style.display = "none";
  }

  terminal.appendChild(div);
  terminal.scrollTop = terminal.scrollHeight;
// Storyboard Interactive Canvas & Slicing
let currentGlobalSbImg = null;
let currentGlobalSbBase64 = null;

$("btnUploadGlobalStoryboard").onclick = () => $("storyboardGlobalPicker").click();
$("storyboardGlobalPicker").onchange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    currentGlobalSbBase64 = reader.result;
    const img = new Image();
    img.onload = () => {
      currentGlobalSbImg = img;
      renderGridCanvas();
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
};

$("gridModeSelect").onchange = () => {
  if (currentGlobalSbImg) renderGridCanvas();
};

function renderGridCanvas() {
  if (!currentGlobalSbImg) return;
  const canvas = $("gridCanvas");
  const ctx = canvas.getContext("2d");
  canvas.width = currentGlobalSbImg.width || 1280;
  canvas.height = currentGlobalSbImg.height || 720;
  ctx.drawImage(currentGlobalSbImg, 0, 0, canvas.width, canvas.height);

  const mode = $("gridModeSelect").value;
  const rows = mode === "3x3" ? 3 : 2;
  const cols = mode === "3x3" ? 3 : 2;

  const cellW = canvas.width / cols;
  const cellH = canvas.height / rows;

  ctx.strokeStyle = "#ec4899";
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 6]);

  // Vertical lines
  for (let c = 1; c < cols; c++) {
    ctx.beginPath();
    ctx.moveTo(c * cellW, 0);
    ctx.lineTo(c * cellW, canvas.height);
    ctx.stroke();
  }
  // Horizontal lines
  for (let r = 1; r < rows; r++) {
    ctx.beginPath();
    ctx.moveTo(0, r * cellH);
    ctx.lineTo(canvas.width, r * cellH);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // Badges for each shot
  ctx.font = "bold 20px Outfit, sans-serif";
  let shotNum = 1;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * cellW + 12;
      const y = r * cellH + 32;
      ctx.fillStyle = "rgba(0,0,0,0.75)";
      ctx.fillRect(x - 4, y - 22, 90, 28);
      ctx.fillStyle = "#ffffff";
      ctx.fillText("Shot " + shotNum, x, y);
      shotNum++;
    }
  }

  canvas.style.display = "block";
  $("gridPlaceholder").style.display = "none";
}

$("btnSliceGlobalGrid").onclick = async () => {
  const mode = $("gridModeSelect").value;
  const rows = mode === "3x3" ? 3 : 2;
  const cols = mode === "3x3" ? 3 : 2;

  try {
    $("btnSliceGlobalGrid").disabled = true;
    $("btnSliceGlobalGrid").textContent = "Đang cắt...";
    const res = await api("/api/projects/" + activeSlug + "/storyboard/slice", "POST", {
      rows,
      cols,
      base64: currentGlobalSbBase64 || undefined
    });
    alert("Đã cắt Storyboard thành " + res.count + " Shots thành công!");
    
    // Display in gallery
    const list = $("globalShotsList");
    list.replaceChildren(...res.shots.map((path, idx) => {
      const box = el("div", { style: "display:flex; flex-direction:column; gap:4px; align-items:center; min-width:140px;" },
        el("img", { src: "/media/" + activeSlug + "/" + path, style: "width:140px; aspect-ratio:16/9; object-fit:cover; border-radius:4px; border:1px solid var(--border-subtle);" }),
        el("span", { style: "font-size:10.5px; font-weight:700; color:var(--muted);", textContent: "Shot " + (idx + 1) })
      );
      return box;
    }));
    $("globalShotsContainer").style.display = "block";
  } catch (err) { alert("Lỗi cắt Storyboard: " + err.message); }
  finally {
    $("btnSliceGlobalGrid").disabled = false;
    $("btnSliceGlobalGrid").textContent = "✂️ Cắt Grid Thành Shots";
  }
};

// Auto-Loop Engine Runner
let isAutoLoopRunning = false;
$("btnStartAutoLoop").onclick = async () => {
  if (!confirm("Bắt đầu quy trình Auto-Loop: Viết lại kịch bản -> Render tuần tự có Continuity?")) return;
  const limit = Number($("cfgAutoLoopLimit").value) || 3;
  isAutoLoopRunning = true;
  $("btnStartAutoLoop").disabled = true;
  $("loopStatusDetail").textContent = "Đang lặp...";
  $("loopStatusDetail").style.color = "var(--warn)";

  try {
    for (let loop = 0; loop < limit; loop++) {
      if (!isAutoLoopRunning) break;
      $("loopCurrentProgress").textContent = (loop + 1) + " / " + limit;
      
      // Rewrite each scene
      const scenes = currentFilm.scenes || [];
      for (const sc of scenes) {
        await api("/api/projects/" + activeSlug + "/scenes/" + sc.id + "/loop-rewrite", "POST");
      }
      await loadActiveProject();

      // Trigger Render
      await api("/api/projects/" + activeSlug + "/render", "POST");
      // Wait between loops
      await new Promise(r => setTimeout(r, 4000));
    }
    alert("Quy trình Auto-Loop (" + limit + " vòng) đã hoàn tất!");
    $("loopStatusDetail").textContent = "Hoàn tất";
    $("loopStatusDetail").style.color = "var(--ok)";
  } catch (err) { alert("Lỗi Auto-Loop: " + err.message); }
  finally {
    isAutoLoopRunning = false;
    $("btnStartAutoLoop").disabled = false;
  }
};

loadProjects();
</script>
</body>
</html>
`;
