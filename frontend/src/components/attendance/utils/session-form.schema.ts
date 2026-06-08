import { z } from 'zod';

export const sessionFormSchema = z.object({
  session_date: z.string().trim().min(1, 'Vui lòng chọn ngày buổi học.'),
  session_no: z
    .number()
    .int('Số buổi phải là số nguyên.')
    .min(1, 'Số buổi phải lớn hơn 0.'),
  note: z.string().trim(),
});

export type SessionFormValues = z.infer<typeof sessionFormSchema>;

export const defaultSessionFormValues: SessionFormValues = {
  session_date: '',
  session_no: 1,
  note: '',
};
