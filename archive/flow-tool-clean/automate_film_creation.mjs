// ============================================================
//  AUTOMATE FILM CREATION — Pipeline runner for Google Flow
// ============================================================
import fs from "fs";

const SCRIPT_TEXT = `SCENE 1:
Góc nhìn điện ảnh toàn cảnh (Cinematic wide shot), thành phố Cyberpunk tương lai rực rỡ dưới cơn mưa đêm, các tòa nhà chọc trời phát sáng bảng hiệu hologram neon xanh và tím. Một chiến binh công nghệ cao đứng trên mép sân thượng ngắm nhìn đô thị, camera trôi chậm về phía trước, hiệu ứng mưa rơi chân thực 8k.

SCENE 2:
Góc cận cảnh ấn tượng (Dramatic close-up), chiến binh kích hoạt thanh kiếm Katana năng lượng plasma xanh lam rực rỡ. Ánh sáng kiếm phản chiếu lên đôi mắt sắc bén và mũ trùm đầu công nghệ, các hạt mưa bốc hơi khi chạm vào lưỡi kiếm, chuyển động cinematic siêu chi tiết.`;

async function main() {
  const res = await fetch("http://127.0.0.1:9222/json/list");
  const targets = await res.json();
  const iframe = targets.find(t => t.id === "C9CC3D2E27E51CB80E407FDB91E2DFED");
  if (!iframe) {
    console.error("Không tìm thấy applet iframe C9CC3D2E27E51CB80E407FDB91E2DFED.");
    return;
  }

  const ws = new WebSocket(iframe.webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener("open", r));

  console.log("[1] Đang nạp kịch bản vào Clean Studio Timeline...");

  // Send script into state and click Timeline
  const injectScript = `(async () => {
    try {
      // Find the script textarea (placeholder: "Nhập kịch bản phân cảnh (SCENE)..." or textarea idx 2)
      const textareas = Array.from(document.querySelectorAll("textarea"));
      const scriptArea = textareas.find(t => t.placeholder?.includes("kịch bản phân cảnh") || t.placeholder?.includes("SCENE")) || textareas[2];
      
      if (!scriptArea) return { success: false, error: "Không tìm thấy ô kịch bản" };

      // Set value and dispatch input event for React
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
      nativeSetter.call(scriptArea, ${JSON.stringify(SCRIPT_TEXT)});
      scriptArea.dispatchEvent(new Event("input", { bubbles: true }));
      scriptArea.dispatchEvent(new Event("change", { bubbles: true }));

      await new Promise(r => setTimeout(r, 400));

      // Click "Timeline" button to parse scenes
      const buttons = Array.from(document.querySelectorAll("button"));
      const timelineBtn = buttons.find(b => b.innerText?.includes("Timeline"));
      if (!timelineBtn) return { success: false, error: "Không tìm thấy nút Timeline" };

      timelineBtn.click();
      await new Promise(r => setTimeout(r, 600));

      // Get count of scenes generated
      const sceneCards = document.querySelectorAll("[data-scene-id], .scene-card, .group\\\\/scene");
      return {
        success: true,
        scriptLength: scriptArea.value.length,
        buttonsFound: buttons.map(b => b.innerText.trim()).filter(Boolean).slice(0, 10)
      };
    } catch (e) {
      return { success: false, error: String(e && e.stack || e) };
    }
  })()`;

  ws.send(JSON.stringify({
    id: 1,
    method: "Runtime.evaluate",
    params: {
      expression: injectScript,
      awaitPromise: true,
      returnByValue: true
    }
  }));

  ws.addEventListener("message", ev => {
    const data = JSON.parse(ev.data);
    console.log("Kết quả nạp Timeline:", JSON.stringify(data.result?.result?.value, null, 2));
    ws.close();
  });
}

main();
