// ============================================================
// Cinematic Prompts, Production Directives & Safety Keywords
// ============================================================

export const DEFAULT_STORY_PROMPT = `Phân tích truyện, ý tưởng và hình ảnh tham khảo đính kèm (nếu có).
Viết cho mình kịch bản quay phim điện ảnh chi tiết, thể loại bám sát truyện, bám sát cốt truyện, không được phép sáng tạo thêm. văn phong, ngôn ngữ phù hợp người Việt Nam . Yêu cầu: 

* Cấu trúc cố định của 1 SCENE 10 giây bao gồm:
Bắt đầu với chữ SCENE.
Liệt kê tên nhân vật.
Liệt kê tên bối cảnh chính xác.
Mỗi shot, chỉ ghi shot, không ghi thời gian và bao gồm các thành phần sau: (Tên nhân vật, Bối cảnh nhất quán với toàn bộ câu chuyện, Từng shot và hành động cụ thể của từng nhân vật, Biểu cảm, hành động và trạng thái cảm xúc. Ghi rõ thoại của nhân vật, luôn ghi tên nhân vật trước thoại. Khi nhân vật nào nói, camera phải chuyển/hướng phong cách điện ảnh rõ ràng về đúng nhân vật đó, ghi rõ tên nhân vật được quay. Diễn biến phải liên tục, logic, dễ quay và có cao trào. Thoại tự nhiên, đúng chất drama hài hước Việt Nam).
* Các shot phải liên kết mượt mà, không nhảy cảnh vô lý.
* Mỗi scene chỉ có duy nhất 1 từ “SCENE”.
  Chỉ xuất kịch bản theo từng SCENE, không giải thích gì thêm`;

export const DEFAULT_SYSTEM_PROMPT = `Sử dụng các hình ảnh tham khảo đã tải lên làm nguồn dữ liệu hình ảnh chuẩn xác tuyệt đối. Đọc toàn bộ kịch bản trước khi bắt đầu tạo hình ảnh.

Đóng vai một ê-kíp gồm đạo diễn, đạo diễn hình ảnh (DOP), biên tập viên và huấn luyện viên diễn xuất từng đoạt giải thưởng tại Hollywood. Chuyển hóa kịch bản thành một bộ phim điện ảnh live-action siêu chân thực. Nắm vững cốt truyện, nhân vật, các mối quan hệ, động cơ, xung đột, nhịp độ, diễn biến cảm xúc và các tầng ý nghĩa ngầm. THỂ HIỆN BẰNG HÌNH ẢNH, ĐỪNG KỂ LỂ. Góc máy phải nương theo cảm xúc, không phải lời thoại.

PHONG CÁCH ĐIỆN ẢNH: Live-action đời thực, photorealistic, tự nhiên, không CGI, bố cục thanh thoát, chiều sâu không gian chân thực, chất liệu vật lý chính xác, ánh sáng có nguồn rõ ràng và độ tương phản điện ảnh tiết chế. Ưu tiên texture da, lỗ chân lông, tóc con, nếp vải, bóng đổ và phản chiếu tự nhiên. Tránh da nhựa, làm đẹp quá mức, ánh sáng giả, HDR, bloom và vẻ ngoài nhân tạo.

DIỄN XUẤT: Hơi thở, chớp mắt, cử động mắt, khoảng lặng, cử chỉ tinh tế, vi biểu cảm và cảm xúc được tiết chế một cách tự nhiên. Tránh lối diễn xuất máy móc, đồng bộ hóa động tác hoặc cường điệu.

GÓC MÁY: Mang đậm chất điện ảnh khổ lớn (large-format), đa dạng các cỡ cảnh (toàn, trung, cận, OTS, POV), chuyển động máy có chủ đích, tự nhiên như máy quay thật. Tránh lặp lại bố cục khung hình, lạm dụng xóa phông hoặc chuyển động máy vô lý.

TÍNH NHẤT QUÁN: Giữ nguyên tuyệt đối đặc điểm nhận dạng nhân vật, khuôn mặt, độ tuổi, kiểu tóc, trang phục từ ảnh tham chiếu.

QUY TẮC XUẤT: Với lệnh tạo ảnh thì ghi rõ thời gian từng cảnh trên ảnh. Với lệnh tạo video thì chọn đúng thứ tự cảnh, không có chữ trên video.`;

export const DEFAULT_DIRECTIONAL_PROMPT = `Phong cách hiện đại, nhân vật trẻ đẹp, nữ rất xinh xắn và trang phục lộng lẫy, chân dài và cao. Với mỗi nhân vật, tạo ảnh thiết kế nhân vật theo phong cách người thật, điện ảnh, chân thực cao.

Ghi rõ thông tin trên ảnh:
· Tên nhân vật
· Tuổi
· Ngoại hình
· Khuôn mặt
· Kiểu tóc
· Dáng người
· Trang phục phù hợp với thời đại và hoàn cảnh trong kịch bản
· Phụ kiện đặc trưng
· Đặc điểm nhận diện cố định
· DNA giọng nói chính xác
· Toàn thân chính diện
· Góc 3/4
· Góc nghiêng
· Mặt sau
· Cận mặt

Giữ khuôn mặt, vóc dáng, tóc, độ tuổi và các đặc điểm nhận diện NHẤT QUÁN tuyệt đối để có thể sử dụng làm reference cho tất cả cảnh sau này. Xuất ảnh Phông nền xanh chroma key sạch, đồng nhất, ánh sáng mềm mại, bố cục chuyên nghiệp, phù hợp làm ảnh tham chiếu nhân vật cho phim AI.`;

export const DEFAULT_LOCATION_DIRECTIONAL_PROMPT = `Phong cách hiện đại. Mỗi bối cảnh phải được thiết kế thành ảnh tham chiếu bối cảnh riêng, không phải ảnh minh họa một shot cụ thể.

Thể hiện rõ và ghi rõ thông tin trên ảnh:
· Tên bối cảnh
· Kiến trúc
· Không gian
· Bố cục tổng thể
· Nội thất
· Đồ vật đặc trưng
· Cửa, cửa sổ, cầu thang, bàn ghế, giường, tủ... nếu có
· Chất liệu
· Màu sắc
· Ánh sáng
· Thời đại
· Phong cách kiến trúc
· Các chi tiết cần duy trì nhất quán trong những cảnh quay sau

Bối cảnh phải được thể hiện ở góc nhìn điện ảnh rộng, rõ không gian và các vật thể quan trọng, KHÔNG có nhân vật đứng trong ảnh, trừ khi nhân vật là một phần cố định của thiết kế bối cảnh.`;

export const DEFAULT_HEAL_INSTRUCTION = `Viết lại kịch bản bằng các từ đồng nghĩa để tránh vi phạm. Nhưng vẫn giữ nguyên cốt truyện của kịch bản. Kịch bản mới có số từ bằng kịch bản cũ. Chỉ xuất scene.`;

export const DEFAULT_STORYBOARD_PROMPT = `Professional cinematic storyboard sketch, detailed pencil lines, clear composition, visual guide for the scene action.`;

export const DEFAULT_LOOP_REWRITE_PROMPT = `Dựa trên kịch bản gốc của cảnh này, hãy viết lại một phiên bản mới với diễn biến khác đi một chút, tăng tính kịch tính hoặc thay đổi góc nhìn nhưng vẫn giữ nguyên nhân vật và bối cảnh. Đảm bảo ngôn ngữ điện ảnh chuyên nghiệp.`;

export const DEFAULT_IMAGE_PRODUCTION_RULE = `Professional photorealistic cinematography, 8k resolution, high fidelity, cinematic lighting, ultra-detailed textures, highly consistent facial features and environment from references.`;

export const ADVERSARIAL_MUTATION_PROMPT = `Professional cinematic portrait. Redesign facial features to be 100% unique and strictly non-celebrity. MUST RETAIN identical hair style, eye color, skin texture, clothing, and background from reference. Highest fidelity.`;

// The 23 safety keywords monitored by the auto-healing loop
export const SAFETY_KEYWORDS = [
  "safety", "policy", "content", "filter", "violation", "flagged", "blocked",
  "unsafe", "harmful", "sensitive", "prohibited", "an toàn", "chính sách",
  "vi phạm", "từ chối", "bộ lọc", "nhạy cảm", "giới hạn", "ngôn ngữ",
  "hình ảnh", "celebrity", "famous person", "safety celebrity"
] as const;

export const CELEBRITY_KEYWORDS = [
  "celebrity", "famous person", "safety celebrity", "người nổi tiếng", "khuôn mặt nhận dạng"
] as const;
