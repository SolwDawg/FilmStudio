// ============================================================
//  RUN K-DRAMA (3 SHOTS, CONTINUITY, OMNI MODEL)
// ============================================================
import fs from "fs";

const KDRAMA_SCRIPT = `SCENE 1:
(Cinematic wide tracking shot) Ngã tư phố Gangnam Seoul sầm uất vào một đêm mưa thu se lạnh, lá vàng rơi trên vỉa hè lát đá. Ánh đèn neon và đèn xe phản chiếu lung linh trên mặt đường ướt. Một chàng trai Hàn Quốc điển trai trong bộ áo măng tô màu be lịch lãm bước xuống từ chiếc xe hơi màu đen sang trọng, nhìn thấy một bóng hình quen thuộc phía trước. Không khí K-drama lãng mạn, 8k photorealistic.

SCENE 2:
(Dramatic medium close-up, nối tiếp góc nhìn từ cảnh trước) Dưới ánh đèn đường vàng ấm áp, một cô gái Hàn Quốc xinh đẹp dịu dàng với mái tóc đen gợn sóng buông xõa trên vai, mặc áo len cổ lọ màu kem trang nhã. Cô cầm chiếc ô trong suốt, ánh mắt ngấn lệ ngước lên nhìn chàng trai, chiếc ô từ từ rơi xuống vỉa hè ướt mưa, giọt nước mắt lăn trên má.

SCENE 3:
(Cinematic two-shot medium slow motion, kết nối trực tiếp khoảnh khắc chiếc ô rơi) Bất chấp cơn mưa thu trút hạt, chàng trai lập tức lao nhanh qua dòng người, đưa chiếc ô đen che lên đỉnh đầu cô gái vừa lúc chiếc ô của cô rơi chạm đất. Cả hai đứng đối diện nhau chỉ cách gang tấc, chàng trai ôm nhẹ lấy bờ vai cô, ánh mắt tràn ngập yêu thương và xúc động giữa trung tâm Seoul hoa lệ.`;

async function main() {
  const res = await fetch("http://127.0.0.1:9222/json/list");
  const targets = await res.json();
  const iframe = targets.find(t => t.id === "C9CC3D2E27E51CB80E407FDB91E2DFED");
  if (!iframe) { console.error("Iframe not found"); return; }

  const ws = new WebSocket(iframe.webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener("open", r));

  const script = `(async () => {
    try {
      // 1. Set model to Omni 1.1 Flash
      const modelBtn = Array.from(document.querySelectorAll("button")).find(b => b.innerText?.includes("MODEL VIDEO"));
      if (modelBtn && !modelBtn.innerText?.includes("Omni")) {
        modelBtn.click();
        await new Promise(r => setTimeout(r, 300));
        const menuItems = Array.from(document.querySelectorAll("div, button, span")).filter(el => el.innerText?.trim() === "Omni 1.1 Flash");
        if (menuItems.length > 0) menuItems[menuItems.length - 1].click();
        await new Promise(r => setTimeout(r, 300));
      }

      // 2. Enable Continuity: THAM CHIẾU CẢNH
      const refBtn = Array.from(document.querySelectorAll("button")).find(b => b.innerText?.includes("THAM CHIẾU CẢNH"));
      if (refBtn) {
        const isActive = refBtn.className?.includes("bg-blue-500") || refBtn.querySelector(".bg-blue-500");
        if (!isActive) refBtn.click();
      }

      // 3. Enable Auto-merge: TỰ GHÉP MASTER
      const mergeBtn = Array.from(document.querySelectorAll("button")).find(b => b.innerText?.includes("TỰ GHÉP MASTER"));
      if (mergeBtn) {
        const isActive = mergeBtn.className?.includes("bg-green-500") || mergeBtn.querySelector(".bg-green-500");
        if (!isActive) mergeBtn.click();
      }

      // 4. Fill script textarea
      const textareas = Array.from(document.querySelectorAll("textarea"));
      const scriptArea = textareas.find(t => t.placeholder?.includes("kịch bản phân cảnh") || t.placeholder?.includes("SCENE")) || textareas[2];
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
      nativeSetter.call(scriptArea, ${JSON.stringify(KDRAMA_SCRIPT)});
      scriptArea.dispatchEvent(new Event("input", { bubbles: true }));
      scriptArea.dispatchEvent(new Event("change", { bubbles: true }));

      await new Promise(r => setTimeout(r, 400));

      // 5. Click Timeline
      const allBtns = Array.from(document.querySelectorAll("button"));
      const timelineBtn = allBtns.find(b => b.innerText?.includes("Timeline"));
      if (timelineBtn) {
        timelineBtn.click();
        await new Promise(r => setTimeout(r, 600));
      }

      // 6. Click BẮT ĐẦU QUAY
      const startBtn = Array.from(document.querySelectorAll("button")).find(b => b.innerText?.includes("BẮT ĐẦU QUAY"));
      if (startBtn) {
        startBtn.click();
      }

      return {
        success: true,
        model: Array.from(document.querySelectorAll("button")).find(b => b.innerText?.includes("MODEL VIDEO"))?.innerText?.replace(/\\n/g, " "),
        started: !!startBtn
      };
    } catch (e) {
      return { success: false, error: String(e && e.stack || e) };
    }
  })()`;

  ws.send(JSON.stringify({
    id: 1,
    method: "Runtime.evaluate",
    params: { expression: script, awaitPromise: true, returnByValue: true }
  }));

  ws.addEventListener("message", ev => {
    console.log("Khởi động hoàn tất:", JSON.stringify(JSON.parse(ev.data).result?.result?.value, null, 2));
    ws.close();
  });
}

main();
