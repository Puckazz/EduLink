import { z } from 'zod';

export const parentFormSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập họ và tên.')
    .max(100, 'Họ và tên tối đa 100 ký tự.'),
  phone: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập số điện thoại.')
    .max(15, 'Số điện thoại tối đa 15 ký tự.'),
  email: z
    .string()
    .trim()
    .max(100, 'Email tối đa 100 ký tự.')
    .refine((value) => value === '' || z.email().safeParse(value).success, {
      message: 'Email không hợp lệ.',
    }),
  username: z.string().trim().max(50, 'Tên đăng nhập tối đa 50 ký tự.'),
  password: z
    .string()
    .trim()
    .refine((value) => value === '' || value.length >= 6, {
      message: 'Mật khẩu phải có ít nhất 6 ký tự.',
    })
    .refine((value) => value.length <= 100, {
      message: 'Mật khẩu tối đa 100 ký tự.',
    }),
  relationship: z.enum(['CHA', 'ME', 'NGUOI_GIAM_HO']),
});

export type ParentFormValues = z.infer<typeof parentFormSchema>;

export const defaultParentFormValues: ParentFormValues = {
  full_name: '',
  phone: '',
  email: '',
  username: '',
  password: '',
  relationship: 'NGUOI_GIAM_HO',
};
