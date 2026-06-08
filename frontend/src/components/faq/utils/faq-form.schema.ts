import { z } from 'zod';
import type { FeedbackCategory } from '@/types/feedback';

export const faqFormSchema = z.object({
  question: z
    .string()
    .trim()
    .min(5, 'Câu hỏi phải có ít nhất 5 ký tự.'),
  answer: z
    .string()
    .trim()
    .min(10, 'Câu trả lời phải có ít nhất 10 ký tự.'),
  category: z.custom<FeedbackCategory>((value) => typeof value === 'string', {
    message: 'Vui lòng chọn chủ đề.',
  }),
  sort_order: z
    .number()
    .int('Thứ tự hiển thị phải là số nguyên.')
    .min(0, 'Thứ tự hiển thị không được nhỏ hơn 0.'),
  is_active: z.boolean(),
});

export type FaqFormValues = z.infer<typeof faqFormSchema>;

export const defaultFaqFormValues: FaqFormValues = {
  question: '',
  answer: '',
  category: 'KHAC',
  sort_order: 0,
  is_active: true,
};
