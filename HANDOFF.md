# Reed: bàn giao cho phiên mới

Dán nội dung phần "PROMPT" bên dưới vào phiên mới (cwd: `E:\Your English`).

---

## PROMPT

Tôi đang làm **Reed**, web app học tiếng Anh một file HTML (`E:\Your English\index.html`). Bạn tiếp quản từ phiên trước. Hãy đọc `HANDOFF.md`, `platform-plan.md`, `Meet\adaptive-learning-spec-v4.md`, rồi `git log --oneline | head -30` trước khi sửa. Luôn trả lời tiếng Việt, ngắn gọn, nói rõ cái gì đã kiểm tra và cái gì chưa.

### 1. App là gì
- Đọc ngắn (~50 từ/bài), cuộn từng bước: câu A1 → chạm/cuộn để cụm từ đổi sang A2 (tự nhiên hơn). Nghe giọng nam/nữ (Kokoro mp3), ghi âm giọng mình, sổ tay từ vựng, 7 chủ đề (Family, Friends, School, Work, Lifestyle, Health, Tech), 9 bài.
- Một file `index.html`, không build. Mọi chỉnh sửa phải đồng bộ **3 nơi**: `index.html` → `deploy/index.html` → `netlify-upload/index.html` (`cp`). Người dùng tự kéo thư mục **`netlify-upload/`** (≈16MB) lên Netlify bằng tay (không kéo `deploy/` vì có `export/` 111MB thừa). Dự án đã `git init`, commit sau mỗi thay đổi (author `luanh <bxvinh0908711110@gmail.com>`, kèm dòng `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`).
- Site live: https://yourenglish1.netlify.app

### 2. Cấu trúc code (trong `index.html`)
- `<script type="text/plain" id="appSrc">` chứa app chính; một loader (script thường) nạp bài từ Supabase (có cache `localStorage reed_lessons_v1`, dự phòng dữ liệu nhúng `ALL`) rồi mới chạy `appSrc`.
- Dữ liệu bài: mảng `ALL` (mỗi bài: `topic, level, scene, cat, tpl` có chỗ trống `{0}`,`{1}`… và `hl[]` = {o,u,lv,vn,ex}). `PRACTICE` = bài tập "Welcome to Reed" (không lên DB).
- Engine cuộn: `P` (câu/slide), `layout()`, `update()`, `goStep(dir)` (1 vuốt/lăn/phím = đúng 1 bước, scroll gốc bị tắt: `html{overflow:hidden}`), `lockBoundY` (khoá bài theo tiến trình, lưu `reed_unlocked_<topic>`).
- Module chính: `Tips` (gợi ý đúng lúc), `Practice` (bài tập làm), `Tour` (tour 9 bước spotlight + mũi tên + hộp chào mừng), `Rec` (ghi âm), panel chỉnh ảnh hero (`?edit`).
- `AUDIO` = map câu → `aNNN` (file `audio/female|male/aNNN.mp3`, 259 câu). Câu nào chưa có thì dùng giọng trình duyệt.
- Thanh player `#player` ẩn ở trang chủ (`.away`), trượt lên khi vào bài. Nút mic `#micBtn` trong player.

### 3. Hạ tầng
- **Supabase** (project `reed`): URL `https://mmadhhjjfqnlhitklfep.supabase.co`, khoá publishable/anon đã nằm trong loader. Migration: `supabase/migrations/0001_init.sql`, `0002_category.sql`; seed: `supabase/seed.sql` (xoá + nạp lại toàn bộ), `supabase/seed_from_8.sql` (chỉ thêm Health/Tech). Sinh seed: `node supabase/make-seed.mjs [--from=N]`. **Không bao giờ** dùng/nhận khoá `service_role`. Người dùng đã chạy 0001, 0002, seed, seed_from_8; cần kiểm tra lại DB khớp 9 bài nếu sửa nội dung.
- **Giọng đọc:** Kokoro (`tools/kokoro-venv`, `tools/gen_kokoro_new.py`), quy trình khi đổi nội dung bài: `node tools/audio_texts.mjs` (liệt kê câu thiếu → `tools/audio_new.json`) → chạy `tools/kokoro-venv/Scripts/python.exe tools/gen_kokoro_new.py` → `node tools/audio_apply.mjs` → copy `deploy/audio` sang `audio/`, `netlify-upload/audio`. Bài sửa chữ phải tạo lại âm thanh tương ứng.
- **Ảnh:** WebP trong `Image/webp/`, copy vào `deploy/img/` và `netlify-upload/img/`. Hero: `hero.webp` (1200w) + `hero-sm.webp` (640w), nền trong suốt, đã đổi sang ảnh "Reading on a Sofa". `IMG` map scene → file; My Hobbies vẫn dùng tranh SVG vẽ tay.
- **Kiểm thử:** `tools/pw` (Playwright + WebKit/Chromium). Bộ hay dùng: `fit3.mjs` (không clip chữ ở 6 cỡ màn hình), `touch.mjs` (vuốt thật qua CDP, 1 vuốt = 1 bước), `tour2.mjs` (tour 9 bước), `rec5.mjs` (ghi âm, micro giả), `away.mjs`, `hero.mjs`, `align.mjs`, `how.mjs`. Server tĩnh viết ngay trong script, phục vụ `deploy/`. Mỗi lần sửa: chạy lại ít nhất `fit3`, `touch`, `tour2`.

### 4. Quyết định thiết kế đã chốt (đừng đảo ngược khi chưa hỏi)
- Ngôn ngữ UI hướng dẫn: **tiếng Việt**; nội dung học: tiếng Anh.
- Màu: A1 chữ xanh đậm `#4433ff`, A2 chữ đỏ hồng `#ff004c`, đều trên nền lime `#e4ffa4`. Player nền xanh đen `--bar:#1d2433`. Thanh chủ đề nền lime mờ 35%; mobile thì full-bleed cuộn ngang. Giữ bản sắc lime + xanh dương + pill, nhưng giảm độ nặng (đã làm 2 đợt "visual refinement").
- Tagline hero: "Simple. Word to Word. Easy and Fun." Tiêu đề xoay: "You read to speak/write/listen/learn better." Nút **Start Reading**. Không có chữ SCROLL.
- Nút trợ giúp tên **"How to Learn"** (mở lại tour).
- Ghi âm: nút mic trong player; đang ghi thì player biến hình (nút đỏ + sóng âm + Hủy); sau khi dừng tự phát giọng bạn rồi giọng mẫu và hiện thẻ 2 hàng (Giọng bạn | Giọng mẫu / So sánh | Ghi lại / Xong); mic có chấm xanh khi đã có bản ghi (chạm = mở thẻ + nghe lại, nhấn giữ = ghi lại). Bản ghi chỉ lưu trong máy (IndexedDB, 20 bản).
- Hướng dẫn gồm 3 lớp: Tour (hộp chào mừng "Xem hướng dẫn / Đã hiểu"), bài tập làm (nút "Làm thử"), gợi ý đúng lúc (Tips). Có thể bớt nếu thấy rối.
- Hero ảnh: vị trí desktop do người dùng chỉnh bằng `?edit`: `{"desktop":{"w":95,"r":-2.5,"b":0},"mobile":{"w":130,"r":-14,"b":0}}` (vw).

### 5. Việc còn lại / ý tưởng đã nêu (hỏi người dùng chọn thứ tự)
1. **Chưa kiểm tra trên iPhone/Safari thật**: vuốt 1 bước, nhấn giữ chọn bài, ghi âm (định dạng `audio/mp4`), thanh chủ đề, hero. Người dùng test trên điện thoại thật và gửi ảnh/video lỗi; nếu lỗi riêng iOS khó đoán, đề xuất `?debug` (eruda).
2. Mobile: ở bước 3 của tour thẻ che một phần chữ; Tour/Tips chưa kiểm tra riêng cho trạng thái hero mới.
3. Hero ảnh: người dùng muốn bản tiêu đề có bút dạ quang vàng/thanh chủ đề trắng mờ như mẫu thiết kế (chưa làm).
4. Spec v4 chưa làm: bật/tắt bản dịch tiếng Việt từng câu, nhắc nghỉ sau 30 phút, thẻ bài + thanh danh mục kiểu YouTube (đã có thanh chủ đề), màu 4 cấp A1–B2, thống kê học, thẻ "1-min read".
5. Phát triển ghi âm (ý tưởng): karaoke đọc theo, shadowing, sóng âm đặt chồng, nhật ký tiến bộ, nhận dạng "bạn vừa nói gì" bằng Web Speech API.
6. **PWA** (manifest, icon 192/512/maskable, apple-touch-icon, service worker offline cache 148+ mp3, tải phông Inter về, nút cài app) và **đăng nhập Google + đồng bộ + admin dashboard** theo `platform-plan.md` (chọn nền shadcn-admin + Supabase; luồng C/D/E/F/G/H chưa làm). Người dùng đã chọn: soạn bài = bạn + cộng tác viên (3 vai: learner/editor/admin), đăng nhập tuỳ chọn, làm tuần tự từng luồng.
7. Hosting: cân nhắc Cloudflare Pages khi thu phí (Netlify free có giới hạn credits; người dùng đang báo "Low on credits"). Nên có tên miền riêng.
8. Dọn dẹp: các file backup tạm và `tools/*.mjs` thử nghiệm có thể gọn lại; `deploy/export` 111MB không thuộc app.

### 6. Quy tắc làm việc
- Sửa bằng script Python/Edit nhỏ, luôn `node tools/syn.mjs` (kiểm cú pháp `appSrc`) sau khi sửa. Cẩn thận chuỗi `\b` trong Python (từng sinh ký tự backspace).
- Không đoán kết quả: chạy Playwright và xem ảnh chụp trước khi báo xong. Trung thực những gì chưa kiểm tra (iPhone thật, micro thật).
- Những việc cần người dùng tự làm (đăng nhập, mật khẩu, khoá bí mật, tải lên Netlify, tạo Google OAuth) thì hướng dẫn, không làm thay.
- Mỗi thay đổi: sync 3 nơi + commit + báo ngắn gọn.
