import { z } from 'zod';

export const majorFormSchema = z.object({
  major_code: z
    .string()
    .trim()
    .min(1, 'Mã ngành học không được để trống.')
    .max(20, 'Mã ngành học tối đa 20 ký tự.'),
  major_name: z
    .string()
    .trim()
    .min(1, 'Tên ngành học không được để trống.')
    .max(100, 'Tên ngành học tối đa 100 ký tự.'),
});

export type MajorFormValues = z.infer<typeof majorFormSchema>;

export const defaultMajorFormValues: MajorFormValues = {
  major_code: '',
  major_name: '',
};
