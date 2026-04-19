import apiClient from "@/lib/axios";
import type {
  Notification,
  CreateNotificationDto,
} from "@/types/notification";

export interface UpdateNotificationDto {
  title?: string;
  content?: string;
}

export const NotificationService = {
  // Admin: Get all notifications
  async getAll(): Promise<Notification[]> {
    const res = await apiClient.get<Notification[]>("/notifications");
    return res.data;
  },

  // Admin/Parent: Get notification details
  async getById(id: number): Promise<Notification> {
    const res = await apiClient.get<Notification>(`/notifications/${id}`);
    return res.data;
  },

  // Admin: Create notification
  async create(data: CreateNotificationDto): Promise<Notification> {
    const res = await apiClient.post<Notification>("/notifications", data);
    return res.data;
  },

  // Admin: Update notification
  async update(id: number, data: UpdateNotificationDto): Promise<Notification> {
    const res = await apiClient.put<Notification>(`/notifications/${id}`, data);
    return res.data;
  },

  // Admin: Delete notification
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/notifications/${id}`);
  },

  // Parent: Get my notifications
  async getMyNotifications(): Promise<Notification[]> {
    const res = await apiClient.get<Notification[]>("/me/notifications");
    return res.data;
  },
};
