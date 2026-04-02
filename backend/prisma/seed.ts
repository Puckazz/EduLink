import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const majorsData = [
  { major_code: 'CNTT', major_name: 'Cong nghe thong tin' },
  { major_code: 'QTKD', major_name: 'Quan tri kinh doanh' },
  { major_code: 'KTDN', major_name: 'Ke toan doanh nghiep' },
  { major_code: 'NNA', major_name: 'Ngon ngu Anh' },
  { major_code: 'DTVT', major_name: 'Dien tu vien thong' },
];

function resolveMajorCode(className?: string): string {
  if (!className) {
    return 'QTKD';
  }

  if (className.startsWith('10')) {
    return 'CNTT';
  }

  if (className.startsWith('11')) {
    return 'KTDN';
  }

  if (className.startsWith('12')) {
    return 'NNA';
  }

  return 'QTKD';
}

function resolveStudyYear(className?: string): number {
  if (!className) {
    return 1;
  }

  if (className.startsWith('10')) {
    return 1;
  }

  if (className.startsWith('11')) {
    return 2;
  }

  if (className.startsWith('12')) {
    return 3;
  }

  return 1;
}

function resolveCohort(studyYear: number): string {
  const cohortMap: Record<number, string> = {
    1: 'Khóa 2027',
    2: 'Khóa 2026',
    3: 'Khóa 2025',
    4: 'Khóa 2024',
  };

  return cohortMap[studyYear] ?? 'Khóa 2027';
}

function resolveStudentEmail(fullName: string, studentCode: string): string {
  const normalizedName = fullName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '.');

  return `${normalizedName}.${studentCode.toLowerCase()}@edulink.vn`;
}

// ── Data ────────────────────────────────────────────────────────────────
const parentsData = [
  {
    full_name: 'Nguyễn Văn C',
    phone: '0901234567',
    email: 'nguyenvanc@gmail.com',
    students: [
      {
        student_code: 'HS2024001',
        full_name: 'Nguyễn Văn B',
        class: '10A1',
        date_of_birth: new Date('2008-03-15'),
      },
    ],
  },
  {
    full_name: 'Trần Thị Hương',
    phone: '0912345678',
    email: 'tranthihuong@gmail.com',
    students: [
      {
        student_code: 'HS2024002',
        full_name: 'Trần Minh Khôi',
        class: '10A1',
        date_of_birth: new Date('2008-07-22'),
      },
      {
        student_code: 'HS2024003',
        full_name: 'Trần Thị Mai',
        class: '11A2',
        date_of_birth: new Date('2007-11-05'),
      },
    ],
  },
  {
    full_name: 'Lê Hoàng Nam',
    phone: '0923456789',
    email: 'lehoangnam@gmail.com',
    students: [
      {
        student_code: 'HS2024004',
        full_name: 'Lê Hoàng Anh',
        class: '10A2',
        date_of_birth: new Date('2008-01-30'),
      },
    ],
  },
  {
    full_name: 'Phạm Thị Lan',
    phone: '0934567890',
    email: 'phamthilan@gmail.com',
    students: [
      {
        student_code: 'HS2024005',
        full_name: 'Phạm Đức Huy',
        class: '11A1',
        date_of_birth: new Date('2007-05-18'),
      },
      {
        student_code: 'HS2024006',
        full_name: 'Phạm Thị Ngọc',
        class: '12A1',
        date_of_birth: new Date('2006-09-12'),
      },
    ],
  },
  {
    full_name: 'Võ Minh Tuấn',
    phone: '0945678901',
    email: 'vominhtuan@gmail.com',
    students: [
      {
        student_code: 'HS2024007',
        full_name: 'Võ Minh Đức',
        class: '10A3',
        date_of_birth: new Date('2008-12-25'),
      },
    ],
  },
  {
    full_name: 'Đặng Thị Thanh',
    phone: '0956789012',
    email: 'dangthithanh@gmail.com',
    students: [
      {
        student_code: 'HS2024008',
        full_name: 'Đặng Quốc Bảo',
        class: '11A3',
        date_of_birth: new Date('2007-02-14'),
      },
    ],
  },
  {
    full_name: 'Bùi Văn Hải',
    phone: '0967890123',
    email: 'buivanhai@gmail.com',
    students: [
      {
        student_code: 'HS2024009',
        full_name: 'Bùi Thị Hà',
        class: '12A2',
        date_of_birth: new Date('2006-06-08'),
      },
      {
        student_code: 'HS2024010',
        full_name: 'Bùi Văn Hùng',
        class: '10A1',
        date_of_birth: new Date('2008-10-20'),
      },
    ],
  },
  {
    full_name: 'Hoàng Thị Yến',
    phone: '0978901234',
    email: 'hoangthiyen@gmail.com',
    students: [
      {
        student_code: 'HS2024011',
        full_name: 'Hoàng Gia Bảo',
        class: '11A2',
        date_of_birth: new Date('2007-08-03'),
      },
    ],
  },
  {
    full_name: 'Ngô Đình Khoa',
    phone: '0989012345',
    email: 'ngodinhkhoa@gmail.com',
    students: [
      {
        student_code: 'HS2024012',
        full_name: 'Ngô Đình Long',
        class: '10A2',
        date_of_birth: new Date('2008-04-17'),
      },
      {
        student_code: 'HS2024013',
        full_name: 'Ngô Thị Trang',
        class: '12A3',
        date_of_birth: new Date('2006-12-01'),
      },
    ],
  },
  {
    full_name: 'Dương Văn Phúc',
    phone: '0990123456',
    email: 'duongvanphuc@gmail.com',
    students: [
      {
        student_code: 'HS2024014',
        full_name: 'Dương Minh Phú',
        class: '11A1',
        date_of_birth: new Date('2007-09-28'),
      },
      {
        student_code: 'HS2024015',
        full_name: 'Dương Thị Linh',
        class: '10A3',
        date_of_birth: new Date('2008-02-10'),
      },
    ],
  },
  {
    full_name: 'Trịnh Thị Hoa',
    phone: '0901122334',
    email: 'trinhthihoa@gmail.com',
    students: [
      {
        student_code: 'HS2024016',
        full_name: 'Trịnh Quốc Huy',
        class: '10A1',
        date_of_birth: new Date('2008-05-11'),
      },
    ],
  },
  {
    full_name: 'Lý Văn Toàn',
    phone: '0912233445',
    email: 'lyvantoan@gmail.com',
    students: [
      {
        student_code: 'HS2024017',
        full_name: 'Lý Thị Bích',
        class: '11A3',
        date_of_birth: new Date('2007-03-19'),
      },
      {
        student_code: 'HS2024018',
        full_name: 'Lý Văn Kiên',
        class: '12A2',
        date_of_birth: new Date('2006-08-07'),
      },
    ],
  },
  {
    full_name: 'Phan Thị Mỹ Linh',
    phone: '0923344556',
    email: 'phantmylinh@gmail.com',
    students: [
      {
        student_code: 'HS2024019',
        full_name: 'Phan Gia Khang',
        class: '10A2',
        date_of_birth: new Date('2008-11-23'),
      },
    ],
  },
  {
    full_name: 'Châu Văn Bình',
    phone: '0934455667',
    email: 'chauvanbinh@gmail.com',
    students: [
      {
        student_code: 'HS2024020',
        full_name: 'Châu Thị Diễm',
        class: '12A1',
        date_of_birth: new Date('2006-04-30'),
      },
      {
        student_code: 'HS2024021',
        full_name: 'Châu Minh Luân',
        class: '10A3',
        date_of_birth: new Date('2008-09-15'),
      },
    ],
  },
  {
    full_name: 'Vũ Thị Ngọc Ánh',
    phone: '0945566778',
    email: 'vungocnanh@gmail.com',
    students: [
      {
        student_code: 'HS2024022',
        full_name: 'Vũ Nhật Minh',
        class: '11A2',
        date_of_birth: new Date('2007-07-04'),
      },
    ],
  },
  {
    full_name: 'Đinh Văn Thắng',
    phone: '0956677889',
    email: 'dinhvanthang@gmail.com',
    students: [
      {
        student_code: 'HS2024023',
        full_name: 'Đinh Thị Thu',
        class: '10A1',
        date_of_birth: new Date('2008-01-08'),
      },
      {
        student_code: 'HS2024024',
        full_name: 'Đinh Văn Duy',
        class: '11A1',
        date_of_birth: new Date('2007-06-21'),
      },
      {
        student_code: 'HS2024025',
        full_name: 'Đinh Ngọc Hân',
        class: '12A3',
        date_of_birth: new Date('2006-02-17'),
      },
    ],
  },
  {
    full_name: 'Lâm Thị Bạch Tuyết',
    phone: '0967788990',
    email: 'lamtuyet@gmail.com',
    students: [
      {
        student_code: 'HS2024026',
        full_name: 'Lâm Trọng Nghĩa',
        class: '10A2',
        date_of_birth: new Date('2008-07-29'),
      },
    ],
  },
  {
    full_name: 'Cao Văn Trường',
    phone: '0978899001',
    email: 'caovantruong@gmail.com',
    students: [
      {
        student_code: 'HS2024027',
        full_name: 'Cao Thị Phương',
        class: '12A2',
        date_of_birth: new Date('2006-10-13'),
      },
      {
        student_code: 'HS2024028',
        full_name: 'Cao Minh Tâm',
        class: '11A3',
        date_of_birth: new Date('2007-12-25'),
      },
    ],
  },
  {
    full_name: 'Hồ Thị Kim Oanh',
    phone: '0989900112',
    email: 'hokimoanh@gmail.com',
    students: [
      {
        student_code: 'HS2024029',
        full_name: 'Hồ Bảo Châu',
        class: '10A3',
        date_of_birth: new Date('2008-03-06'),
      },
    ],
  },
  {
    full_name: 'Tô Văn Hậu',
    phone: '0900112233',
    email: 'tovanhau@gmail.com',
    students: [
      {
        student_code: 'HS2024030',
        full_name: 'Tô Ngọc Tú',
        class: '11A1',
        date_of_birth: new Date('2007-04-14'),
      },
      {
        student_code: 'HS2024031',
        full_name: 'Tô Gia Hân',
        class: '10A1',
        date_of_birth: new Date('2008-08-18'),
      },
    ],
  },
];

// ── Seed function ───────────────────────────────────────────────────────
async function main() {
  // 1. Tạo Admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: adminPassword,
      full_name: 'Quản trị viên',
      email: 'admin@edulink.vn',
    },
  });
  console.log('✅ Admin created:', admin.username);

  // 2. Tạo majors
  const majorCodeToId = new Map<string, number>();

  for (const major of majorsData) {
    const createdMajor = await prisma.major.upsert({
      where: { major_code: major.major_code },
      update: {
        major_name: major.major_name,
      },
      create: major,
    });

    majorCodeToId.set(createdMajor.major_code, createdMajor.major_id);
  }

  // 3. Tạo Parents + Students
  for (const p of parentsData) {
    const parent = await prisma.parent.upsert({
      where: { phone: p.phone },
      update: {},
      create: {
        full_name: p.full_name,
        phone: p.phone,
        email: p.email,
        password: null,
        is_active: false,
      },
    });

    for (const s of p.students) {
      const majorCode = resolveMajorCode(s.class);
      const studyYear = resolveStudyYear(s.class);
      const cohort = resolveCohort(studyYear);
      const email = resolveStudentEmail(s.full_name, s.student_code);

      await prisma.student.upsert({
        where: { student_code: s.student_code },
        update: {
          major_id: majorCodeToId.get(majorCode),
          email,
          study_year: studyYear,
          cohort,
        },
        create: {
          student_code: s.student_code,
          full_name: s.full_name,
          email,
          class: s.class,
          study_year: studyYear,
          cohort,
          date_of_birth: s.date_of_birth,
          parent_id: parent.parent_id,
          major_id: majorCodeToId.get(majorCode),
        },
      });
    }

    const codes = p.students.map((s) => s.student_code).join(', ');
    console.log(`✅ Parent ${p.phone} (${p.full_name}) → Students: ${codes}`);
  }

  // 4. Tổng kết
  const majorCount = await prisma.major.count();
  const parentCount = await prisma.parent.count();
  const studentCount = await prisma.student.count();
  console.log(
    `\n🎉 Seed completed! ${majorCount} majors, ${parentCount} parents, ${studentCount} students`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
