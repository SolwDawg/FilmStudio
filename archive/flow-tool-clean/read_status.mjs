// ============================================================
//  READ EXACT STUDIO STATUS & SCENES
// ============================================================
async function run() {
  const res = await fetch("http://127.0.0.1:9222/json/list");
  const targets = await res.json();
  const iframe = targets.find(t => t.id === "C9CC3D2E27E51CB80E407FDB91E2DFED");
  if (!iframe) { console.log("Không tìm thấy frame"); return; }

  const ws = new WebSocket(iframe.webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener("open", r));

  const script = `(() => {
    const ps = Array.from(document.querySelectorAll("p"));
    const statusMsg = ps.find(p => p.className?.includes("tracking-widest") && p.className?.includes("uppercase"))?.innerText || "";
    
    const sceneHeaders = Array.from(document.querySelectorAll("*")).map(e => e.innerText?.trim()).filter(t => t && /^SCENE\s+\d+$/i.test(t));
    const uniqueScenes = Array.from(new Set(sceneHeaders));
    const sceneInfos = [];
    document.querySelectorAll(".grid > div, [class*='rounded-2xl']").forEach(el => {
      const txt = el.innerText || "";
      if (txt.includes("SCENE 1") || txt.includes("SCENE 2") || txt.includes("SCENE 3") || txt.includes("SCENE 4")) {
        sceneInfos.push(txt.slice(0, 150));
      }
    });

    const videoEls = Array.from(document.querySelectorAll("video")).map(v => ({ src: v.src?.slice(0, 80), duration: v.duration }));
    return {
      statusMsg,
      sceneInfos,
      videoEls
    };
  })()`;

  ws.send(JSON.stringify({
    id: 1,
    method: "Runtime.evaluate",
    params: { expression: script, returnByValue: true }
  }));

  ws.addEventListener("message", ev => {
    const data = JSON.parse(ev.data);
    console.log("Status Message:", data.result?.result?.value?.statusMsg);
    console.log("Scene Details:", data.result?.result?.value?.sceneInfos);
    ws.close();
  });
}

run();
