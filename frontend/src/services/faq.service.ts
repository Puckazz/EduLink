import apiClient from '@/lib/axios';
import type { Faq, CreateFaqDto, UpdateFaqDto } from '@/types/faq';

export const FaqService = {
  async getPublic(): Promise<Faq[]> {
    const res = await apiClient.get<Faq[]>('/faq');
    return res.data;
  },

  async getAll(): Promise<Faq[]> {
    const res = await apiClient.get<Faq[]>('/faq/admin');
    return res.data;
  },

  async create(dto: CreateFaqDto): Promise<Faq> {
    const res = await apiClient.post<Faq>('/faq', dto);
    return res.data;
  },

  async update(id: number, dto: UpdateFaqDto): Promise<Faq> {
    const res = await apiClient.patch<Faq>(`/faq/${id}`, dto);
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/faq/${id}`);
  },
};
