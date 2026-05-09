'use client';

import { useQuery } from '@tanstack/react-query';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { DashboardService } from '@/services/dashboard.service';
import { useStudentStore } from '@/stores/useStudentStore';
import type { ParentProfile, ParentProfileStudent } from '@/types/auth';
import type { Score } from '@/types/score';
import type { Attendance } from '@/types/attendance';

// Local type matching NotificationsWidget's local Notification interface
interface DashboardNotification {
  id?: number;
  title: string;
  content: string;
  created_at?: string;
  type?: string;
}

export function useParentDashboard() {
  const profileQuery = useCurrentUser();
  const profile = profileQuery.data as ParentProfile | undefined;

  const { selectedStudentId, setSelectedStudentId } = useStudentStore();

  // GET /dashboard/me – lấy tổng quan phụ huynh (con, điểm, chuyên cần)
  const dashboardQuery = useQuery({
    queryKey: ['dashboard', 'me'],
    queryFn: () => DashboardService.getParentDashboard(),
    enabled: !profileQuery.isPending,
    staleTime: 2 * 60 * 1000,
  });

  const rawStudents = dashboardQuery.data?.students ?? [];

  // Map sang ParentProfileStudent để tương thích StudentCard
  const students: ParentProfileStudent[] = rawStudents.map((s) => ({
    student_id: s.student_id,
    student_code: s.student_code,
    full_name: s.full_name,
    class: s.class,
    study_year: null,
    major: s.major ? { major_name: s.major } : null,
  }));

  // Resolve active student từ store hoặc mặc định đầu tiên
  const activeStudentId =
    selectedStudentId !== null &&
    rawStudents.some((s) => s.student_id === selectedStudentId)
      ? selectedStudentId
      : (rawStudents[0]?.student_id ?? 0);

  const activeRaw =
    rawStudents.find((s) => s.student_id === activeStudentId) ??
    rawStudents[0] ??
    null;

  const activeStudent =
    students.find((s) => s.student_id === activeStudentId) ??
    students[0] ??
    null;

  // Map scores sang Score[] (chỉ cần các fields mà LatestScoresWidget dùng)
  const scores: Score[] = (activeRaw?.scores ?? []).map((s) => ({
    score_id: s.score_id,
    semester: s.semester,
    year: s.year,
    avg: s.avg,
    assignment: null,
    midterm: null,
    final: null,
    note: null,
    publish_status: 'PUBLISHED' as const,
    created_at: '',
    updated_at: '',
    student_id: activeStudentId,
    subject_id: s.subject ? 0 : 0,
    subject: s.subject
      ? {
          subject_id: 0,
          subject_code: s.subject.subject_code,
          subject_name: s.subject.subject_name,
          credit: null,
        }
      : undefined,
  }));

  // Map attendances sang Attendance[] (chỉ cần các fields mà AttendanceDonutWidget dùng)
  const attendance: Attendance[] = (activeRaw?.attendances ?? []).map((a) => ({
    attendance_id: a.attendance_id,
    semester: a.semester,
    total_sessions: a.total_sessions,
    absent_sessions: a.absent_sessions,
    late_sessions: a.late_sessions,
    created_at: '',
    student_id: activeStudentId,
  }));

  const isPending = profileQuery.isPending || dashboardQuery.isPending;

  return {
    profile,
    students,
    activeStudent,
    selectedStudentId: activeStudentId,
    setSelectedStudentId,
    scores,
    attendance,
    notifications: [] as DashboardNotification[],
    isPending,
    isError: profileQuery.isError || dashboardQuery.isError,
  };
}
