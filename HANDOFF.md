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

### 7. Cập nhật sau phiên bàn giao (10–18/10/2026)
- **Hosting:** đã chuyển sang Cloudflare (Workers static assets). Cấu hình ở `wrangler.jsonc` (thư mục `deploy/`), tự đăng khi `git push` lên `main` của repo `tothanhhuy1207-debug/reed` (private). Địa chỉ: https://reed.tothanhhuy1207.workers.dev. Netlify cũ còn giữ tới khi ổn định. Kiểm tra nhanh site thật: `node tools/pw/live.mjs`.
- **Đồng bộ file:** `node tools/sync.mjs` chép `index.html` + file PWA (manifest, sw.js, _headers, icons, fonts) từ gốc sang `deploy/` và `netlify-upload/`. Quy tắc 3 nơi vẫn giữ.
- **PWA:** manifest, icon, `sw.js` (cache khung app, mp3 lưu theo lần nghe + hỗ trợ Range; app đã cài tự tải sẵn âm thanh), phông Inter tự lưu, nút cài app, thanh "Có bản mới". Khi đổi ảnh/phông/icon: tăng `VERSION` trong `sw.js`; đổi âm thanh cùng tên file: tăng `AUDIO_CACHE`.
- **Nút EN/VI** (trong player, bên trái mic): chữ Việt thay chữ Anh, cùng cỡ và cùng điểm bắt đầu, cụm học được tô theo dạng `{n:chữ}` trong `VI` (dữ liệu bản dịch nằm trong code, chưa lên Supabase). Về EN khi qua bước.
- **Sổ tay:** thiết kế lại (gộp theo bài, tìm kiếm, tab Words/Phrasal Verbs/Collocations/Idioms, vuốt phải = đã thuộc / trái = xoá có hoàn tác, chạm cụm đổi A1⇄A2).
- **Quyết định mới (spec v5), người dùng đã chọn:**
  - **Start Reading mở màn hình danh sách bài** (thẻ có ảnh, số bài, mức, "1 min"; ✓ cho bài đã đọc, ổ khoá cho bài chưa mở). Vuốt/lăn vẫn đi thẳng vào bài 1. Bài đã đọc lưu ở `localStorage reed_read_v1` (ghi khi cuộn tới trang tổng kết).
  - **Điện thoại (hover:none hoặc rộng ≤ 820px): đổi chữ A1→A2 tức thì**, không blur, không làm mượt. Máy tính giữ hiệu ứng lăn.
- **Chưa làm (spec v5):** tab "Bài đã đọc" trong sổ tay + lọc kết hợp, màn hình hoàn thành bài + SFX, nhắc nghỉ 30 phút, nút Dịch tuỳ ý, nút Đăng nhập, màu 4 cấp A1–B2.
- Việc cloud (admin, kiểm thử+CI) chưa chạy được vì chưa cấp quyền GitHub cho tài khoản Claude; làm trực tiếp trên máy.

### 8. Bàn giao phiên 2 (cập nhật 18/10/2026) — đọc mục này trước
**Trạng thái:** nhánh `master` = `origin/main` (commit mới nhất `b76e7cf`), `index.html` = `deploy/index.html` = `netlify-upload/index.html`. Site live (Cloudflare): https://reed.tothanhhuy1207.workers.dev, tự đăng khi `git push origin master:main` (khoảng 1–2 phút). Kiểm tra site thật: `node tools/pw/live.mjs`.

**Đã xong trong phiên này (đều đã commit + đẩy):** PWA + Cloudflare (mục 7), nút EN/VI (tô cụm tiếng Việt, cùng cỡ/vị trí/xuống dòng với EN), sổ tay thiết kế lại, bỏ blur trên điện thoại, đổi A1→A2 rất nhanh (~0,15s) trên điện thoại, màn hình danh sách bài kiểu YouTube (Start Reading), bấm logo về hero, thanh player cao hơn (58–60px) + thanh tiến trình nâng lên, dọn code (`fadeJump` trùng, `nbSetPh` dùng `setPhrase`).

**Đang làm dở (KHÔNG nằm trên master): nhánh `wip/overview` (commit `caf7761`)** = trang tổng quan các chủ đề. Người dùng chọn luồng: Hero → Start Reading → **Trang tổng quan** (mọi chủ đề, mỗi chủ đề một mục: tên + "See all ›" + 3 bài đầu, desktop lưới 3 cột, điện thoại danh sách dọc, dấu mở rộng ⌄ nếu > 3 bài) → chạm tên chủ đề → danh sách bài của chủ đề (màn hiện có) → chọn bài. Chạm một bài trong tổng quan = vào thẳng bài (đổi chủ đề nếu cần). Esc từ danh sách chủ đề quay về tổng quan; bấm logo REED đóng hết; bấm tab chủ đề khi đang ở tổng quan = mở danh sách chủ đề đó. Mã nằm trong khối "Màn hình danh sách bài" / "Trang tổng quan các chủ đề" của `appSrc` (hàm `openOverview`, `renderOverview`, `openTopicList`, `closeLessonList(back)`, `goToLesson`…). Nhánh này làm ĐÚNG ý nhưng **`tools/pw/list.mjs` còn 3 kiểm tra rớt** (thẻ trong danh sách chủ đề đếm ra 11 thay vì 2: nghi bộ chọn `.lscCard` của test đang bắt cả thẻ của trang tổng quan, hoặc 2 màn hình dùng chung phần tử). Việc cần làm: `git switch wip/overview`, sửa bộ chọn trong `list.mjs` (giới hạn trong `#lscGrid`), viết thêm `tools/pw/ov.mjs` (mở tổng quan, bài khoá lắc, chạm tên chủ đề, Esc hai lần, chọn bài ở chủ đề khác, bấm tab khi đang ở tổng quan, chip lọc All/Unread/Read), chạy lại `home`, `pwa`, `touch`, `tour2`, rồi merge vào master, `node tools/sync.mjs`, push. **Không sync nhánh WIP vào `netlify-upload/`** (người dùng kéo thư mục đó lên Netlify cũ).

**Chưa làm (spec v5, `Meet/adaptive-learning-spec-v5.md`):** tab "Bài đã đọc" trong sổ tay + lọc kết hợp (loại × bài), màn hình hoàn thành bài + SFX (cần file âm thanh miễn phí bản quyền), nhắc nghỉ 30 phút, nút Dịch tuỳ ý (cần dịch vụ ngoài), nút Đăng nhập (làm cùng đăng nhập Google), màu 4 cấp A1–B2, tính "1 min" từ số từ (hiện cố định). Bản dịch VI vẫn nằm trong code (`VI`), chưa lên Supabase (cần migration `0003_translation.sql`, bạn tự chạy SQL). Admin dashboard + Google login + đồng bộ + R2/media: chưa làm (cloud session thất bại vì chưa cấp quyền GitHub cho tài khoản Claude). Tối ưu âm thanh đã tư vấn nhưng CHƯA làm: mã hoá lại mp3 32kbps (giảm ~50%), chỉ tải sẵn giọng đang chọn, nút "Tải offline" thay vì tự tải.

**Quy tắc làm việc đã rút ra (quan trọng):**
- Sửa `index.html` bằng script Node viết bằng công cụ Write (không dùng heredoc của shell cho chuỗi có `\` hoặc `\u`: shell làm hỏng ký tự gạch chéo ngược). `index.html` dùng CRLF: script patch phải đổi CRLF→LF khi sửa rồi đổi lại khi ghi (xem mẫu các `patch_*.mjs` đã dùng: đọc file, `split("\r\n").join("\n")`, `rep(a,b)` kiểm tra duy nhất, ghi lại). Sau mỗi lần sửa: `node tools/syn.mjs` (chỉ kiểm cú pháp `appSrc`; phần script ngoài appSrc như PWA cần kiểm bằng Playwright), rồi `node tools/sync.mjs`.
- Mỗi thay đổi: sync 3 nơi + commit (author `luanh <bxvinh0908711110@gmail.com>`, kèm dòng `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`) + `git push origin master:main`. `netlify-upload/` bị gitignore, chỉ `sync.mjs` cập nhật nó.
- Test (tools/pw, tự dựng server tĩnh phục vụ `deploy/`): `fit3`, `touch`, `tour2`, `home`, `pwa`, `lang`, `nb1/nb2/nb3/nb4/nb7`, `list`, `player`, `rec5` (micro giả), `jank`, `live` (site thật). Chạy nối tiếp nhiều script thì để nền + chờ (lệnh dài quá 2 phút bị đẩy xuống nền). Đo hiệu năng phải xen kẽ A/B (`perfab.mjs`), đo tách riêng bị nhiễu máy.
- Luôn nói rõ cái gì đã kiểm tra bằng Playwright và cái gì chưa (iPhone/Safari thật, micro thật, cài app thật). Chưa từng kiểm trên thiết bị thật.
- Việc cần người dùng tự làm (đăng nhập/cấp quyền GitHub-Cloudflare-Supabase-Google, chạy SQL, mua tên miền, kéo `netlify-upload/` nếu còn dùng Netlify) thì hướng dẫn, không làm thay. Không nhận khoá `service_role`.

**Sở thích người dùng:** trả lời tiếng Việt ngắn gọn; giao diện ít chữ (nhiều chỗ chuyển sang tiếng Anh ngắn: Search/Recent/Level, All/Unread/Read, "1 min"); bố cục theo hình tham chiếu YouTube (danh sách bài, trang tổng quan); màu theo bảng màu app (lime `#e4ffa4`, xanh `#4433ff`/`#1b3bff`, đỏ hồng `#ff004c`, navy `#1d2433`); ghét hiệu ứng nặng/giật trên điện thoại; muốn tên miền riêng sau (hiện dùng `.workers.dev`).

### 9. Cập nhật phiên 3 (18/10/2026)
- **Trang tổng quan** (Start Reading) đã merge: tab **All** đầu thanh chủ đề, mỗi chủ đề = icon + tên + "See all ›" + MỘT thẻ bìa (ô xám, điền ảnh vào `TOPIC_THUMB`) + số bài; chạm → danh sách bài của chủ đề. Vuốt ngang trên danh sách/tổng quan đổi chủ đề (`lswipe.mjs`). Không hiệu ứng thẻ trên điện thoại (từng gây nhấp nháy).
- **Trong bài:** vuốt ngang cũng đổi bước (trái = tiếp, phải = lùi; `hswipe.mjs`). Player điện thoại cao 68px, cách đáy 34px.
- **Nhạc nền:** nút ♫ trên đầu trang (giữa How to Learn và Sổ tay), file `audio/music/reed_family_lofi_30s.mp3`, lặp, volume .3, tạm dừng khi ghi âm / ẩn tab (`Bgm`, `music.mjs`).
- **Icon lưu** đổi thành ngôi sao. **Tour hướng dẫn 13 bước** theo nội dung người dùng đưa (`tour13.mjs`; `tour2.mjs` là bản cũ 9 bước, không còn đúng).
- **Trang chủ:** lăn chuột / vuốt lên / phím ↓ ở trang chủ mở trang tổng quan (như Start Reading), không rơi thẳng vào bài (`userStep`; `goStep` gọi trực tiếp vẫn đi vào bài, nên test dùng `goStep(1)` để vào bài).
- **Auto-play** (công tắc 🔊 trong hàng cài đặt của player, mặc định bật, lưu `reed_autoplay`): mỗi bước tự đọc đúng cụm A1 / A2 đang hiển thị, không đọc cả câu (trễ 0,35s); không chạy khi ghi âm / tour / làm thử / trang chủ; không dùng giọng trình duyệt (`auto.mjs`).
- **Âm thanh cụm:** 105 cụm (key AUDIO không có dấu câu cuối) từng bị Kokoro cắt cụt từ cuối (vd "brother"); đã tạo lại với dấu chấm (`tools/regen_phrases.py`, kiểm bằng `tools/scan_clip.py` chỉ là ước lượng). `AUDIO_CACHE` = `reed-audio-v2`. Thêm cụm mới: nhớ thêm dấu chấm khi tạo âm thanh.
