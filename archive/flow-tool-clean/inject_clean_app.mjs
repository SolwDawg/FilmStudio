import fs from "fs";

async function run() {
  const res = await fetch("http://127.0.0.1:9222/json/list");
  const targets = await res.json();
  const appTarget = targets.find(t => t.title === "Flow app") || 
                    targets.filter(t => t.type === "iframe" && t.url.startsWith("blob:") && t.url.includes("scf.usercontent.goog"))[1];
  if (!appTarget) {
    console.error("No active Flow App frame found. Please open Google Flow in Chrome.");
    return;
  }

  const dataUrl = fs.readFileSync("c:/learning/Film/flow-tool-clean/dist/app.dataurl.txt", "utf8").trim();

  const ws = new WebSocket(appTarget.webSocketDebuggerUrl);
  await new Promise((resolve) => {
    ws.addEventListener("open", () => {
      console.log("Connected to Flow App frame:", appTarget.id);
      ws.send(JSON.stringify({
        id: 1,
        method: "Runtime.evaluate",
        params: {
          expression: `(async () => {
            try {
              // 1. Dynamic import clean bundle from data URL
              const cleanDataUrl = ${JSON.stringify(dataUrl)};
              const cleanModule = await import(cleanDataUrl);
              const CleanApp = cleanModule.default || cleanModule.App;
              
              if (!CleanApp) return { success: false, error: "CleanApp not found in module" };
              
              // 2. Import react and react-dom/client from importmap
              const React = await import("react");
              const { createRoot } = await import("react-dom/client");
              
              const rootEl = document.getElementById("root");
              if (!rootEl) return { success: false, error: "Root element not found" };
              
              // 3. Unmount existing or clear
              if (window.__cleanAppRoot) {
                window.__cleanAppRoot.render(React.createElement(CleanApp));
              } else {
                rootEl.innerHTML = "";
                const newRoot = createRoot(rootEl);
                window.__cleanAppRoot = newRoot;
                newRoot.render(React.createElement(CleanApp));
              }
              
              window.__isCleanAppActive = true;
              return { success: true, message: "Clean App successfully rendered into Flow!" };
            } catch (err) {
              return { success: false, error: err.message, stack: err.stack };
            }
          })()`,
          awaitPromise: true,
          returnByValue: true
        }
      }));
    });
    ws.addEventListener("message", (ev) => {
      const data = JSON.parse(ev.data.toString());
      console.log("Injection Result:", JSON.stringify(data.result?.result?.value, null, 2));
      ws.close();
      resolve();
    });
    ws.addEventListener("error", (e) => {
      console.error("WS error:", e);
      resolve();
    });
  });
}

run();
