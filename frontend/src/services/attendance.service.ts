import apiClient from "@/lib/axios";
import type { Attendance } from "@/types/attendance";

export interface CreateAttendanceDto {
  semester: string;
  total_sessions?: number;
  absent_sessions?: number;
}

export interface UpdateAttendanceDto {
  semester?: string;
  total_sessions?: number;
  absent_sessions?: number;
}

export const AttendanceService = {
  // Admin: Get student's attendance
  async getByStudent(studentId: number): Promise<Attendance[]> {
    const res = await apiClient.get<Attendance[]>(
      `/students/${studentId}/attendances`,
    );
    return res.data;
  },

  // Admin: Create student's attendance
  async createForStudent(studentId: number, data: CreateAttendanceDto): Promise<Attendance> {
    const res = await apiClient.post<Attendance>(
      `/students/${studentId}/attendances`,
      data
    );
    return res.data;
  },

  // Admin: Update attendance
  async update(id: number, data: UpdateAttendanceDto): Promise<Attendance> {
    const res = await apiClient.put<Attendance>(`/attendances/${id}`, data);
    return res.data;
  },

  // Parent: Get child's attendance
  async getByStudentForParent(studentId: number): Promise<Attendance[]> {
    const res = await apiClient.get<Attendance[]>(
      `/me/students/${studentId}/attendances`,
    );
    return res.data;
  },
};
