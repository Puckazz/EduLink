import apiClient from '@/lib/axios';
import type {
  Student,
  StudentListQuery,
  StudentListResponse,
  CreateStudentDto,
  UpdateStudentDto,
  AssignParentDto,
  StudentParentsResponse,
} from '@/types/student';

export const StudentService = {
  // ─── Admin: Student CRUD ─────────────────────────────────────────────────

  async getAll(query?: StudentListQuery): Promise<StudentListResponse> {
    const res = await apiClient.get<StudentListResponse>('/students', {
      params: query,
    });
    return res.data;
  },

  async getById(id: number): Promise<Student> {
    const res = await apiClient.get<Student>(`/students/${id}`);
    return res.data;
  },

  async create(data: CreateStudentDto): Promise<Student> {
    const res = await apiClient.post<Student>('/students', data);
    return res.data;
  },

  async update(id: number, data: UpdateStudentDto): Promise<Student> {
    const res = await apiClient.put<Student>(`/students/${id}`, data);
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/students/${id}`);
  },

  // ─── Parent: My students ─────────────────────────────────────────────────

  async getMyStudents(
    query?: StudentListQuery,
  ): Promise<StudentListResponse> {
    const res = await apiClient.get<StudentListResponse>('/students/me/students', {
      params: query,
    });
    return res.data;
  },

  async getMyStudentById(id: number): Promise<Student> {
    const res = await apiClient.get<Student>(`/students/me/students/${id}`);
    return res.data;
  },

  // ─── Admin: Student-Parent linkage ───────────────────────────────────────

  async assignParent(
    studentId: number,
    data: AssignParentDto,
  ): Promise<Student> {
    const res = await apiClient.post<Student>(
      `/students/${studentId}/parents`,
      data,
    );
    return res.data;
  },

  async getParents(studentId: number): Promise<StudentParentsResponse> {
    const res = await apiClient.get<StudentParentsResponse>(
      `/students/${studentId}/parents`,
    );
    return res.data;
  },

  async removeParent(studentId: number, parentId: number): Promise<Student> {
    const res = await apiClient.delete<Student>(
      `/students/${studentId}/parents/${parentId}`,
    );
    return res.data;
  },
};
