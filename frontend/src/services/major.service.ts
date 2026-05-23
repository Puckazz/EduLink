import apiClient from '@/lib/axios';
import type { Major, CreateMajorDto, UpdateMajorDto } from '@/types/major';

export const MajorService = {
  async getAll(): Promise<Major[]> {
    const res = await apiClient.get<Major[]>('/major');
    return res.data;
  },

  async getById(id: number): Promise<Major> {
    const res = await apiClient.get<Major>(`/major/${id}`);
    return res.data;
  },

  async create(dto: CreateMajorDto): Promise<Major> {
    const res = await apiClient.post<Major>('/major', dto);
    return res.data;
  },

  async update(id: number, dto: UpdateMajorDto): Promise<Major> {
    const res = await apiClient.patch<Major>(`/major/${id}`, dto);
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/major/${id}`);
  },
};

