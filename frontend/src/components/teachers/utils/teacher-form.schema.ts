import { z } from 'zod';

export const teacherFormSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập tên đăng nhập.')
    .max(50, 'Tên đăng nhập tối đa 50 ký tự.'),
  password: z
    .string()
    .trim()
    .refine((value) => value === '' || value.length >= 6, {
      message: 'Mật khẩu phải có ít nhất 6 ký tự.',
    })
    .refine((value) => value.length <= 100, {
      message: 'Mật khẩu tối đa 100 ký tự.',
    }),
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
  phone: z.string().trim().max(15, 'Số điện thoại tối đa 15 ký tự.'),
});

export type TeacherFormValues = z.infer<typeof teacherFormSchema>;

export const defaultTeacherFormValues: TeacherFormValues = {
  username: '',
  password: '',
  full_name: '',
  email: '',
  phone: '',
};
