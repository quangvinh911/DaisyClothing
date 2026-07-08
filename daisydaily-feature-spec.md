# DaisyDaily — Spec Tính Năng: Tối Ưu Điều Hướng Web → TikTok Affiliate

**Mục tiêu tổng thể:** Tăng tỷ lệ chuyển đổi từ website (daisydaily.shop) sang video TikTok chứa link affiliate sản phẩm (@em.xinh0905). Mọi tính năng dưới đây phục vụ 1 phễu duy nhất:

```
Traffic vào web (SEO/social) → Xem nội dung (blog/lookbook/shop)
→ Thấy sản phẩm hấp dẫn → Bấm CTA → Redirect sang video TikTok đúng sản phẩm → Bấm giỏ hàng vàng (affiliate) trên TikTok
```

Tài liệu này dùng để đưa cho AI coding agent triển khai. Mỗi mục có: mô tả, UI/UX chi tiết, cấu trúc dữ liệu gợi ý, và mức độ ưu tiên.

---

## 0. Nguyên tắc thiết kế chung

- **1 sản phẩm = 1 video TikTok gắn với nó.** Mọi nơi hiển thị sản phẩm (blog, shop, lookbook) đều phải map tới đúng video demo/mặc thử sản phẩm đó, không chỉ dẫn về trang TikTok chung.
- **Mobile-first.** Phần lớn người dùng TikTok truy cập từ mobile → ưu tiên test responsive, nút bấm to, sticky elements không che nội dung.
- **Giảm số bước bấm.** Từ lúc thấy sản phẩm đến lúc mở được video trên TikTok tối đa 1 cú click/tap.
- **Data-driven:** Tạo 1 nguồn dữ liệu trung tâm (JSON/CMS) chứa toàn bộ sản phẩm + video liên kết, tái sử dụng ở mọi trang thay vì hard-code rời rạc.

### Cấu trúc dữ liệu đề xuất (dùng chung toàn site)

```json
{
  "products": [
    {
      "id": "prod_001",
      "name": "Đầm hoa dạo phố",
      "category": "dam-vay",
      "price": 199000,
      "priceLabel": "199k",
      "isBestSeller": true,
      "isNew": false,
      "image": "/images/products/prod_001.jpg",
      "tiktokVideoUrl": "https://www.tiktok.com/@em.xinh0905/video/xxxxxxxxx",
      "tiktokVideoThumbnail": "/images/videos/vid_001_thumb.jpg",
      "views": "12.3k",
      "likes": "890",
      "tags": ["dao-pho", "he-2026", "hoa-nhi"]
    }
  ],
  "lookbooks": [
    {
      "id": "look_001",
      "title": "Outfit Đi Làm Công Sở",
      "coverImage": "/images/lookbooks/look_001.jpg",
      "productIds": ["prod_001", "prod_004", "prod_010"]
    }
  ]
}
```

> AI Agent: nên tạo file `data/products.json` (hoặc kết nối CMS như Sanity/Notion API nếu có) làm single source of truth. Tất cả component bên dưới fetch từ đây.

---

## 1. Nâng cấp Section "Shop My Style" (ưu tiên cao nhất)

### Mục tiêu
Đây là section chuyển đổi chính hiện tại — biến nó thành "cửa hàng thu nhỏ" thay vì chỉ là gallery ảnh.

### Chi tiết tính năng

**1.1. Card sản phẩm nâng cấp**
Mỗi card hiển thị:
- Ảnh sản phẩm (từ video TikTok, dạng thumbnail dọc 9:16 hoặc vuông 1:1)
- Badge góc trên trái: `🔥 Bán chạy` hoặc `🆕 Mới` (điều kiện: `isBestSeller` / `isNew`)
- Tên sản phẩm
- Giá: `priceLabel` (VD: "199k") — hiển thị rõ, font đậm
- Lượt xem/thích của video: icon mắt + số, icon tim + số
- Nút CTA: **"Xem Video & Mua ngay 🛍️"** — full width, màu nổi bật (brand color), khi hover/tap có hiệu ứng scale nhẹ

**1.2. Bộ lọc danh mục**
- Thanh tab ngang phía trên grid: `Tất cả | Áo | Váy & Đầm | Quần | Phụ kiện`
- Filter client-side (không reload trang), dùng React state hoặc vanilla JS filter theo `category`
- Tab active có underline hoặc background nổi bật

**1.3. Sắp xếp**
- Dropdown nhỏ góc phải: `Mới nhất | Bán chạy nhất | Giá thấp-cao`

**1.4. Hành vi khi click**
- Click vào card → mở `tiktokVideoUrl` ở tab mới (`target="_blank" rel="noopener"`)
- Track sự kiện click (Google Analytics event `product_click` với `product_id`) để sau này biết sản phẩm nào hiệu quả nhất

### Acceptance Criteria
- [ ] Grid responsive: 2 cột mobile, 3-4 cột desktop
- [ ] Filter hoạt động không reload trang, mượt
- [ ] Mỗi card có đủ: ảnh, badge (nếu có), tên, giá, views/likes, CTA
- [ ] Click card mở đúng video TikTok tương ứng ở tab mới
- [ ] Có tracking event khi click

---

## 2. Nhúng sản phẩm trực tiếp vào bài Blog

### Mục tiêu
Blog hiện đang là nội dung "đọc xong thì thôi" — cần biến nó thành nội dung có điểm chuyển đổi ngay trong lúc đọc.

### Chi tiết tính năng

**2.1. Block "Outfit trong bài này"**
- Đặt cuối mỗi bài viết (hoặc giữa bài, sau đoạn nội dung liên quan)
- Layout: hàng ngang scroll được (carousel) trên mobile, grid 3-4 cột trên desktop
- Mỗi item = mini card: ảnh + tên + giá + nút nhỏ "Xem trên TikTok"
- Dữ liệu: mỗi bài blog có field `relatedProductIds: ["prod_001", "prod_004"]` trong CMS/markdown frontmatter

**2.2. Inline product mention**
- Trong nội dung bài viết, khi nhắc tên sản phẩm, cho phép chèn 1 "smart link" dạng: từ đó được gạch chân/tô màu, hover hiện popup nhỏ (ảnh + giá + nút mua) — giống Amazon affiliate blog style
- Kỹ thuật: dùng shortcode hoặc component `<ProductMention id="prod_001">đầm hoa dạo phố</ProductMention>` trong markdown/MDX

**2.3. Frontmatter mẫu cho bài blog** (nếu dùng markdown/MDX)
```yaml
---
title: "Cách phối đồ dạo phố mùa hè"
relatedProductIds: ["prod_001", "prod_004", "prod_010"]
---
```

### Acceptance Criteria
- [ ] Mỗi bài blog (có gắn sản phẩm) hiển thị block "Outfit trong bài này" ở cuối bài
- [ ] Carousel hoạt động mượt trên mobile (swipe)
- [ ] Click sản phẩm → mở video TikTok tương ứng

---

## 3. Trang Lookbook / Outfit Idea (tính năng mới)

### Mục tiêu
Giúp người dùng mua theo "phong cách/dịp" thay vì lục từng sản phẩm — tăng giá trị giỏ hàng và thời gian trên trang.

### Chi tiết tính năng

**3.1. Trang danh sách Lookbook** — route `/lookbook`
- Grid ảnh lớn theo chủ đề: "Đi làm", "Dạo phố", "Đi tiệc", "Ở nhà"... (dựa theo `tags` sản phẩm có sẵn hoặc tạo mới)
- Mỗi card = 1 ảnh outfit tổng hợp + tiêu đề + số lượng sản phẩm trong outfit đó

**3.2. Trang chi tiết Lookbook** — route `/lookbook/[id]`
- Ảnh lớn outfit ở trên (có thể là ảnh chụp tổng hợp hoặc GIF ngắn từ video)
- Danh sách sản phẩm trong outfit đó bên dưới hoặc dạng "hotspot" (chấm tròn trên ảnh, click vào từng vị trí trên người mẫu → hiện thông tin sản phẩm + link video) — nếu kỹ thuật cho phép, đây là trải nghiệm rất hiệu quả (giống shoppable image)
- Nút "Xem tất cả trong 1 video" nếu outfit này gói gọn trong 1 video TikTok duy nhất

### Acceptance Criteria
- [ ] Trang `/lookbook` liệt kê được các bộ outfit theo chủ đề
- [ ] Trang chi tiết hiển thị đủ sản phẩm trong outfit, mỗi sản phẩm click được ra video
- [ ] (Nâng cao, optional) Hotspot tương tác trên ảnh

---

## 4. Social Proof & Nội dung cập nhật real-time

### 4.1. Hiển thị số liệu tương tác
- Áp dụng field `views`, `likes` cho MỌI nơi hiển thị sản phẩm (không chỉ riêng section Follow Me), gồm cả Shop My Style, Blog embed, Lookbook

### 4.2. Section "Video Mới Nhất"
- Nếu có thể fetch TikTok qua oEmbed API (`https://www.tiktok.com/oembed?url=...`) hoặc cron job cập nhật thủ công vào `products.json`
- Nếu không có API chính thức ổn định, giải pháp thực tế: **cập nhật thủ công qua CMS** (Notion/Sanity) mỗi khi có video mới — AI Agent nên build 1 trang admin đơn giản hoặc dùng Notion database làm CMS để chủ shop tự thêm sản phẩm/video mới không cần code
- Hiển thị badge "Mới" tự động cho video đăng trong 7 ngày gần nhất (so sánh field `publishedAt`)

### Acceptance Criteria
- [ ] Views/likes hiển thị đồng nhất toàn site
- [ ] Có cơ chế (thủ công hoặc tự động) để thêm sản phẩm/video mới mà không cần sửa code

---

## 5. Cải thiện UX điều hướng chung

### 5.1. Sticky CTA button (mobile ưu tiên)
- Cố định ở đáy màn hình khi cuộn qua khỏi hero section: `[TikTok icon] Xem shop trên TikTok →`
- Ẩn đi khi đã ở gần footer hoặc khi mở modal khác
- Trên desktop: có thể để dạng floating button góc dưới phải

### 5.2. Exit-intent popup (desktop)
- Trigger khi chuột di chuyển ra khỏi viewport phía trên (dấu hiệu chuẩn bị đóng tab)
- Nội dung: "Đừng bỏ lỡ outfit hot nhất tuần này 🔥" + ảnh sản phẩm bán chạy nhất + nút "Xem ngay"
- Giới hạn hiện 1 lần / session (dùng `sessionStorage`)

### Acceptance Criteria
- [ ] Sticky button hiện đúng thời điểm, không che nội dung quan trọng, biến mất hợp lý ở footer
- [ ] Exit-intent chỉ hiện 1 lần/phiên, có nút đóng rõ ràng

---

## 6. Nâng cấp trang Shop (`/shop`)

### Chi tiết tính năng
- Mỗi sản phẩm trong grid dùng **thumbnail từ video** (ảnh cắt từ video lúc mặc/demo sản phẩm) thay vì ảnh studio tĩnh, để người dùng liên tưởng ngay đến nội dung TikTok
- Hover (desktop) / tap giữ (mobile) → autoplay preview ngắn (3-5s) của video nếu kỹ thuật cho phép (giống TikTok Shop trên web)
- Áp dụng lại toàn bộ filter + sort như mục 1.2/1.3

### Acceptance Criteria
- [ ] Ảnh sản phẩm là thumbnail video, không phải ảnh chụp studio rời
- [ ] (Optional) Preview video khi hover/tap giữ

---

## 7. Thu thập Email / Remarketing

### Chi tiết tính năng
- Form đăng ký hiện có → thêm ưu đãi đổi lấy email: **"Nhận ngay mã giảm 10% TikTok Shop khi đăng ký"**
- Sau khi submit: gửi email tự động (dùng Mailchimp/Resend/EmailJS) chứa mã code + link tới 3 sản phẩm bán chạy nhất
- Thiết lập email tự động hàng tuần (newsletter) giới thiệu outfit mới kèm link video — có thể dùng template đơn giản, kéo dữ liệu từ `products.json`

### Acceptance Criteria
- [ ] Form thu thập email hoạt động, lưu vào danh sách (Mailchimp/Google Sheet/DB)
- [ ] Có email tự động phản hồi ngay sau khi đăng ký kèm ưu đãi

---

## 8. SEO nội dung cho trang danh mục

### Chi tiết tính năng
- Mỗi trang danh mục (`/shop/dam-vay`, `/shop/ao`,...) cần:
  - Thẻ `<title>` và `<meta description>` tối ưu từ khóa (VD: "Đầm dạo phố hè 2026 - DaisyDaily")
  - Đoạn mô tả ngắn 100-150 từ ở đầu trang (giúp SEO, không chỉ là ảnh sản phẩm)
  - Heading `<h1>` chuẩn chứa từ khóa chính
- Thêm structured data (Schema.org `Product`) cho từng sản phẩm để hỗ trợ rich snippet trên Google

### Acceptance Criteria
- [ ] Mỗi trang danh mục có title/meta riêng biệt, không trùng lặp
- [ ] Có đoạn mô tả text chứa từ khóa tự nhiên
- [ ] Schema.org Product markup hiện diện (kiểm tra bằng Google Rich Results Test)

---

## Bảng ưu tiên triển khai (đề xuất thứ tự cho AI Agent)

| # | Tính năng | Ưu tiên | Độ khó ước tính |
|---|-----------|---------|------------------|
| 1 | Nâng cấp Shop My Style (card, filter, sort, tracking) | 🔴 Cao | Trung bình |
| 2 | Cấu trúc dữ liệu trung tâm `products.json` | 🔴 Cao | Thấp |
| 3 | Sticky CTA button mobile | 🔴 Cao | Thấp |
| 4 | Block "Outfit trong bài này" trong Blog | 🟠 Trung bình | Trung bình |
| 5 | Trang Lookbook (list + chi tiết) | 🟠 Trung bình | Cao |
| 6 | Nâng cấp trang Shop (thumbnail video) | 🟠 Trung bình | Trung bình |
| 7 | Email capture + auto-email | 🟡 Thấp-Trung | Trung bình |
| 8 | Exit-intent popup | 🟡 Thấp | Thấp |
| 9 | SEO danh mục + Schema.org | 🟡 Thấp | Thấp |
| 10 | Hotspot tương tác trên ảnh Lookbook | 🟢 Nâng cao (optional) | Cao |

---

## Ghi chú kỹ thuật cho AI Agent

- Không cần API TikTok chính thức để lấy views/likes real-time (API TikTok hạn chế cho affiliate); có thể **nhập tay** số liệu này định kỳ vào `products.json`, hoặc để trống nếu không có.
- Tất cả link ra TikTok cần `rel="noopener noreferrer"` và mở tab mới để không mất traffic đã vào web.
- Nên tích hợp Google Analytics 4 (hoặc tương tự) để track event `product_click`, `video_redirect`, `email_signup` — làm cơ sở đánh giá tính năng nào đang hiệu quả.
- Ưu tiên component tái sử dụng (`ProductCard`, `ProductGrid`, `StickyTikTokButton`) để dùng chung giữa Shop, Blog embed, Lookbook — tránh trùng lặp code.
