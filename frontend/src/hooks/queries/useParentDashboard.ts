import { useQuery } from '@tanstack/react-query';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { ScoreService } from '@/services/score.service';
import { AttendanceService } from '@/services/attendance.service';
import type { ParentProfile } from '@/types/auth';

export function useParentDashboard() {
  const profileQuery = useCurrentUser();
  const profile = profileQuery.data as ParentProfile | undefined;

  // Use first linked student
  const firstStudent = profile?.students?.[0] ?? null;
  const studentId = firstStudent?.student_id ?? 0;
  const enabled = !!studentId;

  const scoresQuery = useQuery({
    queryKey: ['parent', 'me', 'scores', studentId],
    queryFn: () => ScoreService.getScoresByStudentForParent(studentId, { limit: 5, sort_by: 'created_at', sort_order: 'desc' }),
    enabled,
    staleTime: 2 * 60 * 1000,
  });

  const attendanceQuery = useQuery({
    queryKey: ['parent', 'me', 'attendance', studentId],
    queryFn: () => AttendanceService.getByStudentForParent(studentId),
    enabled,
    staleTime: 2 * 60 * 1000,
  });

  const notificationsQuery = useQuery({
    queryKey: ['parent', 'me', 'notifications'],
    queryFn: async () => {
      const { default: apiClient } = await import('@/lib/axios');
      const res = await apiClient.get('/me/notifications');
      return res.data as { data?: any[]; [key: string]: any };
    },
    staleTime: 60 * 1000,
  });

  const isPending = profileQuery.isPending || scoresQuery.isPending || attendanceQuery.isPending;

  return {
    profile,
    firstStudent,
    scores: scoresQuery.data?.data ?? [],
    attendance: attendanceQuery.data ?? [],
    notifications: notificationsQuery.data?.data ?? notificationsQuery.data ?? [],
    isPending,
    isError: profileQuery.isError,
  };
}
