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

### Kịch bản

- Mỗi cảnh bắt đầu bằng `SCENE 1:` / `CẢNH 1:` / `PHÂN CẢNH 1:`; nội dung có thể nằm cùng dòng hoặc dòng dưới.
- Thêm `[CUT]` hoặc `[CẮT CẢNH]` để **cắt cứng**: cảnh đó không lấy frame cuối của cảnh trước làm frame đầu.
- Các cảnh còn lại được nối liền: frame cuối của cảnh N (trích bằng ffmpeg) thành `--start-frame` của cảnh N+1.

### Lệnh `film`

| Lệnh | Việc |
| --- | --- |
| `film new <title> [--script f]` | Tạo dự án trong `projects/<slug>/` |
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

```
src/            engine gflow-cli (browser/, flow/, jobs/, cli.ts)
src/studio/     lớp làm phim (project, script, pipeline, ffmpeg, cli, server, dashboard)
tests/          test của engine + studio.test.ts
examples/       pipeline.yaml, kdrama-autumn.md
archive/        tài liệu & script từ thư mục Film cũ (không dùng trong dự án mới)
```

## Phát triển

```bash
npm run dev -- status mua-thu-seoul   # chạy `film` từ source
npm run gflow -- doctor               # chạy `gflow` từ source
npm test && npm run lint
```

Các test fixture của engine cần trình duyệt của Playwright: chạy `npx playwright install chromium` một lần trước `npm test`.

## Giấy phép

MIT. Engine © swissmarley (gflow-cli). `gflow` là công cụ không chính thức, không liên kết với Google; bạn tự chịu trách nhiệm tuân thủ điều khoản của Google Flow.
