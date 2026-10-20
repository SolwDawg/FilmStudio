// ============================================================
//  MONITOR GENERATION PROGRESS
// ============================================================
async function poll() {
  const res = await fetch("http://127.0.0.1:9222/json/list");
  const targets = await res.json();
  const iframe = targets.find(t => t.id === "C9CC3D2E27E51CB80E407FDB91E2DFED");
  if (!iframe) return;

  const ws = new WebSocket(iframe.webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener("open", r));

  const checkScript = `(() => {
    // Look for status messages or badges
    const statusEl = document.querySelector(".text-\\\\[10px\\\\].font-black, [class*='text-orange'], [class*='text-blue']");
    const allText = Array.from(document.querySelectorAll("*")).map(e => e.innerText?.trim()).filter(Boolean);
    const progressLines = allText.filter(t => 
      t.includes("%") || 
      t.includes("Đang") || 
      t.includes("quay") || 
      t.includes("Hoàn tất") || 
      t.includes("Lỗi") ||
      t.includes("bắt đầu")
    ).slice(0, 8);

    return {
      progressLines: Array.from(new Set(progressLines))
    };
  })()`;

  ws.send(JSON.stringify({
    id: 1,
    method: "Runtime.evaluate",
    params: { expression: checkScript, returnByValue: true }
  }));

  ws.addEventListener("message", ev => {
    const data = JSON.parse(ev.data);
    console.log("Tiến độ:", JSON.stringify(data.result?.result?.value?.progressLines));
    ws.close();
  });
}

poll();
