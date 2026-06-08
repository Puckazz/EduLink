import apiClient from "@/lib/axios";
import type {
  CreateNotificationDto,
  Notification,
  UpdateNotificationDto,
} from "@/types/notification";

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

  async getMyNotifications(limit?: number): Promise<Notification[]> {
    const res = await apiClient.get<Notification[]>("/me/notifications", {
      params: limit ? { limit } : undefined,
    });
    return res.data;
  },
};
