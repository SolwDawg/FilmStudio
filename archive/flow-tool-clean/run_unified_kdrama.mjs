import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const SCRIPT = `SCENE 1:
(Cinematic medium-wide tracking shot) Ngã tư Gangnam Seoul đêm mưa thu, lá phong vàng ướt trên vỉa hè lung linh ánh đèn neon. Chàng trai diện áo măng tô màu be bước xuống xe hơi, ngỡ ngàng nhận ra bóng dáng quen thuộc ở lề đường bên kia. Ở 2 giây cuối, máy quay lia mượt mà (Pan) từ chàng trai quét qua lòng đường lát đá ướt mưa về phía góc vỉa hè đối diện.

SCENE 2:
(Cinematic medium shot, tiếp nối góc lia qua đường) Khung hình tiếp nối liền mạch từ mặt đường ướt, máy quay nâng lên góc nhìn đối diện. Thiếu nữ mặc áo len cổ lọ màu kem trang nhã che chiếc ô trong suốt dưới mưa. Nhận ra người ấy, mắt nàng ngấn lệ, bàn tay khẽ buông lỏng cán ô khiến chiếc ô trong suốt rơi nghiêng xuống mặt đường ướt mưa.

SCENE 3:
(Cinematic pull-back tracking shot, tiếp nối chiếc ô rơi) Nối tiếp liền mạch từ khung hình cô gái và chiếc ô vừa rơi trên mặt đường, máy quay kéo lùi mượt mà mở rộng trường nhìn góc phố. Chàng trai với chiếc ô đen lớn chạy nhanh tới che mưa cho cô gái. Anh vươn tay ôm lấy bờ vai cô gái, cả hai đứng đối diện nhau dưới chiếc ô đen giữa cơn mưa thu Seoul, ánh mắt xúc động nghẹn ngào.`;

async function main() {
  const res = await fetch("http://127.0.0.1:9222/json/list");
  const targets = await res.json();
  const iframe = targets.find(t => t.id === "C9CC3D2E27E51CB80E407FDB91E2DFED");
  const ws = new WebSocket(iframe.webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener("open", r));

  const evalInIframe = (expr) => new Promise((resolve, reject) => {
    const id = Math.floor(Math.random() * 1000000);
    const onMsg = (ev) => {
      const data = JSON.parse(ev.data);
      if (data.id === id) {
        ws.removeEventListener("message", onMsg);
        if (data.result?.exceptionDetails) {
          reject(new Error(JSON.stringify(data.result.exceptionDetails)));
        } else {
          resolve(data.result?.result?.value);
        }
      }
    };
    ws.addEventListener("message", onMsg);
    ws.send(JSON.stringify({
      id,
      method: "Runtime.evaluate",
      params: { expression: expr, awaitPromise: true, returnByValue: true }
    }));
  });

  console.log("=== BƯỚC 1: NẠP ACTOR DNA & KỊCH BẢN ĐỒNG BỘ ===");
  const setup = await evalInIframe(`(async () => {
    const actors = [
      {
        id: "actor_man",
        name: "chàng trai",
        aliases: ["chàng trai", "Min-woo", "người đàn ông"],
        roles: ["nam chính"],
        traits: "Hàn Quốc, 28 tuổi, áo măng tô be, tóc ướt đen",
        mediaId: "2da727f8-51ea-4636-9672-01040d89324e",
        type: "actor"
      },
      {
        id: "actor_woman",
        name: "cô gái",
        aliases: ["cô gái", "thiếu nữ", "Seo-yeon", "nàng"],
        roles: ["nữ chính"],
        traits: "Hàn Quốc, 25 tuổi, áo len cổ lọ kem, mắt ngấn lệ",
        mediaId: "68308d31-0bc3-4ad9-9b73-cd863cd6e59d",
        type: "actor"
      }
    ];
    window.__CLEAN_APP__.setActors(actors);

    // Điền kịch bản
    const textareas = Array.from(document.querySelectorAll("textarea"));
    const scriptArea = textareas.find(t => t.placeholder?.includes("kịch bản phân cảnh") || t.placeholder?.includes("SCENE")) || textareas[2];
    const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
    nativeSetter.call(scriptArea, ${JSON.stringify(SCRIPT)});
    scriptArea.dispatchEvent(new Event("input", { bubbles: true }));
    scriptArea.dispatchEvent(new Event("change", { bubbles: true }));

    await new Promise(r => setTimeout(r, 400));

    // Nhấn nút Timeline
    const allBtns = Array.from(document.querySelectorAll("button"));
    const timelineBtn = allBtns.find(b => b.innerText?.includes("Timeline"));
    if (timelineBtn) {
      timelineBtn.click();
      await new Promise(r => setTimeout(r, 800));
    }

    const scenes = window.__CLEAN_APP__.getScenes();
    return {
      actorCount: window.__CLEAN_APP__.getActors()?.length,
      sceneCount: scenes?.length,
      scenes: scenes?.map(s => ({ idx: s.chunkIndex + 1, text: s.rawText.slice(0, 60) }))
    };
  })()`);

  console.log("Nạp dự án thành công:", JSON.stringify(setup, null, 2));

  console.log("\n=== BƯỚC 2: KÍCH HOẠT BATCH RENDER ĐỒNG BỘ ===");
  await evalInIframe(`(() => {
    window.__CLEAN_APP__.renderBatch(true);
    return true;
  })()`);

  console.log("Đã phát lệnh renderBatch(true). Bắt đầu giám sát...");
  ws.close();
}

main().catch(err => {
  console.error("Lỗi:", err);
  process.exit(1);
});
