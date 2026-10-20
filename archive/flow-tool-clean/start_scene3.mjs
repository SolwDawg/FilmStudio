// ============================================================
//  TRIGGER SCENE 3 RENDER
// ============================================================
async function main() {
  const res = await fetch("http://127.0.0.1:9222/json/list");
  const targets = await res.json();
  const iframe = targets.find(t => t.id === "C9CC3D2E27E51CB80E407FDB91E2DFED");
  if (!iframe) return;

  const ws = new WebSocket(iframe.webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener("open", r));

  const script = `(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    // Try "QUAY TIẾP TỤC" first
    const continueBtn = buttons.find(b => b.innerText?.includes("QUAY TIẾP TỤC"));
    if (continueBtn) {
      continueBtn.click();
      return { clicked: "QUAY TIẾP TỤC" };
    }
    // Otherwise find Scene 3's "BẮT ĐẦU" button
    const scene3Cards = Array.from(document.querySelectorAll("*")).filter(e => e.innerText?.includes("SCENE 3"));
    const lastCard = scene3Cards[scene3Cards.length - 1];
    const s3Btn = lastCard?.querySelector("button") || buttons.filter(b => b.innerText?.trim() === "BẮT ĐẦU")[0];
    if (s3Btn) {
      s3Btn.click();
      return { clicked: "SCENE 3 BẮT ĐẦU" };
    }
    return { clicked: "none" };
  })()`;

  ws.send(JSON.stringify({
    id: 1,
    method: "Runtime.evaluate",
    params: { expression: script, returnByValue: true }
  }));

  ws.addEventListener("message", ev => {
    console.log("Kích hoạt Scene 3:", JSON.parse(ev.data).result?.result?.value);
    ws.close();
  });
}

main();
