# Film Studio: nâng cấp sắp tới và kế hoạch chuyển sang app

Tổng hợp từ phiên làm việc ngày 20/10/2026. Phần A là việc còn lại cho công cụ hiện tại. Phần B là kế hoạch build lại thành app kiểu node/plugin (giống ComfyUI).

## Hiện trạng

- Nhánh `fix/render-pipeline-and-prompts`, chưa push. Các commit trong phiên:
  - `e06bfdb` Sửa render Flow từ đầu đến cuối, gia cố pipeline, viết lại prompt
  - `3406a3d` Character của Flow, preset thể loại, chế độ nối cảnh Ingredients
  - `79edc1c` Chia module, sửa phụ thuộc ngược, xoá code cũ không dùng
  - `b2d70cd` `index.ts` cho từng module, ESLint chặn import xuyên tầng
  - `f1b0294` Rút logic phim ra khỏi server dashboard
  - `6df38eb` Dashboard phục vụ từ file tĩnh (`public/`)
  - `6f04f5c` Sửa `character list` trả về rỗng
- 140 test pass, `tsc` và ESLint sạch, `npm run build` chạy được.
- Cấu trúc module: `core` → `browser` / `flow` → `gflow`; `studio/domain`, `studio/media` → `studio/render` → `studio/dashboard`; `studio/cli.ts` nối các module lại với nhau.

## A. Nâng cấp sắp tới cho công cụ hiện tại

### A1. Việc cần làm ngay
- [ ] Khởi động lại dashboard (`npm run dashboard`). Process cũ (PID 17708) vẫn chạy code từ trước khi tái cấu trúc, và từng xoá `flowProjectId` khỏi `film.json`.
- [ ] Push nhánh và tạo pull request.
- [ ] Quyết định có commit những thứ đang nằm ngoài git không: việc xoá `AGENTS.md` và `archive/` (người dùng đã xoá), `CLAUDE.md` (chưa từng được commit, đã cập nhật phần Architecture), `projects/` (dữ liệu test).
- [ ] Xoá trên Flow các project test thừa: `fa75251b…`, `1a7565fa…`, `23d1b1ad…` và project trống `741e2b45…`. Giữ lại `6e950b98…` (test-omni) và `785b5111…` (kiếm hiệp).

### A2. Phim mẫu kiếm hiệp (`projects/kiem-hiep-truc-lam`)
Scene 1–3 đã render ở chế độ Frames. Độ liền mạch giữa các cảnh: 1→2 là 0,94; 2→3 là 0,92. Gương mặt giữ đúng.
- [ ] Cảnh thoại tĩnh dùng thời lượng ngắn hơn (`"duration": 6`). Ở cảnh 8 giây, Omni tự thêm một pha đánh vào giây cuối.
- [ ] Sửa mô tả thanh kiếm của Lăng Phong. Cụm "black-sheathed sword" làm nhân vật có lúc cầm cả vỏ; nên tả kiếm trần khi giao đấu.
- [ ] Tạo character Flow cho Mộ Dung Tuyết **không đeo khăn**, để Flow có gương mặt rõ. Scene 6 là cảnh `[CUT]` nên gắn được character.
- [ ] Render scene 4–7 (48 credit, cộng character Tuyết), rồi ghép `final.mp4`.

### A3. Prompt và kịch bản
- [ ] Prompt kịch bản thêm quy tắc: cảnh thoại tĩnh không quá 6 giây, hoặc ghi rõ "giữ yên đến hết shot".
- [ ] Hướng dẫn và kiểm tra để mô tả nhân vật (`--description`) viết bằng tiếng Anh, vì nó đi thẳng vào prompt video.
- [ ] Cân nhắc cho `film character add` sinh sẵn prompt tạo character Flow từ mô tả.
- [ ] Thêm thể loại mới: hành động hiện đại, cổ trang Việt, hoạt hình (cần sửa style, prompt ảnh nhân vật và bối cảnh, quy tắc ảnh).

### A4. Engine và pipeline
- [ ] **Tải video thất bại sau khi Flow đã tạo xong thì đang render lại (tốn credit).** Cần lấy lại video từ kết quả đã có trên Flow thay vì tạo mới.
- [ ] Test fixture cho bước tải frame Start/End. Hiện mới có fixture cho ảnh tham chiếu ở chế độ Ingredients.
- [ ] Bỏ qua bước chọn cài đặt khi Flow đã ở đúng chế độ/model/tỉ lệ (tối ưu đã hoãn từ trước).
- [ ] Chế độ nối cảnh kết hợp: mặc định `frames`, tự chuyển sang `ingredients` cho cảnh mà frame cuối của cảnh trước không thấy rõ mặt nhân vật (cần cách nhận diện gương mặt).
- [ ] Lệnh `film doctor --live`: kiểm tra nhanh các selector Flow trên trang thật mà không tốn credit.

### A5. Những điều đã biết về Google Flow (tháng 10/2026)
- Character chỉ gắn được ở chế độ **Ingredients**. Chế độ **Frames** chỉ có hai ô Start/End.
- Chọn một character trong picker đôi khi thêm ngay, đôi khi phải bấm thêm "Add to prompt".
- Popover dùng Angular CDK (`.cdk-overlay-pane`), không còn Radix.
- Trang tạo character: `/project/<id>/character`. Danh sách character: bộ lọc "Characters", mỗi character là một `flow-character-tile`.
- Thanh bên có các bộ lọc "Images"/"Videos" trùng chữ với nút chọn chế độ, nên regex chọn chế độ phải neo đầu và cuối chuỗi.
- Hộp thoại "Rights to use this image" do người dùng tự trả lời. Engine chờ, không bấm thay.
- Omni 720p 8 giây tốn 12 credit mỗi lần tạo.

### A6. Không làm
- Endpoint "heal" của dashboard (thay từ nhạy cảm để lách bộ lọc) giữ nguyên, không phát triển thêm. Các helper "adversarial" lách bộ lọc người nổi tiếng đã bị xoá.

## B. Kế hoạch chuyển sang app kiểu node/plugin

### B1. Các quyết định chính
| Quyết định | Lựa chọn | Lý do |
| --- | --- | --- |
| Cách build | Thay dần từng phần trong monorepo mới | Code hiện có chạy được với Flow thật; giữ lệnh `film` cũ chạy song song đến khi bản mới làm được đủ việc |
| Ngôn ngữ / vỏ desktop | **TypeScript + Electron** | Playwright là thư viện Node; tái dùng gần hết code; plugin dùng npm; UI và engine chung kiểu dữ liệu. Tauri (Rust) hay Wails (Go) vẫn phải chạy Node kèm cho Playwright |
| Mô hình | Đồ thị node có kiểu dữ liệu + timeline | Dữ liệu phim (asset) tách khỏi quy trình (đồ thị); timeline và trình soạn node cùng sửa một mô hình |
| So với ComfyUI | Tự build, có thể cắm ComfyUI vào làm provider | Làm phim cần cache theo credit, nối cảnh tuần tự, chạy lâu và resume được |
| Rust / Go | Chỉ dùng cho plugin chạy ngoài process khi cần | Go hợp cho backend điều phối nhiều người dùng; Rust hợp cho xử lý media hay model chạy trên máy |

**Nút thắt hiệu năng là thời gian Flow render và credit, không phải engine.** Hiệu năng đến từ cache, lập lịch và cách xử lý media, không đến từ việc chọn ngôn ngữ nhanh hơn.

### B2. Kiến trúc
```
UI: React + Vite + @xyflow/react (trình soạn node + timeline + xem trước)
        │ REST (OpenAPI sinh từ zod) + WebSocket (tiến độ, log)
Server: Fastify
        │
Engine: lập lịch theo tài nguyên · cache theo hash · cổng chi phí · resume (SQLite WAL) · kho blob
        │
SDK:    defineNode / defineProvider · kiểu dữ liệu · phân loại lỗi · JSON Schema
        │
Plugin: core · script · media · provider-flow · provider-veo · provider-comfyui · ...
```

### B3. Monorepo
```
packages/
  sdk/        kiểu dữ liệu, defineNode/defineProvider, lỗi, schema → JSON Schema
  engine/     scheduler, cache, kho blob, SQLite, nạp plugin
  server/     Fastify REST + WebSocket
  ui/         React + Vite + @xyflow/react, Zustand, TanStack Query
  cli/        film run | doctor | plugin create
  testkit/    ctx giả, provider giả, testNode(), fixture
plugins/
  core/           Text, Scene[], ForEach, Approve, Merge
  script/         parse, breakdown, preset thể loại      ← studio/domain
  media/          lastFrame, stitch, crop, proxy         ← studio/media
  provider-flow/  Playwright + selector Flow             ← flow/ + browser/
  provider-veo/, provider-comfyui/
templates/        wuxia-7-canh.json, kdrama.json
```
Công cụ: pnpm workspaces + Turborepo, tsup, vitest, changesets, Node 22 LTS.

### B4. Node SDK (dạng mẫu)
```ts
export default defineNode({
  id: "flow.renderVideo", version: 1, category: "Video",
  inputs:  { prompt: T.Text, startFrame: T.Image.optional(), characters: T.Character.list() },
  outputs: { video: T.Video, lastFrame: T.Image },
  params:  z.object({ model: z.string().default("Omni"), duration: z.number().default(8),
                      continuity: z.enum(["frames", "ingredients"]).default("frames") }),
  cost: () => ({ credits: 12 }),
  async run(ctx, inputs, params) {
    const video = await ctx.provider("video").generate({ ...inputs, ...params });
    return { video, lastFrame: await ctx.node("media.lastFrame", { video }) };
  }
});
```

### B5. Hiệu năng
- **Cache theo nội dung:** khoá = hash(node, version, tham số, hash đầu vào, version provider). Kết quả lưu trong kho blob đặt tên theo SHA-256. Muốn tạo lại thì đổi `seed`/`variant`.
- **Chỉ chạy lại phần bị đổi.** Ở chế độ Frames, sửa cảnh N thì cảnh N trở đi chạy lại, và UI báo trước số credit sẽ tốn.
- **Lập lịch theo tài nguyên:** `flow-browser: 1`, `veo-api: theo rate limit`, `ffmpeg: số nhân CPU / 2`, `gpu-encode: 1`. Khi cảnh N đang render, ffmpeg chuẩn hoá cảnh N−1 cùng lúc.
- **Các đoạn ngăn bởi `[CUT]` chạy song song** khi có từ hai phiên provider trở lên.
- **Media không đi qua bộ nhớ JS:** cổng nối chỉ truyền tham chiếu blob, server stream bằng HTTP Range, UI dùng proxy 360p và thumbnail.
- **UI:** sự kiện gộp lại, tối đa khoảng 10 lần/giây; đồ thị lớn được ảo hoá; plugin chỉ nạp khi cần.

### B6. Độ tương thích
- SDK theo semver. Node có `version` + `migrate()`, file đồ thị có `schemaVersion`.
- **Plugin chạy trong process** (TypeScript) hoặc **ngoài process qua JSON-RPC trên stdio** (Python, Rust, Go...). Lỗi trong plugin không kéo sập engine.
- Provider ComfyUI gọi API HTTP của ComfyUI để dùng lại hệ sinh thái của nó.
- Những chi tiết riêng của Windows (cổng debug của Chrome, liệt kê process, taskkill) nằm trong adapter của `provider-flow`. ffmpeg có bản kèm sẵn để dự phòng. CI chạy Windows, macOS và Linux.
- Selector Flow chỉ nằm trong `provider-flow`, có contract test trên fixture và `doctor --live`.

### B7. Phát triển
- Viết hợp đồng trước: node và provider chỉ phụ thuộc SDK. Có `testNode()` với ctx giả và provider giả; test toàn đồ thị không tốn credit; test chạy thật trên Flow chỉ chạy khi bật cờ.
- Phân loại lỗi chuẩn trong SDK: `transient | rate-limited | blocked | failed | stop`. Không bao giờ thử lại khi bị chặn vì chính sách.
- `film plugin create`, plugin tự nạp lại khi sửa code lúc dev, tài liệu node sinh từ schema.
- Log có cấu trúc (pino), mỗi lần chạy có bản ghi thời gian từng node và sổ credit.

### B8. Điểm mở rộng
Node, kiểu dữ liệu (kèm cách serialize và component xem trước), provider (video, ảnh, LLM, TTS), widget UI (web component), template đồ thị, hook (lúc bắt đầu chạy, lúc một node xong, lúc vượt mức chi phí), exporter (EDL, phụ đề...). Mỗi plugin khai báo quyền trong manifest (mạng, trình duyệt, ghi file); app chỉ nạp plugin từ nguồn tin cậy, và chạy plugin lạ trong process riêng.

### B9. Code hiện tại chuyển sang đâu
| Hiện tại | App mới |
| --- | --- |
| `src/core/` | `packages/sdk` (kiểu dữ liệu, lỗi, contract) |
| `src/flow/` + `src/browser/` | `plugins/provider-flow` |
| `src/studio/domain/` | `plugins/script` (+ template thể loại) |
| `src/studio/media/` | `plugins/media` |
| `src/studio/render/pipeline.ts` | `packages/engine` + node `ForEachScene` |
| `src/studio/dashboard/` | `packages/ui` + `packages/server` |
| `src/gflow/`, `src/studio/cli.ts` | `packages/cli` |

### B10. Lộ trình
| Giai đoạn | Nội dung | Hoàn thành khi |
| --- | --- | --- |
| 1 | SDK + engine chạy không giao diện + testkit; chuyển `script` và `media` thành plugin | `film run wuxia.json` cho ra kết quả giống pipeline hiện tại, test bằng provider giả |
| 2 | Cache, resume, cổng chi phí, lập lịch tài nguyên; `provider-flow` | Sửa một cảnh thì chỉ cảnh đó (và các cảnh nối sau) render lại; có ước tính credit trước khi chạy |
| 3 | Server + UI: trình soạn node, timeline, xem trước, tiến độ trực tiếp | Làm được cả phim mẫu chỉ bằng giao diện; bỏ dashboard cũ |
| 4 | Plugin ngoài process + provider thứ hai (Veo API hoặc ComfyUI); template đồ thị | Đổi provider mà không sửa đồ thị |
| 5 | Đóng gói Electron, cập nhật tự động | Cài được trên Windows và macOS, chạy với profile Chrome đã đăng nhập |
