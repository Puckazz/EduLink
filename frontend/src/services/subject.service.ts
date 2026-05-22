import apiClient from '@/lib/axios';
import type { Subject, SubjectListResponse } from '@/types/subject';

export const SubjectService = {
  async getAll(): Promise<Subject[]> {
    const res = await apiClient.get<SubjectListResponse>('/subjects');
    return res.data.data;
  },

  async getById(id: number): Promise<Subject> {
    const res = await apiClient.get<Subject>(`/subjects/${id}`);
    return res.data;
  },
};
