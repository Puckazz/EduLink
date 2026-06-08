import { z } from 'zod';

export const notificationRecipients = ['all', 'parents', 'teachers'] as const;

export const notificationFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập tiêu đề thông báo.')
    .max(150, 'Tiêu đề tối đa 150 ký tự.'),
  recipient: z.enum(notificationRecipients, {
    message: 'Vui lòng chọn đối tượng nhận.',
  }),
  body: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập nội dung tin nhắn.')
    .max(500, 'Nội dung tối đa 500 ký tự.'),
  isUrgent: z.boolean(),
});

export type NotificationFormValues = z.infer<typeof notificationFormSchema>;
export type NotificationRecipient = NotificationFormValues['recipient'];

export const defaultNotificationFormValues: NotificationFormValues = {
  title: '',
  recipient: 'all',
  body: '',
  isUrgent: false,
};
