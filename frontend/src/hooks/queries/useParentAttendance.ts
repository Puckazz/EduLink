'use client';

import { useQuery } from '@tanstack/react-query';
import { useStudentStore } from '@/stores/useStudentStore';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { AttendanceService } from '@/services/attendance.service';
import type { ParentProfile } from '@/types/auth';
import type { Attendance } from '@/types/attendance';

export function useParentAttendance() {
  const profileQuery = useCurrentUser();
  const profile = profileQuery.data as ParentProfile | undefined;
  const students = profile?.students ?? [];

  const { selectedStudentId } = useStudentStore();
  const activeStudentId =
    selectedStudentId !== null &&
    students.some((s) => s.student_id === selectedStudentId)
      ? selectedStudentId
      : students[0]?.student_id ?? 0;

  const activeStudent =
    students.find((s) => s.student_id === activeStudentId) ??
    students[0] ??
    null;

  const enabled = !!activeStudentId;

  const attendanceQuery = useQuery({
    queryKey: ['parent', 'attendance', activeStudentId],
    queryFn: () => AttendanceService.getByStudentForParent(activeStudentId),
    enabled,
    staleTime: 2 * 60 * 1000,
  });

  const records: Attendance[] = attendanceQuery.data ?? [];

  const totalSessions = records.reduce((s, a) => s + a.total_sessions, 0);
  const totalAbsent   = records.reduce((s, a) => s + a.absent_sessions, 0);
  const totalLate     = records.reduce((s, a) => s + a.late_sessions, 0);
  const totalPresent  = Math.max(0, totalSessions - totalAbsent - totalLate);
  const overallRate   =
    totalSessions > 0
      ? Math.round(((totalPresent + totalLate) / totalSessions) * 100)
      : null;

  return {
    profile,
    students,
    activeStudent,
    records,
    totalSessions,
    totalAbsent,
    totalLate,
    totalPresent,
    overallRate,
    isLoading: attendanceQuery.isPending || profileQuery.isPending,
    isError:   attendanceQuery.isError   || profileQuery.isError,
    refetch:   attendanceQuery.refetch,
  };
}
