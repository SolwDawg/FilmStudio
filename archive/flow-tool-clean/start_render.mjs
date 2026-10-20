// ============================================================
//  TRIGGER RENDER & MONITOR STATUS
// ============================================================
async function main() {
  const res = await fetch("http://127.0.0.1:9222/json/list");
  const targets = await res.json();
  const iframe = targets.find(t => t.id === "C9CC3D2E27E51CB80E407FDB91E2DFED");
  if (!iframe) {
    console.error("Không tìm thấy iframe.");
    return;
  }

  const ws = new WebSocket(iframe.webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener("open", r));

  console.log("[2] Kích hoạt 'BẮT ĐẦU QUAY' trên Clean Studio...");

  const clickScript = `(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const startBtn = buttons.find(b => b.innerText?.includes("BẮT ĐẦU QUAY"));
    if (startBtn) {
      startBtn.click();
      return { success: true, clicked: "BẮT ĐẦU QUAY" };
    }
    // Fallback: click first scene's "BẮT ĐẦU" button
    const sceneStartBtn = buttons.find(b => b.innerText?.trim() === "BẮT ĐẦU");
    if (sceneStartBtn) {
      sceneStartBtn.click();
      return { success: true, clicked: "SCENE 1 BẮT ĐẦU" };
    }
    return { success: false, error: "Không tìm thấy nút bắt đầu quay" };
  })()`;

  ws.send(JSON.stringify({
    id: 1,
    method: "Runtime.evaluate",
    params: { expression: clickScript, returnByValue: true }
  }));

  ws.addEventListener("message", ev => {
    const data = JSON.parse(ev.data);
    console.log("Kết quả:", data.result?.result?.value);
    ws.close();
  });
}

main();
