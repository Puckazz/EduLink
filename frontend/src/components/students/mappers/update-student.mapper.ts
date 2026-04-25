import type { UpdateStudentDto, Student } from '@/types/student';
import type { UpdateStudentFormValues } from '@/components/students/utils/update-student-form.schema';

function normalizeOptionalString(value: string | null | undefined): string | undefined {
  if (value === null || value === undefined) return undefined;
  const normalized = value.trim();
  return normalized === '' ? undefined : normalized;
}

export function mapUpdateStudentFormToDto(
  values: UpdateStudentFormValues,
): UpdateStudentDto {
  const studyYear = normalizeOptionalString(values.study_year);
  const majorId =
    values.major_id === 'none' ? undefined : Number(values.major_id);

  return {
    student_code: values.student_code.trim(),
    full_name: values.full_name.trim(),
    email: normalizeOptionalString(values.email),
    status: values.status,
    date_of_birth: normalizeOptionalString(values.date_of_birth),
    class: normalizeOptionalString(values.class),
    study_year: studyYear ? Number(studyYear) : undefined,
    cohort: normalizeOptionalString(values.cohort),
    major_id: majorId,
  };
}

export function mapStudentToUpdateForm(student: Student): UpdateStudentFormValues {
  let status: 'DANG_HOC' | 'BAO_LUU' | 'DINH_CHI' = 'DANG_HOC';
  if (student.status === 'Đang học') status = 'DANG_HOC';
  if (student.status === 'Bảo lưu') status = 'BAO_LUU';
  if (student.status === 'Đình chỉ') status = 'DINH_CHI';

  return {
    student_code: student.student_code || '',
    full_name: student.full_name || '',
    email: student.email || '',
    status,
    date_of_birth: student.date_of_birth ? student.date_of_birth.split('T')[0] : '',
    class: student.class || '',
    study_year: student.study_year ? String(student.study_year) : '',
    cohort: student.cohort || '',
    major_id: student.major_id ? String(student.major_id) : 'none',
  };
}
