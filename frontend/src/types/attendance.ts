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
