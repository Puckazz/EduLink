import { z } from 'zod';

export const changePasswordFormSchema = z
  .object({
    oldPassword: z.string().trim().min(1, 'Vui lòng nhập mật khẩu hiện tại.'),
    newPassword: z
      .string()
      .min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự.')
      .max(100, 'Mật khẩu mới tối đa 100 ký tự.'),
    confirmPassword: z.string(),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: 'Xác nhận mật khẩu mới chưa khớp.',
    path: ['confirmPassword'],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordFormSchema>;

export const defaultChangePasswordFormValues: ChangePasswordFormValues = {
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
};
