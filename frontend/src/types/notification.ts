import type { Admin } from "./admin";

export interface Notification {
  notification_id: number;
  title: string;
  content: string;
  created_at: string;
  admin_id: number;
  admin?: Admin;
}

export interface CreateNotificationDto {
  title: string;
  content: string;
}
