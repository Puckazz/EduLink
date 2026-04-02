import apiClient from '@/lib/axios';
import type { Major } from '@/types/major';

export const MajorService = {
  async getAll(): Promise<Major[]> {
    const res = await apiClient.get<Major[]>('/major');
    return res.data;
  },

  async getById(id: number): Promise<Major> {
    const res = await apiClient.get<Major>(`/major/${id}`);
    return res.data;
  },
};
