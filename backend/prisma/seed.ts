import {
  PrismaClient,
  ParentRelationship,
  StudentStatus,
  AttendanceRecordStatus,
  FeedbackCategory,
  AcademicTermCode,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ── Helpers ────────────────────────────────────────────────────────────────

function toSlug(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '.');
}

function studentEmail(name: string, code: string): string {
  return `${toSlug(name)}.${code.toLowerCase()}@student.hutech.edu.vn`;
}

function academicYearName(year: number): string {
  return `${year} - ${year + 1}`;
}

function academicYearDates(year: number) {
  return {
    start_date: new Date(`${year}-09-01T00:00:00.000Z`),
    end_date: new Date(`${year + 1}-08-31T00:00:00.000Z`),
  };
}

function termDates(code: AcademicTermCode, year: number) {
  if (code === AcademicTermCode.HK1) {
    return {
      start_date: new Date(`${year}-09-01T00:00:00.000Z`),
      end_date: new Date(`${year + 1}-01-15T00:00:00.000Z`),
    };
  }
  if (code === AcademicTermCode.HK2) {
    return {
      start_date: new Date(`${year + 1}-02-01T00:00:00.000Z`),
      end_date: new Date(`${year + 1}-06-15T00:00:00.000Z`),
    };
  }
  return {
    start_date: new Date(`${year + 1}-06-16T00:00:00.000Z`),
    end_date: new Date(`${year + 1}-08-31T00:00:00.000Z`),
  };
}

function termName(code: AcademicTermCode, year: number): string {
  const label =
    code === AcademicTermCode.HK1
      ? 'Học kỳ I'
      : code === AcademicTermCode.HK2
        ? 'Học kỳ II'
        : 'Học kỳ hè';
  return `${label} - ${academicYearName(year)}`;
}

function parseTermKey(raw: string): string {
  const match = raw.trim().toUpperCase().match(/^(HK1|HK2|HKH)[-/](\d{4})$/);
  if (!match) throw new Error(`Invalid semester seed value: ${raw}`);
  return `${match[1]}-${match[2]}`;
}

// ── Static data ────────────────────────────────────────────────────────────

const majors = [
  { major_code: 'CNTT', major_name: 'Công nghệ Thông tin' },
  { major_code: 'KTPM', major_name: 'Kỹ thuật Phần mềm' },
  { major_code: 'QTKD', major_name: 'Quản trị Kinh doanh' },
  { major_code: 'KTDN', major_name: 'Kế toán Doanh nghiệp' },
  { major_code: 'NNA',  major_name: 'Ngôn ngữ Anh' },
  { major_code: 'DTVT', major_name: 'Điện tử Viễn thông' },
  { major_code: 'TKDH', major_name: 'Thiết kế Đồ họa' },
];

const subjects = [
  { subject_code: 'INT101', subject_name: 'Nhập môn Lập trình', credit: 3, major_code: 'CNTT' },
  { subject_code: 'INT102', subject_name: 'Lập trình Hướng đối tượng', credit: 3, major_code: 'KTPM' },
  { subject_code: 'INT201', subject_name: 'Cơ sở Dữ liệu', credit: 3, major_code: 'CNTT' },
  { subject_code: 'INT202', subject_name: 'Mạng Máy tính', credit: 3, major_code: 'CNTT' },
  { subject_code: 'INT301', subject_name: 'Phát triển Web', credit: 3, major_code: 'KTPM' },
  { subject_code: 'INT302', subject_name: 'Trí tuệ Nhân tạo', credit: 3, major_code: 'CNTT' },
  { subject_code: 'MAT101', subject_name: 'Toán Cao cấp A1', credit: 3 },
  { subject_code: 'MAT102', subject_name: 'Xác suất Thống kê', credit: 3 },
  { subject_code: 'PHY101', subject_name: 'Vật lý Đại cương', credit: 2, major_code: 'DTVT' },
  { subject_code: 'ENG101', subject_name: 'Tiếng Anh Cơ bản', credit: 3 },
  { subject_code: 'ENG201', subject_name: 'Tiếng Anh Chuyên ngành', credit: 3, major_code: 'NNA' },
  { subject_code: 'MKT101', subject_name: 'Marketing Căn bản', credit: 3, major_code: 'QTKD' },
  { subject_code: 'ACC101', subject_name: 'Nguyên lý Kế toán', credit: 3, major_code: 'KTDN' },
  { subject_code: 'MGT201', subject_name: 'Quản trị Học', credit: 3, major_code: 'QTKD' },
  { subject_code: 'LAW101', subject_name: 'Pháp luật Đại cương', credit: 2 },
  { subject_code: 'GPH101', subject_name: 'Thiết kế Đồ họa Cơ bản', credit: 3, major_code: 'TKDH' },
];

const faqData = [
  {
    question: 'Làm sao để phụ huynh xem điểm học tập của sinh viên?',
    answer: 'Phụ huynh đăng nhập EduLink, chọn mục Điểm số, sau đó chọn sinh viên cần theo dõi. Hệ thống sẽ hiển thị điểm từng môn, điểm trung bình và trạng thái công bố nếu dữ liệu đã được nhà trường cập nhật.',
    category: FeedbackCategory.HOC_TAP,
    sort_order: 1,
  },
  {
    question: 'Điểm mới cập nhật nhưng phụ huynh chưa nhìn thấy thì cần làm gì?',
    answer: 'Phụ huynh vui lòng thử tải lại trang hoặc đăng xuất rồi đăng nhập lại. Nếu sau 24 giờ điểm vẫn chưa hiển thị, phụ huynh có thể gửi phản hồi trong nhóm Học tập để bộ phận đào tạo kiểm tra.',
    category: FeedbackCategory.HOC_TAP,
    sort_order: 2,
  },
  {
    question: 'Phụ huynh có thể xem tình hình chuyên cần của sinh viên ở đâu?',
    answer: 'Vào mục Chuyên cần trên thanh điều hướng dành cho phụ huynh. Tại đây có thống kê số buổi có mặt, vắng, đi trễ và danh sách chi tiết theo từng lớp học phần.',
    category: FeedbackCategory.HOC_TAP,
    sort_order: 3,
  },
  {
    question: 'Làm sao để xem thời khóa biểu của sinh viên?',
    answer: 'Phụ huynh chọn mục Lịch học để xem các lớp học phần đang tham gia, thời gian học, phòng học và giảng viên phụ trách. Dữ liệu lịch học được sắp xếp theo tuần để dễ theo dõi.',
    category: FeedbackCategory.THOI_KHOA_BIEU,
    sort_order: 1,
  },
  {
    question: 'Nếu lịch học thay đổi thì hệ thống có cập nhật không?',
    answer: 'Khi nhà trường hoặc giảng viên cập nhật lớp học phần, EduLink sẽ hiển thị thông tin mới nhất. Phụ huynh nên kiểm tra mục Thông báo và Lịch học định kỳ để nắm thay đổi.',
    category: FeedbackCategory.THOI_KHOA_BIEU,
    sort_order: 2,
  },
  {
    question: 'Phụ huynh có thể theo dõi thông báo học phí bằng cách nào?',
    answer: 'Các thông báo liên quan đến học phí sẽ được gửi trong mục Thông báo. Nếu cần xác nhận khoản thu cụ thể, phụ huynh có thể gửi phản hồi ở nhóm Tài chính và ghi rõ mã số sinh viên.',
    category: FeedbackCategory.TAI_CHINH,
    sort_order: 1,
  },
  {
    question: 'Có thể xin gia hạn thời gian đóng học phí qua EduLink không?',
    answer: 'EduLink hỗ trợ gửi phản hồi và trao đổi với nhà trường. Phụ huynh cần tạo phản hồi nhóm Tài chính, trình bày lý do và chờ bộ phận phụ trách hướng dẫn hồ sơ hoặc quy trình tiếp theo.',
    category: FeedbackCategory.TAI_CHINH,
    sort_order: 2,
  },
  {
    question: 'Khi sinh viên vắng học vì lý do sức khỏe, phụ huynh cần báo ở đâu?',
    answer: 'Phụ huynh có thể tạo phản hồi nhóm Sức khỏe hoặc Kỷ luật, đính kèm nội dung mô tả tình trạng và giấy xác nhận nếu có. Nhà trường sẽ kiểm tra thông tin và hướng dẫn xử lý theo quy định.',
    category: FeedbackCategory.SUC_KHOE,
    sort_order: 1,
  },
  {
    question: 'Phụ huynh có thể phản ánh vấn đề kỷ luật hoặc nề nếp của sinh viên không?',
    answer: 'Có. Phụ huynh chọn mục Phản hồi, tạo phản hồi mới với nhóm Kỷ luật, mô tả rõ sự việc và thời điểm liên quan để nhà trường tiếp nhận và phối hợp xử lý.',
    category: FeedbackCategory.KY_LUAT,
    sort_order: 1,
  },
  {
    question: 'EduLink có hỗ trợ thông tin về ký túc xá không?',
    answer: 'Phụ huynh có thể gửi câu hỏi trong nhóm Ký túc xá để được hướng dẫn về nội quy, tình trạng lưu trú, chi phí hoặc các vấn đề sinh hoạt liên quan đến sinh viên.',
    category: FeedbackCategory.KY_TUC_XA,
    sort_order: 1,
  },
  {
    question: 'Làm sao để biết sinh viên có hoạt động ngoại khóa nào sắp diễn ra?',
    answer: 'Các chương trình ngoại khóa, hội thảo và sự kiện sẽ được đăng trong mục Thông báo. Phụ huynh cũng có thể gửi phản hồi nhóm Hoạt động ngoại khóa nếu cần thêm thông tin.',
    category: FeedbackCategory.HOAT_DONG,
    sort_order: 1,
  },
  {
    question: 'Nếu quên mật khẩu tài khoản phụ huynh thì làm thế nào?',
    answer: 'Tại màn hình đăng nhập, phụ huynh chọn Quên mật khẩu và làm theo hướng dẫn xác thực. Nếu không nhận được mã xác thực, vui lòng kiểm tra lại email hoặc liên hệ bộ phận hỗ trợ.',
    category: FeedbackCategory.KHAC,
    sort_order: 1,
  },
  {
    question: 'Phụ huynh có thể liên kết thêm sinh viên vào cùng một tài khoản không?',
    answer: 'Việc liên kết sinh viên cần được nhà trường xác nhận. Phụ huynh vui lòng gửi phản hồi nhóm Khác hoặc liên hệ bộ phận quản trị kèm thông tin mã số sinh viên và quan hệ với sinh viên.',
    category: FeedbackCategory.KHAC,
    sort_order: 2,
  },
];

// parents[] → students[]
const families = [
  {
    parents: [
      { full_name: 'Nguyễn Văn Thành', phone: '0901234561', email: 'nvthanh@gmail.com', relationship: ParentRelationship.CHA, is_primary: true },
      { full_name: 'Lê Thị Dung', phone: '0901234560', email: 'ltdung@gmail.com', relationship: ParentRelationship.ME, is_primary: false },
    ],
    students: [
      { student_code: 'SV2024001', full_name: 'Nguyễn Thị Hương', dob: new Date('2003-03-15'), class: 'CNTT2024A', major_code: 'CNTT', study_year: 1, cohort: 'Khóa 2024' },
      { student_code: 'SV2022001', full_name: 'Nguyễn Văn Hải', dob: new Date('2001-07-20'), class: 'KTPM2022B', major_code: 'KTPM', study_year: 3, cohort: 'Khóa 2022' },
    ],
  },
  {
    // Trường hợp 2: Chỉ có Mẹ (1 phụ huynh)
    parents: [
      { full_name: 'Trần Thị Lan', phone: '0912345672', email: 'ttlan@gmail.com', relationship: ParentRelationship.ME, is_primary: true },
    ],
    students: [
      { student_code: 'SV2024002', full_name: 'Trần Minh Khôi', dob: new Date('2003-09-10'), class: 'QTKD2024A', major_code: 'QTKD', study_year: 1, cohort: 'Khóa 2024' },
    ],
  },
  {
    // Trường hợp 3: Người giám hộ (1 phụ huynh)
    parents: [
      { full_name: 'Phạm Đức Trí', phone: '0923456783', email: 'pdtri@gmail.com', relationship: ParentRelationship.NGUOI_GIAM_HO, is_primary: true },
    ],
    students: [
      { student_code: 'SV2023001', full_name: 'Lê Thị Bích Ngọc', dob: new Date('2002-05-22'), class: 'NNA2023A', major_code: 'NNA', study_year: 2, cohort: 'Khóa 2023' },
      { student_code: 'SV2024003', full_name: 'Lê Hoàng Phúc', dob: new Date('2003-12-01'), class: 'CNTT2024B', major_code: 'CNTT', study_year: 1, cohort: 'Khóa 2024' },
    ],
  },
  {
    // Trường hợp 4: Cha và Người giám hộ (2 người)
    parents: [
      { full_name: 'Đinh Văn Hoàng', phone: '0934567894', email: 'dvhoang@gmail.com', relationship: ParentRelationship.CHA, is_primary: true },
      { full_name: 'Đinh Thị Thu', phone: '0934567890', email: 'dtthu@gmail.com', relationship: ParentRelationship.NGUOI_GIAM_HO, is_primary: false },
    ],
    students: [
      { student_code: 'SV2022002', full_name: 'Đinh Đức Huy', dob: new Date('2001-02-14'), class: 'DTVT2022A', major_code: 'DTVT', study_year: 3, cohort: 'Khóa 2022' },
    ],
  },
  {
    parents: [
      { full_name: 'Võ Văn Tuấn', phone: '0945678905', email: 'vvtuan@gmail.com', relationship: ParentRelationship.CHA, is_primary: true },
      { full_name: 'Trương Thị Yến', phone: '0945678900', email: 'ttyen@gmail.com', relationship: ParentRelationship.ME, is_primary: false },
    ],
    students: [
      { student_code: 'SV2021001', full_name: 'Võ Minh Đức', dob: new Date('2000-11-30'), class: 'KTDN2021A', major_code: 'KTDN', study_year: 4, cohort: 'Khóa 2021' },
      { student_code: 'SV2023002', full_name: 'Võ Thị Thu Thảo', dob: new Date('2002-06-18'), class: 'TKDH2023A', major_code: 'TKDH', study_year: 2, cohort: 'Khóa 2023' },
    ],
  },
  {
    parents: [
      { full_name: 'Đặng Thị Thanh', phone: '0956789016', email: 'dtthanh@gmail.com', relationship: ParentRelationship.ME, is_primary: true },
    ],
    students: [
      { student_code: 'SV2024004', full_name: 'Đặng Quốc Bảo', dob: new Date('2003-08-05'), class: 'KTPM2024A', major_code: 'KTPM', study_year: 1, cohort: 'Khóa 2024' },
    ],
  },
  {
    parents: [
      { full_name: 'Bùi Văn Hải', phone: '0967890127', email: 'bvhai@gmail.com', relationship: ParentRelationship.CHA, is_primary: true },
    ],
    students: [
      { student_code: 'SV2023003', full_name: 'Bùi Thị Hà', dob: new Date('2002-01-25'), class: 'QTKD2023B', major_code: 'QTKD', study_year: 2, cohort: 'Khóa 2023' },
      { student_code: 'SV2022003', full_name: 'Bùi Văn Hùng', dob: new Date('2001-09-12'), class: 'CNTT2022A', major_code: 'CNTT', study_year: 3, cohort: 'Khóa 2022' },
    ],
  },
  {
    parents: [
      { full_name: 'Hoàng Thị Yến', phone: '0978901238', email: 'htyen@gmail.com', relationship: ParentRelationship.ME, is_primary: true },
    ],
    students: [
      { student_code: 'SV2024005', full_name: 'Hoàng Gia Bảo', dob: new Date('2003-04-03'), class: 'DTVT2024A', major_code: 'DTVT', study_year: 1, cohort: 'Khóa 2024' },
    ],
  },
  {
    parents: [
      { full_name: 'Ngô Đình Khoa', phone: '0989012349', email: 'ndkhoa@gmail.com', relationship: ParentRelationship.CHA, is_primary: true },
    ],
    students: [
      { student_code: 'SV2021002', full_name: 'Ngô Đình Long', dob: new Date('2000-07-17'), class: 'KTPM2021A', major_code: 'KTPM', study_year: 4, cohort: 'Khóa 2021' },
      { student_code: 'SV2023004', full_name: 'Ngô Thị Trang', dob: new Date('2002-10-28'), class: 'NNA2023B', major_code: 'NNA', study_year: 2, cohort: 'Khóa 2023' },
    ],
  },
  {
    parents: [
      { full_name: 'Dương Văn Phúc', phone: '0990123450', email: 'dvphuc@gmail.com', relationship: ParentRelationship.CHA, is_primary: true },
    ],
    students: [
      { student_code: 'SV2022004', full_name: 'Dương Minh Phú', dob: new Date('2001-03-09'), class: 'CNTT2022B', major_code: 'CNTT', study_year: 3, cohort: 'Khóa 2022' },
      { student_code: 'SV2024006', full_name: 'Dương Thị Linh', dob: new Date('2003-01-14'), class: 'TKDH2024A', major_code: 'TKDH', study_year: 1, cohort: 'Khóa 2024' },
    ],
  },
  {
    parents: [
      { full_name: 'Trịnh Thị Hoa', phone: '0901122334', email: 'tthoa2@gmail.com', relationship: ParentRelationship.ME, is_primary: true },
    ],
    students: [
      { student_code: 'SV2023005', full_name: 'Trịnh Quốc Huy', dob: new Date('2002-12-20'), class: 'QTKD2023A', major_code: 'QTKD', study_year: 2, cohort: 'Khóa 2023' },
    ],
  },
  {
    parents: [
      { full_name: 'Lý Văn Toàn', phone: '0912233445', email: 'lvtoan@gmail.com', relationship: ParentRelationship.CHA, is_primary: true },
    ],
    students: [
      { student_code: 'SV2021003', full_name: 'Lý Thị Bích', dob: new Date('2000-05-08'), class: 'KTDN2021B', major_code: 'KTDN', study_year: 4, cohort: 'Khóa 2021' },
      { student_code: 'SV2024007', full_name: 'Lý Văn Kiên', dob: new Date('2003-07-31'), class: 'CNTT2024C', major_code: 'CNTT', study_year: 1, cohort: 'Khóa 2024' },
    ],
  },
  {
    parents: [
      { full_name: 'Phan Thị Mỹ Linh', phone: '0923344556', email: 'ptmlinh@gmail.com', relationship: ParentRelationship.ME, is_primary: true },
    ],
    students: [
      { student_code: 'SV2023006', full_name: 'Phan Gia Khang', dob: new Date('2002-02-16'), class: 'DTVT2023A', major_code: 'DTVT', study_year: 2, cohort: 'Khóa 2023' },
    ],
  },
  {
    parents: [
      { full_name: 'Châu Văn Bình', phone: '0934455667', email: 'cvbinh@gmail.com', relationship: ParentRelationship.CHA, is_primary: true },
    ],
    students: [
      { student_code: 'SV2022005', full_name: 'Châu Thị Diễm', dob: new Date('2001-08-23'), class: 'NNA2022A', major_code: 'NNA', study_year: 3, cohort: 'Khóa 2022' },
      { student_code: 'SV2024008', full_name: 'Châu Minh Luân', dob: new Date('2003-06-04'), class: 'KTPM2024B', major_code: 'KTPM', study_year: 1, cohort: 'Khóa 2024' },
    ],
  },
  {
    parents: [
      { full_name: 'Vũ Thị Ngọc Ánh', phone: '0945566778', email: 'vtnanh@gmail.com', relationship: ParentRelationship.ME, is_primary: true },
    ],
    students: [
      { student_code: 'SV2021004', full_name: 'Vũ Nhật Minh', dob: new Date('2000-04-11'), class: 'TKDH2021A', major_code: 'TKDH', study_year: 4, cohort: 'Khóa 2021' },
    ],
  },
];

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('🗑️  Xoá dữ liệu cũ...');
  await prisma.feedback.deleteMany();
  await prisma.faq.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.attendanceRecord.deleteMany();
  await prisma.attendanceSession.deleteMany();
  await prisma.classEnrollment.deleteMany();
  await prisma.classSection.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.score.deleteMany();
  await prisma.studentParent.deleteMany();
  await prisma.student.deleteMany();
  await prisma.parent.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.major.deleteMany();
  await prisma.admin.deleteMany();
  await prisma.teacher.deleteMany();
  console.log('✅ Đã xoá toàn bộ dữ liệu cũ.\n');

  // 1. Admin
  const adminPwd = await bcrypt.hash('admin123', 10);
  const admin = await prisma.admin.create({
    data: {
      username: 'admin',
      password: adminPwd,
      full_name: 'Ban Quản trị Hệ thống',
      email: 'admin@hutech.edu.vn',
    },
  });
  console.log('✅ Admin:', admin.username);

  // 1.5 Teachers
  const teacherPwd = await bcrypt.hash('teacher123', 10);
  const teachers = await Promise.all([
    prisma.teacher.create({
      data: { username: 'teacher1', password: teacherPwd, full_name: 'PGS.TS. Nguyễn Văn A', email: 'nva@hutech.edu.vn', phone: '0988888881' }
    }),
    prisma.teacher.create({
      data: { username: 'teacher2', password: teacherPwd, full_name: 'ThS. Trần Thị B', email: 'ttb@hutech.edu.vn', phone: '0988888882' }
    }),
    prisma.teacher.create({
      data: { username: 'teacher3', password: teacherPwd, full_name: 'TS. Phạm Văn C', email: 'pvc@hutech.edu.vn', phone: '0988888883' }
    }),
    prisma.teacher.create({
      data: { username: 'teacher4', password: teacherPwd, full_name: 'GS. Lê Hoàng D', email: 'lhd@hutech.edu.vn', phone: '0988888884' }
    })
  ]);
  console.log(`✅ ${teachers.length} Giáo viên đã được tạo.`);

  // 1.6 Parents
  const parentPwd = await bcrypt.hash('123456', 10);

  // 2. Majors
  const majorMap = new Map<string, number>();
  for (const m of majors) {
    const created = await prisma.major.create({ data: m });
    majorMap.set(created.major_code, created.major_id);
  }
  console.log(`✅ ${majors.length} ngành học đã được tạo.`);

  // 3. Subjects
  const subjectMap = new Map<string, number>();
  for (const s of subjects) {
    const { major_code, ...subjectData } = s;
    const majorId = major_code ? majorMap.get(major_code) : null;
    const created = await prisma.subject.create({
      data: {
        ...subjectData,
        major_id: majorId,
      },
    });
    subjectMap.set(created.subject_code, created.subject_id);
  }
  console.log(`✅ ${subjects.length} môn học đã được tạo.`);

  // 4. Parents + Students
  const allStudentIds: number[] = [];
  const parentIds: number[] = [];

  for (const family of families) {
    const { parents, students } = family;

    const createdParents = [];
    for (const p of parents) {
      const parent = await prisma.parent.create({
        data: {
          full_name: p.full_name,
          phone: p.phone,
          email: p.email,
          relationship: p.relationship,
          is_active: true,
          password: parentPwd,
        },
      });
      createdParents.push({ id: parent.parent_id, is_primary: p.is_primary });
      parentIds.push(parent.parent_id);
    }

    for (const s of students) {
      const email = studentEmail(s.full_name, s.student_code);
      const majorId = majorMap.get(s.major_code);

      const student = await prisma.student.create({
        data: {
          student_code: s.student_code,
          full_name: s.full_name,
          email,
          class: s.class,
          study_year: s.study_year,
          cohort: s.cohort,
          date_of_birth: s.dob,
          status: StudentStatus.DANG_HOC,
          parents: {
            create: createdParents.map((cp) => ({
              parent_id: cp.id,
              is_primary: cp.is_primary,
            })),
          },
          major_id: majorId,
        },
      });
      allStudentIds.push(student.student_id);
    }

    console.log(
      `✅ Phụ huynh: ${parents.map((p) => p.full_name).join(', ')} → ${
        students.length
      } sinh viên`,
    );
  }

  // 5. Scores
  const semesters = [
    { code: AcademicTermCode.HK1, year: 2023 },
    { code: AcademicTermCode.HK2, year: 2023 },
    { code: AcademicTermCode.HK1, year: 2024 },
    { code: AcademicTermCode.HK2, year: 2024 },
    { code: AcademicTermCode.HK1, year: 2025 },
    { code: AcademicTermCode.HK2, year: 2025 },
  ];
  const termMap = new Map<string, number>();
  const academicYearMap = new Map<number, number>();
  for (const sem of semesters) {
    if (!academicYearMap.has(sem.year)) {
      const yearDates = academicYearDates(sem.year);
      const academicYear = await prisma.academicYear.upsert({
        where: { name: academicYearName(sem.year) },
        update: {
          start_date: yearDates.start_date,
          end_date: yearDates.end_date,
        },
        create: {
          name: academicYearName(sem.year),
          start_date: yearDates.start_date,
          end_date: yearDates.end_date,
        },
      });
      academicYearMap.set(sem.year, academicYear.academic_year_id);
    }

    const dates = termDates(sem.code, sem.year);
    const academicYearId = academicYearMap.get(sem.year)!;
    const term = await prisma.academicTerm.upsert({
      where: {
        academic_year_id_code: {
          academic_year_id: academicYearId,
          code: sem.code,
        },
      },
      update: {
        name: termName(sem.code, sem.year),
        start_date: dates.start_date,
        end_date: dates.end_date,
      },
      create: {
        code: sem.code,
        academic_year_id: academicYearId,
        name: termName(sem.code, sem.year),
        start_date: dates.start_date,
        end_date: dates.end_date,
      },
    });
    termMap.set(`${sem.code}-${sem.year}`, term.term_id);
  }
  const subjectCodes = Array.from(subjectMap.keys());

  const scoreData: Array<{
    student_id: number; subject_id: number; term_id: number;
    assignment: number; midterm: number; final: number; avg: number;
    publish_status: string;
  }> = [];
  for (const studentId of allStudentIds) {
    let subjectIndex = 0;
    for (const sem of semesters.filter(
      (s) => !(s.code === AcademicTermCode.HK2 && s.year === 2025),
    )) {
      const pickedSubjects: string[] = [];
      for (let i = 0; i < 5; i++) {
        pickedSubjects.push(subjectCodes[(subjectIndex + i) % subjectCodes.length]);
      }
      subjectIndex += 5;
      for (const code of pickedSubjects) {
        const subjectId = subjectMap.get(code)!;
        const assignment = parseFloat((Math.random() * 3 + 7).toFixed(1));
        const midterm = parseFloat((Math.random() * 4 + 6).toFixed(1));
        const finalScore = parseFloat((Math.random() * 4 + 6).toFixed(1));
        const avg = Math.round((assignment * 0.2 + midterm * 0.3 + finalScore * 0.5) * 100) / 100;
        scoreData.push({
          student_id: studentId, subject_id: subjectId,
          term_id: termMap.get(`${sem.code}-${sem.year}`)!,
          assignment, midterm, final: finalScore, avg,
          publish_status: 'PUBLISHED',
        });
      }
    }
  }
  await prisma.score.createMany({ data: scoreData });
  console.log(`✅ ${scoreData.length} điểm đã được tạo.`);

  // 6. Attendance
  const attendanceData: Array<{
    student_id: number; term_id: number;
    total_sessions: number; absent_sessions: number; late_sessions: number;
  }> = [];
  for (const studentId of allStudentIds) {
    for (const sem of semesters) {
      attendanceData.push({
        student_id: studentId,
        term_id: termMap.get(`${sem.code}-${sem.year}`)!,
        total_sessions: 30,
        absent_sessions: Math.floor(Math.random() * 6),
        late_sessions: Math.floor(Math.random() * 3),
      });
    }
  }
  await prisma.attendance.createMany({ data: attendanceData });
  console.log(`✅ ${attendanceData.length} bản ghi chuyên cần đã được tạo.`);

  // 7. Class Sections (lớp học phần) + Enrollments + Sessions + Records
  //
  // Quy tắc:
  //   FINISHED  → tất cả session là quá khứ, có đầy đủ attendance records
  //   ONGOING   → có session quá khứ (có records) + session tương lai (KHÔNG có records)
  //   UPCOMING  → tất cả session là tương lai, KHÔNG có bất kỳ attendance record nào
  //
  // TODAY = 2026-05-03 (Chủ Nhật)
  // Monday của tuần này = 27/04/2026
  // weekdayDate(dayIdx, weekDelta):
  //   dayIdx: 0=CN, 1=T2, 2=T3, 3=T4, 4=T5, 5=T6, 6=T7
  //   weekDelta: 0=tuần này, -1=tuần trước, +1=tuần sau

  const TODAY = new Date('2026-05-03T00:00:00Z');

  function weekdayDate(dayIdx: number, weekDelta: number): Date {
    // Tìm Monday của tuần chứa TODAY
    const todayDow = TODAY.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    const daysFromMonday = todayDow === 0 ? 6 : todayDow - 1;
    const monday = new Date(TODAY);
    monday.setDate(TODAY.getDate() - daysFromMonday + weekDelta * 7);
    // Offset từ Monday: Mon=0, Tue=1, ..., Sat=5, Sun=6
    const dayOffset = dayIdx === 0 ? 6 : dayIdx - 1;
    const result = new Date(monday);
    result.setDate(monday.getDate() + dayOffset);
    return result;
  }

  const classSectionsData: Array<{
    class_code: string;
    teacher_name: string;
    day_of_week: string;
    start_time: string;
    end_time: string;
    room: string;
    semester: string;
    subject_code: string;
    sessions: Array<{
      session_date: Date;
      session_no: number;
      hasRecords: boolean;
    }>;
  }> = [
    // ── FINISHED: HK2-2023 ─────────────────────────────────────────────
    // Môn: MAT101, LAW101, ENG101
    {
      class_code: 'L61', teacher_name: 'PGS.TS. Nguyễn Văn A',
      day_of_week: 'Thứ 2', start_time: '7:30', end_time: '9:30',
      room: 'A1.202', semester: 'HK2-2023',
      subject_code: 'MAT101',
      sessions: [
        { session_date: weekdayDate(1, -43), session_no: 1, hasRecords: true }, // T2 tuần -43
        { session_date: weekdayDate(1, -41), session_no: 2, hasRecords: true },
        { session_date: weekdayDate(1, -39), session_no: 3, hasRecords: true },
        { session_date: weekdayDate(1, -37), session_no: 4, hasRecords: true },
        { session_date: weekdayDate(1, -35), session_no: 5, hasRecords: true },
        { session_date: weekdayDate(1, -33), session_no: 6, hasRecords: true },
        { session_date: weekdayDate(1, -31), session_no: 7, hasRecords: true },
        { session_date: weekdayDate(1, -29), session_no: 8, hasRecords: true },
      ],
    },
    {
      class_code: 'L62', teacher_name: 'ThS. Trần Thị B',
      day_of_week: 'Thứ 4', start_time: '13:30', end_time: '15:30',
      room: 'C2.501', semester: 'HK2-2023',
      subject_code: 'LAW101',
      sessions: [
        { session_date: weekdayDate(3, -42), session_no: 1, hasRecords: true }, // T4 tuần -42
        { session_date: weekdayDate(3, -40), session_no: 2, hasRecords: true },
        { session_date: weekdayDate(3, -38), session_no: 3, hasRecords: true },
        { session_date: weekdayDate(3, -36), session_no: 4, hasRecords: true },
        { session_date: weekdayDate(3, -34), session_no: 5, hasRecords: true },
        { session_date: weekdayDate(3, -32), session_no: 6, hasRecords: true },
        { session_date: weekdayDate(3, -30), session_no: 7, hasRecords: true },
      ],
    },
    {
      class_code: 'L63', teacher_name: 'TS. Phạm Văn C',
      day_of_week: 'Thứ 6', start_time: '9:45', end_time: '11:45',
      room: 'B3.104', semester: 'HK2-2023',
      subject_code: 'ENG101',
      sessions: [
        { session_date: weekdayDate(5, -41), session_no: 1, hasRecords: true }, // T6 tuần -41
        { session_date: weekdayDate(5, -39), session_no: 2, hasRecords: true },
        { session_date: weekdayDate(5, -37), session_no: 3, hasRecords: true },
        { session_date: weekdayDate(5, -35), session_no: 4, hasRecords: true },
        { session_date: weekdayDate(5, -33), session_no: 5, hasRecords: true },
        { session_date: weekdayDate(5, -31), session_no: 6, hasRecords: true },
      ],
    },

    // ── FINISHED: HK1-2024 ─────────────────────────────────────────────
    // Môn: INT101, INT102, PHY101
    {
      class_code: 'L64', teacher_name: 'GS. Lê Hoàng D',
      day_of_week: 'Thứ 3', start_time: '7:30', end_time: '9:30',
      room: 'C2.302', semester: 'HK1-2024',
      subject_code: 'INT101',
      sessions: [
        { session_date: weekdayDate(2, -26), session_no: 1, hasRecords: true }, // T3 tuần -26
        { session_date: weekdayDate(2, -24), session_no: 2, hasRecords: true },
        { session_date: weekdayDate(2, -22), session_no: 3, hasRecords: true },
        { session_date: weekdayDate(2, -20), session_no: 4, hasRecords: true },
        { session_date: weekdayDate(2, -18), session_no: 5, hasRecords: true },
        { session_date: weekdayDate(2, -16), session_no: 6, hasRecords: true },
        { session_date: weekdayDate(2, -14), session_no: 7, hasRecords: true },
        { session_date: weekdayDate(2, -12), session_no: 8, hasRecords: true },
        { session_date: weekdayDate(2, -10), session_no: 9, hasRecords: true },
      ],
    },
    {
      class_code: 'L65', teacher_name: 'TS. Phạm Văn C',
      day_of_week: 'Thứ 6', start_time: '9:45', end_time: '11:45',
      room: 'B3.104', semester: 'HK1-2024',
      subject_code: 'PHY101',
      sessions: [
        { session_date: weekdayDate(5, -25), session_no: 1, hasRecords: true }, // T6 tuần -25
        { session_date: weekdayDate(5, -23), session_no: 2, hasRecords: true },
        { session_date: weekdayDate(5, -21), session_no: 3, hasRecords: true },
        { session_date: weekdayDate(5, -19), session_no: 4, hasRecords: true },
        { session_date: weekdayDate(5, -17), session_no: 5, hasRecords: true },
        { session_date: weekdayDate(5, -15), session_no: 6, hasRecords: true },
        { session_date: weekdayDate(5, -13), session_no: 7, hasRecords: true },
      ],
    },
    {
      class_code: 'L66', teacher_name: 'ThS. Trần Thị B',
      day_of_week: 'Thứ 5', start_time: '7:30', end_time: '9:30',
      room: 'D2.201', semester: 'HK1-2024',
      subject_code: 'INT102',
      sessions: [
        { session_date: weekdayDate(4, -24), session_no: 1, hasRecords: true }, // T5 tuần -24
        { session_date: weekdayDate(4, -22), session_no: 2, hasRecords: true },
        { session_date: weekdayDate(4, -20), session_no: 3, hasRecords: true },
        { session_date: weekdayDate(4, -18), session_no: 4, hasRecords: true },
        { session_date: weekdayDate(4, -16), session_no: 5, hasRecords: true },
        { session_date: weekdayDate(4, -14), session_no: 6, hasRecords: true },
        { session_date: weekdayDate(4, -12), session_no: 7, hasRecords: true },
        { session_date: weekdayDate(4, -10), session_no: 8, hasRecords: true },
      ],
    },

    // ── ONGOING: HK1-2025 ─────────────────────────────────────────────
    // Môn: INT201, INT202, MAT102, ENG201, ACC101
    // TODAY=CN 03/05 → Monday tuần này = 27/04 (quá khứ), Monday tuần sau = 04/05 (tương lai)
    {
      class_code: 'L01', teacher_name: 'PGS.TS. Nguyễn Văn A',
      day_of_week: 'Thứ 2', start_time: '7:30', end_time: '9:30',
      room: 'A1.202', semester: 'HK1-2025',
      subject_code: 'INT201',
      sessions: [
        { session_date: weekdayDate(1, -9), session_no: 1, hasRecords: true  }, // T2 23/02
        { session_date: weekdayDate(1, -7), session_no: 2, hasRecords: true  }, // T2 09/03
        { session_date: weekdayDate(1, -5), session_no: 3, hasRecords: true  }, // T2 23/03
        { session_date: weekdayDate(1, -3), session_no: 4, hasRecords: true  }, // T2 06/04
        { session_date: weekdayDate(1, -1), session_no: 5, hasRecords: true  }, // T2 20/04
        { session_date: weekdayDate(1,  0), session_no: 6, hasRecords: true  }, // T2 27/04 (tuần này, đã qua)
        { session_date: weekdayDate(1,  1), session_no: 7, hasRecords: false }, // T2 04/05 (tương lai)
        { session_date: weekdayDate(1,  3), session_no: 8, hasRecords: false }, // T2 18/05
      ],
    },
    {
      class_code: 'L05', teacher_name: 'TS. Phạm Văn C',
      day_of_week: 'Thứ 6', start_time: '9:45', end_time: '11:45',
      room: 'B3.104', semester: 'HK1-2025',
      subject_code: 'INT202',
      sessions: [
        { session_date: weekdayDate(5, -8), session_no: 1, hasRecords: true  }, // T6 06/03
        { session_date: weekdayDate(5, -6), session_no: 2, hasRecords: true  }, // T6 20/03
        { session_date: weekdayDate(5, -4), session_no: 3, hasRecords: true  }, // T6 03/04
        { session_date: weekdayDate(5, -2), session_no: 4, hasRecords: true  }, // T6 17/04
        { session_date: weekdayDate(5,  0), session_no: 5, hasRecords: true  }, // T6 01/05 (đã qua)
        { session_date: weekdayDate(5,  2), session_no: 6, hasRecords: false }, // T6 15/05
        { session_date: weekdayDate(5,  4), session_no: 7, hasRecords: false }, // T6 29/05
      ],
    },
    {
      class_code: 'L08', teacher_name: 'GS. Lê Hoàng D',
      day_of_week: 'Thứ 3', start_time: '7:30', end_time: '9:30',
      room: 'C2.302', semester: 'HK1-2025',
      subject_code: 'MAT102',
      sessions: [
        { session_date: weekdayDate(2, -10), session_no: 1, hasRecords: true  }, // T3 17/02
        { session_date: weekdayDate(2, -8),  session_no: 2, hasRecords: true  }, // T3 03/03
        { session_date: weekdayDate(2, -6),  session_no: 3, hasRecords: true  }, // T3 17/03
        { session_date: weekdayDate(2, -4),  session_no: 4, hasRecords: true  }, // T3 31/03
        { session_date: weekdayDate(2, -2),  session_no: 5, hasRecords: true  }, // T3 14/04
        { session_date: weekdayDate(2,  0),  session_no: 6, hasRecords: true  }, // T3 28/04 (đã qua)
        { session_date: weekdayDate(2,  2),  session_no: 7, hasRecords: false }, // T3 12/05
        { session_date: weekdayDate(2,  4),  session_no: 8, hasRecords: false }, // T3 26/05
        { session_date: weekdayDate(2,  6),  session_no: 9, hasRecords: false }, // T3 09/06
      ],
    },
    {
      class_code: 'L09', teacher_name: 'ThS. Trần Thị B',
      day_of_week: 'Thứ 5', start_time: '13:30', end_time: '15:30',
      room: 'D1.305', semester: 'HK1-2025',
      subject_code: 'ENG201',
      sessions: [
        { session_date: weekdayDate(4, -9), session_no: 1, hasRecords: true  }, // T5 26/02
        { session_date: weekdayDate(4, -7), session_no: 2, hasRecords: true  }, // T5 12/03
        { session_date: weekdayDate(4, -5), session_no: 3, hasRecords: true  }, // T5 26/03
        { session_date: weekdayDate(4, -3), session_no: 4, hasRecords: true  }, // T5 09/04
        { session_date: weekdayDate(4, -1), session_no: 5, hasRecords: true  }, // T5 23/04
        { session_date: weekdayDate(4,  1), session_no: 6, hasRecords: false }, // T5 07/05
        { session_date: weekdayDate(4,  3), session_no: 7, hasRecords: false }, // T5 21/05
      ],
    },
    {
      class_code: 'L10', teacher_name: 'PGS.TS. Nguyễn Văn A',
      day_of_week: 'Thứ 7', start_time: '7:30', end_time: '9:30',
      room: 'A2.101', semester: 'HK1-2025',
      subject_code: 'ACC101',
      sessions: [
        { session_date: weekdayDate(6, -8), session_no: 1, hasRecords: true  }, // T7 07/03
        { session_date: weekdayDate(6, -6), session_no: 2, hasRecords: true  }, // T7 21/03
        { session_date: weekdayDate(6, -4), session_no: 3, hasRecords: true  }, // T7 04/04
        { session_date: weekdayDate(6, -2), session_no: 4, hasRecords: true  }, // T7 18/04
        { session_date: weekdayDate(6,  0), session_no: 5, hasRecords: true  }, // T7 02/05 (đã qua)
        { session_date: weekdayDate(6,  2), session_no: 6, hasRecords: false }, // T7 16/05
      ],
    },

    // ── UPCOMING: HK2-2025 — tất cả session tương lai, KHÔNG có records ──
    // Môn: INT301, INT302, MKT101, MGT201
    {
      class_code: 'L02', teacher_name: 'ThS. Trần Thị B',
      day_of_week: 'Thứ 4', start_time: '13:30', end_time: '15:30',
      room: 'C2.501', semester: 'HK2-2025',
      subject_code: 'INT301',
      sessions: [
        { session_date: weekdayDate(3,  5), session_no: 1, hasRecords: false }, // T4 27/05
        { session_date: weekdayDate(3,  7), session_no: 2, hasRecords: false }, // T4 10/06
        { session_date: weekdayDate(3,  9), session_no: 3, hasRecords: false },
        { session_date: weekdayDate(3, 11), session_no: 4, hasRecords: false },
        { session_date: weekdayDate(3, 13), session_no: 5, hasRecords: false },
        { session_date: weekdayDate(3, 15), session_no: 6, hasRecords: false },
        { session_date: weekdayDate(3, 17), session_no: 7, hasRecords: false },
        { session_date: weekdayDate(3, 19), session_no: 8, hasRecords: false },
      ],
    },
    {
      class_code: 'L03', teacher_name: 'GS. Lê Hoàng D',
      day_of_week: 'Thứ 2', start_time: '9:45', end_time: '11:45',
      room: 'B1.201', semester: 'HK2-2025',
      subject_code: 'INT302',
      sessions: [
        { session_date: weekdayDate(1,  5), session_no: 1, hasRecords: false }, // T2 25/05
        { session_date: weekdayDate(1,  7), session_no: 2, hasRecords: false },
        { session_date: weekdayDate(1,  9), session_no: 3, hasRecords: false },
        { session_date: weekdayDate(1, 11), session_no: 4, hasRecords: false },
        { session_date: weekdayDate(1, 13), session_no: 5, hasRecords: false },
        { session_date: weekdayDate(1, 15), session_no: 6, hasRecords: false },
        { session_date: weekdayDate(1, 17), session_no: 7, hasRecords: false },
      ],
    },
    {
      class_code: 'L04', teacher_name: 'TS. Phạm Văn C',
      day_of_week: 'Thứ 6', start_time: '13:00', end_time: '15:00',
      room: 'A3.303', semester: 'HK2-2025',
      subject_code: 'MKT101',
      sessions: [
        { session_date: weekdayDate(5,  5), session_no: 1, hasRecords: false }, // T6 29/05
        { session_date: weekdayDate(5,  7), session_no: 2, hasRecords: false },
        { session_date: weekdayDate(5,  9), session_no: 3, hasRecords: false },
        { session_date: weekdayDate(5, 11), session_no: 4, hasRecords: false },
        { session_date: weekdayDate(5, 13), session_no: 5, hasRecords: false },
        { session_date: weekdayDate(5, 15), session_no: 6, hasRecords: false },
      ],
    },
    {
      class_code: 'L11', teacher_name: 'PGS.TS. Nguyễn Văn A',
      day_of_week: 'Thứ 3', start_time: '13:30', end_time: '15:30',
      room: 'A1.305', semester: 'HK2-2025',
      subject_code: 'MGT201',
      sessions: [
        { session_date: weekdayDate(2,  6), session_no: 1, hasRecords: false }, // T3 02/06
        { session_date: weekdayDate(2,  8), session_no: 2, hasRecords: false },
        { session_date: weekdayDate(2, 10), session_no: 3, hasRecords: false },
        { session_date: weekdayDate(2, 12), session_no: 4, hasRecords: false },
        { session_date: weekdayDate(2, 14), session_no: 5, hasRecords: false },
        { session_date: weekdayDate(2, 16), session_no: 6, hasRecords: false },
      ],
    },
  ];

// Enroll ALL students in each class section

  const enrollStudentIds = allStudentIds;

  let sectionCount = 0;
  let sessionCount = 0;
  let recordCount  = 0;

  // Realistic attendance status pool: ~70% PRESENT, 15% LATE, 15% ABSENT
  const statusPool: AttendanceRecordStatus[] = [
    'PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'PRESENT',
    'PRESENT', 'PRESENT', 'LATE', 'ABSENT', 'PRESENT',
  ];

  for (const cs of classSectionsData) {
    const subjectId = subjectMap.get(cs.subject_code)!;
    const teacher   = teachers.find((t) => t.full_name === cs.teacher_name)!;

    const section = await prisma.classSection.create({
      data: {
        class_code:   cs.class_code,
        teacher_id:   teacher.teacher_id,
        teacher_name: cs.teacher_name,
        day_of_week:  cs.day_of_week,
        start_time:   cs.start_time,
        end_time:     cs.end_time,
        room:         cs.room,
        term_id:      termMap.get(parseTermKey(cs.semester))!,
        subject_id:   subjectId,
      },
    });
    sectionCount++;

    // Batch enroll students
    await prisma.classEnrollment.createMany({
      data: enrollStudentIds.map((studentId) => ({
        section_id: section.section_id,
        student_id: studentId,
      })),
    });
    // Query back enrollment IDs for attendance records
    const enrollments = await prisma.classEnrollment.findMany({
      where: { section_id: section.section_id },
      select: { enrollment_id: true },
      orderBy: { enrollment_id: 'asc' },
    });

    // Batch create sessions
    await prisma.attendanceSession.createMany({
      data: cs.sessions.map((s) => ({
        section_id:   section.section_id,
        session_date: s.session_date,
        session_no:   s.session_no,
      })),
    });
    sessionCount += cs.sessions.length;

    // Query back session IDs for attendance records
    const createdSessions = await prisma.attendanceSession.findMany({
      where: { section_id: section.section_id },
      select: { session_id: true, session_no: true },
      orderBy: { session_no: 'asc' },
    });

    // Batch create attendance records for past sessions
    const recordsData: Array<{
      session_id: number; enrollment_id: number;
      status: AttendanceRecordStatus; note: string | null;
    }> = [];
    for (let i = 0; i < cs.sessions.length; i++) {
      const sessionSpec = cs.sessions[i];
      if (!sessionSpec.hasRecords) continue;
      const sessionId = createdSessions.find((s) => s.session_no === sessionSpec.session_no)!.session_id;
      for (let j = 0; j < enrollments.length; j++) {
        const status = statusPool[(j + i * 3) % statusPool.length];
        recordsData.push({
          session_id:    sessionId,
          enrollment_id: enrollments[j].enrollment_id,
          status,
          note: status === 'ABSENT' ? 'Nghỉ ốm' :
                status === 'LATE'   ? 'Đến muộn 10 phút' : null,
        });
      }
    }
    if (recordsData.length > 0) {
      await prisma.attendanceRecord.createMany({ data: recordsData });
      recordCount += recordsData.length;
    }
  }  // end for (const cs of classSectionsData)

  console.log(`✅ ${sectionCount} lớp học phần, ${sessionCount} buổi học, ${recordCount} bản ghi điểm danh đã được tạo.`);


  // 7. Notifications
  const notifications = [
    { title: 'Lịch thi cuối kỳ HK2/2024', content: 'Lịch thi cuối kỳ học kỳ 2 năm học 2023–2024 đã được cập nhật trên cổng thông tin. Sinh viên vui lòng kiểm tra và chuẩn bị đầy đủ hồ sơ dự thi.' },
    { title: 'Thông báo đóng học phí HK1/2025', content: 'Nhà trường thông báo sinh viên hoàn thành đóng học phí học kỳ 1 năm 2025 trước ngày 30/08/2025. Sinh viên chưa đóng học phí sẽ không được tham gia thi cuối kỳ.' },
    { title: 'Khai giảng năm học 2024–2025', content: 'Lễ khai giảng năm học 2024–2025 sẽ được tổ chức vào ngày 05/09/2024 tại Hội trường A. Toàn thể sinh viên năm nhất có mặt đúng giờ.' },
    { title: 'Hội thảo "AI và Tương lai Nghề nghiệp"', content: 'Trường HUTECH tổ chức hội thảo "Trí tuệ Nhân tạo và Tương lai Nghề nghiệp" vào ngày 20/05/2025. Sinh viên đăng ký tham dự qua cổng thông tin.' },
    { title: 'Cập nhật quy định học vụ 2024', content: 'Nhà trường ban hành quy định học vụ mới áp dụng từ HK1/2025. Sinh viên vui lòng đọc kỹ tài liệu được đính kèm trong thông báo này.' },
    { title: 'Kết quả học tập HK1/2024', content: 'Kết quả học tập học kỳ 1 năm 2024 đã được công bố trên hệ thống EduLink. Sinh viên có thể xem điểm và phúc khảo trong vòng 7 ngày kể từ ngày thông báo.' },
  ];

  for (const notif of notifications) {
    await prisma.notification.create({
      data: {
        title: notif.title,
        content: notif.content,
        admin_id: admin.admin_id,
      },
    });
  }
  console.log(`✅ ${notifications.length} thông báo đã được tạo.`);

  // 8. Feedbacks + FeedbackMessages
  type FbSeed = {
    parentIdx: number;
    title: string;
    category: 'HOC_TAP' | 'TAI_CHINH' | 'THOI_KHOA_BIEU' | 'KY_LUAT' | 'KY_TUC_XA' | 'SUC_KHOE' | 'HOAT_DONG' | 'KHAC';
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
    content: string;
    reply: string | null;
    reply_at: Date | null;
  };

  const feedbackData: FbSeed[] = [
    {
      parentIdx: 0,
      title: 'Hỏi về lịch học phụ đạo môn Toán',
      category: 'HOC_TAP',
      status: 'RESOLVED',
      content: 'Kính gửi Ban Giám hiệu,\n\nTôi muốn hỏi liệu nhà trường có cung cấp thêm hỗ trợ học tập cho môn Giải tích 1 không. Cháu đang gặp khó khăn với phần đạo hàm.\n\nXin cảm ơn thầy cô.',
      reply: 'Kính chào quý phụ huynh, nhà trường có tổ chức các buổi học phụ đạo vào thứ 3 và thứ 5 hàng tuần từ 17h00 - 19h00 tại phòng B205.',
      reply_at: new Date('2025-01-05T14:30:00Z'),
    },
    {
      parentIdx: 1,
      title: 'Hỏi về phí tham quan thực tế sắp tới',
      category: 'TAI_CHINH',
      status: 'IN_PROGRESS',
      content: 'Xin cho tôi hỏi hạn chót đóng phí cho chuyến đi thực tế địa chất là khi nào? Tôi không tìm thấy thông tin trong thông báo.',
      reply: 'Hạn đóng phí là ngày 20 tháng này. Phụ huynh vui lòng nộp trực tiếp tại phòng Kế hoạch Tài vụ.',
      reply_at: new Date('2025-01-08T10:00:00Z'),
    },
    {
      parentIdx: 2,
      title: 'Định hướng hoạt động ngoại khóa cho sinh viên',
      category: 'HOAT_DONG',
      status: 'OPEN',
      content: 'Tôi muốn biết về các hoạt động ngoại khóa tại trường để định hướng phát triển kỹ năng mềm cho con.',
      reply: null,
      reply_at: null,
    },
    {
      parentIdx: 3,
      title: 'Con vắng 3 buổi do bệnh - xin xem xét thi bù',
      category: 'KY_LUAT',
      status: 'RESOLVED',
      content: 'Con vắng 3 buổi do bệnh. Có thể miễn kỷ luật và cho thi bù không? Có giấy xác nhận của bệnh viện.',
      reply: 'Vắng có lý do chính đáng và giấy tờ xác nhận sẽ được xem xét. Nộp giấy y tế tại phòng Công tác Sinh viên.',
      reply_at: new Date('2025-01-10T09:00:00Z'),
    },
    {
      parentIdx: 4,
      title: 'Đề nghị mở rộng chương trình học bổng',
      category: 'TAI_CHINH' as unknown as FbSeed['category'],
      status: 'OPEN' as unknown as FbSeed['status'],
      content: 'Đề nghị nhà trường xem xét hỗ trợ học bổng cho sinh viên hoàn cảnh khó khăn nhưng học lực khá.',
      reply: null,
      reply_at: null,
    },
  ];

  for (const fb of feedbackData) {
    const feedback = await prisma.feedback.create({
      data: {
        parent_id: parentIds[fb.parentIdx],
        title: fb.title,
        category: fb.category,
        status: fb.status,
        content: fb.content,
        reply_content: fb.reply,
        replied_at: fb.reply_at,
      },
    });

    await prisma.feedbackMessage.create({
      data: {
        feedback_id: feedback.feedback_id,
        content: fb.content,
        sender_role: 'PARENT',
        sender_id: parentIds[fb.parentIdx],
        created_at: feedback.created_at,
      },
    });

    if (fb.reply && fb.reply_at) {
      await prisma.feedbackMessage.create({
        data: {
          feedback_id: feedback.feedback_id,
          content: fb.reply,
          sender_role: 'ADMIN',
          sender_id: 1,
          created_at: fb.reply_at,
        },
      });
    }
  }
  console.log(`✅ ${feedbackData.length} phản hồi + messages đã được tạo.`);

  // 9. FAQs
  await prisma.faq.createMany({
    data: faqData,
  });
  console.log(`✅ ${faqData.length} FAQ đã được tạo.`);

  // Summary
  console.log('\n🎉 Seed hoàn tất!');
  console.log(`   Ngành: ${await prisma.major.count()}`);
  console.log(`   Môn học: ${await prisma.subject.count()}`);
  console.log(`   Phụ huynh: ${await prisma.parent.count()}`);
  console.log(`   Sinh viên: ${await prisma.student.count()}`);
  console.log(`   Điểm: ${await prisma.score.count()}`);
  console.log(`   Chuyên cần (tổng hợp): ${await prisma.attendance.count()}`);
  console.log(`   Lớp học phần: ${await prisma.classSection.count()}`);
  console.log(`   Buổi học: ${await prisma.attendanceSession.count()}`);
  console.log(`   Bản ghi điểm danh: ${await prisma.attendanceRecord.count()}`);
  console.log(`   Thông báo: ${await prisma.notification.count()}`);
  console.log(`   Phản hồi: ${await prisma.feedback.count()}`);
  console.log(`   FAQ: ${await prisma.faq.count()}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
