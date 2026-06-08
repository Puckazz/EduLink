import apiClient from "@/lib/axios";
import type {
  Attendance,
  AttendanceRecordStatus,
  AttendanceSession,
  ClassSection,
  ClassSectionListQuery,
  ClassSectionListResponse,
  ClassStats,
  ClassStatus,
  CreateAttendanceDto,
  CreateClassSectionDto,
  Enrollment,
  ImportResult,
  SessionRecordsResponse,
  StudentClassSection,
  Subject,
  Teacher,
  UpdateAttendanceDto,
  UpdateClassSectionDto,
} from "@/types/attendance";
import type { Major } from "@/types/major";

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

  async getMajors(): Promise<Major[]> {
    const res = await apiClient.get<Major[]>('/class-sections/majors');
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
    effectiveStatus?: ClassStatus,
    academicYearId?: number,
  ): Promise<ClassSection[]> {
    const res = await this.getList({
      term_id: termId,
      academic_year_id: termId ? undefined : academicYearId,
      effectiveStatus,
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
