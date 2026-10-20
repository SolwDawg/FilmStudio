// ============================================================
//  CLICK XUẤT MASTER TO MERGE MOVIE
// ============================================================
async function main() {
  const res = await fetch("http://127.0.0.1:9222/json/list");
  const targets = await res.json();
  const iframe = targets.find(t => t.id === "C9CC3D2E27E51CB80E407FDB91E2DFED");
  if (!iframe) { console.error("Iframe not found"); return; }

  const ws = new WebSocket(iframe.webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener("open", r));

  console.log("[3] Bấm nút 'XUẤT MASTER' để ghép 2 cảnh thành phim hoàn chỉnh...");

  const script = `(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const masterBtn = buttons.find(b => b.innerText?.includes("XUẤT MASTER"));
    if (masterBtn) {
      masterBtn.click();
      return { success: true, text: masterBtn.innerText };
    }
    return { success: false, error: "Nút Xuất Master không tìm thấy hoặc đang disable" };
  })()`;

  ws.send(JSON.stringify({
    id: 1,
    method: "Runtime.evaluate",
    params: { expression: script, returnByValue: true }
  }));

  ws.addEventListener("message", ev => {
    const data = JSON.parse(ev.data);
    console.log("Kết quả bấm:", data.result?.result?.value);
    ws.close();
  });
}

main();
