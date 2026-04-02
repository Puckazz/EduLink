import apiClient from '@/lib/axios';
import type {
  Student,
  StudentListQuery,
  StudentListResponse,
  CreateStudentDto,
  UpdateStudentDto,
} from '@/types/student';

export const StudentService = {
  async getAll(query?: StudentListQuery): Promise<StudentListResponse> {
    const res = await apiClient.get<StudentListResponse>('/student', {
      params: query,
    });
    return res.data;
  },

  async getById(id: number): Promise<Student> {
    const res = await apiClient.get<Student>(`/student/${id}`);
    return res.data;
  },

  async create(data: CreateStudentDto): Promise<Student> {
    const res = await apiClient.post<Student>('/student', data);
    return res.data;
  },

  async update(id: number, data: UpdateStudentDto): Promise<Student> {
    const res = await apiClient.patch<Student>(`/student/${id}`, data);
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/student/${id}`);
  },
};
