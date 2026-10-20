import fs from "fs";

async function run() {
  const res = await fetch("http://127.0.0.1:9222/json/list");
  const targets = await res.json();
  const iframe = targets.find(t => t.id === "C9CC3D2E27E51CB80E407FDB91E2DFED");
  const ws = new WebSocket(iframe.webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener("open", r));
  ws.send(JSON.stringify({
    id: 1,
    method: "Runtime.evaluate",
    params: {
      expression: `JSON.stringify({
        textareas: Array.from(document.querySelectorAll("textarea")).map((t, idx) => ({ idx, placeholder: t.placeholder, value: t.value.slice(0, 50) })),
        inputs: Array.from(document.querySelectorAll("input")).map((i, idx) => ({ idx, type: i.type, placeholder: i.placeholder, value: i.value }))
      })`,
      returnByValue: true
    }
  }));
  ws.addEventListener("message", ev => {
    console.log(JSON.parse(ev.data).result?.result?.value);
    ws.close();
  });
}

run();
