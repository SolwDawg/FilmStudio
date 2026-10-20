import fs from 'fs';
import path from 'path';

const LOGICAL_SCRIPT = `SCENE 1:
(Cinematic tracking shot) Ngã tư phố Gangnam Seoul đêm mưa thu lãng mạn. Chàng trai Min-woo trong chiếc áo măng tô màu be trang nhã bước xuống từ chiếc xe hơi sang trọng. Nhìn thấy người thương ở vỉa hè bên kia đường, anh bung chiếc ô màu đen lớn rồi bước nhanh qua vạch kẻ đường về phía cô. Không khí K-drama xúc động, 8k photorealistic.

SCENE 2:
[CẮT CẢNH] (Cinematic medium shot, góc quay đối diện sang vỉa hè) Cô gái Seo-yeon diện áo len cổ lọ màu kem trang nhã đang cầm chiếc ô trong suốt dưới mưa. Nhìn thấy chàng trai Min-woo mặc áo măng tô be đang bước tới, mắt cô trào lệ xúc động. Bàn tay nàng run rẩy buông lỏng cán ô, chiếc ô trong suốt rơi nghiêng xuống mặt đường ướt mưa. Cảnh quay giữ cự ly trung cảnh bao quát cô gái và chiếc ô vừa chạm đất.

SCENE 3:
(Cinematic pull-back shot, nối tiếp khoảnh khắc chiếc ô rơi) Nối tiếp liền mạch từ khung hình cô gái và chiếc ô trong suốt vừa chạm đất. Chính chàng trai Min-woo trong chiếc áo măng tô màu be bước tới trước mặt cô gái, đưa chiếc ô màu đen che lên đầu che mưa cho cô. Anh vươn tay ôm lấy bờ vai cô gái, cả hai đứng đối diện nhìn sâu vào mắt nhau dưới chiếc ô đen giữa cơn mưa thu Seoul.`;

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

  console.log("=== BƯỚC 1: NẠP KỊCH BẢN LOGIC CHUẨN XÁC & KHÓA DNA ===");
  const setup = await evalInIframe(`(async () => {
    // 1. Khóa chuẩn DNA cho cả hai nhân vật
    const actors = [
      {
        id: "actor_man",
        name: "Min-woo",
        aliases: ["Min-woo", "chàng trai", "chàng trai Min-woo", "người đàn ông"],
        roles: ["nam chính"],
        traits: "Hàn Quốc, 28 tuổi, luôn mặc áo măng tô màu be (beige coat), cầm ô đen",
        mediaId: "2da727f8-51ea-4636-9672-01040d89324e",
        type: "actor"
      },
      {
        id: "actor_woman",
        name: "Seo-yeon",
        aliases: ["Seo-yeon", "cô gái", "cô gái Seo-yeon", "nàng", "thiếu nữ"],
        roles: ["nữ chính"],
        traits: "Hàn Quốc, 25 tuổi, luôn mặc áo len cổ lọ màu kem (cream turtleneck), cầm ô trong suốt",
        mediaId: "68308d31-0bc3-4ad9-9b73-cd863cd6e59d",
        type: "actor"
      }
    ];
    window.__CLEAN_APP__.setActors(actors);

    // 2. Điền kịch bản
    const textareas = Array.from(document.querySelectorAll("textarea"));
    const scriptArea = textareas.find(t => t.placeholder?.includes("kịch bản phân cảnh") || t.placeholder?.includes("SCENE")) || textareas[2];
    const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
    nativeSetter.call(scriptArea, ${JSON.stringify(LOGICAL_SCRIPT)});
    scriptArea.dispatchEvent(new Event("input", { bubbles: true }));
    scriptArea.dispatchEvent(new Event("change", { bubbles: true }));

    await new Promise(r => setTimeout(r, 400));

    // 3. Nhấn nút Timeline để tạo lại Scene cards sạch
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

  console.log("Cấu hình dự án:", JSON.stringify(setup, null, 2));

  console.log("\n=== BƯỚC 2: BẮT ĐẦU RENDER BATCH ===");
  await evalInIframe(`(() => {
    window.__CLEAN_APP__.renderBatch(true);
    return true;
  })()`);

  console.log("Đã phát lệnh render. Tiến trình đang chạy!");
  ws.close();
}

main().catch(err => {
  console.error("Lỗi:", err);
  process.exit(1);
});
