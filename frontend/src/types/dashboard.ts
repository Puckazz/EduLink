export interface AdminDashboardStats {
  totalStudents: number;
  totalParents: number;
  totalNotifications: number;
  pendingFeedbacks: number;
  recentFeedbacks: AdminRecentFeedback[];
  gpaByMajor: { major: string; gpa: number }[];
  attendanceSummary: { present: number; absent: number; late: number };
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
}

export interface ParentDashboardStudent {
  student_id: number;
  student_code: string;
  full_name: string;
  class: string | null;
  status: string;
  major: string | null;
  is_primary: boolean;
  scores: ParentDashboardScore[];
  attendances: ParentDashboardAttendance[];
}

export interface ParentDashboardScore {
  score_id: number;
  semester: string;
  year: number;
  avg: number | null;
  subject: { subject_name: string; subject_code: string };
}

export interface ParentDashboardAttendance {
  attendance_id: number;
  semester: string;
  total_sessions: number;
  absent_sessions: number;
  late_sessions: number;
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
  semester: string;
  status: 'UPCOMING' | 'ONGOING' | 'FINISHED';
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
