import { z } from 'zod';

function isValidStudyYear(value: string): boolean {
  if (value.trim() === '') {
    return true;
  }

  const numericValue = Number(value);

  return (
    Number.isInteger(numericValue) && numericValue >= 1 && numericValue <= 20
  );
}

export const createStudentFormSchema = z.object({
  student_code: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập mã sinh viên.')
    .max(50, 'Mã sinh viên tối đa 50 ký tự.'),
  full_name: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập họ và tên.')
    .max(100, 'Họ và tên tối đa 100 ký tự.'),
  email: z
    .string()
    .trim()
    .max(100, 'Email tối đa 100 ký tự.')
    .refine((value) => value === '' || z.email().safeParse(value).success, {
      message: 'Email không hợp lệ.',
    }),
  status: z.enum(['DANG_HOC', 'BAO_LUU', 'DINH_CHI']),
  date_of_birth: z.string().trim(),
  class: z.string().trim().max(50, 'Lớp tối đa 50 ký tự.'),
  study_year: z.string().trim().refine(isValidStudyYear, {
    message: 'Năm học phải là số nguyên từ 1 đến 20.',
  }),
  cohort: z.string().trim().max(50, 'Khóa tối đa 50 ký tự.'),
  major_id: z.string(),
});

export type CreateStudentFormValues = z.infer<typeof createStudentFormSchema>;

export const defaultCreateStudentFormValues: CreateStudentFormValues = {
  student_code: '',
  full_name: '',
  email: '',
  status: 'DANG_HOC',
  date_of_birth: '',
  class: '',
  study_year: '',
  cohort: '',
  major_id: 'none',
};
