import type { StudentTableStudent } from '@/components/students/StudentTable';
import type { Student } from '@/types/student';

const AVATAR_STYLES = [
  'bg-pink-200 text-pink-800',
  'bg-blue-200 text-blue-800',
  'bg-orange-200 text-orange-800',
  'bg-sky-200 text-sky-800',
  'bg-emerald-200 text-emerald-800',
];

function getAvatarInitials(fullName: string): string {
  const segments = fullName.trim().split(/\s+/).filter(Boolean);

  if (segments.length === 0) {
    return '--';
  }

  if (segments.length === 1) {
    return segments[0].slice(0, 2).toUpperCase();
  }

  return `${segments[0][0]}${segments[segments.length - 1][0]}`.toUpperCase();
}

function getAvatarStyle(studentId: number): string {
  return AVATAR_STYLES[studentId % AVATAR_STYLES.length];
}

export function mapStudentToTableStudent(
  student: Student,
): StudentTableStudent {
  const parentContact =
    student.parent?.email ?? student.parent?.phone ?? 'Chưa cập nhật';

  return {
    id: String(student.student_id),
    mssv: student.student_code,
    name: student.full_name,
    email: student.email ?? '-',
    avatarInitials: getAvatarInitials(student.full_name),
    avatarBg: getAvatarStyle(student.student_id),
    major: student.major?.major_name ?? 'Chưa cập nhật',
    year: student.study_year ? `Năm ${student.study_year}` : 'Chưa cập nhật',
    cohort: student.cohort ?? 'Chưa cập nhật',
    parentName: student.parent?.full_name ?? 'Chưa liên kết',
    parentContact,
    parentContactType: student.parent?.email ? 'email' : 'phone',
    status: student.status,
  };
}
