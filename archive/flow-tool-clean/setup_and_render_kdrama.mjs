// ============================================================
//  KOREAN DRAMA PIPELINE (OMNI MODEL + CONTINUITY)
// ============================================================
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const KDRAMA_SCRIPT = `SCENE 1:
(Cinematic wide-to-medium tracking shot) Ngã tư phố Gangnam Seoul sầm uất vào một đêm mưa thu se lạnh, lá cây ngân hạnh vàng óng ướt đẫm rơi trên vỉa hè lát đá. Ánh đèn neon và đèn xe phản chiếu lung linh trên mặt đường ướt. Một chàng trai Hàn Quốc điển trai trong bộ áo măng tô màu be lịch lãm bước xuống từ chiếc xe hơi màu đen sang trọng. Anh đứng khựng lại giữa dòng người vội vã, đôi mắt mở to bàng hoàng khi nhìn thấy một bóng hình quen thuộc phía trước. Không khí điện ảnh K-drama lãng mạn, hạt mưa rơi chậm, 8k photorealistic.

SCENE 2:
(Dramatic medium close-up, nối tiếp góc nhìn từ cảnh trước) Dưới ánh đèn đường vàng ấm áp, một cô gái Hàn Quốc xinh đẹp dịu dàng với mái tóc đen gợn sóng buông xõa trên vai, mặc áo len cổ lọ màu kem trang nhã. Cô đang cầm chiếc ô trong suốt, bỗng khựng lại. Ánh mắt ngấn lệ của cô chậm rãi ngước lên chạm vào ánh mắt chàng trai. Chiếc ô trên tay cô từ từ trượt ngón tay rơi xuống vỉa hè ướt mưa. Một giọt nước mắt lặng lẽ lăn dài trên gò má trắng ngần, biểu cảm rung động sâu sắc nghẹn ngào, hiệu ứng bokeh đèn phố lung linh mờ ảo phía sau.

SCENE 3:
(Cinematic two-shot medium slow motion, kết nối trực tiếp khoảnh khắc chiếc ô rơi) Bất chấp cơn mưa thu trút hạt, chàng trai lập tức lao nhanh qua dòng người, kịp thời đưa chiếc ô đen che lên đỉnh đầu cô gái vừa lúc chiếc ô của cô rơi chạm đất. Cả hai đứng đối diện nhau chỉ cách gang tấc, hơi thở phả ra làn khói mỏng trong làn sương lạnh. Chàng trai vươn bàn tay run rẩy nhẹ nhàng ôm lấy bờ vai cô, ánh mắt tràn ngập xót xa và yêu thương vô bờ bến. Hai người nhìn nhau xúc động giữa trung tâm Seoul hoa lệ, mưa rơi xung quanh như một bức tranh điện ảnh tuyệt mỹ.`;

async function main() {
  const res = await fetch("http://127.0.0.1:9222/json/list");
  const targets = await res.json();
  const iframe = targets.find(t => t.id === "C9CC3D2E27E51CB80E407FDB91E2DFED");
  if (!iframe) {
    console.error("Không tìm thấy applet iframe.");
    return;
  }

  const ws = new WebSocket(iframe.webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener("open", r));

  console.log("[1] Đang cấu hình Clean Studio: Model Omni + Tham chiếu cảnh (Continuity)...");

  const setupScript = `(async () => {
    try {
      const buttons = Array.from(document.querySelectorAll("button"));

      // 1. Click "Dự án mới" to clear old scenes
      const newProjBtn = buttons.find(b => b.innerText?.includes("Dự án mới"));
      if (newProjBtn) {
        newProjBtn.click();
        await new Promise(r => setTimeout(r, 400));
      }

      // 2. Select Model Video = "Omni 1.1 Flash"
      const modelBtn = Array.from(document.querySelectorAll("button")).find(b => b.innerText?.includes("MODEL VIDEO"));
      if (modelBtn) {
        modelBtn.click();
        await new Promise(r => setTimeout(r, 300));
        // Find "Omni 1.1 Flash" in dropdown items
        const menuItems = Array.from(document.querySelectorAll("div, button, span")).filter(el => el.innerText?.trim() === "Omni 1.1 Flash");
        if (menuItems.length > 0) {
          menuItems[menuItems.length - 1].click();
          await new Promise(r => setTimeout(r, 300));
        }
      }

      // 3. Enable "THAM CHIẾU CẢNH" (useLastFrameAsReference) if not active
      const refBtn = Array.from(document.querySelectorAll("button")).find(b => b.innerText?.includes("THAM CHIẾU CẢNH"));
      if (refBtn) {
        const isActive = refBtn.className?.includes("bg-blue-500") || refBtn.querySelector(".bg-blue-500");
        if (!isActive) {
          refBtn.click();
          await new Promise(r => setTimeout(r, 200));
        }
      }

      // 4. Enable "TỰ GHÉP MASTER"
      const mergeBtn = Array.from(document.querySelectorAll("button")).find(b => b.innerText?.includes("TỰ GHÉP MASTER"));
      if (mergeBtn) {
        const isActive = mergeBtn.className?.includes("bg-green-500") || mergeBtn.querySelector(".bg-green-500");
        if (!isActive) {
          mergeBtn.click();
          await new Promise(r => setTimeout(r, 200));
        }
      }

      // 5. Input K-Drama script into textarea
      const textareas = Array.from(document.querySelectorAll("textarea"));
      const scriptArea = textareas.find(t => t.placeholder?.includes("kịch bản phân cảnh") || t.placeholder?.includes("SCENE")) || textareas[2];
      
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
      nativeSetter.call(scriptArea, ${JSON.stringify(KDRAMA_SCRIPT)});
      scriptArea.dispatchEvent(new Event("input", { bubbles: true }));
      scriptArea.dispatchEvent(new Event("change", { bubbles: true }));

      await new Promise(r => setTimeout(r, 400));

      // 6. Click "Timeline" button
      const allBtns = Array.from(document.querySelectorAll("button"));
      const timelineBtn = allBtns.find(b => b.innerText?.includes("Timeline"));
      if (timelineBtn) {
        timelineBtn.click();
        await new Promise(r => setTimeout(r, 600));
      }

      // Check configured model
      const currentModelBtn = Array.from(document.querySelectorAll("button")).find(b => b.innerText?.includes("MODEL VIDEO"));

      return {
        success: true,
        modelSelected: currentModelBtn?.innerText?.replace(/\\n/g, " "),
        scriptLength: scriptArea?.value?.length
      };
    } catch (e) {
      return { success: false, error: String(e && e.stack || e) };
    }
  })()`;

  ws.send(JSON.stringify({
    id: 1,
    method: "Runtime.evaluate",
    params: { expression: setupScript, awaitPromise: true, returnByValue: true }
  }));

  ws.addEventListener("message", ev => {
    const data = JSON.parse(ev.data);
    console.log("Kết quả thiết lập:", JSON.stringify(data.result?.result?.value, null, 2));
    ws.close();
  });
}

main();
