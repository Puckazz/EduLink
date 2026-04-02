import type { CreateStudentDto } from '@/types/student';
import type { CreateStudentFormValues } from '@/components/students/utils/create-student-form.schema';

function normalizeOptionalString(value: string): string | undefined {
  const normalized = value.trim();
  return normalized === '' ? undefined : normalized;
}

export function mapCreateStudentFormToDto(
  values: CreateStudentFormValues,
): CreateStudentDto {
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
