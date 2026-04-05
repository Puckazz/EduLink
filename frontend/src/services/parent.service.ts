import apiClient from '@/lib/axios';
import type {
  Parent,
  ParentDetail,
  ParentListResponse,
  CreateParentDto,
  UpdateParentDto,
} from '@/types/parent';

export const ParentService = {
  // ─── Admin: Parent CRUD ──────────────────────────────────────────────────

  async getAll(): Promise<ParentListResponse> {
    const res = await apiClient.get<ParentListResponse>('/parents');
    return res.data;
  },

  async getById(id: number): Promise<ParentDetail> {
    const res = await apiClient.get<ParentDetail>(`/parents/${id}`);
    return res.data;
  },

  async create(data: CreateParentDto): Promise<Parent> {
    const res = await apiClient.post<Parent>('/parents', data);
    return res.data;
  },

  async update(id: number, data: UpdateParentDto): Promise<Parent> {
    const res = await apiClient.put<Parent>(`/parents/${id}`, data);
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/parents/${id}`);
  },
};
