import fs from "fs";

async function run() {
  const res = await fetch("http://127.0.0.1:9222/json/list");
  const targets = await res.json();
  const iframe = targets.find(t => t.id === "C9CC3D2E27E51CB80E407FDB91E2DFED");
  const ws = new WebSocket(iframe.webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener("open", r));

  const script = `(() => {
    const card2 = Array.from(document.querySelectorAll("*")).find(e => e.innerText?.includes("SCENE 2") && e.innerText?.includes("QUAY"));
    return {
      text: card2?.innerText?.slice(0, 300),
      statusMsg: document.querySelector("p.text-\\\\[8px\\\\].font-black.uppercase")?.innerText
    };
  })()`;

  ws.send(JSON.stringify({
    id: 1,
    method: "Runtime.evaluate",
    params: { expression: script, returnByValue: true }
  }));

  ws.addEventListener("message", ev => {
    console.log("Card 2 details:", JSON.parse(ev.data).result?.result?.value);
    ws.close();
  });
}

run();
