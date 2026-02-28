import apiClient from '@/lib/axios';
import type { Subject } from '@/types/subject';

export const SubjectService = {
  async getAll(): Promise<Subject[]> {
    const res = await apiClient.get<Subject[]>('/subjects');
    return res.data;
  },

  async getById(id: number): Promise<Subject> {
    const res = await apiClient.get<Subject>(`/subjects/${id}`);
    return res.data;
  },
};
