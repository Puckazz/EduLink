import apiClient from "@/lib/axios";
import type { Attendance } from "@/types/attendance";
import type { AcademicTerm } from "@/types/academic-term";

export interface CreateAttendanceDto {
  term_id: number;
  total_sessions?: number;
  absent_sessions?: number;
}

export interface UpdateAttendanceDto {
  term_id?: number;
  total_sessions?: number;
  absent_sessions?: number;
}

export const AttendanceService = {
  async getByStudent(
    studentId: number,
    termId?: number,
    academicYearId?: number,
  ): Promise<Attendance[]> {
    const res = await apiClient.get<Attendance[]>(
      `/students/${studentId}/attendances`,
      {
        params: termId
          ? { term_id: termId }
          : academicYearId
            ? { academic_year_id: academicYearId }
            : undefined,
      },
    );
    return res.data;
  },

  async createForStudent(studentId: number, data: CreateAttendanceDto): Promise<Attendance> {
    const res = await apiClient.post<Attendance>(
      `/students/${studentId}/attendances`,
      data
    );
    return res.data;
  },

  async update(id: number, data: UpdateAttendanceDto): Promise<Attendance> {
    const res = await apiClient.patch<Attendance>(`/attendances/${id}`, data);
    return res.data;
  },

  async getByStudentForParent(
    studentId: number,
    termId?: number,
    academicYearId?: number,
  ): Promise<Attendance[]> {
    const res = await apiClient.get<Attendance[]>(
      `/me/students/${studentId}/attendances`,
      {
        params: termId
          ? { term_id: termId }
          : academicYearId
            ? { academic_year_id: academicYearId }
            : undefined,
      },
    );
    return res.data;
  },

  async getEnrolledSectionsForParent(
    studentId: number,
    termId?: number,
    academicYearId?: number,
  ): Promise<StudentClassSection[]> {
    const search = new URLSearchParams();
    if (termId) search.set('term_id', String(termId));
    else if (academicYearId) search.set('academic_year_id', String(academicYearId));
    const params = search.toString() ? `?${search.toString()}` : '';
    const res = await apiClient.get<StudentClassSection[]>(
      `/me/students/${studentId}/class-sections${params}`,
    );
    return res.data;
  },
};


export type ClassStatus = 'UPCOMING' | 'ONGOING' | 'FINISHED';
export type AttendanceRecordStatus = 'NONE' | 'PRESENT' | 'LATE' | 'ABSENT';

export interface Subject {
  subject_id: number;
  subject_code: string;
  subject_name: string;
  credit: number | null;
}

export interface Teacher {
  teacher_id: number;
  full_name: string | null;
  username: string;
  email: string | null;
}

export interface ClassSection {
  section_id: number;
  class_code: string;
  teacher_name: string;
  teacher_id?: number | null;
  day_of_week: string;
  start_time: string;
  end_time: string;
  room: string;
  term_id: number;
  term: AcademicTerm;
  status: ClassStatus;
  created_at: string;
  subject: { subject_id: number; subject_code: string; subject_name: string };
  _count: { enrollments: number; sessions: number };
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  has_prev: boolean;
  has_next: boolean;
}

export interface ClassSectionListQuery {
  search?: string;
  term_id?: number;
  academic_year_id?: number;
  major_id?: number;
  status?: ClassStatus;
  page?: number;
  limit?: number;
}

export interface ClassSectionListResponse {
  data: ClassSection[];
  pagination: PaginationMeta;
}

export interface CreateClassSectionDto {
  class_code: string;
  teacher_name: string;
  teacher_id?: number | null;
  day_of_week: string;
  start_time: string;
  end_time: string;
  room: string;
  term_id: number;
  status?: ClassStatus;
  subject_id: number;
}

export interface UpdateClassSectionDto {
  class_code?: string;
  teacher_name?: string;
  teacher_id?: number | null;
  day_of_week?: string;
  start_time?: string;
  end_time?: string;
  room?: string;
  term_id?: number;
  status?: ClassStatus;
  subject_id?: number;
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

export type AttendanceAccessReason =
  | 'OPEN'
  | 'ADMIN_OVERRIDE'
  | 'BEFORE_TERM'
  | 'AFTER_TERM'
  | 'BEFORE_WINDOW'
  | 'AFTER_WINDOW';

export interface AttendanceAccess {
  canEditRecords: boolean;
  reason: AttendanceAccessReason;
  windowStart: string;
  windowEnd: string;
  serverNow: string;
}

export interface SessionRecordsResponse {
  data: SessionRecord[];
  meta: { total: number; page: number; limit: number; totalPages: number };
  stats: {
    total: number;
    present: number;
    late: number;
    absent: number;
  };
  trend: {
    present: number | null;
    late: number | null;
    absent: number | null;
  } | null;
  attendanceAccess: AttendanceAccess;
}

export interface ClassStats {
  totalStudents: number;
  totalSessions: number;
  totalPresent: number;
  totalLate: number;
  totalAbsent: number;
}

export interface Enrollment {
  enrollment_id: number;
  enrolled_at: string;
  student: {
    student_id: number;
    student_code: string;
    full_name: string;
    email: string | null;
  };
}

export interface StudentSectionRecord {
  record_id: number;
  status: AttendanceRecordStatus;
  note: string | null;
  updated_at: string;
}

export interface StudentSectionSession {
  session_id: number;
  session_no: number;
  session_date: string;
  note: string | null;
  records: StudentSectionRecord[];
}

export interface StudentClassSection {
  section_id: number;
  class_code: string;
  teacher_name: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  room: string;
  term_id: number;
  term: AcademicTerm;
  status: ClassStatus;
  subject: {
    subject_id: number;
    subject_code: string;
    subject_name: string;
    credit: number | null;
  };
  sessions: StudentSectionSession[];
}



export const SubjectService = {
  async getAll(): Promise<Subject[]> {
    const res = await apiClient.get<{ data: Subject[] } | Subject[]>('/subjects?limit=100');
    const raw = res.data;
    return Array.isArray(raw) ? raw : (raw as { data: Subject[] }).data ?? [];
  },
};


export const ClassSectionService = {
  async getTeachers(): Promise<Teacher[]> {
    const res = await apiClient.get<Teacher[]>('/class-sections/teachers');
    return res.data;
  },

  async getList(query?: ClassSectionListQuery): Promise<ClassSectionListResponse> {
    const res = await apiClient.get<ClassSectionListResponse>('/class-sections', {
      params: query,
    });
    return res.data;
  },

  async getAll(
    termId?: number,
    status?: ClassStatus,
    academicYearId?: number,
  ): Promise<ClassSection[]> {
    const res = await this.getList({
      term_id: termId,
      academic_year_id: termId ? undefined : academicYearId,
      status,
      page: 1,
      limit: 1000,
    });
    return res.data;
  },

  async getOne(id: number): Promise<ClassSection> {
    const res = await apiClient.get<ClassSection>(`/class-sections/${id}`);
    return res.data;
  },

  async create(dto: CreateClassSectionDto): Promise<ClassSection> {
    const res = await apiClient.post<ClassSection>('/class-sections', dto);
    return res.data;
  },

  async update(id: number, dto: UpdateClassSectionDto): Promise<ClassSection> {
    const res = await apiClient.patch<ClassSection>(`/class-sections/${id}`, dto);
    return res.data;
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/class-sections/${id}`);
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

  async updateSession(
    sectionId: number,
    sessionId: number,
    body: { session_date?: string; note?: string },
  ): Promise<AttendanceSession> {
    const res = await apiClient.patch<AttendanceSession>(
      `/class-sections/${sectionId}/sessions/${sessionId}`,
      body,
    );
    return res.data;
  },

  async deleteSession(sectionId: number, sessionId: number): Promise<void> {
    await apiClient.delete(`/class-sections/${sectionId}/sessions/${sessionId}`);
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


  async getEnrollments(sectionId: number): Promise<Enrollment[]> {
    const res = await apiClient.get<Enrollment[]>(`/class-sections/${sectionId}/enrollments`);
    return res.data;
  },

  async addEnrollments(sectionId: number, studentIds: number[]): Promise<void> {
    await apiClient.post(`/class-sections/${sectionId}/enrollments`, { studentIds });
  },

  async removeEnrollment(sectionId: number, enrollmentId: number): Promise<void> {
    await apiClient.delete(`/class-sections/${sectionId}/enrollments/${enrollmentId}`);
  },


  async importFromFile(file: File): Promise<ImportResult> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<ImportResult>('/class-sections/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};

export interface ImportResult {
  created: number;
  skipped: number;
  enrolled: number;
  errors: string[];
}
