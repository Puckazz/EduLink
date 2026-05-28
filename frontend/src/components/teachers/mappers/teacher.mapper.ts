import type {
  CreateTeacherDto,
  Teacher,
  UpdateTeacherDto,
} from '@/types/teacher';
import { formatDate } from '@/utils/format-date';
import type { TeacherFormValues } from '@/components/teachers/utils/teacher-form.schema';

const AVATAR_STYLES = [
  'bg-sky-200 text-sky-800',
  'bg-emerald-200 text-emerald-800',
  'bg-amber-200 text-amber-800',
  'bg-rose-200 text-rose-800',
  'bg-violet-200 text-violet-800',
];

export interface TeacherTableRow {
  id: string;
  displayId: string;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  avatarInitials: string;
  avatarBg: string;
  classSectionText: string;
  createdAtText: string;
  raw: Teacher;
}

function normalizeOptionalString(value: string): string | undefined {
  const normalized = value.trim();
  return normalized === '' ? undefined : normalized;
}

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

function getAvatarStyle(teacherId: number): string {
  return AVATAR_STYLES[teacherId % AVATAR_STYLES.length];
}

function formatTeacherId(teacherId: number): string {
  return `#GV${String(teacherId).padStart(5, '0')}`;
}

export function mapTeacherToTableRow(teacher: Teacher): TeacherTableRow {
  const classSectionCount = teacher.class_section_count;

  return {
    id: String(teacher.teacher_id),
    displayId: formatTeacherId(teacher.teacher_id),
    fullName: teacher.full_name,
    username: teacher.username,
    email: teacher.email ?? '-',
    phone: teacher.phone ?? '-',
    avatarInitials: getAvatarInitials(teacher.full_name),
    avatarBg: getAvatarStyle(teacher.teacher_id),
    classSectionText:
      classSectionCount > 0
        ? `${classSectionCount} lớp học phần`
        : 'Chưa phụ trách lớp',
    createdAtText: formatDate(teacher.created_at),
    raw: teacher,
  };
}

export function mapTeacherFormToCreateDto(
  values: TeacherFormValues,
): CreateTeacherDto {
  return {
    username: values.username.trim(),
    password: values.password.trim(),
    full_name: values.full_name.trim(),
    email: normalizeOptionalString(values.email),
    phone: normalizeOptionalString(values.phone),
  };
}

export function mapTeacherFormToUpdateDto(
  values: TeacherFormValues,
): UpdateTeacherDto {
  return {
    username: values.username.trim(),
    password: normalizeOptionalString(values.password),
    full_name: values.full_name.trim(),
    email: normalizeOptionalString(values.email),
    phone: normalizeOptionalString(values.phone),
  };
}
