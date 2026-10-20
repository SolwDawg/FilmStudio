# 🎬 G-FLOW FILM STUDIO (UNIFIED SUITE)

Hệ thống sản xuất phim tự động toàn diện kết hợp giữa **Google Flow Studio Applet** (phiên bản sạch, mở khóa 100% từ `flow-tool-src`) và **gflow-cli** (công cụ tự động hóa điều khiển Chrome CDP).

---

## 🌟 Tính Năng Đã Mở Khóa & Kết Hợp

1. **Giao Diện Studio (In-Browser Tool):**
   - **Xóa bỏ hoàn toàn MLT Guard & DRM**: Không còn bảng đăng nhập khóa bản quyền, tài khoản kích hoạt sẵn `ULTRA ELITE (CLEAN)` vĩnh viễn.
   - **Mở khóa 999 Phân cảnh (Max Scenes = 999)**: Thay vì bị bóp 20-50 cảnh như bản cũ.
   - **Mở khóa toàn bộ Model cao cấp**: `Veo 3.1 - Quality`, `Veo 3.1 - Fast`, `Omni 1.1 Flash`, `🍌 Nano Banana Pro`.
   - **Bypass Celebrity Filter (Adversarial DNA Mutation)**: Tự động tạo video 4s preview 360p để test chính sách nhận diện người nổi tiếng của Google, nếu bị chặn sẽ tự động biến dị khuôn mặt qua Nano Banana Pro giữ nguyên thần thái.
   - **Auto-Healing Filter Prompt**: Phát hiện 17 từ khóa vi phạm (English & Tiếng Việt) và tự động gọi Gemini viết lại prompt an toàn.
   - **Storyboard Multi-Crop**: Tự chia lưới 2x2 hoặc 3x3 và cắt frame trong trình duyệt qua FFmpeg WASM.
   - **I2V Continuity**: Trích xuất khung hình cuối cùng bằng Canvas HTML5 để làm frame mồi cho cảnh tiếp theo.

2. **Tích Hợp gflow-cli & Native FFmpeg:**
   - **Native FFmpeg 9.0 GPU Acceleration**: Ghép video phim dài 10-50 cảnh siêu tốc chỉ trong vài giây, không tốn RAM và không bị giới hạn bộ nhớ trình duyệt.
   - **Batch Pipeline Runner**: Chuyển đổi dự án `.json` xuất từ Studio thành file `.yaml` cho `gflow batch` để render tự động ở chế độ nền (Headless).
   - **Auto Watch Daemon**: Tự động phát hiện và nạp Studio sạch vào Google Flow mỗi khi refresh trang (F5).

---

## 🚀 Hướng Dẫn Sử Dụng

### 1. Khởi chạy Web Dashboard Companion
Mở bảng điều khiển trực quan tại `http://localhost:3333`:
```bash
cd C:\learning\Film
npm start
```
Từ Dashboard bạn có thể:
- Xem trực tiếp trạng thái kết nối Chrome CDP (Cổng 9222) và trạng thái applet.
- Bấm **"Mở Google Flow & Nạp Studio"** bằng 1 cú click.
- Bấm **"Nạp lại ngay (Force Inject)"** nếu muốn mount lại applet.

### 2. Sử dụng qua dòng lệnh (CLI):

- **Nạp Studio sạch vào tab Google Flow đang mở:**
  ```bash
  node gflow-clean-studio.mjs inject --force
  ```

- **Chạy chế độ Daemon (Tự động nạp khi F5):**
  ```bash
  node gflow-clean-studio.mjs watch
  ```

- **Khởi chạy Chrome và mở Google Flow:**
  ```bash
  node gflow-clean-studio.mjs launch
  ```

- **Chuyển đổi file dự án JSON đã lưu thành file Batch YAML:**
  ```bash
  node gflow-clean-studio.mjs to-batch "du_an_phim.json" "pipeline.yaml"
  ```

- **Chạy tạo hàng loạt video bằng gflow-cli:**
  ```bash
  npx --prefix C:\learning\gflow-cli gflow batch pipeline.yaml
  ```

- **Ghép toàn bộ video trong thư mục bằng Native FFmpeg 9.0:**
  ```bash
  node gflow-clean-studio.mjs stitch "C:\learning\Film\gflow-output" "Phim_Hoan_Chinh.mp4"
  ```

---

## 📁 Cấu Trúc Thư Mục

- [flow-tool-clean/](file:///c:/learning/Film/flow-tool-clean): Mã nguồn sạch của applet Studio đã mở khóa (App.tsx, ffmpegService, bundle esbuild).
- [gflow-clean-studio.mjs](file:///c:/learning/Film/gflow-clean-studio.mjs): Bộ điều khiển đa năng kết nối Google Flow qua CDP, quản lý nạp và xuất dữ liệu.
- [gflow-studio-server.mjs](file:///c:/learning/Film/gflow-studio-server.mjs): Web Dashboard máy chủ cục bộ (Port 3333).
- [package.json](file:///c:/learning/Film/package.json): Các lệnh script npm tiện ích.
- `C:\learning\gflow-cli`: Bộ engine CLI Playwright điều khiển sinh ảnh, video và quản lý character.
