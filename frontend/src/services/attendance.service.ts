import apiClient from "@/lib/axios";
import type { Attendance } from "@/types/attendance";

export const AttendanceService = {
  async getByStudent(studentId: number): Promise<Attendance[]> {
    const res = await apiClient.get<Attendance[]>(
      `/attendance/student/${studentId}`,
    );
    return res.data;
  },

  async getAll(): Promise<Attendance[]> {
    const res = await apiClient.get<Attendance[]>("/attendance");
    return res.data;
  },
};
