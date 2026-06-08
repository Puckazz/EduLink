import { z } from 'zod';

function isValidCredit(value: string): boolean {
  if (value.trim() === '') return true;
  const credit = Number(value);
  return Number.isInteger(credit) && credit >= 1 && credit <= 10;
}

export const subjectFormSchema = z.object({
  subject_code: z
    .string()
    .trim()
    .min(1, 'Mã môn học không được để trống.')
    .max(20, 'Mã môn học tối đa 20 ký tự.'),
  subject_name: z
    .string()
    .trim()
    .min(1, 'Tên môn học không được để trống.')
    .max(100, 'Tên môn học tối đa 100 ký tự.'),
  credit: z.string().trim().refine(isValidCredit, {
    message: 'Số tín chỉ phải là số nguyên từ 1 đến 10.',
  }),
  major_id: z.string().trim(),
});

export type SubjectFormValues = z.infer<typeof subjectFormSchema>;

export const defaultSubjectFormValues: SubjectFormValues = {
  subject_code: '',
  subject_name: '',
  credit: '',
  major_id: '',
};
