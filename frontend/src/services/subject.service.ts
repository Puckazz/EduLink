import apiClient from '@/lib/axios';
import type { Subject, SubjectListResponse, CreateSubjectDto, UpdateSubjectDto } from '@/types/subject';

export const SubjectService = {
  async getAll(): Promise<Subject[]> {
    const res = await apiClient.get<SubjectListResponse>('/subjects?limit=1000');
    return res.data.data;
  },

  async getById(id: number): Promise<Subject> {
    const res = await apiClient.get<Subject>(`/subjects/${id}`);
    return res.data;
  },

  async getPaginated(params?: {
    search?: string;
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: string;
  }): Promise<SubjectListResponse> {
    const res = await apiClient.get<SubjectListResponse>('/subjects', { params });
    return res.data;
  },

  async create(dto: CreateSubjectDto): Promise<Subject> {
    const res = await apiClient.post<Subject>('/subjects', dto);
    return res.data;
  },

  async update(id: number, dto: UpdateSubjectDto): Promise<Subject> {
    const res = await apiClient.patch<Subject>(`/subjects/${id}`, dto);
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/subjects/${id}`);
  },
};

