import fs from "fs";

async function run() {
  const res = await fetch("http://127.0.0.1:9222/json/list");
  const targets = await res.json();
  const iframe = targets.find(t => t.id === "C9CC3D2E27E51CB80E407FDB91E2DFED");
  const ws = new WebSocket(iframe.webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener("open", r));

  const script = `(() => {
    const btn = Array.from(document.querySelectorAll("button")).find(x => x.innerText?.includes("TẠO NGAY"));
    if (btn) {
      btn.click();
      return { clicked: "TẠO NGAY" };
    }
    const cancel = Array.from(document.querySelectorAll("button")).find(x => x.innerText?.includes("HUỶ"));
    if (cancel) {
      cancel.click();
      return { clicked: "HUỶ" };
    }
    return { clicked: "none" };
  })()`;

  ws.send(JSON.stringify({
    id: 1,
    method: "Runtime.evaluate",
    params: { expression: script, returnByValue: true }
  }));

  ws.addEventListener("message", ev => {
    console.log("Modal dismiss result:", JSON.parse(ev.data).result?.result?.value);
    ws.close();
  });
}

run();
