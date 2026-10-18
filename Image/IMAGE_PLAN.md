# Ảnh bìa chủ đề (thumbnail topic) cho Reed

Dùng ở: trang tổng quan "All" (thẻ bìa mỗi chủ đề). Ô ảnh thật: `.lscThumb` = **16:9** (desktop ≈ 357×200 css px, điện thoại ≈ 220×124). Xuất **640×360 WebP**, ≤ 150 KB, đặt ở `img/topic-<id>.webp`, gắn vào `TOPIC_THUMB` trong `index.html`.

Câu mở đầu chung (mọi prompt): `Photorealistic candid lifestyle photograph, warm natural light, realistic people, shallow depth of field, cozy and authentic, wide 16:9 composition, no text, no logos, no watermark.` (đổi từ tranh minh hoạ phẳng sang ảnh chụp thật theo yêu cầu: cùng phong cách với ảnh bài học 'My Family'.)

| id | Tên | Cảnh (mỗi prompt một cảnh) | File đích |
|---|---|---|---|
| family | Family | A family of four having breakfast together at a sunny table | img/topic-family.webp |
| friends | Friends | Three friends laughing at an outdoor cafe table | img/topic-friends.webp |
| school | School | Children in uniforms with backpacks walking to school | img/topic-school.webp |
| work | Work | Young professional smiling at a desk with laptop and coffee | img/topic-work.webp |
| lifestyle | Lifestyle | Person relaxing on a sofa with tea, a book and plants | img/topic-lifestyle.webp |
| health | Health | Person stretching in a park at sunrise | img/topic-health.webp |
| tech | Tech | Person using a laptop and smartphone at a tidy desk | img/topic-tech.webp |

Người trong ảnh do AI tạo, đa dạng; không người nổi tiếng; không chữ/số/logo. Tổng 7 ảnh (≤ 12, không cần duyệt trước). Ảnh gốc ChatGPT nằm ở `E:\AI Editor\AI Editor\Image\chatgpt-out\`.
