// ============================================================
// Genre presets: the prompt set a new project starts from
// ============================================================
//
// A preset only fills the project's own fields (style, storyPrompt, directionalPrompt, ...) when the
// project is created; afterwards they are ordinary settings the user edits on the dashboard or in
// film.json. A field a preset leaves out falls back to the default prompt in prompts.ts.

import {
  DEFAULT_DIRECTIONAL_PROMPT,
  DEFAULT_IMAGE_PRODUCTION_RULE,
  DEFAULT_LOCATION_DIRECTIONAL_PROMPT,
  DEFAULT_STORY_PROMPT,
  DEFAULT_VIDEO_STYLE,
  DURATION_PLACEHOLDER
} from "./prompts.js";

export interface GenrePreset {
  label: string;
  description: string;
  style: string;
  storyPrompt: string;
  directionalPrompt: string;
  locationDirectionalPrompt: string;
  imageProductionRule: string;
}

// Video style: prepended to every scene prompt, so short and purely visual (see prompts.ts). It
// names no places or props: every word here is drawn into EVERY scene, so "inns, lanterns" in
// the style pulled attention away from a bamboo-forest duel.
const WUXIA_VIDEO_STYLE = `Live-action Chinese wuxia period film, photorealistic, large-format cinema camera. Layered silk hanfu and period hairstyles, real fabric and hair moving with the motion. Grounded martial arts with real weight, gravity and momentum; bodies stay in contact with the ground except for brief, clearly motivated leaps. Weapons keep their shape. Muted jade and ink-wash color grade. Faces, ages, hair, outfits and weapons match the character references. No modern objects, no on-screen text, subtitles or watermarks.`;

const WUXIA_STORY_PROMPT = `Bạn là biên kịch kiêm chỉ đạo võ thuật và đạo diễn hình ảnh (DOP) của một ê-kíp phim kiếm hiệp cổ trang. Chuyển truyện / ý tưởng bên dưới (và ảnh tham khảo đính kèm, nếu có) thành kịch bản phân cảnh cho phim AI live-action. Mỗi SCENE sẽ được render thành MỘT clip video dài khoảng ${DURATION_PLACEHOLDER} giây bằng một mô hình tạo video; các clip nối tiếp nhau bằng frame cuối của clip trước.

NỘI DUNG
- Bám sát cốt truyện, nhân vật, ân oán và các mối quan hệ (sư môn, môn phái, huynh muội) của truyện gốc; không thêm tình tiết mới.
- Thế giới giang hồ Trung Hoa cổ đại: núi sương, rừng trúc, khách điếm, đình viện, bến đò. Không có đồ vật hiện đại.
- Kể bằng hình ảnh: ánh mắt, gió thổi tà áo, khoảng lặng trước khi ra tay. Xen cảnh tĩnh (đối mặt, dò xét) trước và sau mỗi pha giao đấu để giữ nhịp.
- Thoại cổ phong, ngắn và hàm súc; xưng hô đúng vai vế: tại hạ, các hạ, cô nương, công tử, huynh, muội, sư phụ, tiền bối.

VÕ THUẬT (mô hình video giỏi chuyển động liền một mạch, kém khi chuyển trạng thái đột ngột)
- Mỗi scene chỉ MỘT nhịp động tác theo một hướng: ví dụ "lao tới và đâm", "đỡ đòn rồi lùi lại thủ thế". Không dồn nhiều giai đoạn trái ngược (bay xuống, đâm, xoay người đỡ, dừng lại nói) vào một scene; tách thành nhiều scene.
- Scene giao đấu KHÔNG có thoại. Thoại đặt ở scene riêng, nhân vật đã đứng yên, cỡ trung hoặc cận.
- Cỡ cảnh theo biên độ động tác: bay nhảy, khinh công, lao từ trên cao, nhiều người giao đấu dùng Wide hoặc Full shot, thấy đủ khoảng trống phía trên và quanh nhân vật. Cận cảnh chỉ cho động tác nhỏ (siết chuôi kiếm, ánh mắt).
- Binh khí: trong giao đấu, nhân vật đã cầm sẵn binh khí trần. Rút kiếm hay tra kiếm vào vỏ là một scene tĩnh riêng, quay chậm.
- Mọi hiệu ứng phải có nguyên nhân vật lý rõ ràng: nước bắn lên khi chân dẫm vào vũng nước, lá rơi khi kiếm chém qua cành trúc, tà áo bay theo hướng chuyển động. Không để nước, lá hay ánh sáng tự bung ra từ lưỡi kiếm.
- Trọng lực thật: người bật lên rồi rơi xuống, không lơ lửng; thân thể có quán tính khi dừng.
- Không tả máu me, vết thương hay cảnh chém giết chi tiết; thắng thua thể hiện qua thế kiếm, binh khí văng khỏi tay, mũi kiếm dừng sát cổ.

ĐỊNH DẠNG (bắt buộc, đúng từng dòng)
SCENE <số>:
Nhân vật: <tên chuẩn, cách nhau bằng dấu phẩy; hoặc "Không có">
Bối cảnh: <tên bối cảnh tiếng Việt, viết giống hệt nhau mỗi lần xuất hiện>
Shot: <viết bằng TIẾNG ANH: cỡ cảnh và chuyển động máy, nơi chốn và thời tiết, rồi hành động trong ${DURATION_PLACEHOLDER} giây; gọi nhân vật bằng tên chuẩn> <Tên nhân vật>: "<thoại tiếng Việt>"

QUY TẮC
1. Đánh số liên tục SCENE 1:, SCENE 2:, ... Mỗi scene chỉ có duy nhất một dòng bắt đầu bằng "SCENE".
2. Mỗi scene đúng MỘT shot: một clip ${DURATION_PLACEHOLDER} giây không chứa được nhiều góc máy. Cần nhiều góc máy thì tách thành nhiều scene.
3. Dòng Shot viết bằng tiếng Anh (mô hình video hiểu tiếng Anh chính xác nhất), câu ngắn, mô tả trực diện cái máy quay nhìn thấy; tự tả lại nơi chốn và thời tiết trong câu đầu vì mô hình không đọc dòng "Bối cảnh". Chỉ thoại giữ tiếng Việt.
4. Thoại: tối đa 2 câu ngắn (khoảng 15 từ) mỗi scene, luôn ghi tên nhân vật trước thoại và đặt thoại trong ngoặc kép. Máy quay hướng về đúng người đang nói.
5. Liền mạch: nếu scene tiếp nối scene trước (cùng địa điểm, cùng thời điểm), mở đầu đúng vị trí, tư thế, binh khí và ánh sáng mà scene trước kết thúc. Khi scene sau nối tiếp, kết thúc shot ở cỡ trung hoặc cận, thấy rõ gương mặt và trang phục của nhân vật chính (cả nón, binh khí nếu có): frame cuối là ảnh mở đầu của scene sau, nên đừng kết thúc bằng cận tay, đồ vật hay một cảnh quá rộng.
6. Khi đổi địa điểm, nhảy thời gian, hồi tưởng hoặc chuyển sang tuyến nhân vật khác, viết [CUT] ngay sau "SCENE <số>:" trên cùng dòng.
7. Luôn gọi nhân vật bằng đúng tên chuẩn, không thay bằng "he", "she", "hắn", "nàng".
8. Giữ trang phục, kiểu tóc và binh khí của mỗi nhân vật nhất quán giữa các scene (kiếm vẫn ở tay phải, vỏ kiếm vẫn đeo sau lưng...), trừ khi truyện có thay đổi.
9. Không mô tả chữ, câu đối, biển hiệu, bức thư hay cuộn giấy có chữ đọc được trong khung hình.

Chỉ xuất các SCENE theo định dạng trên, không giải thích gì thêm.

VÍ DỤ (chỉ minh họa định dạng, không dùng lại nội dung):
SCENE 1:
Nhân vật: Lăng Phong
Bối cảnh: Rừng trúc dưới mưa
Shot: (Wide shot, slow push-in) Misty bamboo forest in steady rain. Lăng Phong stands still on a muddy path, left hand on his sheathed sword, rain dripping from the rim of his bamboo hat; he slowly turns his head toward rustling leaves behind him, ending in a medium shot on his face.

SCENE 2:
Nhân vật: Lăng Phong, Mộ Dung Tuyết
Bối cảnh: Rừng trúc dưới mưa
Shot: (Wide tracking shot) Misty bamboo forest in steady rain. Lăng Phong already holds his drawn sword. Mộ Dung Tuyết runs in from the left across the mud, splashing through puddles, and lunges with both short swords; Lăng Phong turns and sweeps both blades aside, and they both slide back into guard stances a sword's length apart.

SCENE 3:
Nhân vật: Lăng Phong, Mộ Dung Tuyết
Bối cảnh: Rừng trúc dưới mưa
Shot: (Medium two-shot, static) Misty bamboo forest in steady rain. Lăng Phong and Mộ Dung Tuyết stand still in guard stances, breathing hard, rain running down their blades. Lăng Phong: "Cô nương là ai?"

SCENE 4: [CUT]
Nhân vật: Mộ Dung Tuyết
Bối cảnh: Khách điếm ven sông
Shot: (Medium close-up, static) A riverside inn at night, lit by one flickering candle. Mộ Dung Tuyết sits alone at a wooden table, slowly removes her face veil and looks down at a broken sword in front of her.`;

const WUXIA_DIRECTIONAL_PROMPT = `Ảnh tham chiếu nhân vật (character reference sheet) cho phim kiếm hiệp cổ trang, phong cách người thật, điện ảnh, siêu chân thực, dùng làm chuẩn nhận diện cho mọi cảnh quay sau.

- Ngoại hình, độ tuổi, vóc dáng, kiểu tóc, trang phục và phụ kiện đúng theo mô tả nhân vật bên dưới; không tự làm đẹp, làm trẻ hay thay đổi vóc dáng.
- Trang phục cổ trang Trung Hoa may thật: áo bào, hán phục nhiều lớp bằng lụa, gấm hoặc vải thô, đai lưng, giày vải; tóc dài búi hoặc buộc cao với trâm, phát quan hoặc dây buộc tóc.
- Binh khí riêng của nhân vật (kiếm, đao, quạt, sáo...) cầm hoặc đeo đúng vị trí sẽ dùng trong phim.
- Một ảnh gồm 5 góc của cùng một người, xếp thành một hàng ngang, cùng tỉ lệ: toàn thân chính diện, toàn thân góc 3/4, toàn thân góc nghiêng, toàn thân phía sau, cận mặt.
- Khuôn mặt, tóc, trang phục, binh khí giống hệt nhau ở cả 5 góc.
- Phông nền xanh chroma key trơn, đồng nhất; ánh sáng studio mềm, đều, không bóng gắt.
- Không có chữ, nhãn, số, chú thích hay logo trong ảnh.`;

const WUXIA_LOCATION_DIRECTIONAL_PROMPT = `Ảnh tham chiếu bối cảnh (location reference) cho phim kiếm hiệp cổ trang, phong cách người thật, điện ảnh, siêu chân thực, dùng làm chuẩn cho mọi cảnh quay diễn ra tại đây, không phải ảnh minh họa một shot cụ thể.

- Kiến trúc, cảnh vật, vật liệu và màu sắc đúng theo mô tả bối cảnh bên dưới, đúng Trung Hoa cổ đại: gỗ, ngói, đá, giấy dán cửa, đèn lồng; núi non, rừng trúc, sông hồ.
- Không có đồ vật, dây điện, đèn điện hay công trình hiện đại.
- Góc rộng ngang tầm mắt, thấy rõ bố cục không gian, lối vào và các đồ vật quan trọng sẽ xuất hiện trong cảnh.
- Ánh sáng tự nhiên, có nguồn rõ ràng (trời, đèn lồng, nến), đúng thời điểm trong ngày của kịch bản.
- Không có người trong ảnh.
- Không có chữ, câu đối, biển hiệu có chữ, chú thích hay logo trong ảnh.`;

const WUXIA_IMAGE_PRODUCTION_RULE = `Photorealistic live-action still from a Chinese wuxia period film. Ancient China setting with no modern objects. Natural motivated lighting from daylight, lanterns or candles, realistic lens perspective and depth of field, true-to-life skin, hair, silk and fabric texture. Faces, outfits, weapons and environment match the reference images exactly. No text or watermarks.`;

export const GENRES = {
  drama: {
    label: "Tâm lý, tình cảm",
    description: "Phim người thật hiện đại, nhịp chậm, cảm xúc (mặc định)",
    style: DEFAULT_VIDEO_STYLE,
    storyPrompt: DEFAULT_STORY_PROMPT,
    directionalPrompt: DEFAULT_DIRECTIONAL_PROMPT,
    locationDirectionalPrompt: DEFAULT_LOCATION_DIRECTIONAL_PROMPT,
    imageProductionRule: DEFAULT_IMAGE_PRODUCTION_RULE
  },
  wuxia: {
    label: "Kiếm hiệp cổ trang",
    description: "Giang hồ Trung Hoa cổ đại: hán phục, rừng trúc, khinh công, kiếm pháp",
    style: WUXIA_VIDEO_STYLE,
    storyPrompt: WUXIA_STORY_PROMPT,
    directionalPrompt: WUXIA_DIRECTIONAL_PROMPT,
    locationDirectionalPrompt: WUXIA_LOCATION_DIRECTIONAL_PROMPT,
    imageProductionRule: WUXIA_IMAGE_PRODUCTION_RULE
  }
} satisfies Record<string, GenrePreset>;

export type GenreId = keyof typeof GENRES;
export const DEFAULT_GENRE: GenreId = "drama";

export function isGenreId(value: unknown): value is GenreId {
  return typeof value === "string" && Object.hasOwn(GENRES, value);
}

// The preset for a project's genre; unknown or missing genres get the default.
export function genrePreset(genre?: string): GenrePreset {
  return GENRES[isGenreId(genre) ? genre : DEFAULT_GENRE];
}
