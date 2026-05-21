import apiClient from '@/lib/axios';
import type { Faq, CreateFaqDto, UpdateFaqDto } from '@/types/faq';

export const FaqService = {
  /** [Authenticated] Lấy danh sách FAQ đang active (dành cho phụ huynh/giáo viên xem) */
  async getPublic(): Promise<Faq[]> {
    const res = await apiClient.get<Faq[]>('/faq');
    return res.data;
  },

  /** [Admin] Lấy tất cả FAQ kể cả inactive */
  async getAll(): Promise<Faq[]> {
    const res = await apiClient.get<Faq[]>('/faq/admin');
    return res.data;
  },

  /** [Admin] Tạo FAQ mới */
  async create(dto: CreateFaqDto): Promise<Faq> {
    const res = await apiClient.post<Faq>('/faq', dto);
    return res.data;
  },

  /** [Admin] Cập nhật FAQ */
  async update(id: number, dto: UpdateFaqDto): Promise<Faq> {
    const res = await apiClient.patch<Faq>(`/faq/${id}`, dto);
    return res.data;
  },

  /** [Admin] Xóa FAQ */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/faq/${id}`);
  },
};
