# Kế Hoạch Kỹ Thuật Nâng Cấp KTTX11 PRO v2.0

> Hệ thống kiểm tra trực tuyến Tin học 11 – Trường THPT Giá Rai – Phân hiệu Nguyễn Trung Trực (Sở GD&ĐT Cà Mau), Năm học 2026–2027.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> Dựa trên 4 quyết định đã xác nhận của thầy/cô, hệ thống sẽ tiến hành xóa bỏ toàn bộ mã client-side giả lập và tách biệt 100% bảo mật về phía máy chủ/Firestore:

- **Định hướng giao diện**: Chuẩn Cổng thông tin Giáo dục Cà Mau, màu chủ đạo Deep Navy (`#0A192F` / `#0F2042`) kết hợp Cyan biển Cà Mau (`#0EA5E9` / `#06B6D4`), độ tương phản cao chống chói mắt trên màn hình phòng máy trường học.
- **Cơ sở dữ liệu & Lưu trữ**: Firebase Firestore thời gian thực (real-time), chấm dứt việc dùng `localStorage` hay `server-db.json` làm kho dữ liệu chính thức.
- **Chống gian lận phòng máy**: Chế độ nghiêm ngặt — Bắt buộc toàn màn hình (Full-Screen Lockdown), chặn chuột phải (context menu), chặn phím tắt DevTools/F12/Ctrl+C/Ctrl+U/Ctrl+S, bắt sự kiện mất tiêu điểm (blur/visibilitychange) và đếm vi phạm tự động nộp bài khi quá giới hạn cho phép.
- **Đồng bộ Google Sheets**: Tự động chuyển điểm và nhật ký chi tiết sang Google Sheets ngay khi học sinh nộp bài thành công; có cơ chế hàng đợi (Retry Queue) lưu cục bộ mã hóa nếu mạng trường học chập chờn để gửi lại khi có mạng.

---

## 1. Rà Soát Hiện Trạng & Phân Tích Lỗ Hổng Kỹ Thuật

Qua khảo sát toàn bộ codebase hiện hữu, phát hiện các điểm xung đột trực tiếp với nguyên tắc bắt buộc:

1. **Lỗ hổng lộ đáp án và thang điểm ở Frontend (`src/services/apiClient.ts`)**:
   - `apiClient.ts` đang `import { OFFICIAL_EXAMS }` trực tiếp trong mã chạy ở trình duyệt. Mọi học sinh chỉ cần bật Console F12 hoặc gõ xem biến là đọc được toàn bộ đáp án đúng `correctOption` (Phần I) và `correctValue` (Phần II) của cả 4 mã đề (101, 102, 103, 104).
   - Thao tác chấm điểm thi bị đẩy về chạy fallback ở frontend với `localStorage`.
2. **Lộ thông tin quản trị và khóa bảo mật**:
   - `ADMIN_PASSWORD = 'admin123'`, chuỗi secret Google Sheets `SHARED_SECRET_KEY = 'GIA_RAI_TIN12_SECURE_2026'` đang bị hardcode ngay trong file TypeScript frontend `apiClient.ts`.
3. **Phụ thuộc file `server-db.json` và `localStorage`**:
   - Máy chủ `server.ts` ghi vào file cục bộ `server-db.json`. Khi triển khai lên Vercel Serverless Functions (`/api/*`), hệ thống file là read-only/ephemeral, dẫn đến mất toàn bộ dữ liệu học sinh và bài thi.
4. **Xung đột cấu hình Vercel vs AI Studio Dev Server**:
   - Thư mục `/api/*` có một số file handler nhưng chưa đồng bộ với Firestore, thiếu bảo mật backend và chưa có cơ chế verify token giáo viên an toàn.

---

## 2. Kiến Trúc Kỹ Thuật & Luồng Dữ Liệu KTTX11 PRO v2.0

```
┌────────────────────────────────────────────────────────────────────────┐
│                   GIAO DIỆN HỌC SINH & GIÁO VIÊN                       │
│  - Chuẩn Cổng GD&ĐT Cà Mau (Deep Navy #0A192F / Cyan #0EA5E9)          │
│  - Bóc tách 100% đáp án: Đề thi hiển thị chỉ chứa text & options       │
│  - Chế độ giám thị máy tính: Fullscreen, Anti-Copy, Blur Sentinel      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTPS (API / Firestore Client SDK)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      TẦNG BẢO MẬT & API BACKEND                        │
│  - Vercel Serverless Functions (/api/*) & Express Dev Server (server.ts)│
│  - Xác thực mật khẩu giáo viên qua biến môi trường ADMIN_PASSWORD      │
│  - Chấm điểm bài thi độc quyền tại Backend (Server-Side Grading)       │
│  - Stripper Engine: Lọc bỏ toàn bộ đáp án đúng trước khi trả về client │
└─────────────────┬──────────────────────────────────┬───────────────────┘
                  │                                  │
                  ▼                                  ▼
┌───────────────────────────────────┐  ┌─────────────────────────────────┐
│     FIREBASE FIRESTORE CLOUD      │  │     GOOGLE SHEETS WEB APP       │
│  - /configs/current               │  │  - Tự động ghi kết quả bài thi  │
│  - /students/{studentId}          │  │  - Ghi nhật ký thi cử & vi phạm │
│  - /attempts/{attemptId}          │  │  - Hàng đợi Retry tự phục hồi   │
│  - /audit_logs/{logId}            │  │                                 │
└───────────────────────────────────┘  └─────────────────────────────────┘
```

### Thiết kế Cơ sở dữ liệu Firestore (`firebase-blueprint.json`):
- `configs/exam_config`: Thông tin kỳ thi (Năm học 2026-2027, thời gian 45 phút, trạng thái Khóa/Mở đề, chế độ xem điểm).
- `students/{studentId}`: Danh sách học sinh theo khối 11 THPT Giá Rai (mã định danh, họ tên, lớp, trạng thái).
- `attempts/{attemptId}`: Lượt thi của từng học sinh (thời điểm bắt đầu, bài làm trắc nghiệm, bài làm đúng/sai, số lần rời tab, điểm chính thức được máy chủ chấm, trạng thái đồng bộ Google Sheets).
- `audit_logs/{logId}`: Nhật ký giám sát an toàn (học sinh vào thi, nộp bài, rời màn hình, giáo viên khóa/mở đề, giáo viên can thiệp điểm).

---

## 3. Trải Nghiệm Người Dùng & Thiết Kế Giao Diện (Visual Design)

- **Phong cách Cổng Giáo Dục Cà Mau**:
  - Tông màu: Nền Slate tối giản trang nhã kết hợp dải Header & Banner Deep Navy (`#0A192F`, `#0F2447`), điểm nhấn thương hiệu Cyan Thủy triều (`#0284C7`, `#0EA5E9`).
  - Font chữ: `Be Vietnam Pro` (tiếng Việt chuẩn mực, hỗ trợ hoàn hảo dấu thanh) kết hợp `JetBrains Mono` / Tabular figures cho đồng hồ đếm ngược và mã đề.
  - Phù hiệu & Huy hiệu trường: THPT Giá Rai – Phân hiệu Nguyễn Trung Trực, trang trọng, nghiêm túc.
- **Phòng thi tập trung (Exam Focus Mode)**:
  - Bố cục 2 cột khoa học: Cột trái (70%) hiển thị câu hỏi rõ ràng, cỡ chữ 16px dễ đọc, khoảng cách dòng thoáng; Cột phải (30%) là Lưới điều hướng câu hỏi (24 câu MCQ + 4 câu Đúng/Sai).
  - Trạng thái rõ ràng: Đã trả lời (Cyan nổi bật), Chưa trả lời (Trắng viền Slate), Đặt cờ nghi vấn (Vàng cam).
  - Không có thanh cuộn ngang, hoàn toàn phản hồi mượt trên cả PC phòng máy lẫn màn hình điện thoại di động.

---

## 4. Danh Sách File Cần Chỉnh Sửa, Tạo Mới & Loại Bỏ

### File Cần Tạo Mới:
1. `firebase-blueprint.json`: Định nghĩa cấu trúc các thực thể Firestore (`configs`, `students`, `attempts`, `audit_logs`).
2. `firestore.rules`: Bộ quy tắc bảo mật Firestore Zero-Trust (chặn học sinh đọc đề có đáp án, chặn sửa điểm, chặn đọc bài của bạn).
3. `src/services/firebase.ts`: Khởi tạo Firebase SDK an toàn với xử lý lỗi mạng chuẩn mực.
4. `src/services/antiCheat.ts`: Module giám sát độc lập (Full-screen API, Window Blur/Focus, Chặn Copy/Paste, Chặn F12/Phím tắt).
5. `src/services/syncQueue.ts`: Cơ chế hàng đợi tự động đồng bộ kết quả lên Google Sheets kèm cơ chế retry khi mạng chập chờn.

### File Cần Chỉnh Sửa:
1. `src/services/apiClient.ts`:
   - **XÓA BỎ HOÀN TOÀN** việc import `OFFICIAL_EXAMS` (bảo mật tuyệt đối, không lộ đáp án ở client).
   - Xóa bỏ mật khẩu `admin123` hardcoded và secret key Google Sheets ở frontend.
   - Chuyển hướng các cuộc gọi sang API Backend thực tế hoặc Firestore an toàn, hiển thị lỗi chuẩn khi mất kết nối.
2. `server.ts` & `/api/*`:
   - Chuẩn hóa các route backend (`/api/config`, `/api/students/verify`, `/api/exam/start`, `/api/exam/submit`, `/api/exam/save-progress`, `/api/exam/log-event`, `/api/exam/toggle-lock`, `/api/admin/*`).
   - Đảm bảo stripped câu hỏi (loại bỏ `correctOption` và `correctValue`) trước khi gửi cho học sinh.
   - Chấm điểm an toàn chỉ tại backend và đồng bộ dữ liệu vào Firestore + Google Sheets.
3. `src/components/ExamRoom.tsx`:
   - Tích hợp module Anti-Cheat nghiêm ngặt, hiển thị thanh trạng thái kết nối mạng & chế độ toàn màn hình.
4. `src/components/TeacherDashboard.tsx`:
   - Giao diện quản trị viên chuyên nghiệp: Quản lý khóa/mở đề, danh sách điểm thời gian thực, bảng phân tích ma trận điểm, xuất Excel/Sheets.
5. `src/components/Header.tsx` & `src/components/HomeView.tsx`:
   - Tinh chỉnh giao diện theo phong cách Cổng thông tin Giáo dục Cà Mau (Deep Navy & Cyan).
6. `.env.example`:
   - Khai báo đầy đủ các biến môi trường: `ADMIN_PASSWORD`, `GOOGLE_SHEET_WEBAPP_URL`, `GOOGLE_SHEET_SECRET_KEY`, `VITE_FIREBASE_*`.

---

## 5. Kế Hoạch Triển Khai Chia Thành 5 Giai Đoạn Độc Lập

```
┌────────────────────────────────────────────────────────────────────────┐
│ GIAI ĐOẠN 1: BẢO MẬT & BÓC TÁCH ĐÁP ÁN KHỎI FRONTEND                   │
│ - Xóa bỏ import đáp án chuẩn khỏi client bundle                       │
│ - Chuẩn hóa Backend chấm điểm độc quyền & stripped câu hỏi            │
│ - Kiểm thử: Build bundle không còn chứa chuỗi đáp án đúng             │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ GIAI ĐOẠN 2: THIẾT LẬP FIREBASE FIRESTORE & QUY TẮC ZERO-TRUST         │
│ - Kích hoạt Firebase qua tool chuẩn, tạo blueprint & firestore.rules  │
│ - Kết nối lưu trữ lượt thi và cấu hình kỳ thi lên Cloud Firestore     │
│ - Kiểm thử: Xác thực kết nối và phân quyền đọc/ghi                    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ GIAI ĐOẠN 3: NÂNG CẤP HỆ THỐNG GIÁM THỊ & CHỐNG GIAN LẬN PHÒNG MÁY     │
│ - Module bắt buộc toàn màn hình, chặn chuột phải, phím tắt F12/Ctrl+C │
│ - Bộ đếm rời màn hình và tự động thu bài khi vi phạm nghiêm trọng     │
│ - Kiểm thử: Thử nghiệm chuyển tab, phím tắt và kiểm tra log ghi nhận  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ GIAI ĐOẠN 4: HÀNG ĐỢI ĐỒNG BỘ GOOGLE SHEETS TỰ ĐỘNG & RETRY RESILIENCE │
│ - Tự động đồng bộ ngay khi nộp bài                                     │
│ - Hàng đợi RetryQueue xử lý trường hợp phòng máy mất mạng tạm thời    │
│ - Kiểm thử: Mock ngắt kết nối và phục hồi tự động                     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ GIAI ĐOẠN 5: TỐI ƯU GIAO DIỆN CỔNG GD CÀ MAU & BẢNG ĐIỀU KHIỂN GIÁO VIÊN│
│ - Áp dụng bảng màu Deep Navy & Cyan chuẩn phòng máy                   │
│ - Hoàn thiện Dashboard giáo viên, thống kê phân phối điểm và mã đề    │
│ - Kiểm tra toàn diện TypeScript, build kiểm thử và Vercel readiness   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Tiêu Chí Nghiệm Thu & Kiểm Thử Chi Tiết

1. **Bảo mật tuyệt đối**:
   - Tìm kiếm chuỗi trong build output `dist/`: Tuyệt đối không xuất hiện thuộc tính `correctOption` hay `correctValue`.
   - Tìm kiếm `ADMIN_PASSWORD`: Tuyệt đối không có mật khẩu quản trị lộ trong JS client.
2. **Tính toàn vẹn dữ liệu đề thi**:
   - Toàn bộ 4 mã đề (101, 102, 103, 104) giữ nguyên vẹn 100% nội dung câu hỏi, phương án, bối cảnh và thang điểm (MCQ: 24 câu x 0.25đ = 6.0đ; Đúng/Sai: 4 câu theo thang chuẩn Bộ GD&ĐT = 4.0đ; Tổng: 10.0đ).
3. **Độ ổn định phòng máy trường học**:
   - Khi học sinh tải lại trang (F5) hoặc mất điện/rớt mạng phòng máy, tiến độ làm bài được bảo toàn và cho phép tiếp tục nếu chưa hết thời gian.
