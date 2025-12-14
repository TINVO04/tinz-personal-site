# Hướng dẫn Copilot cho Website Cá nhân TinCoZes

## Tổng quan dự án
Website portfolio cá nhân một trang với các hiệu ứng tương tác. Xây dựng bằng HTML/CSS/JS thuần (không dùng framework), bao gồm:
- Hiệu ứng tuyết rơi trên canvas
- Con trỏ chuột tùy chỉnh với ánh sáng radial gradient
- Hiệu ứng nghiêng 3D cho card khi hover với parallax chuột
- Hiệu ứng giải mã chữ kiểu hacker
- Nhạc nền tự động phát với fade-in
- Màn hình intro click để vào

**Cấu trúc file**: Phẳng - `index.html`, `script.js`, `styles.css` ở thư mục gốc. Assets trong `assets/images/` và `assets/music/`.

## Kiến trúc Hiệu ứng Hình ảnh

### Hệ thống Tuyết rơi (`script.js` dòng 7-66)
- Hệ thống particle trên canvas với tự động scale (`flakesCount = width / 10`)
- Mỗi bông tuyết có thuộc tính: `x`, `y`, `r` (bán kính), `speedY`, `drift`, `opacity`
- Điều khiển tốc độ toàn cục qua hằng số `SNOW_SPEED` (dòng 53)
- Xử lý resize cửa sổ bằng cách khởi tạo lại các bông tuyết

### Hiệu ứng Hover Card
**Hệ thống 2 phần** kết hợp CSS và JS:
1. **Ánh sáng radial gradient** (CSS): Dùng CSS custom properties `--mouse-x` và `--mouse-y` được cập nhật bởi JS mousemove listener
2. **3D tilt parallax** (JS dòng 125-156): Chuẩn hóa vị trí chuột về `[-1, 1]`, áp dụng transforms `rotateX/Y` với `perspective(900px)`. Xoay tối đa: 8deg, Z-translation: 12px

### Animation Xuất hiện Card
**Trình tự quan trọng** (dòng 100-120):
- Card bắt đầu với `opacity: 0` và transform trong CSS
- Khi click intro, thêm class `.card-enter` với delay lệch nhau 80ms
- Animation kết thúc với listener `animationend` để xóa class và set trạng thái hiển thị cuối cùng
- Phải giữ `perspective(900px)` để hiệu ứng nghiêng hoạt động

## Quản lý Âm thanh
Nhạc nền (`assets/music/1.mp3`) với **fade-in thủ công**:
- Bắt đầu ở volume 0, tăng 0.02 mỗi 80ms lên 0.15
- Xử lý autoplay bị chặn với `.catch()`
- Được set để lặp vô hạn

**Để đổi nhạc**: Cập nhật `<audio>` src trong `index.html` dòng 185

## Các Pattern CSS

### Hệ thống Background Phân lớp
Ba lớp độ sâu (tất cả `position: fixed`):
1. **Base**: `background-image: url("assets/images/bg.jpg")` với `background-attachment: fixed`
2. **Aurora gradient** (`body::before`): 4 radial gradients với animation `auroraShift` (22s alternate)
3. **Vignette** (`body::after`): overlay `rgba(0,0,0,0.42)` để tạo hiệu ứng focus

### Z-index Stack
- `999`: Snow canvas (below content, above background)
- `9999`: Custom cursor
- `10000`: Intro overlay
- `10001`: Cursor (must be above overlay)

### Quy ước Styling Card
- Background cơ bản: `rgba(6,79,79,0.352)` với `backdrop-filter: blur(10px)`
- Border: `1px solid rgba(148,184,176,0.25)`, tăng lên `0.6` khi hover
- Border radius: `var(--radius-xl)` (22px)
- Ngoại lệ Hero card: Hoàn toàn trong suốt (`rgba(255,255,255,0)`) với `backdrop-filter: none`

## Các Pattern JavaScript

### Hiệu ứng Giải mã Chữ (hàm `decodeTextEffect`)
Animation đệ quy hiển thị từng ký tự trong khi hiển thị các ký tự ngẫu nhiên phía trước điểm đang hiển thị. Dùng cho element `#hero-sub` với tốc độ 100ms, delay restart 2000ms.

### Triển khai Con trỏ Tùy chỉnh
- DOM element `.cursor-fx` được thêm bằng code
- Cập nhật vị trí trên `mousemove` thành `e.clientX/Y`
- CSS: `cursor: none` trên tất cả elements để ẩn con trỏ mặc định

## Hướng dẫn Phát triển

### Thêm Card Mới
1. Dùng base class `.card` để giữ styling nhất quán
2. Thêm card vào cột `<section>` phù hợp (trái: 1.4fr, phải: 1.1fr)
3. Card sẽ tự động nhận animation xuất hiện khi click intro
4. Hiệu ứng hover (nghiêng + ánh sáng) được áp dụng qua JS listener cho tất cả `.card` elements

### Chỉnh sửa Animations
- **Tốc độ tuyết rơi**: Đổi hằng số `SNOW_SPEED` (dòng 53)
- **Độ nghiêng card**: Điều chỉnh `maxRotate` (dòng 141, mặc định 8deg)
- **Delay xuất hiện card**: Sửa phép tính `80 * index` (dòng 108)
- **Thời lượng animation aurora**: Đổi `22s` trong keyframes `auroraShift`

### Quản lý Assets
- **Avatar**: Cập nhật `background-image` trong class `.avatar-inner` (CSS dòng 330)
- **Background**: Đổi `background-image` trong `body` (CSS dòng 61)
- **Favicon**: Thay thế `assets/images/favicon.png`
- **Nhạc**: Files trong `assets/music/`, tham chiếu trong `<audio>` src

## Responsive
- Breakpoint: `768px` cho mobile
- Desktop: Grid 2 cột (`1.4fr` trái, `1.1fr` phải)
- Mobile: Cột đơn, bật overflow scroll (xóa `overflow: hidden`)
- Social grid: `auto-fit` với `minmax(180px, 1fr)`

## Lỗi Thường Gặp
- Không xóa `perspective(900px)` khỏi card transforms - sẽ làm hỏng hiệu ứng nghiêng 3D
- Canvas phải resize khi window resize nếu không tuyết sẽ không scale đúng
- Z-index của intro overlay phải cao hơn content nhưng thấp hơn cursor
- Class `.card-enter` của card phải được xóa sau animation nếu không JS transforms sẽ không hoạt động
- Audio fade-in dùng `setInterval`, không phải CSS transitions (để tương thích đa trình duyệt)
