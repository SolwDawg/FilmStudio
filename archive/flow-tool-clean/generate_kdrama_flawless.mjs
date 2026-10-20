import fs from "fs";
import path from "path";
import { execSync } from "child_process";

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

  console.log("=== BƯỚC 1: KHỞI TẠO CHARACTER DNA ĐỂ KHÓA DIỆN MẠO NHÂN VẬT ===");

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

  // 1. Generate Character DNA images using Flow.generate.image
  const dnaResult = await evalInIframe(`(async () => {
    try {
      const { Flow } = await import("flow-sdk");
      
      console.log("[DNA] Đang tạo chân dung DNA cho Chàng trai (Min-woo)...");
      const actorMan = await Flow.generate.image({
        prompt: "Photorealistic 8k Korean handsome 28yo actor, sharp jawline, black hair parted slightly wet with autumn rain, wearing stylish beige trench coat, warm emotional brown eyes, Seoul Gangnam street night bokeh, cinematic portrait lighting, highly detailed skin texture.",
        modelDisplayName: "🍌 Nano Banana Pro",
        aspectRatio: "1:1"
      });
      
      console.log("[DNA] Đang tạo chân dung DNA cho Cô gái (Seo-yeon)...");
      const actorWoman = await Flow.generate.image({
        prompt: "Photorealistic 8k Korean beautiful 25yo actress, delicate gentle facial features, long wavy black hair resting on shoulders, wearing elegant cream turtleneck sweater, emotional glistening eyes with subtle tears, Seoul autumn rain atmosphere, cinematic portrait photography.",
        modelDisplayName: "🍌 Nano Banana Pro",
        aspectRatio: "1:1"
      });
      
      const actors = [
        {
          id: "actor_man_" + Date.now(),
          name: "chàng trai",
          aliases: ["chàng trai", "Min-woo", "người đàn ông"],
          roles: ["nam chính"],
          traits: "Hàn Quốc, 28 tuổi, áo măng tô be, tóc đen",
          mediaId: actorMan.mediaId,
          base64: actorMan.base64,
          mimeType: actorMan.mimeType,
          type: "actor"
        },
        {
          id: "actor_woman_" + Date.now(),
          name: "cô gái",
          aliases: ["cô gái", "Seo-yeon", "người phụ nữ"],
          roles: ["nữ chính"],
          traits: "Hàn Quốc, 25 tuổi, áo len cổ lọ kem, tóc xoăn đen",
          mediaId: actorWoman.mediaId,
          base64: actorWoman.base64,
          mimeType: actorWoman.mimeType,
          type: "actor"
        }
      ];
      
      window.__CLEAN_APP__.setActors(actors);
      return {
        success: true,
        manMediaId: actorMan.mediaId,
        womanMediaId: actorWoman.mediaId
      };
    } catch (e) {
      return { success: false, error: e.message, stack: e.stack };
    }
  })()`);

  console.log("Kết quả tạo DNA nhân vật:", JSON.stringify(dnaResult, null, 2));
  if (!dnaResult?.success) {
    console.error("Lỗi tạo DNA!");
    ws.close();
    return;
  }

  console.log("\n=== BƯỚC 2: THIẾT LẬP 3 SCENE CHUẨN ĐIỆN ẢNH VÀ NỐI FRAME CHÍNH XÁC ===");

  const setupScenesResult = await evalInIframe(`(() => {
    try {
      const scenes = [
        {
          id: "scene_1_" + Date.now(),
          chunkIndex: 0,
          title: "SCENE 1",
          rawText: "SCENE 1:\\n(Cinematic medium-wide tracking shot) Ngã tư phố Gangnam Seoul đêm mưa thu, lá cây ngân hạnh rơi trên mặt đường ướt phản chiếu ánh đèn neon. Chàng trai trong chiếc áo măng tô màu be bước xuống từ chiếc xe hơi sang trọng. Anh sải bước qua vỉa hè lát đá, ánh mắt hướng về phía trước ngỡ ngàng khi nhìn thấy bóng hình quen thuộc giữa dòng người. Không khí điện ảnh K-drama lãng mạn, 8k photorealistic.",
          status: "idle",
          imageStatus: "idle",
          disableContinuity: false
        },
        {
          id: "scene_2_" + Date.now(),
          chunkIndex: 1,
          title: "SCENE 2",
          rawText: "SCENE 2:\\n(Cinematic medium shot, góc quay đối diện sang vỉa hè) Dưới ánh đèn đường vàng ấm áp ở góc phố Gangnam, cô gái mặc áo len cổ lọ màu kem trang nhã đang cầm chiếc ô trong suốt che mưa. Ánh mắt ngấn lệ của cô chậm rãi ngước lên chạm vào ánh nhìn từ xa. Ngón tay cô run rẩy từ từ buông lỏng cán ô, chiếc ô trong suốt trượt rơi xuống mặt đường ướt mưa. Cảnh quay giữ cự ly trung cảnh bao quát cô gái và chiếc ô vừa chạm đất.",
          status: "idle",
          imageStatus: "idle",
          disableContinuity: true // Đảo góc quay chuẩn điện ảnh (Shot-Reverse Shot), không giật lùi camera từ mắt chàng trai
        },
        {
          id: "scene_3_" + Date.now(),
          chunkIndex: 2,
          title: "SCENE 3",
          rawText: "SCENE 3:\\n(Cinematic pull-back tracking shot, nối tiếp khoảnh khắc chiếc ô rơi) Ngay khi chiếc ô trong suốt chạm mặt đường lát đá ướt mưa, máy quay kéo lùi mượt mà. Chàng trai bung chiếc ô đen lớn chạy nhanh tới che mưa cho cô gái. Anh vươn tay ôm lấy bờ vai cô gái, cả hai đứng đối diện nhau dưới chiếc ô đen giữa cơn mưa thu Seoul, hơi thở phả khói mỏng, ánh mắt xúc động xót xa yêu thương.",
          status: "idle",
          imageStatus: "idle",
          disableContinuity: false // Khóa cứng 100% End Frame của Scene 2 làm Start Frame
        }
      ];

      window.__CLEAN_APP__.setScenes(scenes);
      return { success: true, sceneCount: scenes.length };
    } catch (e) {
      return { success: false, error: e.message };
    }
  })()`);

  console.log("Thiết lập Scene hoàn tất:", setupScenesResult);

  console.log("\n=== BƯỚC 3: KÍCH HOẠT BATCH RENDER CHO 3 CẢNH ===");

  await evalInIframe(`(() => {
    window.__CLEAN_APP__.renderBatch(true);
    return { started: true };
  })()`);

  console.log("Đã kích hoạt renderBatch(true). Bắt đầu theo dõi quá trình render...");
  ws.close();
}

main();
