import { PrismaClient, ParentRelationship, StudentStatus, ClassStatus, AttendanceRecordStatus } from '@prisma/client';
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
  { subject_code: 'INT101', subject_name: 'Nhập môn Lập trình', credit: 3 },
  { subject_code: 'INT102', subject_name: 'Lập trình Hướng đối tượng', credit: 3 },
  { subject_code: 'INT201', subject_name: 'Cơ sở Dữ liệu', credit: 3 },
  { subject_code: 'INT202', subject_name: 'Mạng Máy tính', credit: 3 },
  { subject_code: 'INT301', subject_name: 'Phát triển Web', credit: 3 },
  { subject_code: 'INT302', subject_name: 'Trí tuệ Nhân tạo', credit: 3 },
  { subject_code: 'MAT101', subject_name: 'Toán Cao cấp A1', credit: 3 },
  { subject_code: 'MAT102', subject_name: 'Xác suất Thống kê', credit: 3 },
  { subject_code: 'PHY101', subject_name: 'Vật lý Đại cương', credit: 2 },
  { subject_code: 'ENG101', subject_name: 'Tiếng Anh Cơ bản', credit: 3 },
  { subject_code: 'ENG201', subject_name: 'Tiếng Anh Chuyên ngành', credit: 3 },
  { subject_code: 'MKT101', subject_name: 'Marketing Căn bản', credit: 3 },
  { subject_code: 'ACC101', subject_name: 'Nguyên lý Kế toán', credit: 3 },
  { subject_code: 'MGT201', subject_name: 'Quản trị Học', credit: 3 },
  { subject_code: 'LAW101', subject_name: 'Pháp luật Đại cương', credit: 2 },
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
    const created = await prisma.subject.create({ data: s });
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
          password: null,
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
    { semester: 'HK1', year: 2023 },
    { semester: 'HK2', year: 2023 },
    { semester: 'HK1', year: 2024 },
    { semester: 'HK2', year: 2024 },
    { semester: 'HK1', year: 2025 },
  ];
  const subjectCodes = Array.from(subjectMap.keys());

  let scoreCount = 0;
  for (const studentId of allStudentIds) {
    // Shuffle subjects for variety or just pick sequentially
    let subjectIndex = 0;
    for (const sem of semesters) {
      const pickedSubjects: string[] = [];
      for (let i = 0; i < 5; i++) {
        pickedSubjects.push(subjectCodes[(subjectIndex + i) % subjectCodes.length]);
      }
      subjectIndex += 5;
      for (const code of pickedSubjects) {
        const subjectId = subjectMap.get(code)!;
        const assignment = parseFloat((Math.random() * 3 + 7).toFixed(1)); // 7.0–10.0
        const midterm = parseFloat((Math.random() * 4 + 6).toFixed(1));    // 6.0–10.0
        const finalScore = parseFloat((Math.random() * 4 + 6).toFixed(1)); // 6.0–10.0
        const avg = Math.round((assignment * 0.2 + midterm * 0.3 + finalScore * 0.5) * 100) / 100;
        await prisma.score.create({
          data: {
            student_id: studentId,
            subject_id: subjectId,
            semester: sem.semester,
            year: sem.year,
            assignment,
            midterm,
            final: finalScore,
            avg,
            publish_status: 'PUBLISHED',
          },
        });
        scoreCount++;
      }
    }
  }
  console.log(`✅ ${scoreCount} điểm đã được tạo.`);

  // 6. Attendance
  let attCount = 0;
  for (const studentId of allStudentIds) {
    for (const sem of semesters) {
      const total = 30;
      const absent = Math.floor(Math.random() * 6); // 0–5 buổi vắng
      const late   = Math.floor(Math.random() * 3); // 0–2 buổi đi muộn
      await prisma.attendance.create({
        data: {
          student_id: studentId,
          semester: `${sem.semester}/${sem.year}`,
          total_sessions: total,
          absent_sessions: absent,
          late_sessions: late,
        },
      });
      attCount++;
    }
  }
  console.log(`✅ ${attCount} bản ghi chuyên cần đã được tạo.`);

  // 7. Class Sections (lớp học phần) + Enrollments + Sessions + Records
  const classSectionsData = [
    {
      class_code: 'L01', teacher_name: 'PGS.TS. Nguyễn Văn A',
      day_of_week: 'Thứ 2', start_time: '7:30', end_time: '9:30',
      room: 'A1.202', semester: 'HK1-2024', status: ClassStatus.ONGOING,
      subject_code: 'MAT101',
    },
    {
      class_code: 'L02', teacher_name: 'ThS. Trần Thị B',
      day_of_week: 'Thứ 4', start_time: '13:30', end_time: '15:30',
      room: 'C2.501', semester: 'HK1-2024', status: ClassStatus.UPCOMING,
      subject_code: 'INT101',
    },
    {
      class_code: 'L05', teacher_name: 'TS. Phạm Văn C',
      day_of_week: 'Thứ 6', start_time: '9:45', end_time: '11:45',
      room: 'B3.104', semester: 'HK1-2024', status: ClassStatus.ONGOING,
      subject_code: 'PHY101',
    },
    {
      class_code: 'L08', teacher_name: 'GS. Lê Hoàng D',
      day_of_week: 'Thứ 3', start_time: '7:30', end_time: '9:30',
      room: 'C2.302', semester: 'HK1-2024', status: ClassStatus.FINISHED,
      subject_code: 'INT201',
    },
  ];

  // Enroll ALL students in each class section
  const enrollStudentIds = allStudentIds;

  let sectionCount = 0;
  let sessionCount = 0;
  let recordCount = 0;

  for (const cs of classSectionsData) {
    const subjectId = subjectMap.get(cs.subject_code)!;
    const teacher = teachers.find((t) => t.full_name === cs.teacher_name)!;
    const section = await prisma.classSection.create({
      data: {
        class_code: cs.class_code,
        teacher_id: teacher.teacher_id,
        teacher_name: cs.teacher_name,
        day_of_week: cs.day_of_week,
        start_time: cs.start_time,
        end_time: cs.end_time,
        room: cs.room,
        semester: cs.semester,
        status: cs.status,
        subject_id: subjectId,
      },
    });
    sectionCount++;

    // Enroll students
    const enrollments: { enrollment_id: number }[] = [];
    for (const studentId of enrollStudentIds) {
      const enroll = await prisma.classEnrollment.create({
        data: { section_id: section.section_id, student_id: studentId },
        select: { enrollment_id: true },
      });
      enrollments.push(enroll);
    }

    // Session dates per section matching day_of_week (2026)
    const sectionDates: Record<string, Date[]> = {
      'L01': [new Date('2026-02-09'), new Date('2026-03-09'), new Date('2026-04-06')], // Thứ 2 (Mon)
      'L02': [new Date('2026-02-11'), new Date('2026-03-11'), new Date('2026-04-08')], // Thứ 4 (Wed)
      'L05': [new Date('2026-02-06'), new Date('2026-03-06'), new Date('2026-04-03')], // Thứ 6 (Fri)
      'L08': [new Date('2026-02-10'), new Date('2026-03-10'), new Date('2026-04-07')], // Thứ 3 (Tue)
    };
    const baseDates = sectionDates[cs.class_code] ?? [
      new Date('2026-02-10'), new Date('2026-03-10'), new Date('2026-04-07'),
    ];

    for (let i = 0; i < baseDates.length; i++) {
      const session = await prisma.attendanceSession.create({
        data: {
          section_id: section.section_id,
          session_date: baseDates[i],
          session_no: i + 1,
        },
      });
      sessionCount++;

      // Realistic distribution: ~70% PRESENT, 15% LATE, 15% ABSENT
      // Vary by student index AND session index so each student has different days
      const statusPool: AttendanceRecordStatus[] = [
        'PRESENT','PRESENT','PRESENT','PRESENT','PRESENT',
        'PRESENT','PRESENT','LATE','ABSENT','PRESENT',
      ];
      for (let j = 0; j < enrollments.length; j++) {
        const status = statusPool[(j + i * 4) % statusPool.length];
        await prisma.attendanceRecord.create({
          data: {
            session_id:    session.session_id,
            enrollment_id: enrollments[j].enrollment_id,
            status,
            note: status === 'ABSENT' ? 'Nghỉ ốm' :
                  status === 'LATE'   ? 'Đến muộn 10 phút' : '',
          },
        });
        recordCount++;
      }
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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
