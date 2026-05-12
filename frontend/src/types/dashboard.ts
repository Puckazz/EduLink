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
