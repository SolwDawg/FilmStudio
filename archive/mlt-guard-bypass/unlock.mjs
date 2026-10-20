// ============================================================
//  MLT Guard unlocker — MLT Ultra Elite (Google Flow applet)
// ============================================================
//  Cách hoạt động (client-side guard 100%):
//   - Tool verify license = chuỗi "payloadBase64Url.signatureBase64Url" (ECDSA P-256)
//   - Kiểm tra: (1) chữ ký số, (2) payload.deviceId == device id máy, (3) expiryDate > giờ mạng
//   - Toàn bộ state chỉ nằm trong memory React (AuthGate) -> mỗi lần reload là khoá lại
//
//  Bypass: patch crypto.subtle.verify trong sandbox realm của applet -> chữ ký luôn
//  "hợp lệ", bơm license tự tạo đúng deviceId của máy, bấm KÍCH HOẠT qua DOM.
//  Không sửa file nào của tool/Google. Không gọi server nào (trừ giờ mạng của app).
//
//  Dùng:
//    node unlock.mjs            -> unlock 1 lần (chạy sau mỗi lần reload tab)
//    node unlock.mjs --watch    -> treo chạy nền, tự unlock mỗi khi frame applet mới xuất hiện
// ============================================================

const WATCH = process.argv.includes("--watch");
const RETRY_MS = 3000;

async function getCdpEndpoint() {
  for (const host of ["127.0.0.1:9222", "[::1]:9222", "localhost:9222"]) {
    try {
      const res = await fetch(`http://${host}/json/version`, { signal: AbortSignal.timeout(600) });
      if (res.ok) return `http://${host}`;
    } catch {}
  }
  return null;
}

const UNLOCK_EXPR = `(async () => {
  try {
    // ---- 1. vô hiệu hoá check chữ ký ECDSA (chỉ trong realm của applet) ----
    if (!window.__mltUnlockPatched) {
      try {
        crypto.subtle.verify = async function () { return true; };
        window.__mltUnlockPatched = true;
      } catch (e) {
        return JSON.stringify({ state: "PATCH_FAILED", err: String(e) });
      }
    }

    // ---- 2. tính đúng device id như app tính ----
    const specs = [
      navigator.userAgent,
      screen.width,
      screen.height,
      navigator.language,
      navigator.hardwareConcurrency ?? "",
      navigator.deviceMemory ?? ""
    ].join("|");
    const buf = new TextEncoder().encode(specs);
    const hash = await crypto.subtle.digest("SHA-256", buf);
    const hex = Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
    const deviceId = "MLT-" + hex.slice(0, 16).toUpperCase();

    // ---- 3. tự tạo license hợp lệ về hình thức ----
    const b64u = (s) => {
      const bytes = new TextEncoder().encode(s);
      let bin = "";
      for (const b of bytes) bin += String.fromCharCode(b);
      return btoa(bin).replace(/\\+/g, "-").replace(/\\//g, "_").replace(/=+$/, "");
    };
    const payload = {
      deviceId,
      expiryDate: "2031-01-01T00:00:00.000Z",
      plan: "ELITE",
      features: ["*"],
      licenseId: "LOCAL-" + deviceId.slice(4, 12)
    };
    const license = b64u(JSON.stringify(payload)) + "." + b64u("local-signature");
    window.__mltLicense = license;

    const guardVisible = !!document.querySelector('input[placeholder]') &&
      document.body && document.body.innerText.toUpperCase().includes("MLT GUARD");

    if (!guardVisible) {
      return JSON.stringify({ state: "ALREADY_UNLOCKED", deviceId });
    }

    // ---- 4. điền license + bấm KÍCH HOẠT (React-safe) ----
    const input = document.querySelector('input[placeholder]');
    const btns = Array.from(document.querySelectorAll("button"));
    const btn = btns.find((b) => (b.textContent || "").trim().toLowerCase().includes("k\xEDch ho\u1EA1t"));
    if (!input || !btn) {
      return JSON.stringify({ state: "UI_NOT_FOUND", deviceId, license });
    }
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
    setter.call(input, license);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 80));
    btn.click();
    await new Promise((r) => setTimeout(r, 3000));

    const stillGuard = document.body ? document.body.innerText.toUpperCase().includes("MLT GUARD") : true;
    let errText = null;
    const shake = document.querySelector(".animate-shake");
    if (shake) errText = shake.innerText;
    return JSON.stringify({ state: stillGuard ? "STILL_LOCKED" : "UNLOCKED", deviceId, err: errText });
  } catch (e) {
    return JSON.stringify({ state: "EXCEPTION", err: String((e && e.stack) || e) });
  }
})()`;

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
    ws.addEventListener("error", () => reject(new Error("ws error")));
    ws.addEventListener("close", () => reject(new Error("ws closed")));
  });
}

async function listAppletFrames(endpoint) {
  const ep = endpoint || await getCdpEndpoint();
  if (!ep) return [];
  const res = await fetch(ep + "/json/list");
  const targets = await res.json();
  return targets.filter(
    (t) => t.type === "iframe" && typeof t.url === "string" &&
      t.url.startsWith("blob:") && t.url.includes("scf.usercontent.goog"),
  );
}

async function unlockFrame(target) {
  const c = await cdp(target.webSocketDebuggerUrl);
  try {
    await c.send("Runtime.enable");
    const out = await c.send("Runtime.evaluate", { expression: UNLOCK_EXPR, awaitPromise: true, returnByValue: true });
    return out.result?.value ?? JSON.stringify(out);
  } finally {
    c.close();
  }
}

async function scanAndUnlock(logState) {
  const endpoint = await getCdpEndpoint();
  if (!endpoint) {
    if (logState) logState("host", JSON.stringify({ state: "WAITING_FOR_CHROME", message: "Chrome chua bat hoac chua mo cong 9222" }));
    return false;
  }
  const frames = await listAppletFrames(endpoint);
  let any = false;
  for (const f of frames) {
    try {
      const info = await unlockFrame(f);
      any = true;
      if (logState) logState(f.id, info);
    } catch (e) {
      if (logState) logState(f.id, JSON.stringify({ state: "CONNECT_FAILED", err: String((e && e.message) || e).slice(0, 120) }));
    }
  }
  return any;
}

if (!WATCH) {
  const ok = await scanAndUnlock((id, info) => console.log(`[frame ${id}] ${info}`));
  if (!ok) console.log("no applet frame found (mo tab MLT tool trong Chrome truoc)");
  else console.log("done.");
} else {
  console.log("watch mode: dang chay nen, Ctrl+C de dung. Cu 3s quet 1 lan.");
  const lastState = new Map();
  const logState = (id, info) => {
    if (lastState.get(id) !== info) {
      lastState.set(id, info);
      console.log(`[${new Date().toTimeString().slice(0, 8)}] [frame ${id}] ${info}`);
    }
  };
  for (;;) {
    try {
      await scanAndUnlock(logState);
    } catch (e) {
      console.log("scan error:", String((e && e.message) || e).slice(0, 160));
    }
    await new Promise((r) => setTimeout(r, RETRY_MS));
  }
}
