# Phan tich luong chuc nang phu huynh va quan he bang

Tai lieu nay mo ta cac chuc nang ben phia phu huynh trong EduLink, dua tren schema Prisma hien tai va cac module backend/frontend lien quan.

## 1. Tong quan module phu huynh

Phu huynh la mot trong ba role chinh cua he thong:

- `admin`: quan tri he thong, tao du lieu, quan ly sinh vien/phu huynh/diem/chuyen can/thong bao/phan hoi.
- `teacher`: quan ly lop hoc phan va diem danh lop duoc phan cong.
- `parent`: xem thong tin con, diem, chuyen can, thoi khoa bieu, thong bao, gui phan hoi, chat AI va quan ly tai khoan ca nhan.

Luon truy cap du lieu cua phu huynh xoay quanh cap lien ket:

```text
Parent -> StudentParent -> Student
```

Bang `StudentParent` la bang trung gian many-to-many, dong thoi la lop kiem tra quyen cho hau het API phu huynh. Neu khong ton tai ban ghi `(student_id, parent_id)`, phu huynh khong duoc xem du lieu cua sinh vien do.

## 2. Cac bang cot loi cua phu huynh

### 2.1 Parent

Bang `Parent` luu tai khoan phu huynh:

```text
Parent
- parent_id
- username
- password
- refresh_token_hash
- full_name
- phone
- email
- relationship
- is_active
- avatar_url
- created_at
```

Quan he:

```text
Parent 1 - n StudentParent
Parent 1 - n Feedback
Parent 1 - n ChatConversation
```

Ghi chu:

- `phone` la truong dang nhap chinh cua phu huynh.
- `is_active = false` khi tai khoan chua kich hoat OTP/dat mat khau.
- `relationship` gom `CHA`, `ME`, `NGUOI_GIAM_HO`.

### 2.2 Student

Bang `Student` luu sinh vien:

```text
Student
- student_id
- student_code
- full_name
- email
- status
- date_of_birth
- class
- study_year
- cohort
- deleted_at
- major_id
```

Quan he:

```text
Student n - 1 Major
Student 1 - n StudentParent
Student 1 - n Score
Student 1 - n Attendance
Student 1 - n ClassEnrollment
Student 1 - n Feedback
Student 1 - n ChatConversation
```

Ghi chu:

- `deleted_at` dung cho xoa mem.
- Cac API parent nen chi lam viec voi sinh vien chua bi xoa mem.

### 2.3 StudentParent

Bang lien ket phu huynh - sinh vien:

```text
StudentParent
- student_id
- parent_id
- is_primary
```

Khoa:

```text
PRIMARY KEY (student_id, parent_id)
INDEX parent_id
```

Quan he:

```text
StudentParent.student_id -> Student.student_id
StudentParent.parent_id -> Parent.parent_id
```

Vai tro:

- Lien ket mot phu huynh voi mot hoac nhieu sinh vien.
- Cho phep mot sinh vien co nhieu phu huynh.
- Lam co so phan quyen cho diem, chuyen can, lich hoc, feedback theo sinh vien va chat AI.

## 3. Luong kich hoat va dang nhap phu huynh

### 3.1 Tao tai khoan ban dau

Nguoi thuc hien: admin.

Bang lien quan:

```text
Parent
Student
StudentParent
```

Luong:

1. Admin tao ban ghi `Parent`.
2. Admin tao sinh vien neu chua co.
3. Admin gan phu huynh cho sinh vien bang `StudentParent`.
4. Tai khoan parent ban dau co the chua co `password` va `is_active = false`.

API lien quan:

```text
POST /parents
POST /students/:id/parents
```

### 3.2 Yeu cau OTP kich hoat

Nguoi thuc hien: parent.

API:

```text
POST /auth/request-otp
```

Input chinh:

```text
phone
student_code
```

Luong backend:

1. Tim `Student` theo `student_code`.
2. Lay danh sach `StudentParent` cua sinh vien.
3. Tim `Parent` co `phone` trung voi input.
4. Neu khong co lien ket, tra loi loi.
5. Neu tai khoan da active hoac da co password, khong cho kich hoat lai.
6. Tao ban ghi `Otp`.

Bang lien quan:

```text
Student
StudentParent
Parent
Otp
```

Quan he su dung:

```text
Student.student_code -> StudentParent.student_id -> Parent.phone
```

### 3.3 Verify OTP va dat mat khau

API:

```text
POST /auth/verify-otp
POST /auth/set-password
```

Luong:

1. `verify-otp` tim OTP moi nhat chua dung theo `phone`.
2. Kiem tra ma OTP va han su dung.
3. Danh dau `Otp.is_used = true`.
4. `set-password` hash mat khau moi.
5. Cap nhat `Parent.password` va `Parent.is_active = true`.

Bang lien quan:

```text
Otp
Parent
```

### 3.4 Dang nhap

API:

```text
POST /auth/login
GET /auth/profile
POST /auth/refresh
POST /auth/logout
PATCH /auth/change-password
```

Luong:

1. Phu huynh dang nhap bang `identifier = phone` va `password`.
2. Backend tim `Parent` theo `phone`.
3. Kiem tra `is_active`, `password`, bcrypt compare.
4. Tao access token va refresh token.
5. Luu hash refresh token vao `Parent.refresh_token_hash`.
6. Frontend goi `/auth/profile` de lay thong tin user va danh sach sinh vien.

Bang lien quan:

```text
Parent
StudentParent
Student
Major
```

## 4. Dashboard phu huynh

Frontend route:

```text
/parent
```

Backend API:

```text
GET /dashboard/me
```

Muc dich:

- Hien thi danh sach con.
- Hien thi GPA tong quan.
- Hien thi diem moi nhat.
- Hien thi chuyen can gan day.
- Hien thi thong bao gan day.
- Cung cap shortcut toi cac trang diem, chuyen can, lich hoc, feedback, chat.

Luong:

1. Frontend lay profile hien tai bang `useCurrentUser`.
2. Lay `parent_id` tu JWT.
3. Backend query `StudentParent` theo `parent_id`.
4. Include `Student`, `Major`, `Score`, `Subject`, `AcademicTerm`, `Attendance`.
5. Query them `Notification` phu hop voi parent.
6. Backend tinh `gpa_4` tu diem da cong bo.
7. Frontend chon sinh vien active bang `useStudentStore`.

Bang lien quan:

```text
Parent
StudentParent
Student
Major
Score
Subject
AcademicTerm
Attendance
Notification
Admin
```

Quan he:

```text
Parent.parent_id -> StudentParent.parent_id
StudentParent.student_id -> Student.student_id
Student.major_id -> Major.major_id
Score.student_id -> Student.student_id
Score.subject_id -> Subject.subject_id
Score.term_id -> AcademicTerm.term_id
Attendance.student_id -> Student.student_id
Attendance.term_id -> AcademicTerm.term_id
Notification.admin_id -> Admin.admin_id
```

## 5. Xem diem cua con

Frontend route:

```text
/parent/scores
```

Backend API:

```text
GET /me/students/:id/scores
```

Muc dich:

- Xem bang diem tung mon.
- Loc theo nam hoc/hoc ky.
- Tinh GPA hoc ky, GPA tich luy, tin chi dat, tin chi dang ky.

Luong:

1. Frontend xac dinh `activeStudentId` tu profile va store.
2. Goi `/me/students/:id/scores`.
3. Backend kiem tra quyen bang `StudentParent`.
4. Neu co lien ket, query `Score` theo `student_id`.
5. Join `Subject` de lay ma mon, ten mon, tin chi.
6. Join `AcademicTerm` de biet hoc ky/nam hoc.
7. Frontend tinh GPA va render bang.

Bang lien quan:

```text
StudentParent
Student
Score
Subject
AcademicTerm
AcademicYear
```

Quan he:

```text
AcademicYear 1 - n AcademicTerm
AcademicTerm 1 - n Score
Student 1 - n Score
Subject 1 - n Score
```

Khoa va rang buoc:

```text
Score unique (student_id, subject_id, term_id)
Score index (student_id, term_id)
```

Ghi chu:

- `Score.publish_status` phan biet `DRAFT` va `PUBLISHED`.
- Dashboard da lay diem voi `publish_status = 'PUBLISHED'`.
- Trang diem parent nen dam bao chi hien thi diem da cong bo de tranh lo diem nhap nhap.

## 6. Chuyen can cua con

Frontend route:

```text
/parent/attendance
```

Backend API:

```text
GET /me/students/:id/attendances
GET /me/students/:id/class-sections
```

Chuyen can trong he thong co hai lop du lieu.

### 6.1 Bang tong hop Attendance

Bang:

```text
Attendance
- attendance_id
- student_id
- term_id
- total_sessions
- absent_sessions
- late_sessions
- created_at
```

Quan he:

```text
Attendance.student_id -> Student.student_id
Attendance.term_id -> AcademicTerm.term_id
```

Rang buoc:

```text
unique (student_id, term_id)
```

Vai tro:

- Phuc vu thong ke nhanh tren dashboard va trang chuyen can.
- Tinh tong buoi, vang, tre, co mat.
- `present = total_sessions - absent_sessions - late_sessions`.

Luong:

1. Frontend chon sinh vien active.
2. Goi `/me/students/:id/attendances`.
3. Backend kiem tra `StudentParent`.
4. Query `Attendance` theo `student_id`, co the loc `term_id` hoac `academic_year_id`.
5. Frontend cong tong va ve chart.

### 6.2 Diem danh chi tiet theo lop hoc phan

Bang:

```text
ClassSection
ClassEnrollment
AttendanceSession
AttendanceRecord
```

Quan he:

```text
Subject 1 - n ClassSection
AcademicTerm 1 - n ClassSection
Teacher 1 - n ClassSection

ClassSection 1 - n ClassEnrollment
Student 1 - n ClassEnrollment

ClassSection 1 - n AttendanceSession
AttendanceSession 1 - n AttendanceRecord
ClassEnrollment 1 - n AttendanceRecord
```

Luong tao va cap nhat:

1. Admin tao `ClassSection`.
2. Admin them sinh vien vao lop, tao `ClassEnrollment`.
3. Admin/teacher tao buoi hoc, tao `AttendanceSession`.
4. He thong tao `AttendanceRecord` mac dinh `NONE` cho moi sinh vien trong lop.
5. Teacher/admin cap nhat trang thai `PRESENT`, `LATE`, `ABSENT`, `NONE`.
6. Sau khi luu diem danh, service dong bo lai bang tong hop `Attendance`.

Luong parent xem:

1. Frontend goi `/me/students/:id/class-sections`.
2. Backend kiem tra `StudentParent`.
3. Query cac `ClassSection` co `ClassEnrollment.student_id = id`.
4. Include `sessions` va `records` cua rieng sinh vien do.
5. Frontend dung du lieu nay de hien thi lich diem danh/calendar.

## 7. Thoi khoa bieu cua con

Frontend route:

```text
/parent/schedule
```

Backend API:

```text
GET /me/students/:id/class-sections
```

Muc dich:

- Hien thi lop hoc phan da dang ky.
- Hien thi mon hoc, giang vien, thu, gio, phong, hoc ky, trang thai lop.
- Hien thi dang bang va dang weekly grid.
- Xem chi tiet tung lop hoc phan, gom danh sach buoi hoc va diem danh.

Bang lien quan:

```text
StudentParent
Student
ClassEnrollment
ClassSection
Subject
Teacher
AcademicTerm
AcademicYear
AttendanceSession
AttendanceRecord
```

Quan he chinh:

```text
Student -> ClassEnrollment -> ClassSection -> Subject
ClassSection -> AcademicTerm -> AcademicYear
ClassSection -> Teacher
ClassSection -> AttendanceSession -> AttendanceRecord
AttendanceRecord -> ClassEnrollment
```

Phan quyen:

```text
Parent chi xem duoc ClassSection cua Student neu co StudentParent(student_id, parent_id)
```

## 8. Thong bao

Frontend route:

```text
/parent/notifications
NotificationBell tren header
```

Backend API:

```text
GET /me/notifications
```

Bang:

```text
Notification
- notification_id
- title
- content
- admin_id
- target_role
- target_id
- feedback_id
- created_at
```

Quan he:

```text
Notification.admin_id -> Admin.admin_id
```

Co che target:

```text
target_role = null, target_id = null
  -> broadcast toan he thong

target_role = 'parent', target_id = null
  -> gui tat ca phu huynh

target_role = 'parent', target_id = parent_id
  -> gui rieng mot phu huynh
```

Luong:

1. Parent goi `/me/notifications`.
2. Backend lay cac thong bao broadcast, thong bao cho tat ca parent va thong bao rieng parent hien tai.
3. Frontend hien thi list va bell dropdown.

Ghi chu:

- Trang thai read/unread hien duoc xu ly o frontend bang localStorage/hook, chua co bang DB rieng.
- `feedback_id` dung de lien ket thong bao ve feedback, nhung schema hien tai chua khai bao foreign key relation toi `Feedback`.

## 9. Phan hoi/gop y cua phu huynh

Frontend route:

```text
/parent/feedback
```

Backend API:

```text
POST /feedback
GET /feedback/mine
GET /feedback/:id
GET /feedback/:id/messages
POST /feedback/:id/messages
POST /feedback/attachments/pre-upload
DELETE /feedback/attachments/pre-upload
GET /feedback/attachments/:attachmentId/download
```

### 9.1 Tao feedback moi

Bang lien quan:

```text
Parent
Student
StudentParent
Feedback
FeedbackMessage
MessageAttachment
Notification
Admin
```

Luong:

1. Parent nhap title, category, content.
2. Neu co file, frontend pre-upload file len Cloudinary.
3. Submit feedback kem metadata attachment.
4. Backend neu co `student_id` thi kiem tra `StudentParent`.
5. Tao `Feedback`.
6. Tao message dau tien trong `FeedbackMessage` voi `sender_role = PARENT`.
7. Tao `MessageAttachment` neu co file.
8. Tao `Notification` gui admin.

Quan he:

```text
Parent 1 - n Feedback
Student 1 - n Feedback, optional
Feedback 1 - n FeedbackMessage
FeedbackMessage 1 - n MessageAttachment
Admin 1 - n Notification
```

### 9.2 Xem lich su feedback

API:

```text
GET /feedback/mine
```

Luong:

1. Backend lay `parent_id` tu JWT.
2. Query `Feedback` where `parent_id = currentParentId`.
3. Include sinh vien lien quan va message admin moi nhat.
4. Frontend hien thi lich su, trang thai va noi dung phan hoi moi nhat.

### 9.3 Thread tin nhan feedback

API:

```text
GET /feedback/:id/messages
POST /feedback/:id/messages
```

Luong:

1. Parent mo mot feedback.
2. Frontend lay message thread.
3. Parent gui them message va attachment neu can.
4. Backend tao `FeedbackMessage`.
5. Backend tao `Notification` gui admin.

Trang thai feedback:

```text
OPEN
IN_PROGRESS
RESOLVED
```

Category:

```text
HOC_TAP
TAI_CHINH
THOI_KHOA_BIEU
KY_LUAT
KY_TUC_XA
SUC_KHOE
HOAT_DONG
KHAC
```

Luu y bao mat:

- Khi tao feedback co `student_id`, backend da kiem tra `StudentParent`.
- Can dam bao cac API lay chi tiet feedback/message va gui message tiep theo cung kiem tra `feedback.parent_id == currentParentId` neu role la parent.
- Neu khong kiem tra, parent co the doan `feedback_id` va truy cap thread cua nguoi khac.

## 10. FAQ

Frontend route:

```text
/parent/faq
/parent/feedback/faq
```

Backend API:

```text
GET /faq
```

Bang:

```text
Faq
- faq_id
- question
- answer
- category
- sort_order
- is_active
- created_at
- updated_at
```

Luong:

1. Parent goi `/faq`.
2. Backend tra ve cac FAQ co `is_active = true`.
3. Frontend group theo `category`.

Quan he:

```text
Faq khong co foreign key toi Parent/Student.
Faq dung chung cho cac role da dang nhap.
```

## 11. Chat AI phu huynh

Frontend route:

```text
/parent/chat
ChatWidget floating trong dashboard layout
```

Backend API:

```text
POST /ai/chat/conversations
GET /ai/chat/conversations
PATCH /ai/chat/conversations/:id
DELETE /ai/chat/conversations/:id
POST /ai/chat
GET /ai/chat/conversations/:id/history
DELETE /ai/chat/history
DELETE /ai/chat/history/student/:studentId
```

Bang lien quan:

```text
Parent
Student
StudentParent
ChatConversation
ChatHistory
Score
Subject
Attendance
Notification
```

Quan he:

```text
Parent 1 - n ChatConversation
Student 1 - n ChatConversation, optional
ChatConversation 1 - n ChatHistory
```

Luong tao conversation:

1. Parent chon sinh vien active.
2. Frontend goi `POST /ai/chat/conversations`.
3. Backend kiem tra `StudentParent(parent_id, student_id)`.
4. Tao `ChatConversation`.

Luong gui tin nhan:

1. Parent gui message vao conversation.
2. Backend kiem tra conversation thuoc `parent_id` hien tai.
3. Backend lay context sinh vien:
   - Thong tin `Student`.
   - Diem `Score` da `PUBLISHED`.
   - Chuyen can `Attendance`.
   - Thong bao gan day `Notification`.
4. Tao prompt gui LLM.
5. Luu message user vao `ChatHistory`.
6. Luu reply assistant vao `ChatHistory`.
7. Neu la tin nhan dau tien, backend co the goi AI de dat title tu dong.

Phan quyen:

```text
create conversation -> validate StudentParent
read/update/delete conversation -> validate ChatConversation.parent_id
chat -> validate ChatConversation.parent_id
clear by student -> validate StudentParent
```

## 12. Cai dat tai khoan phu huynh

Frontend route:

```text
/parent/settings
```

Backend API:

```text
PATCH /me/profile
POST /me/avatar
DELETE /me/avatar
PATCH /auth/change-password
GET /me/preferences
PATCH /me/preferences
```

Bang lien quan:

```text
Parent
UserPreference
```

Luong cap nhat profile:

1. Parent cap nhat `full_name`, `email`, `phone`, `avatar_url`.
2. Backend update `Parent`.
3. Neu avatar thay doi, xoa avatar cu tren Cloudinary.

Luong doi mat khau:

1. Parent nhap mat khau cu va mat khau moi.
2. Backend compare mat khau cu.
3. Hash mat khau moi.
4. Update `Parent.password`.

Luong notification preferences:

1. Frontend doc `/me/preferences`.
2. Backend query `UserPreference` theo `role = 'parent'` va `user_id = parent_id`.
3. Khi update, backend upsert theo unique key `(role, user_id, key)`.

Quan he logic:

```text
UserPreference khong co FK vat ly toi Parent.
Voi parent: UserPreference.role = 'parent' va UserPreference.user_id = Parent.parent_id.
```

## 13. So do quan he tong quat

### 13.1 Tai khoan va sinh vien

```text
Parent
  1 - n StudentParent
Student
  1 - n StudentParent
Major
  1 - n Student
```

### 13.2 Diem

```text
AcademicYear
  1 - n AcademicTerm
AcademicTerm
  1 - n Score
Student
  1 - n Score
Subject
  1 - n Score
Major
  1 - n Subject
```

### 13.3 Chuyen can va lich hoc

```text
AcademicTerm
  1 - n ClassSection
Subject
  1 - n ClassSection
Teacher
  1 - n ClassSection
ClassSection
  1 - n ClassEnrollment
Student
  1 - n ClassEnrollment
ClassSection
  1 - n AttendanceSession
AttendanceSession
  1 - n AttendanceRecord
ClassEnrollment
  1 - n AttendanceRecord
Student
  1 - n Attendance
AcademicTerm
  1 - n Attendance
```

### 13.4 Feedback va thong bao

```text
Parent
  1 - n Feedback
Student
  1 - n Feedback optional
Feedback
  1 - n FeedbackMessage
FeedbackMessage
  1 - n MessageAttachment
Admin
  1 - n Notification
Notification.feedback_id
  logic link toi Feedback.feedback_id, hien chua co FK relation trong Prisma schema
```

### 13.5 Chat AI

```text
Parent
  1 - n ChatConversation
Student
  1 - n ChatConversation optional
ChatConversation
  1 - n ChatHistory
```

### 13.6 Preferences

```text
UserPreference
  logic link theo role + user_id

Neu role = 'parent':
  UserPreference.user_id = Parent.parent_id
```

## 14. Bang tong hop chuc nang - API - bang

| Chuc nang | Frontend route | API chinh | Bang chinh |
| --- | --- | --- | --- |
| Kich hoat tai khoan | `/login` activation step | `/auth/request-otp`, `/auth/verify-otp`, `/auth/set-password` | `Parent`, `Student`, `StudentParent`, `Otp` |
| Dang nhap/profile | `/login`, dashboard layout | `/auth/login`, `/auth/profile`, `/auth/refresh` | `Parent`, `StudentParent`, `Student`, `Major` |
| Dashboard | `/parent` | `/dashboard/me` | `StudentParent`, `Student`, `Score`, `Attendance`, `Notification` |
| Diem | `/parent/scores` | `/me/students/:id/scores` | `Score`, `Subject`, `AcademicTerm`, `AcademicYear` |
| Chuyen can | `/parent/attendance` | `/me/students/:id/attendances`, `/me/students/:id/class-sections` | `Attendance`, `ClassSection`, `AttendanceSession`, `AttendanceRecord` |
| Thoi khoa bieu | `/parent/schedule` | `/me/students/:id/class-sections` | `ClassSection`, `ClassEnrollment`, `Subject`, `Teacher`, `AcademicTerm` |
| Thong bao | `/parent/notifications` | `/me/notifications` | `Notification`, `Admin` |
| Feedback | `/parent/feedback` | `/feedback`, `/feedback/mine`, `/feedback/:id/messages` | `Feedback`, `FeedbackMessage`, `MessageAttachment`, `Notification` |
| FAQ | `/parent/faq` | `/faq` | `Faq` |
| Chat AI | `/parent/chat` | `/ai/chat/*` | `ChatConversation`, `ChatHistory`, `Score`, `Attendance`, `Notification` |
| Cai dat | `/parent/settings` | `/me/profile`, `/auth/change-password`, `/me/preferences` | `Parent`, `UserPreference` |

## 15. Luu y thiet ke va rui ro can quan tam

### 15.1 StudentParent la diem kiem soat quyen

Moi API parent doc du lieu theo sinh vien nen co check:

```text
StudentParent where student_id = inputStudentId and parent_id = currentParentId
```

Dieu nay da duoc ap dung trong cac luong diem, chuyen can, class sections va chat AI.

### 15.2 Feedback can kiem tra ownership day du hon

Voi role parent, cac API sau can dam bao feedback thuoc ve parent dang dang nhap:

```text
GET /feedback/:id
GET /feedback/:id/messages
POST /feedback/:id/messages
GET /feedback/attachments/:attachmentId/download
```

Download attachment da co check parent ownership qua feedback parent_id. Tuy nhien chi tiet feedback/messages va add message nen cung check ro rang.

### 15.3 Notification read state chua luu database

Hien read/unread cua thong bao chu yeu nam o frontend. Neu can dong bo nhieu thiet bi, nen them bang:

```text
NotificationRead
- notification_id
- role
- user_id
- read_at
```

### 15.4 Chua co module hoc phi/payment rieng

Schema hien tai khong co bang hoc phi hay thanh toan. Tai chinh chi xuat hien trong:

```text
FeedbackCategory.TAI_CHINH
```

Neu can chuc nang hoc phi, can bo sung cac bang nhu:

```text
TuitionInvoice
Payment
PaymentTransaction
ScholarshipOrDiscount
```

### 15.5 Attendance co hai nguon du lieu

`AttendanceRecord` la du lieu chi tiet theo buoi hoc. `Attendance` la bang tong hop theo sinh vien/hoc ky. Khi thay doi diem danh chi tiet, can dong bo lai `Attendance` de parent dashboard va attendance page khong bi lech.

