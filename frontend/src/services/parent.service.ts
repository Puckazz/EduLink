import apiClient from '@/lib/axios';
import type {
  Parent,
  ParentDetail,
  ParentListQuery,
  ParentListResponse,
  CreateParentDto,
  UpdateParentDto,
} from '@/types/parent';

export const ParentService = {
  // ─── Admin: Parent CRUD ──────────────────────────────────────────────────

  async getAll(query?: ParentListQuery): Promise<ParentListResponse> {
    const res = await apiClient.get<ParentListResponse>('/parents', {
      params: query,
    });
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
    const res = await apiClient.patch<Parent>(`/parents/${id}`, data);
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/parents/${id}`);
  },
};
