import type { Student } from './student';
import type { AcademicTerm } from './academic-term';

export interface Attendance {
  attendance_id: number;
  term_id: number;
  term: AcademicTerm;
  total_sessions: number;
  absent_sessions: number;
  late_sessions: number;
  created_at: string;
  student_id: number;
  student?: Student;
}

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
  effectiveStatus: ClassStatus;
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
  effectiveStatus?: ClassStatus;
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
  effectiveStatus: ClassStatus;
  subject: {
    subject_id: number;
    subject_code: string;
    subject_name: string;
    credit: number | null;
  };
  sessions: StudentSectionSession[];
}

export interface ImportResult {
  created: number;
  skipped: number;
  enrolled: number;
  errors: string[];
}
