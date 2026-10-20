import fs from "fs";

async function run() {
  const res = await fetch("http://127.0.0.1:9222/json/list");
  const targets = await res.json();
  const iframe = targets.find(t => t.id === "C9CC3D2E27E51CB80E407FDB91E2DFED");
  const ws = new WebSocket(iframe.webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener("open", r));

  const script = `(() => {
    const allButtons = Array.from(document.querySelectorAll("button"));
    const startButtons = allButtons.filter(b => b.innerText?.includes("BẮT ĐẦU"));
    startButtons.forEach(b => b.click());
    return startButtons.map(b => b.innerText.trim());
  })()`;

  ws.send(JSON.stringify({
    id: 1,
    method: "Runtime.evaluate",
    params: { expression: script, returnByValue: true }
  }));

  ws.addEventListener("message", ev => {
    console.log("Đã bấm các nút:", JSON.parse(ev.data).result?.result?.value);
    ws.close();
  });
}

run();
