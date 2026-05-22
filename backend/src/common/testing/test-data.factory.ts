/**
 * Factory functions tạo test data nhất quán cho toàn bộ unit tests.
 */

export const createMockAdmin = (overrides: Record<string, any> = {}) => ({
  admin_id: 1,
  username: 'admin',
  password: '$2b$10$HASHEDPASSWORD1234567890123456789012345678',
  refresh_token_hash: null as string | null,
  full_name: 'Admin User',
  email: 'admin@edulink.vn',
  created_at: new Date('2024-01-01'),
  ...overrides,
});

export const createMockTeacher = (overrides: Record<string, any> = {}) => ({
  teacher_id: 10,
  username: 'teacher01',
  password: '$2b$10$HASHEDPASSWORD1234567890123456789012345678',
  refresh_token_hash: null as string | null,
  full_name: 'Nguyễn Văn A',
  email: 'teacher@edulink.vn',
  phone: '0901234567',
  created_at: new Date('2024-01-01'),
  ...overrides,
});

export const createMockParent = (overrides: Record<string, any> = {}) => ({
  parent_id: 100,
  username: null as string | null,
  password: null as string | null,
  refresh_token_hash: null as string | null,
  full_name: 'Trần Thị B',
  phone: '0987654321',
  email: 'parent@gmail.com',
  relationship: 'ME' as const,
  is_active: false,
  created_at: new Date('2024-01-01'),
  ...overrides,
});

export const createMockActiveParent = (overrides: Record<string, any> = {}) =>
  createMockParent({
    password: '$2b$10$HASHEDPASSWORD1234567890123456789012345678',
    is_active: true,
    refresh_token_hash: null,
    ...overrides,
  });

export const createMockStudent = (overrides: Record<string, any> = {}) => ({
  student_id: 1000,
  student_code: 'SV001',
  full_name: 'Lê Văn C',
  email: 'student@edulink.vn',
  status: 'DANG_HOC' as const,
  date_of_birth: new Date('2002-05-10'),
  class: '2022_CNTT',
  study_year: 2022,
  cohort: 'K22',
  created_at: new Date('2024-01-01'),
  deleted_at: null as Date | null,
  major_id: 1,
  parents: [] as any[],
  major: { major_id: 1, major_code: 'CNTT', major_name: 'Công nghệ thông tin' },
  ...overrides,
});

export const createMockOtp = (overrides: Record<string, any> = {}) => ({
  id: 1,
  phone: '0987654321',
  otp_code: '123456',
  expires_at: new Date(Date.now() + 5 * 60 * 1000),
  is_used: false,
  created_at: new Date(),
  ...overrides,
});

export const createExpiredOtp = (overrides: Record<string, any> = {}) =>
  createMockOtp({
    expires_at: new Date(Date.now() - 1000),
    ...overrides,
  });

export const createMockScore = (overrides: Record<string, any> = {}) => ({
  score_id: 1,
  semester: 'HK1-2024',
  year: 2024,
  assignment: 8.5,
  midterm: 7.0,
  final: 8.0,
  avg: 7.85,
  note: null as string | null,
  publish_status: 'DRAFT',
  created_at: new Date('2024-01-01'),
  updated_at: new Date('2024-01-01'),
  student_id: 1000,
  subject_id: 1,
  subject: {
    subject_id: 1,
    subject_code: 'CS101',
    subject_name: 'Nhập môn lập trình',
    credit: 3,
  },
  ...overrides,
});

export const createMockAttendance = (overrides: Record<string, any> = {}) => ({
  attendance_id: 1,
  semester: 'HK1-2024',
  total_sessions: 30,
  absent_sessions: 2,
  late_sessions: 1,
  created_at: new Date('2024-01-01'),
  student_id: 1000,
  student: {
    student_id: 1000,
    student_code: 'SV001',
    full_name: 'Lê Văn C',
    class: '2022_CNTT',
  },
  ...overrides,
});

export const createMockNotification = (overrides: Record<string, any> = {}) => ({
  notification_id: 1,
  title: 'Thông báo test',
  content: 'Nội dung thông báo',
  created_at: new Date('2024-01-01'),
  admin_id: 1,
  target_role: null as string | null,
  target_id: null as number | null,
  feedback_id: null as number | null,
  admin: {
    admin_id: 1,
    full_name: 'Admin User',
    email: 'admin@edulink.vn',
  },
  ...overrides,
});

export const createMockFeedback = (overrides: Record<string, any> = {}) => ({
  feedback_id: 1,
  title: 'Góp ý về lịch thi',
  category: 'HOC_TAP' as const,
  status: 'OPEN' as const,
  content: 'Tôi muốn phản hồi về lịch thi học kỳ này.',
  created_at: new Date('2024-01-01'),
  updated_at: new Date('2024-01-01'),
  reply_content: null as string | null,
  replied_at: null as Date | null,
  parent_id: 100,
  student_id: null as number | null,
  parent: { parent_id: 100, full_name: 'Trần Thị B', phone: '0987654321', email: 'parent@gmail.com' },
  student: null as any,
  messages: [] as any[],
  ...overrides,
});

export const createMockClassSection = (overrides: Record<string, any> = {}) => ({
  section_id: 1,
  class_code: 'L01',
  teacher_id: 10,
  teacher_name: 'PGS.TS. Nguyễn Văn A',
  day_of_week: 'Thứ 2',
  start_time: '7:30',
  end_time: '9:30',
  room: 'A1.202',
  semester: 'HK1-2024',
  status: 'UPCOMING' as const,
  created_at: new Date('2024-01-01'),
  subject: { subject_id: 1, subject_code: 'CS101', subject_name: 'Nhập môn lập trình' },
  _count: { enrollments: 0, sessions: 0 },
  ...overrides,
});

export const createPaginationMeta = (total: number, page = 1, limit = 10) => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
});
