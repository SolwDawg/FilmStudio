import fs from "fs";

async function inspect() {
  const res = await fetch("http://127.0.0.1:9222/json/list");
  const targets = await res.json();
  const iframes = targets.filter(t => t.type === "iframe" && t.url?.includes("scf.usercontent.goog"));
  for (const f of iframes) {
    console.log("=== Iframe ID:", f.id, "===");
    const ws = new WebSocket(f.webSocketDebuggerUrl);
    await new Promise(r => ws.addEventListener("open", r));
    ws.send(JSON.stringify({
      id: 1,
      method: "Runtime.evaluate",
      params: {
        expression: `JSON.stringify({
          hasRoot: !!document.getElementById("root"),
          buttons: Array.from(document.querySelectorAll("button")).map(b => b.innerText.trim()).filter(Boolean).slice(0, 20),
          cleanActive: window.__isCleanAppActive,
          title: document.title
        })`,
        returnByValue: true
      }
    }));
    await new Promise(r => {
      ws.addEventListener("message", ev => {
        const d = JSON.parse(ev.data);
        console.log("Eval:", d.result?.result?.value);
        ws.close();
        r();
      });
    });
  }
}

inspect();
