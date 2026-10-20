# 🎬 Film Studio

Một dự án duy nhất để làm phim AI trên Google Flow: **viết kịch bản → tách cảnh → render từng cảnh trong Flow (nối frame cuối sang cảnh sau) → ghép thành phim**.

Gộp từ hai dự án cũ:

| Nguồn | Vai trò trong dự án này |
| --- | --- |
| `gflow-cli` | **Engine** (`src/` ngoài `src/studio/`): điều khiển Flow trong Chrome đã đăng nhập của bạn bằng Playwright — image, video, frames, character, extend, batch. Lệnh `gflow ...` vẫn dùng nguyên như cũ. |
| `Film` (bản cũ) | **Quy trình làm phim**: kịch bản `SCENE n:`, nối cảnh bằng frame cuối, ghép phim bằng ffmpeg, dashboard web, xuất batch YAML. Viết lại thành `src/studio/` (lệnh `film ...`). |

## Yêu cầu

Node.js ≥ 20, Google Chrome, ffmpeg trong `PATH`, tài khoản Google có Flow.

```bash
npm install
npm run build
npm link            # tạo lệnh `film` và `gflow` (hoặc dùng: npm run dev -- <lệnh>)
gflow auth login    # đăng nhập Google một lần
gflow doctor        # kiểm tra phiên
```

> Đã đăng nhập sẵn ở `C:\learning\gflow-cli`? Dùng lại profile đó:
> `set GFLOW_PROFILE_DIR=C:\learning\gflow-cli\.gflow\profiles`

## Quy trình làm một bộ phim

```bash
# 1. Tạo dự án từ kịch bản (xem examples/kdrama-autumn.md)
film new "Mùa Thu Seoul" --script examples/kdrama-autumn.md

# 2. Khai báo nhân vật: mô tả được chèn vào prompt của mọi cảnh có nhân vật xuất hiện
film character add mua-thu-seoul Minwoo --alias Min-woo \
     --description "Hàn Quốc, 28 tuổi, áo măng tô be, tóc đen ướt"
film character add mua-thu-seoul Seoyeon --alias Seo-yeon --flow-name "Seo-yeon" \
     --description "Hàn Quốc, 25 tuổi, áo len cổ lọ màu kem"
film import mua-thu-seoul projects/mua-thu-seoul/script.md   # nhận diện lại ai xuất hiện ở cảnh nào

# 2b. (Tuỳ chọn) Tạo character trong Flow để giữ gương mặt nhất quán, rồi gán bằng --flow-name
gflow character create --project <flowProjectId> --name Seo-yeon      --prompt "Photorealistic Korean woman, 25, long black hair, cream turtleneck sweater"      --description "warm and shy"
gflow character list --project <flowProjectId>

# 3. Chỉnh style/model/tỉ lệ nếu cần: projects/mua-thu-seoul/film.json

# 4. Render (có thể dừng/chạy lại — cảnh đã xong được bỏ qua)
film render mua-thu-seoul
film status mua-thu-seoul

# 5. Ghép phim
film stitch mua-thu-seoul          # -> projects/mua-thu-seoul/final.mp4
```

### Render: thử lại, tạm dừng, cấu hình

- Lỗi tạm thời (Flow báo generation failed, UI/timeout, tải video lỗi) được thử lại tối đa `maxRetries` lần (mặc định 2), cách nhau `retryDelay` giây. Bị rate limit thì chờ lâu hơn (ít nhất 60 giây, tăng dần).
- Cảnh bị Flow **chặn vì chính sách** không được render lại: prompt giữ nguyên thì sẽ lại bị chặn, mà lần nào cũng tốn credit. Hãy sửa prompt cảnh đó rồi chạy `film render` lại.
- Hết credit, phải đăng nhập lại hoặc cần thao tác tay thì dừng ngay.
- `--continue-on-error`: khi một cảnh lỗi, bỏ qua các cảnh nối liền với nó và render tiếp từ cảnh `[CUT]` kế tiếp. Cuối lượt có tổng kết, và lệnh trả mã lỗi nếu có cảnh hỏng.
- `film.json` được đọc lại trước mỗi cảnh, nên sửa prompt, Pause/Resume hay đổi cấu hình trên dashboard đều có tác dụng với các cảnh chưa render. Các trường dùng được: `renderTimeout` (giây/cảnh), `retryDelay` (giây), `maxRetries`, `renderDelay` (giây nghỉ giữa các cảnh), `isPaused`.
- Ctrl+C hoặc nút Dừng Khẩn Cấp đưa cảnh đang chạy về `pending` để lần sau render lại.
- **Project trên Flow**: lần render đầu tạo một project Flow mới và lưu id của nó vào `film.json` (`flowProjectId`); các lần render sau quay lại đúng project đó. Muốn dùng project có sẵn thì đặt `flowProject` (tên project) hoặc `flowProjectId`; xoá `flowProjectId` để bắt đầu project mới.
- Engine luôn mở Flow bằng giao diện tiếng Anh (`hl=en`), nên tài khoản Google dùng ngôn ngữ nào cũng chạy được.
- Lần đầu tải frame lên, Flow có thể hỏi "Rights to use this image": engine dừng chờ bạn trả lời trong cửa sổ Chrome (tối đa 5 phút), không tự đồng ý.
- `film stitch --only-rendered` ghép bản xem trước từ các cảnh đã render.
- **Character của Flow** (`flowName`): Flow chỉ gắn character ở chế độ *Ingredients*; chế độ *Frames* (bắt đầu đúng frame cuối cảnh trước) không nhận character. Cảnh mở đầu một đoạn (cảnh đầu tiên, cảnh `[CUT]`, hoặc khi tắt continuity) luôn được gắn character. Cảnh nối tiếp tuỳ theo `continuityMode` trong `film.json` (hoặc ô "Nối cảnh" trên dashboard; ghi đè từng cảnh bằng `scenes[].continuityMode`):
  - `"frames"` (mặc định): bắt đầu đúng frame cuối cảnh trước, liền mạch tuyệt đối, nhưng không gắn character. Nếu frame cuối không thấy rõ mặt nhân vật (cận tay, cảnh quá rộng), Flow sẽ tự "đoán" ra gương mặt khác.
  - `"ingredients"`: gắn character Flow, kèm frame cuối cảnh trước làm ảnh tham chiếu. Gương mặt giữ đúng, đổi lại điểm nối gần giống chứ không khớp từng pixel. Chỉ áp dụng cho cảnh có character Flow; cảnh không có thì vẫn dùng `"frames"`.

  Character thuộc về từng project Flow, nên phải tạo trong đúng project mà `flowProjectId` trỏ tới. Thiếu character thì engine báo lỗi **trước** khi bấm tạo video (không tốn credit). Prompt kịch bản yêu cầu cảnh nối tiếp kết thúc ở cỡ trung hoặc cận, thấy rõ mặt nhân vật, để frame cuối mang theo được gương mặt.

### Thể loại (genre preset)

Mỗi dự án bắt đầu từ một preset thể loại (`src/studio/domain/genres.ts`). Preset gồm: style video chèn vào mọi cảnh, prompt phân rã truyện (`storyPrompt`), prompt ảnh tham chiếu nhân vật và bối cảnh, và quy tắc ảnh. Các giá trị này được ghi vào `film.json` lúc tạo dự án, sau đó sửa tự do trên dashboard hoặc trong file.

- `drama`: phim người thật hiện đại, nhịp chậm, cảm xúc. Ví dụ: `examples/kdrama-autumn.md`.
- `wuxia`: kiếm hiệp cổ trang. Hán phục, võ thuật có trọng lượng thật; mỗi scene một nhịp động tác theo một hướng, scene giao đấu không có thoại, bay nhảy dùng cảnh rộng, không rút kiếm giữa trận, hiệu ứng (nước, lá) phải có nguyên nhân vật lý; thoại cổ phong; không máu me. Ví dụ: `examples/kiem-hiep-truc-lam.md`.

Với mọi thể loại, dòng `Shot:` của kịch bản viết bằng tiếng Anh (mô hình video hiểu tiếng Anh chính xác nhất), chỉ thoại giữ tiếng Việt. Flow chỉ nhận nội dung sau `Shot:`; các dòng `Nhân vật:`/`Bối cảnh:` dùng để nhận diện nhân vật và bối cảnh. Mô tả nhân vật (`--description`) cũng nên viết bằng tiếng Anh, vì nó được gửi kèm mọi cảnh có nhân vật đó.

```bash
film new "Kiếm Hiệp Trúc Lâm" --genre wuxia --script examples/kiem-hiep-truc-lam.md
film breakdown truyen.txt --project kiem-hiep-truc-lam   # prompt phân rã theo thể loại của dự án
```

### Kịch bản

- Mỗi cảnh bắt đầu bằng `SCENE 1:` / `CẢNH 1:` / `PHÂN CẢNH 1:`; nội dung có thể nằm cùng dòng hoặc dòng dưới.
- Thêm `[CUT]` hoặc `[CẮT CẢNH]` để **cắt cứng**: cảnh đó không lấy frame cuối của cảnh trước làm frame đầu.
- Các cảnh còn lại được nối liền: frame cuối của cảnh N (trích bằng ffmpeg) thành `--start-frame` của cảnh N+1.

### Lệnh `film`

| Lệnh | Việc |
| --- | --- |
| `film new <title> [--script f] [--genre g]` | Tạo dự án trong `projects/<slug>/`, bắt đầu từ preset thể loại (mặc định `drama`) |
| `film genres` | Danh sách preset thể loại: `drama` (tâm lý, tình cảm), `wuxia` (kiếm hiệp cổ trang) |
| `film list` / `film status <p>` | Danh sách dự án / trạng thái từng cảnh |
| `film import <p> <script>` | Thay danh sách cảnh bằng kịch bản mới (xoá tiến độ cũ) |
| `film character add <p> <name>` | `--description`, `--alias`, `--image`, `--flow-name` (tên character đã lưu trong Flow, truyền vào `--character`) |
| `film render <p>` | `--scene <id>` (lặp được), `--force`, `--no-continuity`, `--continue-on-error`, `--max-retries <n>`, `--no-headed`, `--profile`, `--browser` |
| `film plan <p> [-o f.yaml]` | Xuất pipeline cho `gflow batch` (không có nối frame) |
| `film stitch <p> [-o f.mp4]` | Ghép bằng ffmpeg: copy luồng, tự encode lại nếu clip khác codec/kích thước |
| `film dashboard [--port 3333]` | Web UI Hollywood Suite tại `http://127.0.0.1:3333`: 7 Tabs toàn trình, 1-Click Full Auto, 360° DNA Bible, Storyboard Crop Grid, Auto-Loop Engine, Master Cinema Export, Live SSE Logs. |

Thư mục dự án chứa `film.json` (cấu hình + cảnh + nhân vật + bối cảnh), `script.md`, `state.json` (tiến độ), `renders/` (video + slot frames), `final.mp4`. Đổi chỗ lưu bằng biến `FILM_HOME`.

### Tính năng chuẩn:
- **7 Phân Hệ Tabs**:
  1. 🎬 **Timeline (Bàn Dựng Phân Cảnh)**: Multi-Slot Frames (`Story`, `Shot`, `First`, `Last`), chỉnh sửa prompt trực tiếp, nút `Render Cảnh Này`, `[CUT] / [NỐI]`, `Auto-Heal`, `Viết Take Mới`, `Xóa Cảnh`.
  2. 📜 **Kịch Bản & Phân Rã**: Sliding window 150-200 từ, trích xuất cấu trúc chuẩn SCENE 10s Hollywood, DOP Live-Action Prompt editor.
  3. 🧬 **Thư Viện DNA (360° Bible)**: Hồ sơ Diễn viên (Chroma Key 5 góc, Voice Casting) và Bối cảnh Kiến trúc (Location Sheets).  4. 🖼️ **Storyboard & Grid Crop**: Cắt ảnh lưới 2x2 hoặc 3x3 thành các Shot riêng biệt qua FFmpeg native.
  5. 🔄 **Auto-Loop Engine**: Tự động viết lại kịch bản theo phiên bản mới (Takes) và render lặp vô tận.
  6. 🏆 **Phim Master**: Bình thường hóa luồng (30fps, 30000 timescale, yuv420p, libx264, aac) & Lossless GPU Concat.
  7. 📟 **Nhật Ký (Live Terminal)**: Stream SSE thời gian thực có bộ lọc `Done`, `Fail`, `Heal`, `Render`.
- **Top Actions**: `🚀 1-Click Full Auto`, `⏸️ Pause / Resume`, `🛑 Dừng Khẩn Cấp`, `🔄 Reset Chờ`, `⚙️ Cấu Hình Nâng Cao`.


## Cấu trúc

Mã nguồn chia thành các module; mỗi module có một `index.ts` mô tả nó làm gì và được phép phụ thuộc vào module nào. Các module khác chỉ import qua `index.js` đó. ESLint (`no-restricted-imports`) chặn mọi import đi tắt hoặc ngược tầng.

```
src/core/               hợp đồng dùng chung: lỗi, schema job, interface FlowAutomation, URL Flow, đường dẫn, version
src/browser/            phiên Playwright, profile Chrome                         -> core
src/flow/               tự động hoá Google Flow (FlowPage, CharacterPage, ...)   -> core
src/gflow/              lệnh `gflow` và batch runner                             -> core, browser, flow
src/studio/domain/      dự án phim, kịch bản, thể loại, prompt, thao tác sửa phim -> core
src/studio/media/       ffmpeg: trích frame, ghép phim, cắt storyboard           (độc lập)
src/studio/render/      pipeline render, chỉ dùng FlowAutomation                 -> core, domain, media
src/studio/dashboard/   API HTTP + giao diện (public/index.html, app.js, styles.css) -> core, domain, media, render
src/studio/cli.ts       lệnh `film`, nối các module lại với nhau
tests/                  test unit, fixture Playwright và test dashboard trên trình duyệt
examples/               pipeline.yaml, kdrama-autumn.md, kiem-hiep-truc-lam.md
```

Flow đổi giao diện thì chỉ sửa `src/flow/`. Thêm thể loại hay prompt mới thì chỉ sửa `src/studio/domain/`.

## Phát triển

```bash
npm run dev -- status mua-thu-seoul   # chạy `film` từ source
npm run gflow -- doctor               # chạy `gflow` từ source
npm test && npm run lint
```

Các test fixture của engine cần trình duyệt của Playwright: chạy `npx playwright install chromium` một lần trước `npm test`.

## Giấy phép

MIT. Engine © swissmarley (gflow-cli). `gflow` là công cụ không chính thức, không liên kết với Google; bạn tự chịu trách nhiệm tuân thủ điều khoản của Google Flow.
