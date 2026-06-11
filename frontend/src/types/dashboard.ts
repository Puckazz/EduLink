import type { AcademicTerm } from './academic-term';

export interface AdminDashboardStats {
  totalStudents: number;
  totalParents: number;
  totalNotifications: number;
  pendingFeedbacks: number;
  recentFeedbacks: AdminRecentFeedback[];
  attendanceSummary: { present: number; absent: number; late: number };
}

export interface GpaByMajorResponse {
  gpaByMajor: { major: string; gpa: number }[];
  terms: AcademicTerm[];
}

export interface AdminRecentFeedback {
  feedback_id: number;
  title: string;
  category: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  created_at: string;
  parent: { full_name: string };
}

export interface ParentDashboardData {
  students: ParentDashboardStudent[];
  notifications: ParentDashboardNotification[];
}

export interface ParentDashboardStudent {
  student_id: number;
  student_code: string;
  full_name: string;
  class: string | null;
  status: string;
  study_year: number | null;
  major: string | null;
  is_primary: boolean;
  gpa_4: number | null;
  scores: ParentDashboardScore[];
  attendances: ParentDashboardAttendance[];
}

export interface ParentDashboardScore {
  score_id: number;
  term_id: number;
  term: AcademicTerm;
  avg: number | null;
  subject: { subject_name: string; subject_code: string; credit: number | null };
}

export interface ParentDashboardAttendance {
  attendance_id: number;
  term_id: number;
  term: AcademicTerm;
  total_sessions: number;
  absent_sessions: number;
  late_sessions: number;
}

export interface ParentDashboardNotification {
  notification_id: number;
  title: string;
  content: string;
  created_at: string;
  target_role?: string | null;
  target_id?: number | null;
  feedback_id?: number | null;
  admin?: { full_name: string | null } | null;
}

export interface TeacherDashboardData {
  totalClasses: number;
  ongoingClasses: number;
  totalStudents: number;
  totalSessions: number;
  incompleteSessions: number;
  attendanceSummary: {
    present: number;
    late: number;
    absent: number;
    none: number;
  };
  todayClasses: TeacherDashboardClass[];
  recentClasses: TeacherDashboardClass[];
  recentNotifications: TeacherDashboardNotification[];
}

export interface TeacherDashboardClass {
  section_id: number;
  class_code: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  room: string;
  term_id: number;
  term: AcademicTerm;
  effectiveStatus: 'UPCOMING' | 'ONGOING' | 'FINISHED';
  subject: {
    subject_id: number;
    subject_code: string;
    subject_name: string;
  };
  _count: { enrollments: number; sessions: number };
}

export interface TeacherDashboardNotification {
  notification_id: number;
  title: string;
  content: string;
  created_at: string;
  target_role?: string | null;
  target_id?: number | null;
  feedback_id?: number | null;
  admin?: { full_name: string | null } | null;
}
