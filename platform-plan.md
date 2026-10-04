# Reed Platform: PWA + Database + Admin + Google Login

Kế hoạch triển khai (bản nháp, chờ chốt các quyết định ở mục 8).

## 1. Mục tiêu
- Học viên: học không cần đăng nhập; đăng nhập Google để đồng bộ tiến trình và sổ tay; cài như app (PWA), học offline.
- Admin: dashboard quản lý bài học (câu, cụm từ, ảnh, âm thanh), xuất bản, xem thống kê.
- Dữ liệu: Supabase (Postgres + Auth Google + Storage + RLS).

## 2. Kiến trúc
```
/deploy            App học viên (HTML hiện tại, đọc bài từ Supabase, có cache offline)
/admin             Dashboard (Vite + React + shadcn/ui, gốc: satnaing/shadcn-admin)
/supabase          migrations SQL, seed, policy RLS  (nguồn sự thật của schema)
/shared            Hợp đồng dữ liệu: schema.sql + types + JSON mẫu 1 bài (contract)
/tools/pw          Kiểm thử Playwright (đã có)
```
Nguyên tắc: **schema và hợp đồng dữ liệu (`/shared`) được chốt TRƯỚC**, các luồng làm sau đó độc lập.

## 3. Hợp đồng dữ liệu (Giai đoạn 0, làm tuần tự, ~1 ngày)
Bảng: `profiles(id, role)`, `lessons(id, position, title, topic, status, scene_key, version)`,
`sentences(id, lesson_id, position, text)`, `phrases(id, sentence_id, base, upgrade, level, vn, example)`,
`audio_assets(id, lesson_id, sentence_id, voice, path)`, `progress(user_id, unlocked_count, updated_at)`,
`notebook_items(id, user_id, phrase_id, kind, created_at)`, `study_events(user_id, lesson_id, event, at)`.
RLS: học viên chỉ đọc bài `published` và chỉ đọc/ghi dòng của chính mình; admin ghi nội dung.
Kết quả giao: `supabase/migrations/0001_init.sql`, `shared/lesson.schema.json`, `shared/sample-lesson.json`.

## 4. Các luồng công việc (làm song song sau Giai đoạn 0)

| Luồng | Nội dung | Phụ thuộc | Ước lượng |
|---|---|---|---|
| **A. Dữ liệu** | Tạo project Supabase, chạy migration, seed 3 bài từ code hiện tại (script chuyển mảng `passages` → SQL), RLS, bucket Storage | Giai đoạn 0 | 2 ngày |
| **B. App học viên** | Đọc bài từ API thay vì mảng trong file (có phương án dự phòng dữ liệu nhúng), giữ nguyên cơ chế cuộn 1 bước/1 vuốt | Hợp đồng (dùng JSON mẫu khi A chưa xong) | 2–3 ngày |
| **C. PWA** | manifest, icon, service worker, cache offline, nút cài, safe-area | Độc lập (chạy trên bản hiện tại) | 2 ngày |
| **D. Đăng nhập + đồng bộ** | Google OAuth, hồ sơ, gộp dữ liệu cục bộ vào tài khoản, đồng bộ tiến trình và sổ tay | A (bảng + RLS), B | 3 ngày |
| **E. Admin: khung + CRUD** | Clone shadcn-admin, dọn trang thừa, đăng nhập admin, danh sách bài, form bài/câu/cụm từ, xuất bản | A | 4–5 ngày |
| **F. Admin: soạn bài + xem trước + media** | Trình soạn đánh dấu cụm từ (Tiptap), xem trước bằng chính engine app, upload ảnh/âm thanh, nút tạo âm thanh Kokoro | E | 4 ngày |
| **G. Dashboard thống kê** | Thẻ số liệu, biểu đồ (bài bỏ dở, cụm hay lưu, học viên hoạt động) | A, D (có dữ liệu sự kiện) | 3 ngày |
| **H. Kiểm thử + phát hành** | Playwright (offline, cảm ứng, RLS), Lighthouse PWA, thử iPhone/Android thật, `_headers` Netlify | tất cả | 2 ngày |

## 5. Có nên làm song song không?
**Có, nhưng chỉ ở mức vừa phải.**
- Song song hợp lý: **B + C + E** sau khi có hợp đồng dữ liệu (ba luồng ít đụng nhau: app học viên, PWA, admin).
- **A phải đi trước hoặc cùng lúc** vì B, D, E đều cần bảng và RLS thật.
- **Không song song được:** F sau E; D sau B và A; G sau D.
- Mỗi luồng làm trong **thư mục riêng** và chỉ giao tiếp qua `/shared`. Nhờ đó không ghi đè file của nhau (dự án chưa dùng git, nên nên `git init` trước khi chia).
- Nếu dùng nhiều tác tử (agent) song song: mỗi agent nhận một luồng + hợp đồng dữ liệu, không được sửa `/shared` hay `index.html` của luồng khác. Sau khi xong, tôi (một mình) tích hợp và chạy kiểm thử chung. Lợi ích: nhanh hơn khoảng 30–40%. Cái giá: tốn nhiều token hơn, và `index.html` là file lớn dùng chung nên luồng B và C dễ xung đột, nên giao B và C cho **cùng một người** làm tuần tự.

## 6. Lộ trình gợi ý (khoảng 3 tuần cho MVP)
- Tuần 1: Giai đoạn 0, A, C (PWA), bắt đầu E.
- Tuần 2: B, D, tiếp E, bắt đầu F.
- Tuần 3: F, G, H, phát hành thử cho vài người dùng.

## 7. Rủi ro chính
| Rủi ro | Cách giảm |
|---|---|
| Sửa bài làm lệch tiến trình đã lưu | Lưu tiến trình theo `id` bài/câu, có `version` |
| Bài admin nhập làm hỏng cơ chế cuộn | Kiểm tra tự động trước khi xuất bản (3–4 cụm/bài, câu không quá dài) |
| Lộ khoá | Chỉ dùng khoá `anon` ở trình duyệt; `service_role` chỉ ở máy bạn/CI |
| Service worker giữ bản cũ | Cache theo phiên bản, `sw.js` no-cache, thanh "Có bản mới" |
| Supabase free tạm dừng khi ít dùng | Chấp nhận khi thử nghiệm; nâng cấp Pro khi có người dùng thật |
| iOS xoá dữ liệu web khi lâu không dùng | `storage.persist()`, khuyến khích cài app, xuất/nhập sổ tay |

## 8. Quyết định đã chốt
- Người soạn: bạn + cộng tác viên → 3 vai trò: `learner`, `editor` (soạn bài), `admin` (thêm cả quản lý người dùng).
- Đăng nhập tuỳ chọn: học không cần tài khoản, Google chỉ để đồng bộ.
- Làm lần lượt từng luồng. Đã `git init` (có `.gitignore` bỏ qua thư mục nặng).

## 9. Trạng thái Giai đoạn 0 (hoàn tất, chờ duyệt)
- `supabase/migrations/0001_init.sql`: bảng, vai trò, RLS. Đã chạy thử trên Postgres cục bộ (PGlite): tạo bảng, nạp seed, trigger tạo hồ sơ chạy đúng.
- `supabase/make-seed.mjs` → `supabase/seed.sql`: chuyển 3 bài hiện có (17 cụm) vào database.
- `shared/lesson.schema.json`: hợp đồng dữ liệu. Mô hình đơn giản hoá: mỗi bài = `template` có {0},{1}... + danh sách `phrases` theo `idx` (không cần bảng `sentences`, đúng cách engine hiện tại hoạt động).
- Việc tiếp theo cần bạn: tạo project Supabase Reed, gửi Project URL + khoá `anon` (không gửi `service_role`).
