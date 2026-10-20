import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

export function findChromeExecutable(): string {
  const candidates = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`
  ];
  return candidates.find((c) => existsSync(c)) || "chrome.exe";
}

export async function getCdpEndpoint(port = 9222): Promise<string | null> {
  for (const host of [`127.0.0.1:${port}`, `[::1]:${port}`, `localhost:${port}`]) {
    try {
      const res = await fetch(`http://${host}/json/version`, { signal: AbortSignal.timeout(600) });
      if (res.ok) return `http://${host}`;
    } catch {
      // Ignore
    }
  }
  return null;
}

export interface CdpTarget {
  id: string;
  type: string;
  title: string;
  url: string;
  webSocketDebuggerUrl?: string;
}

export async function listCdpTargets(endpoint: string): Promise<CdpTarget[]> {
  const res = await fetch(`${endpoint}/json/list`);
  return (await res.json()) as CdpTarget[];
}

export interface CdpClient {
  send(method: string, params?: Record<string, unknown>): Promise<any>;
  close(): void;
}

export function openCdpConnection(wsUrl: string): Promise<CdpClient> {
  return new Promise((resolvePromise, rejectPromise) => {
    const ws = new WebSocket(wsUrl);
    let id = 0;
    const pending = new Map<number, { res: (val: any) => void; rej: (err: any) => void }>();

    ws.addEventListener("open", () => {
      resolvePromise({
        send(method: string, params: Record<string, unknown> = {}) {
          return new Promise((res, rej) => {
            const mid = ++id;
            pending.set(mid, { res, rej });
            ws.send(JSON.stringify({ id: mid, method, params }));
          });
        },
        close() {
          try {
            ws.close();
          } catch {
            // Ignore
          }
        }
      });
    });

    ws.addEventListener("message", (ev) => {
      const msg = JSON.parse(ev.data.toString());
      if (msg.id && pending.has(msg.id)) {
        const { res, rej } = pending.get(msg.id)!;
        pending.delete(msg.id);
        if (msg.error) rej(new Error(JSON.stringify(msg.error)));
        else res(msg.result);
      }
    });

    ws.addEventListener("error", (err) => rejectPromise(err));
    ws.addEventListener("close", () => rejectPromise(new Error("ws closed")));
  });
}

/**
 * Checks if the clean applet is already active inside an iframe.
 */
export async function isCleanAppActive(targetWsUrl: string): Promise<boolean> {
  try {
    const client = await openCdpConnection(targetWsUrl);
    try {
      const result = await client.send("Runtime.evaluate", {
        expression: "window.__isCleanAppActive === true",
        returnByValue: true
      });
      return result?.result?.value === true;
    } finally {
      client.close();
    }
  } catch {
    return false;
  }
}

/**
 * Injects the clean applet bundle into the Google Flow sandboxed iframe (#root element).
 */
export async function injectCleanApplet(
  targetWsUrl: string,
  dataUrl: string,
  force = false
): Promise<{ success: boolean; state: string; error?: string }> {
  const client = await openCdpConnection(targetWsUrl);
  try {
    await client.send("Runtime.enable");
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
        return JSON.stringify({ state: "SUCCESS", plan: "ULTRA ELITE (CLEAN)", maxScenes: 999 });
      } catch (err) {
        return JSON.stringify({ state: "ERROR", error: err.message, stack: err.stack });
      }
    })()`;

    const result = await client.send("Runtime.evaluate", {
      expression: script,
      awaitPromise: true,
      returnByValue: true
    });

    const parsed = JSON.parse(result?.result?.value ?? "{}");
    return {
      success: parsed.state === "SUCCESS" || parsed.state === "ALREADY_ACTIVE",
      state: parsed.state,
      error: parsed.error
    };
  } finally {
    client.close();
  }
}

/**
 * Spawns Google Chrome with remote debugging on port 9222.
 */
export function launchChromeWithCdp(port = 9222, url = "https://flow.google.com/?pli=1"): void {
  const chromePath = findChromeExecutable();
  const args = [
    `--remote-debugging-port=${port}`,
    "--remote-allow-origins=*",
    "--no-first-run",
    "--no-default-browser-check",
    url
  ];
  const child = spawn(chromePath, args, { detached: true, stdio: "ignore" });
  child.unref();
}
