import fs from "fs";

const FLAWLESS_SCRIPT = `SCENE 1:
(Cinematic medium-wide tracking shot) Ngã tư phố Gangnam Seoul đêm mưa thu, lá cây ngân hạnh rơi trên mặt đường ướt phản chiếu ánh đèn neon. Chàng trai trong chiếc áo măng tô màu be bước xuống từ chiếc xe hơi sang trọng. Anh sải bước qua vỉa hè lát đá, ánh mắt hướng về phía trước ngỡ ngàng khi nhìn thấy bóng hình quen thuộc giữa dòng người. Không khí điện ảnh K-drama lãng mạn, 8k photorealistic.

SCENE 2:
[CẮT CẢNH] (Cinematic medium shot, góc quay đối diện sang vỉa hè) Dưới ánh đèn đường vàng ấm áp ở góc phố Gangnam, cô gái mặc áo len cổ lọ màu kem trang nhã đang cầm chiếc ô trong suốt che mưa. Ánh mắt ngấn lệ của cô chậm rãi ngước lên chạm vào ánh nhìn từ xa. Ngón tay cô run rẩy từ từ buông lỏng cán ô, chiếc ô trong suốt trượt rơi xuống mặt đường ướt mưa. Cảnh quay giữ cự ly trung cảnh bao quát cô gái và chiếc ô vừa chạm đất.

SCENE 3:
(Cinematic pull-back tracking shot, nối tiếp khoảnh khắc chiếc ô rơi) Ngay khi chiếc ô trong suốt chạm mặt đường lát đá ướt mưa, máy quay kéo lùi mượt mà. Chàng trai bung chiếc ô đen lớn chạy nhanh tới che mưa cho cô gái. Anh vươn tay ôm lấy bờ vai cô gái, cả hai đứng đối diện nhau dưới chiếc ô đen giữa cơn mưa thu Seoul, hơi thở phả khói mỏng, ánh mắt xúc động xót xa yêu thương.`;

async function main() {
  const res = await fetch("http://127.0.0.1:9222/json/list");
  const targets = await res.json();
  const iframe = targets.find(t => t.id === "C9CC3D2E27E51CB80E407FDB91E2DFED");
  const ws = new WebSocket(iframe.webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener("open", r));

  const evalInIframe = (expr) => new Promise(resolve => {
    const id = Math.floor(Math.random() * 100000);
    const onMsg = (ev) => {
      const data = JSON.parse(ev.data);
      if (data.id === id) {
        ws.removeEventListener("message", onMsg);
        resolve(data.result?.result?.value);
      }
    };
    ws.addEventListener("message", onMsg);
    ws.send(JSON.stringify({
      id,
      method: "Runtime.evaluate",
      params: { expression: expr, awaitPromise: true, returnByValue: true }
    }));
  });

  console.log("=== BƯỚC 1: NẠP ACTORS DNA & KỊCH BẢN MỚI ===");

  const setupRes = await evalInIframe(`(async () => {
    try {
      // 1. Đăng ký Actor DNA
      const actors = [
        {
          id: "actor_man",
          name: "chàng trai",
          aliases: ["chàng trai", "Min-woo", "người đàn ông"],
          roles: ["nam chính"],
          traits: "Hàn Quốc, 28 tuổi, áo măng tô be, tóc đen",
          mediaId: "2da727f8-51ea-4636-9672-01040d89324e",
          type: "actor"
        },
        {
          id: "actor_woman",
          name: "cô gái",
          aliases: ["cô gái", "Seo-yeon", "người phụ nữ"],
          roles: ["nữ chính"],
          traits: "Hàn Quốc, 25 tuổi, áo len cổ lọ kem, tóc xoăn đen",
          mediaId: "68308d31-0bc3-4ad9-9b73-cd863cd6e59d",
          type: "actor"
        }
      ];
      window.__CLEAN_APP__.setActors(actors);

      // 2. Điền kịch bản vào textarea
      const textareas = Array.from(document.querySelectorAll("textarea"));
      const scriptArea = textareas.find(t => t.placeholder?.includes("kịch bản phân cảnh") || t.placeholder?.includes("SCENE")) || textareas[2];
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
      nativeSetter.call(scriptArea, ${JSON.stringify(FLAWLESS_SCRIPT)});
      scriptArea.dispatchEvent(new Event("input", { bubbles: true }));
      scriptArea.dispatchEvent(new Event("change", { bubbles: true }));

      await new Promise(r => setTimeout(r, 300));

      // 3. Click nút Timeline để tạo scene cards
      const allBtns = Array.from(document.querySelectorAll("button"));
      const timelineBtn = allBtns.find(b => b.innerText?.includes("Timeline"));
      if (timelineBtn) {
        timelineBtn.click();
        await new Promise(r => setTimeout(r, 600));
      }

      const scenes = window.__CLEAN_APP__.getScenes();
      return {
        success: true,
        actorCount: window.__CLEAN_APP__.getActors()?.length,
        sceneCount: scenes?.length,
        scenes: scenes?.map(s => ({ idx: s.chunkIndex + 1, text: s.rawText.slice(0, 50) }))
      };
    } catch (e) {
      return { success: false, error: e.message, stack: e.stack };
    }
  })()`);

  console.log("Kết quả nạp dự án:", JSON.stringify(setupRes, null, 2));

  console.log("\n=== BƯỚC 2: BẮT ĐẦU QUAY 3 CẢNH BẰNG OMNI 1.1 FLASH ===");

  await evalInIframe(`(() => {
    window.__CLEAN_APP__.renderBatch(true);
    return { started: true };
  })()`);

  console.log("Đã kích hoạt renderBatch(true)!");
  ws.close();
}

main();
