import type { Student } from './student';

export interface Attendance {
  attendance_id: number;
  semester: string;
  total_sessions: number;
  absent_sessions: number;
  created_at: string;
  student_id: number;
  student?: Student;
}
