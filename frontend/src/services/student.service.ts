import apiClient from "@/lib/axios";
import type {
  Student,
  CreateStudentDto,
  UpdateStudentDto,
} from "@/types/student";

export const StudentService = {
  async getAll(): Promise<Student[]> {
    const res = await apiClient.get<Student[]>("/students");
    return res.data;
  },

  async getById(id: number): Promise<Student> {
    const res = await apiClient.get<Student>(`/students/${id}`);
    return res.data;
  },

  async create(data: CreateStudentDto): Promise<Student> {
    const res = await apiClient.post<Student>("/students", data);
    return res.data;
  },

  async update(id: number, data: UpdateStudentDto): Promise<Student> {
    const res = await apiClient.patch<Student>(`/students/${id}`, data);
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/students/${id}`);
  },
};
