# Prompt: thanh tìm kiếm thông minh cho Reed

Dán nội dung trong khối dưới vào một phiên mới (cwd: `E:\Your English`) và đính kèm lại ảnh thiết kế (header có logo + slogan, ô tìm kiếm bo tròn "What do you want to learn today?" với ✦ bên trái và nút mũi tên tròn xanh bên phải, bên dưới là thanh chủ đề có viên thuốc xanh ở tab đang chọn).

```
Tôi đang làm Reed, web app học tiếng Anh một file HTML (E:\Your English\index.html). Bạn tiếp quản từ phiên trước.
Trước khi sửa, đọc HANDOFF.md (đặc biệt mục 4, 7, 8, 9), rồi chạy `git log --oneline | head -30`.
Luôn trả lời tiếng Việt, ngắn gọn; nói rõ cái gì đã kiểm tra bằng Playwright và cái gì chưa (iPhone/Safari thật, micro thật).
Không đảo ngược các quyết định thiết kế đã chốt khi chưa hỏi tôi. Việc cần tôi tự làm (đăng nhập, cấp quyền, chạy SQL) thì hướng dẫn, không làm thay.

NHIỆM VỤ: thiết kế và làm thanh tìm kiếm thông minh ("What do you want to learn today?") cho Reed.
Ảnh tham chiếu (tôi đính kèm): header có logo + slogan, ô tìm kiếm bo tròn lớn với biểu tượng ✦ (sparkle) bên trái, nút mũi tên tròn xanh bên phải, bên dưới là thanh chủ đề (All, Family, Friends, School, Work...) với viên thuốc xanh ở tab đang chọn.

PHẦN 1. LÊN Ý TƯỞNG TRƯỚC (đừng code vội, dừng lại cho tôi duyệt)
Đưa ra kế hoạch ngắn, có lựa chọn kèm khuyến nghị, gồm:
a) Vị trí: ô tìm kiếm nằm ở đâu trong luồng hiện tại (trang chủ hero / trang All / danh sách bài / navbar đáy). Cần hợp với navbar đáy 4 mục (Explore, Continue, Notebook, You) và thanh chủ đề đang có. Đề xuất cả bản điện thoại, tablet, máy tính.
b) Hành vi khi chạm vào ô: mở lớp phủ gợi ý (không phải trang mới). Trong lớp phủ có: gợi ý chủ đề, gợi ý bài, từ khoá/tag phổ biến, lịch sử tìm kiếm gần đây, và bài đang đọc dở.
c) Cách "thông minh": gõ đến đâu gợi ý đến đó (không dấu vẫn tìm được tiếng Việt, ví dụ "gia dinh" ra Family), chịu sai chính tả nhẹ, tìm theo nghĩa (đồng nghĩa/từ liên quan), xếp hạng kết quả (khớp tiêu đề > tag > nội dung). Chạy hoàn toàn trên máy (offline, không gọi dịch vụ ngoài), nhanh trên máy yếu.
d) Chữ gợi ý chạy trong ô (placeholder động): các câu như "What do you want to learn today?", "Try: daily routine", "Try: talk about my family", "Try: job interview"... xoay vòng lần lượt, theo kiểu gõ chữ hoặc trượt/mờ chuyển câu. Cần: tạm dừng khi ô đang được focus hoặc đã có chữ, tôn trọng prefers-reduced-motion và chế độ nhẹ (LITE), không gây giật trên máy yếu (chỉ dùng transform/opacity, không tính lại bố cục), dừng khi tab ẩn. Nội dung gợi ý lấy từ dữ liệu thật (tag/bài hiện có), không gõ cứng.
e) Hệ thống TAG cho bài học: định nghĩa cấu trúc tag (ví dụ: chủ đề con, tình huống, ngữ pháp, cấp độ CEFR, từ khoá tiếng Việt, đồng nghĩa), nơi lưu (dữ liệu nhúng trong `ALL` + bảng/cột trong Supabase qua migration mới — tôi sẽ tự chạy SQL), cách gán tag cho 9 bài hiện có và cho các bài sau, và cách mở rộng cho Stories (bài đặc biệt). Đề xuất tag mẫu cho từng bài hiện có để tôi duyệt.
f) Mô hình dữ liệu tìm kiếm: chỉ mục dựng sẵn khi app chạy (hoặc lúc build), dung lượng nhỏ, cập nhật khi bài thay đổi.
g) Rủi ro và những gì cần tôi quyết định (tối đa 4 câu hỏi, mỗi câu có khuyến nghị).

PHẦN 2. SAU KHI TÔI DUYỆT: LÀM THEO TỪNG BƯỚC NHỎ
1) Hệ thống tag + chỉ mục tìm kiếm (hàm thuần, có test).
2) Ô tìm kiếm + lớp phủ gợi ý + chữ chạy.
3) Nối vào luồng: chọn gợi ý chủ đề → mở danh sách chủ đề; chọn bài → vào đúng bài (dùng cơ chế sẵn có như `goToLesson`, pager, `openTopicList`); chọn tag → danh sách lọc theo tag.
4) Tablet, máy tính, chế độ nhẹ, giảm chuyển động.

QUY TẮC LÀM VIỆC (đã rút ra từ các phiên trước)
- Sửa index.html bằng script Node viết bằng công cụ Write (không dùng heredoc của shell cho chuỗi có `\` hoặc `$`), index.html dùng CRLF, mỗi lần sửa chạy `node tools/syn.mjs` rồi `node tools/sync.mjs`.
- Phần động (chữ chạy, lớp phủ) chỉ dùng transform/opacity, một lần cho mỗi chuyển, không blur, không phát lại animation khi dựng lại DOM (tránh nhấp nháy). Phải tắt/giảm ở LITE và prefers-reduced-motion. Hiệu ứng tinh tế, không "bụp".
- Giữ phong cách hiện có: màu lime #e4ffa4, xanh #4433ff/#1b3bff, đỏ hồng #ff004c, navy #1d2433; UI chữ ngắn tiếng Anh; viên thuốc xanh trượt lò xo (`Pill`) cho thanh chủ đề; kính mờ nhẹ (tắt ở LITE).
- Không phá luồng đang có: pager kéo ngang giữa All/danh sách bài, navbar đáy chỉ hiện ở màn hình duyệt, player chỉ hiện trong bài, Stories (bản video cho điện thoại).
- Mỗi tính năng phải có test Playwright trong tools/pw (kích thước 320/390/834/1280), chạy lại các test cũ (ov, list, lswipe, slide, tablet, bnav, stories, tour13, pwa, fit3...) trước khi báo xong. Xem ảnh chụp thật của từng màn hình.
- Commit sau mỗi bước (author `luanh <bxvinh0908711110@gmail.com>`, kèm dòng Co-Authored-By theo hướng dẫn), `git push origin master:main`, rồi cập nhật HANDOFF.md.
- Tour hướng dẫn (13 bước) và các gợi ý đúng lúc phải được cập nhật nếu thêm điều gì người dùng cần biết.
- Báo cáo ≤ 10 dòng: đã làm gì, đã kiểm tra gì, chưa kiểm tra gì (iPhone/Safari thật), việc cần tôi làm.
```
