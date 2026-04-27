'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { ScoreService } from '@/services/score.service';
import { AttendanceService } from '@/services/attendance.service';
import type { ParentProfile } from '@/types/auth';

export function useParentDashboard() {
  const profileQuery = useCurrentUser();
  const profile = profileQuery.data as ParentProfile | undefined;

  const students = profile?.students ?? [];

  // Selected student (default = first)
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);

  // Resolve the active student: use selectedStudentId if valid, else default to first
  const activeStudentId =
    selectedStudentId !== null && students.some((s) => s.student_id === selectedStudentId)
      ? selectedStudentId
      : students[0]?.student_id ?? 0;

  const activeStudent = students.find((s) => s.student_id === activeStudentId) ?? students[0] ?? null;

  const enabled = !!activeStudentId;

  const scoresQuery = useQuery({
    queryKey: ['parent', 'me', 'scores', activeStudentId],
    queryFn: () =>
      ScoreService.getScoresByStudentForParent(activeStudentId, {
        limit: 5,
        sort_by: 'created_at',
        sort_order: 'desc',
      }),
    enabled,
    staleTime: 2 * 60 * 1000,
  });

  const attendanceQuery = useQuery({
    queryKey: ['parent', 'me', 'attendance', activeStudentId],
    queryFn: () => AttendanceService.getByStudentForParent(activeStudentId),
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

  const isPending =
    profileQuery.isPending || scoresQuery.isPending || attendanceQuery.isPending;

  return {
    profile,
    students,
    activeStudent,
    selectedStudentId: activeStudentId,
    setSelectedStudentId,
    scores: scoresQuery.data?.data ?? [],
    attendance: attendanceQuery.data ?? [],
    notifications: notificationsQuery.data?.data ?? notificationsQuery.data ?? [],
    isPending,
    isError: profileQuery.isError,
  };
}
