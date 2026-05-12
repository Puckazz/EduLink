import apiClient from '@/lib/axios';
import type { AdminDashboardStats, ParentDashboardData } from '@/types/dashboard';

export const DashboardService = {
  async getAdminStats(): Promise<AdminDashboardStats> {
    const res = await apiClient.get<AdminDashboardStats>('/dashboard/admin');
    return res.data;
  },

  async getParentDashboard(): Promise<ParentDashboardData> {
    const res = await apiClient.get<ParentDashboardData>('/dashboard/me');
    return res.data;
  },
};
