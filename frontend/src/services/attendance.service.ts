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
    const res = await apiClient.patch<Attendance>(`/attendances/${id}`, data);
    return res.data;
  },

  // Parent: Get child's attendance
  async getByStudentForParent(studentId: number): Promise<Attendance[]> {
    const res = await apiClient.get<Attendance[]>(
      `/me/students/${studentId}/attendances`,
    );
    return res.data;
  },

  // Parent: Get child's enrolled class sections with per-session records
  async getEnrolledSectionsForParent(
    studentId: number,
    semester?: string,
  ): Promise<StudentClassSection[]> {
    const params = semester ? `?semester=${encodeURIComponent(semester)}` : '';
    const res = await apiClient.get<StudentClassSection[]>(
      `/me/students/${studentId}/class-sections${params}`,
    );
    return res.data;
  },
};

// ── Types for Class-based Attendance ─────────────────────────────────────────

export type ClassStatus = 'UPCOMING' | 'ONGOING' | 'FINISHED';
export type AttendanceRecordStatus = 'NONE' | 'PRESENT' | 'LATE' | 'ABSENT';

export interface ClassSection {
  section_id: number;
  class_code: string;
  teacher_name: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  room: string;
  semester: string;
  status: ClassStatus;
  created_at: string;
  subject: { subject_id: number; subject_code: string; subject_name: string };
  _count: { enrollments: number; sessions: number };
}

export interface AttendanceSession {
  session_id: number;
  session_no: number;
  session_date: string;
  note: string | null;
  _count: { records: number };
}

export interface SessionRecord {
  record_id: number;
  status: AttendanceRecordStatus;
  note: string | null;
  updated_at: string;
  enrollment_id: number;
  enrollment: {
    enrollment_id: number;
    student: {
      student_id: number;
      student_code: string;
      full_name: string;
      email: string | null;
    };
  };
}

export interface SessionRecordsResponse {
  data: SessionRecord[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface ClassStats {
  totalStudents: number;
  totalSessions: number;
  totalPresent: number;
  totalLate: number;
  totalAbsent: number;
}

// Shape returned by GET /me/students/:id/class-sections
export interface StudentSectionRecord {
  record_id: number;
  status: AttendanceRecordStatus;
  note: string | null;
  updated_at: string;
}

export interface StudentSectionSession {
  session_id: number;
  session_no: number;
  session_date: string;  // ISO date
  note: string | null;
  records: StudentSectionRecord[];  // always 0 or 1 entry (this student's record)
}

export interface StudentClassSection {
  section_id: number;
  class_code: string;
  teacher_name: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  room: string;
  semester: string;
  status: ClassStatus;
  subject: {
    subject_id: number;
    subject_code: string;
    subject_name: string;
    credit: number | null;
  };
  sessions: StudentSectionSession[];
}


// ── Class Section Service ─────────────────────────────────────────────────────

export const ClassSectionService = {
  async getAll(semester?: string, status?: ClassStatus): Promise<ClassSection[]> {
    const params = new URLSearchParams();
    if (semester) params.set('semester', semester);
    if (status) params.set('status', status);
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await apiClient.get<ClassSection[]>(`/class-sections${query}`);
    return res.data;
  },

  async getOne(id: number): Promise<ClassSection> {
    const res = await apiClient.get<ClassSection>(`/class-sections/${id}`);
    return res.data;
  },

  async getStats(id: number): Promise<ClassStats> {
    const res = await apiClient.get<ClassStats>(`/class-sections/${id}/stats`);
    return res.data;
  },

  async getSessions(sectionId: number): Promise<AttendanceSession[]> {
    const res = await apiClient.get<AttendanceSession[]>(`/class-sections/${sectionId}/sessions`);
    return res.data;
  },

  async createSession(
    sectionId: number,
    body: { session_date: string; session_no: number; note?: string },
  ): Promise<AttendanceSession> {
    const res = await apiClient.post<AttendanceSession>(
      `/class-sections/${sectionId}/sessions`,
      body,
    );
    return res.data;
  },

  async getSessionRecords(
    sectionId: number,
    sessionId: number,
    page = 1,
    limit = 20,
    search?: string,
  ): Promise<SessionRecordsResponse> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set('search', search);
    const res = await apiClient.get<SessionRecordsResponse>(
      `/class-sections/${sectionId}/sessions/${sessionId}/records?${params.toString()}`,
    );
    return res.data;
  },



  async bulkSaveAttendance(
    sectionId: number,
    sessionId: number,
    records: { enrollmentId: number; status: AttendanceRecordStatus; note?: string }[],
  ) {
    const res = await apiClient.patch(
      `/class-sections/${sectionId}/sessions/${sessionId}/records`,
      { records },
    );
    return res.data;
  },
};

