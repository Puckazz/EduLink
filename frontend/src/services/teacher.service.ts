import apiClient from '@/lib/axios';
import type {
  CreateTeacherDto,
  Teacher,
  TeacherListQuery,
  TeacherListResponse,
  SetTeacherLockDto,
  UpdateTeacherDto,
} from '@/types/teacher';

export const TeacherService = {
  async getAll(query?: TeacherListQuery): Promise<TeacherListResponse> {
    const res = await apiClient.get<TeacherListResponse>('/teachers', {
      params: query,
    });
    return res.data;
  },

  async getById(id: number): Promise<Teacher> {
    const res = await apiClient.get<Teacher>(`/teachers/${id}`);
    return res.data;
  },

  async create(data: CreateTeacherDto): Promise<Teacher> {
    const res = await apiClient.post<Teacher>('/teachers', data);
    return res.data;
  },

  async update(id: number, data: UpdateTeacherDto): Promise<Teacher> {
    const res = await apiClient.patch<Teacher>(`/teachers/${id}`, data);
    return res.data;
  },

  async setLockStatus(id: number, data: SetTeacherLockDto): Promise<Teacher> {
    const res = await apiClient.patch<Teacher>(`/teachers/${id}/lock`, data);
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/teachers/${id}`);
  },
};
