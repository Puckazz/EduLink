import { z } from 'zod';

export const profileInfoFormSchema = z.object({
  full_name: z.string().trim().max(100, 'Họ và tên tối đa 100 ký tự.'),
  email: z
    .string()
    .trim()
    .max(100, 'Email tối đa 100 ký tự.')
    .refine((value) => value === '' || z.email().safeParse(value).success, {
      message: 'Email không hợp lệ.',
    }),
  phone: z.string().trim().max(15, 'Số điện thoại tối đa 15 ký tự.'),
});

export type ProfileInfoFormValues = z.infer<typeof profileInfoFormSchema>;

export const defaultProfileInfoFormValues: ProfileInfoFormValues = {
  full_name: '',
  email: '',
  phone: '',
};
