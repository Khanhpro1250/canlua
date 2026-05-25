# App Cân Nông Sản Mekong

**Tên app gợi ý:** Sổ Lúa Mekong / AgriScale / Cân Nông Sản Đồng Tháp  
**Tagline:** Cân nhanh - Phiếu đẹp - Quản lý dễ

**Mô tả ngắn gọn:**  
Ứng dụng di động thay thế sổ tay truyền thống dành cho thương lái, người cân lúa, sen, hoa, trái cây tại Đồng Tháp và khu vực Đồng Bằng Sông Cửu Long. Giao diện đơn giản, chữ lớn, phù hợp với người lớn tuổi, tập trung vào tốc độ và tính thực tế.

---

## 1. Tổng quan dự án

- **Đối tượng chính**: Thương lái, chủ kho nhỏ, người cân tại ruộng (tuổi 35-60).
- **Pain point**: Đang dùng sổ tay hoặc các app cũ (Cân Lúa V5...) thiếu đồng bộ, báo cáo yếu, phiếu chưa chuyên nghiệp.
- **Lợi thế**: Là web developer + quê Sa Đéc → hiểu rõ nhu cầu thực tế của người dùng.
- **Mục tiêu**: Xây dựng app solo, dễ sử dụng, có mô hình kiếm tiền bền vững.
- **Nền tảng**: **Android + iOS (React Native)**

---

## 2. Mô hình Giá & Gói Dịch Vụ

| Gói       | Giá                          | Đối tượng chính                  |
|-----------|------------------------------|----------------------------------|
| **Free**  | Miễn phí                     | Thử nghiệm, nông dân nhỏ         |
| **Cơ Bản**| **229.000đ** (mua một lần)   | Thương lái dùng 1 máy            |
| **Pro**   | **59.000đ/tháng** hoặc **499.000đ/năm** | Thương lái lớn, kho hàng |
| **Premium**| **99.000đ/tháng**           | HTX, doanh nghiệp nhỏ            |

---

## 3. Checklist Tính năng Chi tiết

| STT | Phân hệ              | Tính năng / Nghiệp vụ chi tiết                  | FREE | CƠ BẢN | PRO     | PREMIUM | Ghi chú UX / Kỹ thuật (React Native) |
|-----|----------------------|--------------------------------------------------|------|--------|---------|---------|--------------------------------------|
| 1   | Quản lý Cân (Core)   | Nhập số cân bằng tay (Ma trận lưới)             | ✔    | ✔      | ✔       | ✔       | Bàn phím số custom siêu to + nút 00 |
| 2   | Quản lý Cân (Core)   | Tự động tính tiền Real-time                     | ✔    | ✔      | ✔       | ✔       | - |
| 3   | Quản lý Cân (Core)   | Tùy chỉnh trừ bì bao                            | ✔    | ✔      | ✔       | ✔       | Pro+ trừ riêng từng bao |
| 4   | Quản lý Cân (Core)   | Hỗ trợ nhiều loại nông sản                      | ✔    | ✔      | ✔       | ✔       | Icon + màu phân biệt |
| 5   | Quản lý Cân (Core)   | Nhập cân bằng giọng nói                         | Giới hạn | ✔  | ✔       | ✔       | `@react-native-voice/voice` |
| 6   | Lưu trữ & Lịch sử    | Lưu lịch sử giao dịch                           | 500 bao/th | Vô hạn | Vô hạn | Vô hạn | WatermelonDB |
| 7   | Lưu trữ & Lịch sử    | Thời gian xem lịch sử                           | 30 ngày | Vĩnh viễn | Vĩnh viễn | Vĩnh viễn | - |
| 8   | Lưu trữ & Lịch sử    | Bộ lọc & Tìm kiếm nâng cao                      | ✖    | ✔      | ✔       | ✔       | Hỗ trợ không dấu |
| 9   | Xuất bản & Hóa đơn   | Tạo Phiếu thu mua / Biên nhận                   | ✖    | ✔      | ✔       | ✔       | Tổng tiền bằng chữ |
| 10  | Xuất bản & Hóa đơn   | Chữ ký điện tử                                  | ✖    | ✔      | ✔       | ✔       | `react-native-signature-canvas` |
| 11  | Xuất bản & Hóa đơn   | Export Excel & PDF                              | ✖    | ✔      | ✔       | ✔       | `xlsx`, `react-native-html-to-pdf` |
| 12  | Xuất bản & Hóa đơn   | In Bluetooth máy in nhiệt                       | ✖    | ✔      | ✔       | ✔       | `react-native-bluetooth-escpos-printer` |
| 13  | Xuất bản & Hóa đơn   | Chia sẻ nhanh qua Zalo                          | ✖    | ✖      | ✔       | ✔       | App Intent |
| 14  | Xuất bản & Hóa đơn   | Hóa đơn điện tử GTGT (API)                      | ✖    | ✖      | ✖       | ✔       | Kết nối nhà cung cấp |
| 15  | Hệ thống             | Hiển thị quảng cáo                              | Có   | Không  | Không   | Không   | - |
| 16  | Hệ thống & Cloud     | Sao lưu & Khôi phục dữ liệu                     | ✖    | Thủ công | Tự động | Tự động | - |
| 17  | Hệ thống & Cloud     | Đồng bộ Cloud (multi-device)                    | ✖    | ✖      | ✔       | ✔       | Supabase + Offline-first |
| 18  | Nâng cao             | Quản lý công nợ                                 | ✖    | ✖      | ✔       | ✔       | - |
| 19  | Nâng cao             | Báo cáo thống kê + Biểu đồ                      | ✖    | ✖      | ✔       | ✔       | Victory Charts / Recharts |
| 20  | Nâng cao             | Tạo & Quét QR Code lô hàng                      | ✖    | ✖      | ✔       | ✔       | `react-native-qrcode-svg` |
| 21  | Nâng cao             | Phân quyền (Chủ kho - Nhân viên)                | ✖    | ✖      | ✔       | ✔       | - |
| 22  | Nâng cao             | Dashboard quản trị trên Web                     | ✖    | ✖      | ✖       | ✔       | React Web |
| 23  | Nâng cao             | Kết nối cân điện tử Bluetooth                   | ✖    | ✖      | ✖       | ✔       | React Native BLE |
| 24  | Nâng cao             | Truy xuất nguồn gốc (Traceability)              | ✖    | ✖      | ✖       | ✔       | - |

---

## 4. Chi tiết Thiết kế Từng Màn Hình

### 4.1 Splash Screen
- Gradient xanh lá + hình ảnh nông nghiệp mờ.
- Logo + tên app lớn giữa màn hình.
- Slogan bên dưới.

### 4.2 Onboarding (3-4 slide)
- Giới thiệu lợi ích chính của app.

### 4.3 Home Screen
- Nút **“+ CÂN MỚI”** cực lớn ở giữa.
- Lịch sử giao dịch gần đây.
- Bottom Navigation: Home, Lịch sử, Báo cáo, Tôi.

### 4.4 Màn hình Nhập Cân Mới (Quan trọng nhất)
- Tìm kiếm/Chọn người bán.
- Chọn loại nông sản (icon).
- Bàn phím số lớn + nút ghi âm.
- Thành tiền hiển thị to, real-time.
- Nút Xác nhận lớn ở dưới.

### 4.5 Màn hình Xác nhận & Tạo Phiếu
- Tóm tắt thông tin.
- Chữ ký điện tử.
- Nút In Bluetooth, Export PDF, Gửi Zalo.

### 4.6 Màn hình Lịch sử
- Bộ lọc thời gian + tìm kiếm.
- Danh sách giao dịch.

### 4.7 Màn hình Báo cáo (Pro+)
- Thẻ tổng quan + biểu đồ.
- Top người bán.

### 4.8 Màn hình Tôi
- Thông tin gói + nút nâng cấp.
- Cài đặt máy in, đồng bộ, hỗ trợ.

**Nguyên tắc thiết kế chung**: Chữ to, nút lớn, màu xanh lá - vàng, ít animation, Offline-first.

---

## 5. Tech Stack

| Phần              | Công nghệ |
|-------------------|----------|
| **Frontend**      | **React Native** (Expo) + TypeScript |
| **UI Library**    | NativeBase / Tamagui / React Native Paper |
| **State**         | Zustand + TanStack Query |
| **Local DB**      | **WatermelonDB** (khuyến nghị) |
| **Backend**       | Supabase (ưu tiên) |
| **Voice**         | `@react-native-voice/voice` |
| **In ấn**         | `react-native-bluetooth-escpos-printer` |
| **PDF/Excel**     | `react-native-html-to-pdf`, `xlsx` |
| **Signature**     | `react-native-signature-canvas` |
| **QR Code**       | `react-native-qrcode-svg` + `expo-barcode-scanner` |

---

## 6. Kế hoạch Phát triển & Phân bổ Vốn 100 triệu

- **Thời gian MVP**: 3-4 tháng part-time
- **Phân bổ**:
  - 8-12 triệu: MacBook / Cloud build (Expo EAS)
  - 10-15 triệu: Server & Tools (Supabase)
  - 35-45 triệu: Marketing (Facebook + TikTok Ads)
  - 3 triệu: Developer Account (Google + Apple)
  - 25-30 triệu: Buffer + test thực tế Sa Đéc

---

## 7. Marketing

- TikTok / Reels: Video thực tế “Thương lái Sa Đéc bỏ sổ tay”
- Group Facebook thương lái Đồng Tháp, An Giang, Cần Thơ
- Hợp tác HTX, Hội Nông dân
- Trial miễn phí + ưu đãi gói Cơ Bản

---

## 8. Next Steps

1. Khảo sát 20-30 thương lái thực tế tại Sa Đéc
2. Setup project React Native + Expo + TypeScript
3. Build MVP (Nhập cân + Lưu local + Tạo phiếu PDF + In Bluetooth)
4. Test & Iterate trước khi launch

---

**Ngày tạo:** 23/05/2026  
**Phiên bản:** 1.1 (React Native)  
**Tác giả:** Khanh