# 📋 EduLink – Bảng kiểm tra chức năng & luồng giao diện (UI Test Checklist)

> **Mục đích**: Rà soát toàn bộ chức năng và luồng hiện có trên giao diện frontend để phát hiện lỗi.
> **Ngày tạo**: 2026-05-25
> **Phiên bản**: 1.0

---

## Quy ước trạng thái

| Ký hiệu | Ý nghĩa |
|----------|----------|
| ✅ | Pass – Hoạt động đúng |
| ❌ | Fail – Phát hiện lỗi |
| ⚠️ | Warning – Hoạt động nhưng có vấn đề nhỏ |
| ⏳ | Chưa test |
| N/A | Không áp dụng |

---

## Mục lục

1. [Xác thực (Authentication)](#1-xác-thực-authentication)
2. [Dashboard – Admin](#2-dashboard--admin)
3. [Dashboard – Phụ huynh (Parent)](#3-dashboard--phụ-huynh-parent)
4. [Dashboard – Giảng viên (Teacher)](#4-dashboard--giảng-viên-teacher)
5. [Quản lý Sinh viên (Admin)](#5-quản-lý-sinh-viên-admin)
6. [Quản lý Phụ huynh (Admin)](#6-quản-lý-phụ-huynh-admin)
7. [Liên kết PH – SV (Admin)](#7-liên-kết-ph--sv-admin)
8. [Chương trình đào tạo – Ngành (Admin)](#8-chương-trình-đào-tạo--ngành-admin)
9. [Quản lý Môn học (Admin)](#9-quản-lý-môn-học-admin)
10. [Quản lý Điểm (Admin)](#10-quản-lý-điểm-admin)
11. [Điểm danh – Admin](#11-điểm-danh--admin)
12. [Điểm danh – Giảng viên (Teacher)](#12-điểm-danh--giảng-viên-teacher)
13. [Năm học & Học kỳ (Admin)](#13-năm-học--học-kỳ-admin)
14. [Chương trình đào tạo / Curriculum (Admin)](#14-chương-trình-đào-tạo--curriculum-admin)
15. [Hộp thư Phản hồi (Admin)](#15-hộp-thư-phản-hồi-admin)
16. [Thông báo (Admin)](#16-thông-báo-admin)
17. [Câu hỏi thường gặp – FAQ (Admin)](#17-câu-hỏi-thường-gặp--faq-admin)
18. [Xem điểm – Phụ huynh](#18-xem-điểm--phụ-huynh)
19. [Xem điểm danh – Phụ huynh](#19-xem-điểm-danh--phụ-huynh)
20. [Thời khóa biểu – Phụ huynh](#20-thời-khóa-biểu--phụ-huynh)
21. [Trò chuyện AI – Phụ huynh](#21-trò-chuyện-ai--phụ-huynh)
22. [Phản hồi / Tin nhắn – Phụ huynh](#22-phản-hồi--tin-nhắn--phụ-huynh)
23. [Hỏi đáp (FAQ) – Phụ huynh](#23-hỏi-đáp-faq--phụ-huynh)
24. [Thông báo – Phụ huynh & Giảng viên](#24-thông-báo--phụ-huynh--giảng-viên)
25. [Thời khóa biểu – Giảng viên](#25-thời-khóa-biểu--giảng-viên)
26. [Cài đặt tài khoản (Tất cả roles)](#26-cài-đặt-tài-khoản-tất-cả-roles)
27. [Layout & Navigation chung](#27-layout--navigation-chung)
28. [Middleware & Phân quyền](#28-middleware--phân-quyền)

---

## 1. Xác thực (Authentication)

**Route**: `/login`
**Components**: `LoginPageClient`, `LoginStep`, `ActivationStep`, `OtpStep`, `SetPasswordStep`, `ForgotPasswordStep`, `AuthHeroPanel`

### 1.1 Đăng nhập (LoginStep)

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Trạng thái | Ghi chú |
|---|-----------|---------------|-------------------|------------|---------|
| 1.1.1 | Đăng nhập thành công (Admin) | Nhập identifier + password đúng của admin → Submit | Redirect đến `/admin` | ✅ | |
| 1.1.2 | Đăng nhập thành công (Parent) | Nhập identifier + password đúng của parent → Submit | Redirect đến `/parent` | ✅ | |
| 1.1.3 | Đăng nhập thành công (Teacher) | Nhập identifier + password đúng của teacher → Submit | Redirect đến `/teacher` | ✅ | |
| 1.1.4 | Đăng nhập sai mật khẩu | Nhập identifier đúng + password sai → Submit | Hiển thị thông báo lỗi, không redirect | ✅ | |
| 1.1.5 | Đăng nhập identifier không tồn tại | Nhập identifier không có trong hệ thống → Submit | Hiển thị thông báo lỗi | ✅ | |
| 1.1.6 | Đăng nhập với trường trống | Bỏ trống identifier hoặc password → Submit | Validation error, không gọi API | ✅ | |
| 1.1.7 | Hiển thị/ẩn mật khẩu | Click icon toggle password visibility | Chuyển đổi giữa text/password | ✅ | |
| 1.1.8 | Link "Kích hoạt tài khoản" | Click link kích hoạt tài khoản | Chuyển sang ActivationStep | ✅ | |
| 1.1.9 | Link "Quên mật khẩu" | Click link quên mật khẩu | Chuyển sang ForgotPasswordStep | ✅ | |

### 1.2 Kích hoạt tài khoản (ActivationStep)

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Trạng thái | Ghi chú |
|---|-----------|---------------|-------------------|------------|---------|
| 1.2.1 | Gửi OTP thành công | Nhập SĐT + mã sinh viên hợp lệ → Submit | Chuyển sang OtpStep, hiển thị toast | ✅ | |
| 1.2.2 | SĐT không hợp lệ | Nhập SĐT sai định dạng → Submit | Validation error | ✅ | |
| 1.2.3 | Mã SV không tồn tại | Nhập mã SV không có trong DB → Submit | Thông báo lỗi từ API | ✅ | |
| 1.2.4 | Quay lại đăng nhập | Click "Quay lại" | Chuyển về LoginStep | ✅ | |

### 1.3 Xác thực OTP (OtpStep)

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Trạng thái | Ghi chú |
|---|-----------|---------------|-------------------|------------|---------|
| 1.3.1 | Nhập OTP đúng | Nhập 6 chữ số OTP đúng → Verify | Chuyển sang SetPasswordStep | ✅ | |
| 1.3.2 | Nhập OTP sai | Nhập OTP sai → Verify | Thông báo lỗi OTP không hợp lệ | ✅ | |
| 1.3.3 | Gửi lại OTP | Click "Gửi lại OTP" | Gửi lại mã OTP mới, reset timer | ✅ | |
| 1.3.4 | Quay lại ActivationStep | Click "Quay lại" | Trở về ActivationStep | ✅ | |

### 1.4 Đặt mật khẩu (SetPasswordStep)

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Trạng thái | Ghi chú |
|---|-----------|---------------|-------------------|------------|---------|
| 1.4.1 | Đặt mật khẩu thành công | Nhập mật khẩu + xác nhận khớp nhau → Submit | Toast thành công, quay về LoginStep | ✅ | |
| 1.4.2 | Mật khẩu không khớp | Nhập mật khẩu + xác nhận khác nhau → Submit | Validation error | ✅ | |
| 1.4.3 | Mật khẩu quá ngắn | Nhập mật khẩu < yêu cầu tối thiểu → Submit | Validation error | ✅ | |

### 1.5 Quên mật khẩu (ForgotPasswordStep)

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Trạng thái | Ghi chú |
|---|-----------|---------------|-------------------|------------|---------|
| 1.5.1 | Yêu cầu OTP quên mật khẩu | Nhập SĐT đã đăng ký → Gửi mã | Gửi OTP qua SMS, hiển thị form nhập OTP + mật khẩu mới | ✅ | |
| 1.5.2 | Reset mật khẩu thành công | Nhập OTP + mật khẩu mới → Submit | Toast thành công, quay về LoginStep | ✅ | |
| 1.5.3 | SĐT chưa đăng ký | Nhập SĐT không tồn tại → Gửi mã | Thông báo lỗi | ✅ | |
| 1.5.4 | Quay lại đăng nhập | Click "Quay lại đăng nhập" | Chuyển về LoginStep | ✅ | |

### 1.6 AuthHeroPanel

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Trạng thái | Ghi chú |
|---|-----------|---------------|-------------------|------------|---------|
| 1.6.1 | Hiển thị đúng nội dung theo step | Chuyển giữa các step (login, activation, otp, set-password, forgot-password) | Hero panel cập nhật nội dung tương ứng | ✅ | |
| 1.6.2 | Responsive trên mobile | Thu nhỏ viewport < 1024px | Panel ẩn hoặc chuyển bố cục dọc | ✅ | |

---

## 2. Dashboard – Admin

**Route**: `/admin`
**Components**: `DashboardPageClient`, `StatCard`, `PerformanceChart`, `AttendanceSummary`, `RecentFeedbackTable`

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Trạng thái | Ghi chú |
|---|-----------|---------------|-------------------|------------|---------|
| 2.1 | Hiển thị thống kê tổng quan | Truy cập `/admin` | Hiển thị 4 StatCards: tổng SV, tổng PH, tổng thông báo, phản hồi chờ xử lý | ⏳ | |
| 2.2 | Biểu đồ GPA theo ngành | Truy cập `/admin` | PerformanceChart hiển thị biểu đồ gpaByMajor | ⏳ | |
| 2.3 | Biểu đồ điểm danh | Truy cập `/admin` | AttendanceSummary hiển thị tỷ lệ present/absent/late | ⏳ | |
| 2.4 | Bảng phản hồi gần đây | Truy cập `/admin` | RecentFeedbackTable hiển thị danh sách phản hồi mới nhất | ⏳ | |
| 2.5 | Click phản hồi trong bảng | Click vào 1 dòng phản hồi | Điều hướng đến trang chi tiết phản hồi | ⏳ | |
| 2.6 | Dữ liệu rỗng | Hệ thống không có dữ liệu | Hiển thị state trống phù hợp, không crash | ⏳ | |
| 2.7 | Loading state | Reload trang | Hiển thị skeleton/loading trong lúc fetch | ⏳ | |
| 2.8 | Error state | API trả lỗi (mock) | Hiển thị thông báo lỗi, không crash | ⏳ | |

---

## 3. Dashboard – Phụ huynh (Parent)

**Route**: `/parent`
**Components**: `ParentDashboardPageClient`, `StudentCard`, `AttendanceDonutWidget`, `LatestScoresWidget`, `NotificationsWidget`, `ActionShortcuts`

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Trạng thái | Ghi chú |
|---|-----------|---------------|-------------------|------------|---------|
| 3.1 | Hiển thị danh sách con | Truy cập `/parent` | Hiển thị StudentCard cho mỗi sinh viên liên kết | ⏳ | |
| 3.2 | Thông tin StudentCard | Xem StudentCard | Hiển thị tên, mã SV, lớp, ngành, trạng thái, ảnh đại diện | ⏳ | |
| 3.3 | Biểu đồ điểm danh Donut | Truy cập `/parent` | Hiển thị tỷ lệ present/absent/late dạng vòng tròn | ⏳ | |
| 3.4 | Điểm mới nhất | Truy cập `/parent` | LatestScoresWidget hiển thị điểm gần nhất | ⏳ | |
| 3.5 | Thông báo mới | Truy cập `/parent` | NotificationsWidget hiển thị thông báo gần đây | ⏳ | |
| 3.6 | Phím tắt hành động | Truy cập `/parent` | ActionShortcuts hiển thị các nút đi nhanh đến các trang | ⏳ | |
| 3.7 | Click shortcut | Click vào một shortcut action | Điều hướng đến trang tương ứng | ⏳ | |
| 3.8 | PH có nhiều SV liên kết | PH có 2+ con | Hiển thị đầy đủ card cho mỗi sinh viên | ⏳ | |
| 3.9 | PH chưa có SV liên kết | PH mới, chưa liên kết SV nào | Hiển thị trạng thái trống phù hợp | ⏳ | |

---

## 4. Dashboard – Giảng viên (Teacher)

**Route**: `/teacher`
**Components**: `TeacherDashboardPageClient`

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Trạng thái | Ghi chú |
|---|-----------|---------------|-------------------|------------|---------|
| 4.1 | Hiển thị thống kê tổng quan | Truy cập `/teacher` | Hiển thị: tổng lớp, lớp đang dạy, tổng SV, tổng buổi học, buổi chưa hoàn thành | ⏳ | |
| 4.2 | Thống kê điểm danh | Truy cập `/teacher` | Hiển thị tỷ lệ present/late/absent/none | ⏳ | |
| 4.3 | Lớp hôm nay | Truy cập `/teacher` | Danh sách lớp `todayClasses` hiển thị đúng thứ/giờ | ⏳ | |
| 4.4 | Lớp gần đây | Truy cập `/teacher` | Danh sách `recentClasses` hiển thị | ⏳ | |
| 4.5 | Thông báo gần đây | Truy cập `/teacher` | `recentNotifications` hiển thị | ⏳ | |
| 4.6 | GV chưa có lớp nào | GV mới, chưa được phân lớp | Hiển thị state trống, không crash | ⏳ | |

---

## 5. Quản lý Sinh viên (Admin)

**Route**: `/admin/students`, `/admin/students/[id]`
**Components**: `StudentsPageClient`, `StudentTable`, `StudentFilterBar`, `StudentCreateModal`, `StudentEditModal`, `StudentDetailPageClient`, `StudentProfileCard`, `StudentParentsCard`, `StudentRecentScoresCard`, `StudentAttendanceCalendar`, `StudentSummaryCards`

### 5.1 Danh sách sinh viên

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Trạng thái | Ghi chú |
|---|-----------|---------------|-------------------|------------|---------|
| 5.1.1 | Hiển thị danh sách SV | Truy cập `/admin/students` | Bảng hiển thị đầy đủ: mã SV, họ tên, lớp, ngành, trạng thái, phụ huynh | ⏳ | |
| 5.1.2 | Phân trang | Có > 1 trang dữ liệu → Click trang 2 | Dữ liệu trang 2 hiển thị, thanh phân trang cập nhật | ⏳ | |
| 5.1.3 | Tìm kiếm theo tên/mã SV | Nhập keyword vào ô tìm kiếm | Danh sách lọc theo keyword | ⏳ | |
| 5.1.4 | Lọc theo trạng thái | Chọn "Đang học" / "Bảo lưu" / "Đình chỉ" | Hiển thị đúng SV theo trạng thái | ⏳ | |
| 5.1.5 | Lọc theo lớp | Chọn 1 lớp cụ thể từ dropdown | Hiển thị SV thuộc lớp đó | ⏳ | |
| 5.1.6 | Lọc theo ngành (major) | Chọn 1 ngành | Hiển thị SV thuộc ngành đó | ⏳ | |
| 5.1.7 | Sắp xếp | Chọn sort option (tên A-Z, mới nhất, v.v.) | Danh sách sắp xếp đúng | ⏳ | |
| 5.1.8 | Reset bộ lọc | Áp dụng filter → Click reset/xóa filter | Quay về danh sách không lọc | ⏳ | |
| 5.1.9 | Không có kết quả | Tìm kiếm keyword không tồn tại | Hiển thị "Không có kết quả" | ⏳ | |

### 5.2 Thêm sinh viên

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Trạng thái | Ghi chú |
|---|-----------|---------------|-------------------|------------|---------|
| 5.2.1 | Mở dialog thêm SV | Click nút "Thêm sinh viên" | Mở StudentCreateModal | ⏳ | |
| 5.2.2 | Thêm SV thành công | Điền đầy đủ: mã SV, họ tên, email, ngày sinh, lớp, niên khóa, ngành, PH → Submit | Toast thành công, danh sách refresh | ⏳ | |
| 5.2.3 | Mã SV trùng | Nhập mã SV đã tồn tại → Submit | Thông báo lỗi trùng mã | ⏳ | |
| 5.2.4 | Thiếu trường bắt buộc | Bỏ trống mã SV hoặc họ tên → Submit | Validation error | ⏳ | |
| 5.2.5 | Hủy thêm SV | Mở modal → Click Cancel/đóng | Modal đóng, không tạo SV | ⏳ | |

### 5.3 Sửa sinh viên

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Trạng thái | Ghi chú |
|---|-----------|---------------|-------------------|------------|---------|
| 5.3.1 | Mở dialog sửa SV | Click icon edit trên 1 dòng SV | Mở StudentEditModal với data đã điền sẵn | ⏳ | |
| 5.3.2 | Sửa thông tin thành công | Thay đổi tên / lớp / trạng thái → Save | Toast thành công, danh sách refresh | ⏳ | |
| 5.3.3 | Sửa SV – validation | Xóa trường bắt buộc → Save | Validation error | ⏳ | |

### 5.4 Chi tiết sinh viên

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Trạng thái | Ghi chú |
|---|-----------|---------------|-------------------|------------|---------|
| 5.4.1 | Xem chi tiết SV | Click vào tên SV / nút xem chi tiết | Mở `/admin/students/[id]` | ⏳ | |
| 5.4.2 | Thông tin profile | Xem trang chi tiết | Hiển thị đầy đủ: mã SV, tên, email, ngày sinh, lớp, niên khóa, ngành, trạng thái | ⏳ | |
| 5.4.3 | Thống kê tổng hợp | Xem SummaryCards | Hiển thị GPA, điểm danh, v.v. | ⏳ | |
| 5.4.4 | Danh sách phụ huynh | Xem StudentParentsCard | Hiển thị PH liên kết, mối quan hệ, SĐT, email | ⏳ | |
| 5.4.5 | Điểm gần đây | Xem StudentRecentScoresCard | Hiển thị bảng điểm gần nhất | ⏳ | |
| 5.4.6 | Lịch điểm danh | Xem StudentAttendanceCalendar | Calendar hiển thị các buổi present/absent/late | ⏳ | |
| 5.4.7 | SV không có dữ liệu | Xem SV mới, chưa có điểm/điểm danh | Hiển thị empty state, không crash | ⏳ | |
| 5.4.8 | Loading/Skeleton | Reload trang chi tiết SV | Hiển thị StudentDetailSkeleton | ⏳ | |

---

## 6. Quản lý Phụ huynh (Admin)

**Route**: `/admin/parents`
**Components**: `ParentsPageClient`, `ParentTable`, `ParentFilterBar`, `ParentFormModal`, `ParentDetailDialog`

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Trạng thái | Ghi chú |
|---|-----------|---------------|-------------------|------------|---------|
| 6.1 | Hiển thị danh sách PH | Truy cập `/admin/parents` | Bảng hiển thị: tên, SĐT, email, quan hệ, trạng thái, SV liên kết | ⏳ | |
| 6.2 | Tìm kiếm PH | Nhập tên / SĐT vào ô tìm kiếm | Lọc danh sách theo keyword | ⏳ | |
| 6.3 | Lọc theo trạng thái | Chọn Active / Inactive | Hiển thị PH theo trạng thái | ⏳ | |
| 6.4 | Lọc theo quan hệ | Chọn Cha / Mẹ / Người giám hộ | Hiển thị PH theo quan hệ | ⏳ | |
| 6.5 | Sắp xếp | Chọn "Mới nhất" / "Tên A-Z" / v.v. | Danh sách sắp xếp đúng | ⏳ | |
| 6.6 | Phân trang | Click trang tiếp | Hiển thị dữ liệu trang tiếp | ⏳ | |
| 6.7 | Thêm PH mới | Click "Thêm PH" → Điền form → Submit | Toast thành công, danh sách refresh | ⏳ | |
| 6.8 | Thêm PH – trùng SĐT | Nhập SĐT đã tồn tại → Submit | Thông báo lỗi trùng | ⏳ | |
| 6.9 | Thêm PH – validation | Bỏ trống tên / SĐT → Submit | Validation error | ⏳ | |
| 6.10 | Sửa PH | Click edit → Thay đổi thông tin → Save | Cập nhật thành công | ⏳ | |
| 6.11 | Xem chi tiết PH | Click vào tên PH hoặc icon detail | Mở ParentDetailDialog hiển thị đầy đủ thông tin + SV liên kết | ⏳ | |
| 6.12 | Xóa / Vô hiệu hóa PH | (Nếu có) Click deactivate | Cập nhật trạng thái | ⏳ | |

---

## 7. Liên kết PH – SV (Admin)

**Route**: `/admin/parent-links`
**Components**: `ParentLinkCreateForm`, `ParentStudentLinkTable`

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Trạng thái | Ghi chú |
|---|-----------|---------------|-------------------|------------|---------|
| 7.1 | Hiển thị bảng liên kết | Truy cập `/admin/parent-links` | Hiển thị danh sách PH-SV đã liên kết với quan hệ, is_primary | ⏳ | |
| 7.2 | Tạo liên kết mới | Chọn PH + SV + quan hệ → Submit | Liên kết tạo thành công, danh sách refresh | ⏳ | |
| 7.3 | Liên kết đã tồn tại | Thử tạo liên kết PH-SV đã có → Submit | Thông báo lỗi trùng | ⏳ | |
| 7.4 | Xóa liên kết | Click xóa liên kết | ConfirmDialog → Xác nhận → Xóa thành công | ⏳ | |
| 7.5 | Gán PH làm primary | Gán mối quan hệ primary cho 1 PH | Cập nhật thành công | ⏳ | |

---

## 8. Chương trình đào tạo – Ngành (Admin)

**Route**: `/admin/majors`
**Components**: `MajorsPageClient`, `MajorDialog`, `MajorFilterBar`

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Trạng thái | Ghi chú |
|---|-----------|---------------|-------------------|------------|---------|
| 8.1 | Hiển thị danh sách ngành | Truy cập `/admin/majors` | Bảng hiển thị: mã ngành, tên ngành, số SV, ngày tạo | ⏳ | |
| 8.2 | Tìm kiếm ngành | Nhập keyword | Lọc danh sách | ⏳ | |
| 8.3 | Thêm ngành mới | Click "Thêm ngành" → Điền form → Submit | Toast thành công, danh sách refresh | ⏳ | |
| 8.4 | Thêm ngành – mã trùng | Nhập mã ngành đã tồn tại | Thông báo lỗi | ⏳ | |
| 8.5 | Sửa ngành | Click edit → Thay đổi → Save | Cập nhật thành công | ⏳ | |
| 8.6 | Xóa ngành | Click xóa → Confirm | Xóa thành công (hoặc báo lỗi nếu còn SV) | ⏳ | |
| 8.7 | Xóa ngành đang có SV | Xóa ngành có SV liên kết | Thông báo lỗi, không cho xóa | ⏳ | |

---

## 9. Quản lý Môn học (Admin)

**Route**: `/admin/subjects` (tham chiếu từ danh sách subject dùng trong scores)
**Components**: `SubjectsPageClient`, `SubjectDialog`, `SubjectFilterBar`

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Trạng thái | Ghi chú |
|---|-----------|---------------|-------------------|------------|---------|
| 9.1 | Hiển thị danh sách môn | Truy cập trang quản lý môn học | Bảng hiển thị: mã môn, tên môn, số tín chỉ, ngành, số bài điểm | ⏳ | |
| 9.2 | Tìm kiếm môn | Nhập keyword | Lọc danh sách | ⏳ | |
| 9.3 | Thêm môn mới | Click "Thêm" → Điền: mã, tên, tín chỉ, ngành → Submit | Toast thành công | ⏳ | |
| 9.4 | Thêm môn – mã trùng | Nhập mã môn đã tồn tại | Thông báo lỗi | ⏳ | |
| 9.5 | Sửa môn | Click edit → Thay đổi → Save | Cập nhật thành công | ⏳ | |
| 9.6 | Xóa môn | Click xóa → Confirm | Xóa thành công (hoặc báo lỗi nếu có điểm) | ⏳ | |
| 9.7 | Liên kết môn với ngành | Chọn ngành khi thêm/sửa môn | Môn gắn với ngành đúng | ⏳ | |

---

## 10. Quản lý Điểm (Admin)

**Route**: `/admin/scores`
**Components**: `ScoresPageClient`, `ScoresFilterBar`, `ScoresTableCard`, `ScoreDetailCard`, `ScoreLogsCard`, `ScoresPageHeader`, `PublishConfirmDialog`

### 10.1 Sổ điểm (Scorebook)

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Trạng thái | Ghi chú |
|---|-----------|---------------|-------------------|------------|---------|
| 10.1.1 | Hiển thị sổ điểm | Truy cập `/admin/scores` | Bảng hiển thị: mã SV, tên, lớp, ngành, môn, tín chỉ, bài tập, giữa kỳ, cuối kỳ, TB, ghi chú, trạng thái | ⏳ | |
| 10.1.2 | Lọc theo ngành | Chọn ngành | Hiển thị SV ngành đó | ⏳ | |
| 10.1.3 | Lọc theo lớp | Chọn lớp | Hiển thị SV lớp đó | ⏳ | |
| 10.1.4 | Lọc theo môn | Chọn môn học | Hiển thị điểm môn đó | ⏳ | |
| 10.1.5 | Lọc theo học kỳ | Chọn học kỳ | Hiển thị điểm HK đó | ⏳ | |
| 10.1.6 | Lọc theo năm học | Chọn năm học | Hiển thị điểm năm đó | ⏳ | |
| 10.1.7 | Tìm kiếm SV | Nhập tên / mã SV | Lọc trong sổ điểm | ⏳ | |
| 10.1.8 | Nhóm theo SV (StudentGroup) | Xem sổ điểm | Các dòng gom nhóm theo sinh viên | ⏳ | |

### 10.2 Chỉnh sửa điểm

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Trạng thái | Ghi chú |
|---|-----------|---------------|-------------------|------------|---------|
| 10.2.1 | Inline edit điểm | Click vào ô điểm → Nhập giá trị mới | Ô chuyển sang edit mode, hiển thị input | ⏳ | |
| 10.2.2 | Lưu điểm hàng loạt (Bulk Update) | Sửa nhiều ô → Click "Lưu" | Tất cả thay đổi được lưu, tính lại TB | ⏳ | |
| 10.2.3 | Nhập điểm ngoài phạm vi | Nhập điểm > 10 hoặc < 0 | Validation error hoặc clamp | ⏳ | |
| 10.2.4 | Tính điểm TB tự động | Nhập đủ bài tập + giữa kỳ + cuối kỳ | Cột TB tự động tính | ⏳ | |

### 10.3 Công bố điểm

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Trạng thái | Ghi chú |
|---|-----------|---------------|-------------------|------------|---------|
| 10.3.1 | Publish 1 bản ghi | Click publish trên 1 dòng → Confirm | Trạng thái chuyển DRAFT → PUBLISHED | ⏳ | |
| 10.3.2 | Bulk publish | Chọn nhiều dòng / filter → Publish all | PublishConfirmDialog → Xác nhận → Tất cả chuyển PUBLISHED | ⏳ | |
| 10.3.3 | Unpublish | Chuyển về DRAFT | Trạng thái chuyển PUBLISHED → DRAFT | ⏳ | |

### 10.4 Chi tiết & Logs

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Trạng thái | Ghi chú |
|---|-----------|---------------|-------------------|------------|---------|
| 10.4.1 | Xem chi tiết điểm | Click vào 1 dòng điểm | ScoreDetailCard hiển thị chi tiết | ⏳ | |
| 10.4.2 | Xem lịch sử thay đổi | Mở ScoreLogsCard | Hiển thị timeline: ai đã thay đổi gì, khi nào | ⏳ | |

### 10.5 Xuất dữ liệu

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Trạng thái | Ghi chú |
|---|-----------|---------------|-------------------|------------|---------|
| 10.5.1 | Export Excel/CSV | Click "Xuất dữ liệu" | File tải về chứa đúng dữ liệu | ⏳ | |

---

## 11. Điểm danh – Admin

**Route**: `/admin/attendance`, `/admin/attendance/[sectionId]`
**Components**: `AttendancePageClient`, `AttendanceCourseCard`, `AttendanceFilterBar`, `CreateClassSectionDialog`, `EditClassSectionDialog`, `ImportClassSectionDialog`, `AttendanceDetailPageClient`, `AttendanceDetailFilters`, `AttendanceDetailTableCard`, `AttendanceStatsCards`, `AttendanceEditDialog`, `CreateSessionDialog`, `EditSessionDialog`

### 11.1 Danh sách lớp học phần

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Trạng thái | Ghi chú |
|---|-----------|---------------|-------------------|------------|---------|
| 11.1.1 | Hiển thị danh sách lớp | Truy cập `/admin/attendance` | Hiển thị AttendanceCourseCard cho mỗi class section | ⏳ | |
| 11.1.2 | Thông tin course card | Xem 1 card | Hiển thị: mã lớp, tên môn, GV, thứ/giờ, phòng, HK, trạng thái, số SV, số buổi | ⏳ | |
| 11.1.3 | Lọc theo học kỳ | Chọn HK | Hiển thị lớp thuộc HK đó | ⏳ | |
| 11.1.4 | Lọc theo năm học | Chọn năm học | Hiển thị lớp thuộc năm đó | ⏳ | |
| 11.1.5 | Lọc theo trạng thái | Chọn UPCOMING / ONGOING / FINISHED | Hiển thị lớp theo trạng thái | ⏳ | |
| 11.1.6 | Empty state | Không có lớp nào | Hiển thị AttendanceEmptyCard | ⏳ | |

### 11.2 CRUD lớp học phần

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Trạng thái | Ghi chú |
|---|-----------|---------------|-------------------|------------|---------|
| 11.2.1 | Tạo lớp mới | Click "Tạo lớp" → Điền form → Submit | Tạo thành công, danh sách refresh | ⏳ | |
| 11.2.2 | Tạo lớp – validation | Bỏ trống mã lớp / môn / HK | Validation error | ⏳ | |
| 11.2.3 | Sửa lớp | Click edit → Thay đổi → Save | Cập nhật thành công | ⏳ | |
| 11.2.4 | Xóa lớp | Click xóa → Confirm | Xóa thành công | ⏳ | |
| 11.2.5 | Import lớp từ file | Click Import → Chọn file Excel/CSV → Upload | ImportClassSectionDialog hiển thị kết quả: created, skipped, errors | ⏳ | |
| 11.2.6 | Import file sai format | Upload file không đúng định dạng | Thông báo lỗi | ⏳ | |

### 11.3 Chi tiết lớp & điểm danh buổi

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Trạng thái | Ghi chú |
|---|-----------|---------------|-------------------|------------|---------|
| 11.3.1 | Xem chi tiết lớp | Click vào card lớp | Mở `/admin/attendance/[sectionId]` | ⏳ | |
| 11.3.2 | Thống kê lớp | Xem AttendanceStatsCards | Hiển thị: tổng SV, tổng buổi, present/late/absent count | ⏳ | |
| 11.3.3 | Danh sách buổi học (sessions) | Xem chi tiết lớp | Hiển thị danh sách sessions với session_no, ngày, ghi chú | ⏳ | |
| 11.3.4 | Tạo buổi học mới | Click "Tạo buổi" → Nhập ngày, số buổi → Submit | Buổi mới tạo thành công | ⏳ | |
| 11.3.5 | Sửa buổi học | Click edit session → Thay đổi → Save | Cập nhật thành công | ⏳ | |
| 11.3.6 | Xóa buổi học | Click xóa session → Confirm | Xóa thành công | ⏳ | |
| 11.3.7 | Điểm danh SV trong buổi | Chọn 1 session → Hiển thị records | Danh sách SV với trạng thái: NONE/PRESENT/LATE/ABSENT | ⏳ | |
| 11.3.8 | Thay đổi trạng thái điểm danh | Click toggle trạng thái SV (PRESENT ↔ ABSENT ↔ LATE) | Trạng thái cập nhật UI | ⏳ | |
| 11.3.9 | Lưu điểm danh hàng loạt | Thay đổi nhiều SV → Click "Lưu" | Bulk save thành công | ⏳ | |
| 11.3.10 | Tìm kiếm SV trong buổi | Nhập tên / mã SV | Lọc danh sách | ⏳ | |
| 11.3.11 | Phân trang records | Có > 20 SV | Phân trang hoạt động đúng | ⏳ | |
| 11.3.12 | Quản lý enrollment | Xem danh sách SV enrolled | Hiển thị đúng, có thể thêm/xóa enrollment | ⏳ | |

---

## 12. Điểm danh – Giảng viên (Teacher)

**Route**: `/teacher/attendance`, `/teacher/attendance/[sectionId]`
**Components**: `TeacherAttendancePageClient`, `TeacherAttendanceDetailPageClient`, `TeacherAttendanceDetailTableCard`

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Trạng thái | Ghi chú |
|---|-----------|---------------|-------------------|------------|---------|
| 12.1 | Hiển thị lớp của GV | Truy cập `/teacher/attendance` | Chỉ hiển thị lớp mà GV đang phụ trách | ⏳ | |
| 12.2 | Lọc theo HK/trạng thái | Áp dụng filter | Lọc đúng | ⏳ | |
| 12.3 | Xem chi tiết lớp | Click vào card lớp | Mở chi tiết với sessions, records | ⏳ | |
| 12.4 | Điểm danh buổi học | Chọn session → Thay đổi trạng thái SV → Lưu | Lưu thành công | ⏳ | |
| 12.5 | GV không thể xóa lớp | Xem giao diện | Không có nút xóa lớp (chỉ admin) | ⏳ | |
| 12.6 | Tạo buổi học | Click "Tạo buổi" (nếu GV có quyền) | Tạo session mới | ⏳ | |

---

## 13. Năm học & Học kỳ (Admin)

**Route**: `/admin/academic-calendar`
**Components**: `AcademicCalendarPageClient`

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Trạng thái | Ghi chú |
|---|-----------|---------------|-------------------|------------|---------|
| 13.1 | Hiển thị danh sách năm học | Truy cập `/admin/academic-calendar` | Hiển thị danh sách AcademicYear với tên, ngày bắt đầu/kết thúc, trạng thái | ⏳ | |
| 13.2 | Hiển thị học kỳ trong năm | Mở chi tiết năm học | Hiển thị danh sách AcademicTerm: HK1, HK2, HKH | ⏳ | |
| 13.3 | Tạo năm học mới | Click "Thêm năm học" → Điền form → Submit | Tạo thành công | ⏳ | |
| 13.4 | Sửa năm học | Click edit → Thay đổi → Save | Cập nhật thành công | ⏳ | |
| 13.5 | Xóa năm học | Click xóa → Confirm | Xóa hoặc báo lỗi nếu có dữ liệu phụ thuộc | ⏳ | |
| 13.6 | Tạo học kỳ | Trong năm học → Click "Thêm HK" → Điền form | Tạo HK thành công | ⏳ | |
| 13.7 | Sửa học kỳ | Click edit HK → Thay đổi → Save | Cập nhật thành công | ⏳ | |
| 13.8 | Xóa học kỳ | Click xóa HK → Confirm | Xóa hoặc báo lỗi | ⏳ | |
| 13.9 | Trạng thái UPCOMING/ONGOING/FINISHED | Kiểm tra hiển thị badge trạng thái | Màu sắc và label đúng | ⏳ | |
| 13.10 | Validation ngày | Nhập end_date < start_date | Validation error | ⏳ | |

---

## 14. Chương trình đào tạo / Curriculum (Admin)

**Route**: (Nếu có riêng, component `CurriculumPageClient`)
**Components**: `CurriculumPageClient`

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Trạng thái | Ghi chú |
|---|-----------|---------------|-------------------|------------|---------|
| 14.1 | Hiển thị chương trình đào tạo | Truy cập trang curriculum | Hiển thị đầy đủ thông tin CTĐT | ⏳ | |
| 14.2 | CRUD operations | Thêm / sửa / xóa mục | Hoạt động đúng | ⏳ | |
| 14.3 | Liên kết với ngành | Chọn ngành → Xem CTĐT | Hiển thị CTĐT thuộc ngành | ⏳ | |

---

## 15. Hộp thư Phản hồi (Admin)

**Route**: `/admin/feedbacks`
**Components**: `FeedbackPageClient`, `FeedbackListSidebar`, `FeedbackDetailPane`, `FeedbackReplyBox`, `AiFeedbackSummaryBanner`, `FeedbackAnalyticsModal`

### 15.1 Danh sách phản hồi

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Trạng thái | Ghi chú |
|---|-----------|---------------|-------------------|------------|---------|
| 15.1.1 | Hiển thị sidebar phản hồi | Truy cập `/admin/feedbacks` | FeedbackListSidebar hiển thị danh sách phản hồi | ⏳ | |
| 15.1.2 | Lọc theo trạng thái | Chọn OPEN / IN_PROGRESS / RESOLVED | Lọc đúng | ⏳ | |
| 15.1.3 | Lọc theo danh mục | Chọn category (Học tập, Tài chính, v.v.) | Lọc đúng | ⏳ | |
| 15.1.4 | Tìm kiếm phản hồi | Nhập keyword | Lọc theo tiêu đề / nội dung | ⏳ | |
| 15.1.5 | Phân trang | Scroll hoặc paginate | Load thêm phản hồi | ⏳ | |

### 15.2 Chi tiết phản hồi

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Trạng thái | Ghi chú |
|---|-----------|---------------|-------------------|------------|---------|
| 15.2.1 | Xem chi tiết phản hồi | Click 1 phản hồi ở sidebar | FeedbackDetailPane hiển thị: tiêu đề, nội dung, danh mục, PH, SV, tin nhắn | ⏳ | |
| 15.2.2 | Xem lịch sử tin nhắn | Mở chi tiết phản hồi | Hiển thị timeline tin nhắn từ PH và Admin | ⏳ | |
| 15.2.3 | Xem file đính kèm | Phản hồi có attachment | Hiển thị ảnh (is_image) hoặc link download file | ⏳ | |

### 15.3 Trả lời phản hồi

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Trạng thái | Ghi chú |
|---|-----------|---------------|-------------------|------------|---------|
| 15.3.1 | Gửi tin nhắn trả lời | Nhập nội dung vào FeedbackReplyBox → Gửi | Tin nhắn mới xuất hiện trong timeline | ⏳ | |
| 15.3.2 | Gửi tin nhắn rỗng | Bỏ trống → Gửi | Không cho gửi, validation | ⏳ | |
| 15.3.3 | Đính kèm file | Upload file → Gửi | Attachment gửi kèm tin nhắn | ⏳ | |
| 15.3.4 | Gợi ý trả lời AI | Click "Gợi ý từ AI" | AiService.suggestFeedbackReply → Điền content vào reply box | ⏳ | |

### 15.4 Cập nhật trạng thái

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Trạng thái | Ghi chú |
|---|-----------|---------------|-------------------|------------|---------|
| 15.4.1 | Chuyển OPEN → IN_PROGRESS | Thay đổi trạng thái dropdown | Cập nhật thành công, UI refresh | ⏳ | |
| 15.4.2 | Chuyển IN_PROGRESS → RESOLVED | Thay đổi trạng thái | Cập nhật thành công | ⏳ | |
| 15.4.3 | Reopen (RESOLVED → OPEN) | (Nếu cho phép) Thay đổi trạng thái | Cập nhật thành công | ⏳ | |

### 15.5 AI & Analytics

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Trạng thái | Ghi chú |
|---|-----------|---------------|-------------------|------------|---------|
| 15.5.1 | Hiển thị AI Summary Banner | Truy cập `/admin/feedbacks` | AiFeedbackSummaryBanner hiển thị tóm tắt, đề xuất hành động | ⏳ | |
| 15.5.2 | Mở Feedback Analytics | Click nút Analytics | FeedbackAnalyticsModal hiển thị: trend chart, category breakdown, avg response, resolution rate | ⏳ | |
| 15.5.3 | AI Summary nội dung | Xem banner | Hiển thị: summary, urgentCount, stats, suggestedActions, categoryBreakdown | ⏳ | |

---

## 16. Thông báo (Admin)

**Route**: `/admin/notifications`
**Components**: `NotificationsPageClient`, `NotificationsFilterBar`, `NotificationDialog`

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Trạng thái | Ghi chú |
|---|-----------|---------------|-------------------|------------|---------|
| 16.1 | Hiển thị danh sách thông báo | Truy cập `/admin/notifications` | Danh sách thông báo: tiêu đề, nội dung preview, ngày, target_role | ⏳ | |
| 16.2 | Lọc thông báo | Áp dụng filter (nếu có) | Lọc đúng | ⏳ | |
| 16.3 | Tạo thông báo mới | Click "Tạo thông báo" → Điền tiêu đề + nội dung + đối tượng → Gửi | Tạo thành công, danh sách refresh | ⏳ | |
| 16.4 | AI sinh nội dung thông báo | Nhập brief → Click "AI Gợi ý" | AiService.generateNotificationDraft → Điền title + content | ⏳ | |
| 16.5 | Tạo TB – validation | Bỏ trống tiêu đề → Submit | Validation error | ⏳ | |
| 16.6 | Chọn đối tượng nhận | Chọn "Tất cả" / "Phụ huynh" / "Giảng viên" | target_role được set đúng | ⏳ | |
| 16.7 | Xem chi tiết thông báo | Click vào 1 thông báo | Hiển thị nội dung đầy đủ | ⏳ | |
| 16.8 | Xóa thông báo | Click xóa → Confirm | Xóa thành công | ⏳ | |

---

## 17. Câu hỏi thường gặp – FAQ (Admin)

**Route**: `/admin/faq`
**Components**: `AdminFaqPageClient`, `FaqDialog`, `FaqFilterBar`

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Trạng thái | Ghi chú |
|---|-----------|---------------|-------------------|------------|---------|
| 17.1 | Hiển thị danh sách FAQ | Truy cập `/admin/faq` | Hiển thị câu hỏi + trả lời, nhóm theo category | ⏳ | |
| 17.2 | Lọc theo category | Chọn danh mục | Lọc đúng | ⏳ | |
| 17.3 | Thêm FAQ mới | Click "Thêm" → Điền câu hỏi, trả lời, category, sort_order → Submit | Tạo thành công | ⏳ | |
| 17.4 | Sửa FAQ | Click edit → Thay đổi → Save | Cập nhật thành công | ⏳ | |
| 17.5 | Xóa FAQ | Click xóa → Confirm | Xóa thành công | ⏳ | |
| 17.6 | Toggle is_active | Bật/tắt trạng thái hoạt động | FAQ ẩn/hiện ở phía PH | ⏳ | |
| 17.7 | Sắp xếp sort_order | Thay đổi thứ tự | Hiển thị đúng thứ tự | ⏳ | |

---

## 18. Xem điểm – Phụ huynh

**Route**: `/parent/scores`
**Components**: `ParentScoresPageClient`

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Trạng thái | Ghi chú |
|---|-----------|---------------|-------------------|------------|---------|
| 18.1 | Hiển thị điểm con | Truy cập `/parent/scores` | Bảng điểm hiển thị: môn, tín chỉ, bài tập, giữa kỳ, cuối kỳ, TB | ⏳ | |
| 18.2 | Chọn sinh viên (nếu nhiều con) | Chọn SV từ dropdown | Hiển thị điểm SV được chọn | ⏳ | |
| 18.3 | Lọc theo HK | Chọn học kỳ | Hiển thị điểm HK đó | ⏳ | |
| 18.4 | Lọc theo năm học | Chọn năm học | Hiển thị điểm năm đó | ⏳ | |
| 18.5 | Lọc theo môn | Chọn môn học | Hiển thị điểm môn đó | ⏳ | |
| 18.6 | Chỉ hiện điểm PUBLISHED | Xem bảng điểm | Chỉ hiển thị điểm có publish_status = PUBLISHED | ⏳ | |
| 18.7 | Không có điểm | SV chưa có điểm nào | Empty state hiển thị phù hợp | ⏳ | |

---

## 19. Xem điểm danh – Phụ huynh

**Route**: `/parent/attendance`
**Components**: `ParentAttendancePageClient`, `ParentAttendanceStatCards`, `ParentAttendanceDonutChart`, `ParentAttendanceBarChart`, `ParentAttendanceTable`, `ParentAttendanceCalendarCard`, `ParentAttendanceFilterBar`, `ParentAttendancePolicyCard`

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Trạng thái | Ghi chú |
|---|-----------|---------------|-------------------|------------|---------|
| 19.1 | Hiển thị thống kê điểm danh | Truy cập `/parent/attendance` | StatCards hiển thị: tổng buổi, vắng, trễ | ⏳ | |
| 19.2 | Biểu đồ Donut | Xem trang | DonutChart hiển thị tỷ lệ điểm danh | ⏳ | |
| 19.3 | Biểu đồ cột | Xem trang | BarChart hiển thị so sánh theo môn/thời gian | ⏳ | |
| 19.4 | Bảng chi tiết | Xem trang | Bảng hiển thị chi tiết từng môn: tổng buổi, vắng, trễ | ⏳ | |
| 19.5 | Lịch điểm danh | Xem ParentAttendanceCalendarCard | Calendar highlight ngày present/absent/late | ⏳ | |
| 19.6 | Lọc theo HK/năm | Áp dụng filter | Dữ liệu lọc đúng | ⏳ | |
| 19.7 | Chọn SV (nhiều con) | Chọn SV khác | Dữ liệu điểm danh cập nhật | ⏳ | |
| 19.8 | Quy chế điểm danh | Xem PolicyCard | Hiển thị thông tin quy chế | ⏳ | |

---

## 20. Thời khóa biểu – Phụ huynh

**Route**: `/parent/schedule`
**Components**: `ParentSchedulePageClient`, `ParentScheduleFilterBar`, `ParentScheduleStatCards`, `ParentScheduleSectionsTable`, `ParentScheduleWeeklyGrid`, `ParentScheduleSectionDetailSheet`

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Trạng thái | Ghi chú |
|---|-----------|---------------|-------------------|------------|---------|
| 20.1 | Hiển thị TKB dạng bảng | Truy cập `/parent/schedule` | SectionsTable hiển thị: mã lớp, môn, GV, thứ, giờ, phòng | ⏳ | |
| 20.2 | Hiển thị TKB dạng lưới tuần | Xem WeeklyGrid | Grid hiển thị các slot theo thứ + giờ | ⏳ | |
| 20.3 | Thống kê TKB | Xem StatCards | Hiển thị tổng môn, số lớp, v.v. | ⏳ | |
| 20.4 | Xem chi tiết lớp | Click vào 1 lớp | Mở SectionDetailSheet hiển thị chi tiết | ⏳ | |
| 20.5 | Lọc theo HK | Chọn HK | Hiển thị TKB HK đó | ⏳ | |
| 20.6 | Chọn SV (nhiều con) | Chọn SV khác | TKB cập nhật theo SV | ⏳ | |
| 20.7 | SV chưa đăng ký lớp | SV không có enrollment nào | Empty state | ⏳ | |

---

## 21. Trò chuyện AI – Phụ huynh

**Route**: `/parent/chat`
**Components**: `ChatPage`, `ChatWidget`, `ChatMessage`

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Trạng thái | Ghi chú |
|---|-----------|---------------|-------------------|------------|---------|
| 21.1 | Hiển thị trang chat | Truy cập `/parent/chat` | Giao diện chat với sidebar conversations + vùng chat | ⏳ | |
| 21.2 | Tạo cuộc hội thoại mới | Click "Cuộc hội thoại mới" | Tạo conversation mới, chọn SV | ⏳ | |
| 21.3 | Gửi tin nhắn | Nhập câu hỏi → Gửi | AI trả lời, hiển thị sources | ⏳ | |
| 21.4 | Lịch sử chat | Chọn 1 conversation cũ | Load lịch sử tin nhắn | ⏳ | |
| 21.5 | Đổi tên conversation | Click edit tên → Nhập tên mới → Save | Cập nhật tên | ⏳ | |
| 21.6 | Xóa conversation | Click xóa → Confirm | Xóa thành công | ⏳ | |
| 21.7 | Xóa lịch sử chat | Click "Xóa lịch sử" | Xóa tất cả messages | ⏳ | |
| 21.8 | Tin nhắn rỗng | Gửi tin nhắn trống | Không cho gửi | ⏳ | |
| 21.9 | Loading AI response | Gửi tin nhắn → Chờ | Hiển thị loading indicator | ⏳ | |
| 21.10 | AI lỗi / timeout | API AI trả lỗi | Hiển thị thông báo lỗi, cho thử lại | ⏳ | |
| 21.11 | ChatWidget | Widget chat nhỏ (nếu có) | Hiển thị và hoạt động đúng | ⏳ | |
| 21.12 | Chọn SV khác | Chuyển SV → Tạo conversation mới | Context AI thay đổi theo SV | ⏳ | |

---

## 22. Phản hồi / Tin nhắn – Phụ huynh

**Route**: `/parent/feedback`
**Components**: `ParentFeedbackSubmitForm`, `ParentFeedbackHistoryCard`, `ParentFeedbackThread`, `ParentFeedbackContactCard`, `ParentFaqPageClient`

### 22.1 Gửi phản hồi mới

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Trạng thái | Ghi chú |
|---|-----------|---------------|-------------------|------------|---------|
| 22.1.1 | Gửi phản hồi thành công | Điền: tiêu đề, danh mục, nội dung, (chọn SV) → Gửi | Toast thành công, form reset | ⏳ | |
| 22.1.2 | Đính kèm file | Upload ảnh/file → Gửi | Attachment gửi kèm (PreUploadedAttachment) | ⏳ | |
| 22.1.3 | Validation form | Bỏ trống tiêu đề / nội dung | Validation error | ⏳ | |
| 22.1.4 | Chọn danh mục | Mở dropdown category | Hiển thị đầy đủ 8 danh mục (Học tập, Tài chính, v.v.) | ⏳ | |
| 22.1.5 | Chọn SV liên quan | Chọn SV từ dropdown | student_id được gắn vào phản hồi | ⏳ | |

### 22.2 Lịch sử phản hồi

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Trạng thái | Ghi chú |
|---|-----------|---------------|-------------------|------------|---------|
| 22.2.1 | Xem lịch sử | Xem ParentFeedbackHistoryCard | Hiển thị danh sách phản hồi đã gửi với trạng thái | ⏳ | |
| 22.2.2 | Xem chi tiết phản hồi | Click 1 phản hồi | Mở ParentFeedbackThread hiển thị timeline tin nhắn | ⏳ | |
| 22.2.3 | Trả lời phản hồi | Trong thread → Nhập nội dung → Gửi | Tin nhắn mới từ PH xuất hiện | ⏳ | |
| 22.2.4 | Badge trạng thái | Xem danh sách | Badge hiển thị đúng: Chờ xử lý / Đang xử lý / Đã giải quyết | ⏳ | |

### 22.3 Thông tin liên hệ

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Trạng thái | Ghi chú |
|---|-----------|---------------|-------------------|------------|---------|
| 22.3.1 | Xem thông tin liên hệ | Xem ParentFeedbackContactCard | Hiển thị SĐT / email hỗ trợ | ⏳ | |

---

## 23. Hỏi đáp (FAQ) – Phụ huynh

**Route**: `/parent/faq`
**Components**: `ParentFaqPageClient`

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Trạng thái | Ghi chú |
|---|-----------|---------------|-------------------|------------|---------|
| 23.1 | Hiển thị FAQ | Truy cập `/parent/faq` | Hiển thị câu hỏi nhóm theo category (FaqGroup) | ⏳ | |
| 23.2 | Mở/đóng câu hỏi | Click câu hỏi | Accordion mở ra/đóng lại hiển thị câu trả lời | ⏳ | |
| 23.3 | Lọc theo category | Chọn danh mục | Hiển thị FAQ thuộc danh mục | ⏳ | |
| 23.4 | Tìm kiếm FAQ | Nhập keyword | Lọc câu hỏi theo keyword | ⏳ | |
| 23.5 | Chỉ hiện FAQ active | Xem trang | Chỉ hiển thị FAQ có is_active = true | ⏳ | |
| 23.6 | Không có FAQ | Không có câu hỏi nào | Empty state | ⏳ | |

---

## 24. Thông báo – Phụ huynh & Giảng viên

**Route**: `/parent/notifications`, `/teacher/notifications`
**Components**: `NotificationListPageClient`, `NotificationBell`

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Trạng thái | Ghi chú |
|---|-----------|---------------|-------------------|------------|---------|
| 24.1 | Hiển thị danh sách TB (PH) | Truy cập `/parent/notifications` | Danh sách thông báo cho PH | ⏳ | |
| 24.2 | Hiển thị danh sách TB (GV) | Truy cập `/teacher/notifications` | Danh sách thông báo cho GV | ⏳ | |
| 24.3 | Phân biệt đã đọc/chưa đọc | Xem danh sách | Thông báo chưa đọc có highlight khác | ⏳ | |
| 24.4 | Đánh dấu đã đọc | Click vào 1 thông báo | Đánh dấu đã đọc (localStorage readIds) | ⏳ | |
| 24.5 | Badge chưa đọc trên sidebar | Có TB mới | Badge số đỏ hiển thị trên menu "Thông báo" | ⏳ | |
| 24.6 | NotificationBell trên Header | Xem Header | Icon chuông hiển thị số unread, dropdown danh sách nhanh | ⏳ | |
| 24.7 | Click TB → navigate | Click vào TB trong bell dropdown | Điều hướng đến trang TB hoặc feedback liên quan | ⏳ | |
| 24.8 | Auto refresh (30s) | Chờ 30 giây | Query refetch danh sách TB | ⏳ | |
| 24.9 | Collapsed sidebar badge | Thu nhỏ sidebar (icon mode) | Chấm đỏ nhỏ hiển thị thay vì số | ⏳ | |

---

## 25. Thời khóa biểu – Giảng viên

**Route**: `/teacher/schedule`
**Components**: `TeacherSchedulePageClient`

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Trạng thái | Ghi chú |
|---|-----------|---------------|-------------------|------------|---------|
| 25.1 | Hiển thị TKB giảng viên | Truy cập `/teacher/schedule` | Hiển thị lịch dạy của GV: lớp, môn, thứ, giờ, phòng | ⏳ | |
| 25.2 | Lọc theo HK | Chọn HK | Hiển thị TKB HK đó | ⏳ | |
| 25.3 | Xem chi tiết lớp | Click vào 1 lớp | Hiển thị chi tiết class section | ⏳ | |
| 25.4 | GV chưa có lớp | Không có lớp nào | Empty state | ⏳ | |

---

## 26. Cài đặt tài khoản (Tất cả roles)

**Route**: `/admin/settings`, `/parent/settings`, `/teacher/settings`
**Components**: `SettingsLayout`, `ProfileInfoForm`, `ChangePasswordForm`, `NotificationPreferencesForm`, `ParentSettingsPageClient`, `TeacherSettingsPageClient`

### 26.1 Thông tin cá nhân

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Trạng thái | Ghi chú |
|---|-----------|---------------|-------------------|------------|---------|
| 26.1.1 | Hiển thị profile (Admin) | Truy cập `/admin/settings` | Hiển thị: username, full_name, email, avatar | ⏳ | |
| 26.1.2 | Hiển thị profile (Parent) | Truy cập `/parent/settings` | Hiển thị: tên, SĐT, email, danh sách SV | ⏳ | |
| 26.1.3 | Hiển thị profile (Teacher) | Truy cập `/teacher/settings` | Hiển thị: username, tên, SĐT, email | ⏳ | |
| 26.1.4 | Cập nhật thông tin | Thay đổi tên/email → Save | Cập nhật thành công, toast | ⏳ | |
| 26.1.5 | Upload avatar | Chọn ảnh → Upload | Ảnh đại diện cập nhật | ⏳ | |
| 26.1.6 | Validation email | Nhập email sai format | Validation error | ⏳ | |

### 26.2 Đổi mật khẩu

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Trạng thái | Ghi chú |
|---|-----------|---------------|-------------------|------------|---------|
| 26.2.1 | Đổi mật khẩu thành công | Nhập MK cũ đúng + MK mới + xác nhận → Submit | Toast thành công | ⏳ | |
| 26.2.2 | MK cũ sai | Nhập MK cũ sai → Submit | Thông báo lỗi | ⏳ | |
| 26.2.3 | MK mới không khớp | MK mới ≠ xác nhận → Submit | Validation error | ⏳ | |
| 26.2.4 | MK mới quá ngắn | Nhập MK < yêu cầu tối thiểu | Validation error | ⏳ | |

### 26.3 Cài đặt thông báo

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Trạng thái | Ghi chú |
|---|-----------|---------------|-------------------|------------|---------|
| 26.3.1 | Hiển thị preferences | Xem NotificationPreferencesForm | Hiển thị các tùy chọn nhận thông báo | ⏳ | |
| 26.3.2 | Thay đổi preferences | Toggle bật/tắt → Save | Lưu thành công | ⏳ | |

---

## 27. Layout & Navigation chung

**Components**: `AppSidebar`, `Header`, `Footer`, `DashboardLayoutClient`, `PaginationBar`, `StatusBadge`, `ConfirmDialog`, `FilterBar`

### 27.1 Sidebar

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Trạng thái | Ghi chú |
|---|-----------|---------------|-------------------|------------|---------|
| 27.1.1 | Hiển thị menu Admin | Đăng nhập admin | Hiển thị 11 menu items + Settings + Logout | ⏳ | |
| 27.1.2 | Hiển thị menu Parent | Đăng nhập parent | Hiển thị 8 menu items + Settings + Logout | ⏳ | |
| 27.1.3 | Hiển thị menu Teacher | Đăng nhập teacher | Hiển thị 4 menu items + Settings + Logout | ⏳ | |
| 27.1.4 | Active state menu | Truy cập 1 trang | Menu item tương ứng được highlight | ⏳ | |
| 27.1.5 | Collapse sidebar | Click toggle collapse | Sidebar thu nhỏ, chỉ hiện icon | ⏳ | |
| 27.1.6 | Tooltip khi collapsed | Hover icon khi sidebar collapsed | Hiển thị tooltip tên menu | ⏳ | |
| 27.1.7 | Subtitle theo role | Xem sidebar header | "Cổng Quản trị" / "Cổng Phụ huynh" / "Cổng Giảng viên" | ⏳ | |
| 27.1.8 | Đăng xuất | Click "Đăng xuất" | Logout, redirect `/login` | ⏳ | |

### 27.2 Header

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Trạng thái | Ghi chú |
|---|-----------|---------------|-------------------|------------|---------|
| 27.2.1 | Hiển thị Header | Xem bất kỳ trang dashboard nào | Header hiển thị đúng | ⏳ | |
| 27.2.2 | NotificationBell | Xem Header | Bell icon với unread count | ⏳ | |
| 27.2.3 | User info / avatar | Xem Header | Hiển thị tên + avatar user | ⏳ | |

### 27.3 Responsive & Mobile

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Trạng thái | Ghi chú |
|---|-----------|---------------|-------------------|------------|---------|
| 27.3.1 | Mobile sidebar | Viewport < 768px | Sidebar ẩn, có hamburger menu | ⏳ | |
| 27.3.2 | Bảng responsive | Thu nhỏ viewport | Bảng scroll ngang hoặc stack | ⏳ | |
| 27.3.3 | Form responsive | Thu nhỏ viewport | Form fields stack dọc | ⏳ | |
| 27.3.4 | Chart responsive | Thu nhỏ viewport | Biểu đồ co giãn phù hợp | ⏳ | |

### 27.4 Shared Components

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Trạng thái | Ghi chú |
|---|-----------|---------------|-------------------|------------|---------|
| 27.4.1 | PaginationBar | Trang có phân trang | Hiển thị đúng: trang hiện tại, tổng trang, nút prev/next | ⏳ | |
| 27.4.2 | StatusBadge | Badge trạng thái | Hiển thị đúng màu/label cho mỗi trạng thái | ⏳ | |
| 27.4.3 | ConfirmDialog | Action cần xác nhận (xóa, v.v.) | Dialog xác nhận hiển thị, có Cancel/Confirm | ⏳ | |
| 27.4.4 | Toast notifications | Sau action thành công/thất bại | Toast hiển thị đúng nội dung, tự tắt | ⏳ | |
| 27.4.5 | Loading states | Khi đang fetch dữ liệu | Skeleton / spinner hiển thị | ⏳ | |
| 27.4.6 | Error boundary | Component throw error | Hiển thị fallback UI, không crash toàn app | ⏳ | |

---

## 28. Middleware & Phân quyền

**File**: `middleware.ts`

| # | Test Case | Bước thực hiện | Kết quả mong đợi | Trạng thái | Ghi chú |
|---|-----------|---------------|-------------------|------------|---------|
| 28.1 | Chưa đăng nhập → /admin | Truy cập `/admin` khi chưa login | Redirect → `/login` | ⏳ | |
| 28.2 | Chưa đăng nhập → /parent | Truy cập `/parent` khi chưa login | Redirect → `/login` | ⏳ | |
| 28.3 | Chưa đăng nhập → /teacher | Truy cập `/teacher` khi chưa login | Redirect → `/login` | ⏳ | |
| 28.4 | Đã login → /login | Truy cập `/login` khi đã đăng nhập | Redirect → ROLE_HOME tương ứng | ⏳ | |
| 28.5 | Parent truy cập /admin | PH đăng nhập → truy cập `/admin` | Redirect → `/parent` | ⏳ | |
| 28.6 | Admin truy cập /parent | Admin đăng nhập → truy cập `/parent` | Redirect → `/admin` | ⏳ | |
| 28.7 | Teacher truy cập /admin | GV đăng nhập → truy cập `/admin` | Redirect → `/teacher` | ⏳ | |
| 28.8 | Token hết hạn → auto refresh | Access token hết hạn, refresh token còn hiệu lực | Middleware tự gọi `/auth/refresh`, set lại cookie, tiếp tục | ⏳ | |
| 28.9 | Refresh token hết hạn | Cả 2 token hết hạn | Redirect → `/login` | ⏳ | |
| 28.10 | Route không thuộc roles | Truy cập `/about` hoặc route khác | Không bị middleware chặn (NextResponse.next()) | ⏳ | |
| 28.11 | Cache-Control headers | Kiểm tra response headers | Có `no-store, max-age=0`, `Pragma: no-cache` | ⏳ | |

---

## Tổng kết

| Module | Tổng TC | Pass | Fail | Warning | Chưa test |
|--------|---------|------|------|---------|-----------|
| Xác thực | 18 | – | – | – | 18 |
| Dashboard Admin | 8 | – | – | – | 8 |
| Dashboard Parent | 9 | – | – | – | 9 |
| Dashboard Teacher | 6 | – | – | – | 6 |
| Quản lý Sinh viên | 22 | – | – | – | 22 |
| Quản lý Phụ huynh | 12 | – | – | – | 12 |
| Liên kết PH-SV | 5 | – | – | – | 5 |
| Ngành | 7 | – | – | – | 7 |
| Môn học | 7 | – | – | – | 7 |
| Quản lý Điểm | 13 | – | – | – | 13 |
| Điểm danh Admin | 18 | – | – | – | 18 |
| Điểm danh Teacher | 6 | – | – | – | 6 |
| Năm học & Học kỳ | 10 | – | – | – | 10 |
| Curriculum | 3 | – | – | – | 3 |
| Phản hồi Admin | 14 | – | – | – | 14 |
| Thông báo Admin | 8 | – | – | – | 8 |
| FAQ Admin | 7 | – | – | – | 7 |
| Xem điểm PH | 7 | – | – | – | 7 |
| Điểm danh PH | 8 | – | – | – | 8 |
| TKB PH | 7 | – | – | – | 7 |
| Chat AI PH | 12 | – | – | – | 12 |
| Phản hồi PH | 8 | – | – | – | 8 |
| FAQ PH | 6 | – | – | – | 6 |
| Thông báo PH & GV | 9 | – | – | – | 9 |
| TKB GV | 4 | – | – | – | 4 |
| Cài đặt tài khoản | 10 | – | – | – | 10 |
| Layout & Navigation | 17 | – | – | – | 17 |
| Middleware & Phân quyền | 11 | – | – | – | 11 |
| **TỔNG** | **~276** | **–** | **–** | **–** | **~276** |

---

## Ghi chú kiểm tra

- **Người kiểm tra**: _________________
- **Ngày bắt đầu**: _________________
- **Ngày hoàn thành**: _________________
- **Môi trường test**: Development / Staging / Production
- **Trình duyệt**: Chrome / Firefox / Safari / Edge
- **Viewport**: Desktop (1920x1080) / Tablet (768px) / Mobile (375px)

---

## Hướng dẫn sử dụng

1. **Trước khi test**: Đảm bảo backend đang chạy, database đã seed dữ liệu mẫu
2. **Khi test**: Cập nhật cột "Trạng thái" cho mỗi test case
3. **Khi phát hiện lỗi**: Ghi mô tả lỗi vào cột "Ghi chú", có thể chụp screenshot
4. **Sau khi test**: Cập nhật bảng tổng kết
