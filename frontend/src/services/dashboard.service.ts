import apiClient from '@/lib/axios';
import type { AdminDashboardStats, ParentDashboardData } from '@/types/dashboard';

export const DashboardService = {
  // ── Admin ────────────────────────────────────────────────────────────────
  async getAdminStats(): Promise<AdminDashboardStats> {
    const res = await apiClient.get<AdminDashboardStats>('/dashboard/admin');
    return res.data;
  },

  // ── Parent ───────────────────────────────────────────────────────────────
  async getParentDashboard(): Promise<ParentDashboardData> {
    const res = await apiClient.get<ParentDashboardData>('/dashboard/me');
    return res.data;
  },
};
