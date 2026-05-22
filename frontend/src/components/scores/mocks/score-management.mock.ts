import type { ScorePublishStatus } from '@/types/score';
import type { Subject } from '@/types/subject';

export interface ScorebookStudentMock {
  student_id: number;
  student_code: string;
  full_name: string;
  class_name: string;
  major_name: string;
}

export const MOCK_SUBJECTS: Subject[] = [
  {
    subject_id: 1,
    subject_code: 'MATH101',
    subject_name: 'Giải tích 1',
    credit: 3,
    _count: { scores: 0 },
  },
  {
    subject_id: 2,
    subject_code: 'CS102',
    subject_name: 'Nhập môn lập trình',
    credit: 4,
    _count: { scores: 0 },
  },
  {
    subject_id: 3,
    subject_code: 'ENG103',
    subject_name: 'Tiếng Anh học thuật',
    credit: 2,
    _count: { scores: 0 },
  },
];

export const MOCK_STUDENTS: ScorebookStudentMock[] = [
  {
    student_id: 1,
    student_code: 'HS2024001',
    full_name: 'Nguyễn Văn B',
    class_name: '10A1',
    major_name: 'Công nghệ thông tin',
  },
  {
    student_id: 2,
    student_code: 'HS2024002',
    full_name: 'Trần Minh Khôi',
    class_name: '10A1',
    major_name: 'Công nghệ thông tin',
  },
  {
    student_id: 3,
    student_code: 'HS2024003',
    full_name: 'Trần Thị Mai',
    class_name: '11A2',
    major_name: 'Kế toán doanh nghiệp',
  },
  {
    student_id: 4,
    student_code: 'HS2024004',
    full_name: 'Lê Hoàng Anh',
    class_name: '10A2',
    major_name: 'Công nghệ thông tin',
  },
  {
    student_id: 5,
    student_code: 'HS2024005',
    full_name: 'Phạm Đức Huy',
    class_name: '11A1',
    major_name: 'Ngôn ngữ Anh',
  },
  {
    student_id: 6,
    student_code: 'HS2024006',
    full_name: 'Phạm Thị Ngọc',
    class_name: '12A1',
    major_name: 'Ngôn ngữ Anh',
  },
  {
    student_id: 7,
    student_code: 'HS2024007',
    full_name: 'Võ Minh Đức',
    class_name: '10A3',
    major_name: 'Điện tử viễn thông',
  },
  {
    student_id: 8,
    student_code: 'HS2024008',
    full_name: 'Đặng Quốc Bảo',
    class_name: '11A3',
    major_name: 'Kế toán doanh nghiệp',
  },
];

interface ScoreSeed {
  assignment: number | null;
  midterm: number | null;
  final: number | null;
  note: string;
  publish_status: ScorePublishStatus;
}

export const MOCK_SCORE_SEED_BY_STUDENT_ID: Record<number, ScoreSeed> = {
  1: {
    assignment: 8.5,
    midterm: 7.5,
    final: 8.2,
    note: 'Ổn định',
    publish_status: 'DRAFT',
  },
  2: {
    assignment: 9.2,
    midterm: 8.8,
    final: null,
    note: 'Chờ thi cuối kỳ',
    publish_status: 'DRAFT',
  },
  3: {
    assignment: 7.3,
    midterm: 6.8,
    final: 7.1,
    note: '',
    publish_status: 'PUBLISHED',
  },
  4: {
    assignment: 8.1,
    midterm: 8.4,
    final: 8.0,
    note: '',
    publish_status: 'PUBLISHED',
  },
};
