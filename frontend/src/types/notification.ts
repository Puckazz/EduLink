import type { Admin } from "./admin";

export interface Notification {
  notification_id: number;
  title: string;
  content: string;
  created_at: string;
  admin_id: number;
  admin?: Admin;
  target_role?: string | null;
  target_id?: number | null;
  feedback_id?: number | null;
}

export interface CreateNotificationDto {
  title: string;
  content: string;
  target_role?: string | null;
}
