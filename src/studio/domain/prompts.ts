// ============================================================
// Cinematic Prompts & Production Directives
// ============================================================
//
// Two audiences, kept apart on purpose:
// - LLM prompts (story breakdown, rewrites): instructions, roles, rules, output format.
// - Generation prompts (video style, reference images, storyboard): pure visual description.
//   Video/image models do not follow instructions or role-play; every word is read as something
//   to depict, so meta-instructions there only dilute the shot (and "write X on the image" puts
//   garbled text into frames).

// Replaced with the scene length (film.duration) by buildStoryChunkPrompt.
export const DURATION_PLACEHOLDER = "{{DURATION}}";

export const DEFAULT_STORY_PROMPT = `Bạn là biên kịch kiêm đạo diễn hình ảnh (DOP) của một ê-kíp phim điện ảnh. Chuyển truyện / ý tưởng bên dưới (và ảnh tham khảo đính kèm, nếu có) thành kịch bản phân cảnh cho phim AI live-action. Mỗi SCENE sẽ được render thành MỘT clip video dài khoảng ${DURATION_PLACEHOLDER} giây bằng một mô hình tạo video; các clip nối tiếp nhau bằng frame cuối của clip trước.

NỘI DUNG
- Bám sát cốt truyện, nhân vật, các mối quan hệ và thể loại của truyện gốc; không thêm tình tiết mới.
- Thể hiện bằng hình ảnh và hành động, không kể lể. Góc máy nương theo cảm xúc của nhân vật.
- Diễn biến liên tục, logic, dễ quay và có cao trào. Thoại tự nhiên, phù hợp người Việt.
- Diễn xuất tiết chế: ánh mắt, hơi thở, khoảng lặng, cử chỉ nhỏ; không cường điệu.
- Mỗi scene một nhịp hành động liền mạch. Mô hình video kém khi chuyển đột ngột từ chuyển động nhanh (chạy, xô xát) sang đứng yên nói chuyện: tách phần hành động và phần thoại thành hai scene.

ĐỊNH DẠNG (bắt buộc, đúng từng dòng)
SCENE <số>:
Nhân vật: <tên chuẩn, cách nhau bằng dấu phẩy; hoặc "Không có">
Bối cảnh: <tên bối cảnh tiếng Việt, viết giống hệt nhau mỗi lần xuất hiện>
Shot: <viết bằng TIẾNG ANH: cỡ cảnh và chuyển động máy, nơi chốn và ánh sáng, rồi hành động, biểu cảm trong ${DURATION_PLACEHOLDER} giây; gọi nhân vật bằng tên chuẩn> <Tên nhân vật>: "<thoại tiếng Việt>"

QUY TẮC
1. Đánh số liên tục SCENE 1:, SCENE 2:, ... Mỗi scene chỉ có duy nhất một dòng bắt đầu bằng "SCENE".
2. Mỗi scene đúng MỘT shot: một clip ${DURATION_PLACEHOLDER} giây không chứa được nhiều góc máy. Cần nhiều góc máy thì tách thành nhiều scene.
3. Dòng Shot viết bằng tiếng Anh (mô hình video hiểu tiếng Anh chính xác nhất), câu ngắn, mô tả trực diện cái máy quay nhìn thấy; tự tả lại nơi chốn trong câu đầu vì mô hình không đọc dòng "Bối cảnh". Chỉ thoại giữ tiếng Việt.
4. Thoại: tối đa 2 câu ngắn (khoảng 15 từ) mỗi scene, luôn ghi tên nhân vật trước thoại và đặt thoại trong ngoặc kép. Máy quay hướng về đúng người đang nói.
5. Liền mạch: nếu scene tiếp nối scene trước (cùng địa điểm, cùng thời điểm), mở đầu đúng vị trí, tư thế, ánh sáng mà scene trước kết thúc. Khi scene sau nối tiếp, kết thúc shot ở cỡ trung hoặc cận, thấy rõ gương mặt và trang phục của nhân vật chính (cả mũ, phụ kiện nếu có): frame cuối là ảnh mở đầu của scene sau, nên đừng kết thúc bằng cận tay, đồ vật hay một cảnh quá rộng.
6. Khi đổi địa điểm, nhảy thời gian hoặc chuyển sang tuyến nhân vật khác, viết [CUT] ngay sau "SCENE <số>:" trên cùng dòng.
7. Luôn gọi nhân vật bằng đúng tên chuẩn, không thay bằng "anh ấy", "cô ta", "nàng".
8. Giữ trang phục, kiểu tóc nhất quán giữa các scene, trừ khi truyện có thay đổi.
9. Không mô tả chữ, phụ đề, logo hay biển hiệu có chữ trong khung hình.

Chỉ xuất các SCENE theo định dạng trên, không giải thích gì thêm.

VÍ DỤ (chỉ minh họa định dạng, không dùng lại nội dung):
SCENE 1:
Nhân vật: Min-woo
Bối cảnh: Ngã tư Gangnam đêm mưa
Shot: (Medium-wide tracking shot) A rainy Gangnam crossing at night, neon reflecting on wet asphalt. Min-woo in a beige trench coat steps out of a car and freezes as he recognizes someone across the street; the camera pans to the opposite sidewalk.

SCENE 2:
Nhân vật: Seo-yeon
Bối cảnh: Ngã tư Gangnam đêm mưa
Shot: (Medium shot, continuing the pan) The same rainy crossing. Seo-yeon holds a clear umbrella, her eyes filling with tears; her grip loosens and the umbrella drops onto the wet road. Seo-yeon: "Là anh thật sao?"

SCENE 3: [CUT]
Nhân vật: Seo-yeon
Bối cảnh: Quán cà phê Bukchon
Shot: (Wide establishing shot, slow dolly-in) A small Bukchon café the next morning, autumn sun through the windows. Seo-yeon sits by the window reading a letter.`;

// Default `film.style` for new projects: prepended to EVERY scene's video prompt, so it stays
// short and purely visual. The scene's own action must not be drowned out by it.
export const DEFAULT_VIDEO_STYLE = `Live-action, photorealistic cinematic footage, large-format cinema camera. Natural motivated lighting, restrained contrast, real skin texture, natural hair and fabric. Subtle, natural acting. Purposeful, realistic camera movement. Faces, ages, hair and outfits match the character references. No on-screen text, subtitles or watermarks.`;

export const DEFAULT_DIRECTIONAL_PROMPT = `Ảnh tham chiếu nhân vật (character reference sheet) phong cách người thật, điện ảnh, siêu chân thực, dùng làm chuẩn nhận diện cho mọi cảnh quay sau.

- Ngoại hình, độ tuổi, vóc dáng, kiểu tóc, trang phục và phụ kiện đúng theo mô tả nhân vật bên dưới và đúng thời đại, hoàn cảnh của kịch bản; không tự làm đẹp, làm trẻ hay thay đổi vóc dáng.
- Một ảnh gồm 5 góc của cùng một người, xếp thành một hàng ngang, cùng tỉ lệ: toàn thân chính diện, toàn thân góc 3/4, toàn thân góc nghiêng, toàn thân phía sau, cận mặt.
- Khuôn mặt, tóc, trang phục, phụ kiện giống hệt nhau ở cả 5 góc.
- Phông nền xanh chroma key trơn, đồng nhất; ánh sáng studio mềm, đều, không bóng gắt.
- Không có chữ, nhãn, số, chú thích hay logo trong ảnh.`;

export const DEFAULT_LOCATION_DIRECTIONAL_PROMPT = `Ảnh tham chiếu bối cảnh (location reference) phong cách người thật, điện ảnh, siêu chân thực, dùng làm chuẩn cho mọi cảnh quay diễn ra tại đây, không phải ảnh minh họa một shot cụ thể.

- Kiến trúc, nội thất, vật liệu, màu sắc, thời đại và phong cách đúng theo mô tả bối cảnh bên dưới.
- Góc rộng ngang tầm mắt, thấy rõ bố cục không gian, lối vào, cửa sổ và các đồ vật quan trọng sẽ xuất hiện trong cảnh.
- Ánh sáng tự nhiên, có nguồn rõ ràng, đúng thời điểm trong ngày của kịch bản.
- Không có người trong ảnh.
- Không có chữ, nhãn, chú thích hay logo được thêm vào ảnh.`;

export const DEFAULT_HEAL_INSTRUCTION = `Viết lại kịch bản bằng các từ đồng nghĩa để tránh vi phạm. Nhưng vẫn giữ nguyên cốt truyện của kịch bản. Kịch bản mới có số từ bằng kịch bản cũ. Chỉ xuất scene.`;

// The storyboard image is cut into equal cells (storyboard.ts), so the panels must tile the image
// exactly: no borders, gutters or margins, which would shift every cut.
export const DEFAULT_STORYBOARD_PROMPT = `Cinematic storyboard drawn as a grid of equal-size panels that fill the whole image edge to edge, with no borders, gutters or margins. One panel per shot, in reading order (left to right, top to bottom). Clean pencil sketch, clear staging and composition, consistent characters across panels. No captions, numbers or text.`;

export const DEFAULT_LOOP_REWRITE_PROMPT = `Viết lại cảnh này thành một take khác: đổi cách diễn, góc máy hoặc nhịp độ để kịch tính hơn, nhưng giữ nguyên nhân vật, bối cảnh và thoại chính. Giữ nguyên trạng thái mở đầu và kết thúc của cảnh (vị trí, tư thế, ánh sáng) để vẫn nối liền với cảnh trước và cảnh sau. Giữ đúng định dạng SCENE gốc, chỉ xuất scene.`;

export const DEFAULT_IMAGE_PRODUCTION_RULE = `Photorealistic live-action film still. Natural motivated lighting, realistic lens perspective and depth of field, true-to-life skin, hair and fabric texture. Faces, outfits and environment match the reference images exactly. No text or watermarks.`;
