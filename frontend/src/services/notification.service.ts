import apiClient from "@/lib/axios";
import type {
  Notification,
  CreateNotificationDto,
} from "@/types/notification";

export interface UpdateNotificationDto {
  title?: string;
  content?: string;
  target_role?: string | null;
}

export const NotificationService = {
  async getAll(): Promise<Notification[]> {
    const res = await apiClient.get<Notification[]>("/notifications");
    return res.data;
  },

  async getInbox(): Promise<Notification[]> {
    const res = await apiClient.get<Notification[]>("/notifications/inbox");
    return res.data;
  },

  async getById(id: number): Promise<Notification> {
    const res = await apiClient.get<Notification>(`/notifications/${id}`);
    return res.data;
  },

  async create(data: CreateNotificationDto): Promise<Notification> {
    const res = await apiClient.post<Notification>("/notifications", data);
    return res.data;
  },

  async update(id: number, data: UpdateNotificationDto): Promise<Notification> {
    const res = await apiClient.patch<Notification>(`/notifications/${id}`, data);
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/notifications/${id}`);
  },

  async getMyNotifications(): Promise<Notification[]> {
    const res = await apiClient.get<Notification[]>("/me/notifications");
    return res.data;
  },
};
