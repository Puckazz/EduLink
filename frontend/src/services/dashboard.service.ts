import apiClient from '@/lib/axios';
import type {
  AdminDashboardStats,
  GpaByMajorResponse,
  ParentDashboardData,
  TeacherDashboardData,
} from '@/types/dashboard';

export const DashboardService = {
  async getAdminStats(): Promise<AdminDashboardStats> {
    const res = await apiClient.get<AdminDashboardStats>('/dashboard/admin');
    return res.data;
  },

  async getGpaByMajor(termId?: number): Promise<GpaByMajorResponse> {
    const params = termId ? { termId } : {};
    const res = await apiClient.get<GpaByMajorResponse>('/dashboard/admin/gpa', { params });
    return res.data;
  },

  async getParentDashboard(): Promise<ParentDashboardData> {
    const res = await apiClient.get<ParentDashboardData>('/dashboard/me');
    return res.data;
  },

  async getTeacherStats(): Promise<TeacherDashboardData> {
    const res = await apiClient.get<TeacherDashboardData>('/dashboard/teacher');
    return res.data;
  },
};
