'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { AttendanceService } from '@/services/attendance.service';
import { ScoreService } from '@/services/score.service';
import { StudentService } from '@/services/student.service';
import type { Attendance } from '@/types/attendance';
import type { ScoreListResponse } from '@/types/score';
import type { StudentParentsResponse } from '@/types/student';

export function getApiErrorMessage(
  error: unknown,
  fallbackMessage: string,
): string {
  if (typeof error !== 'object' || error === null || !('response' in error)) {
    return fallbackMessage;
  }

  const response = (error as { response?: { data?: { message?: unknown } } })
    .response;
  const responseMessage = response?.data?.message;

  if (Array.isArray(responseMessage) && responseMessage.length > 0) {
    return String(responseMessage[0]);
  }

  if (typeof responseMessage === 'string' && responseMessage.trim()) {
    return responseMessage;
  }

  return fallbackMessage;
}

export function useStudentDetail(studentId: number) {
  const enabled = Number.isFinite(studentId) && studentId > 0;

  const studentQuery = useQuery({
    queryKey: ['student-detail', studentId],
    queryFn: () => StudentService.getById(studentId),
    enabled,
    placeholderData: keepPreviousData,
  });

  const parentsQuery = useQuery<StudentParentsResponse>({
    queryKey: ['student-detail', studentId, 'parents'],
    queryFn: () => StudentService.getParents(studentId),
    enabled,
    placeholderData: keepPreviousData,
  });

  const scoresQuery = useQuery<ScoreListResponse>({
    queryKey: ['student-detail', studentId, 'scores'],
    queryFn: () =>
      ScoreService.getScoresByStudent(studentId, {
        page: 1,
        limit: 100,
        sort_by: 'created_at',
        sort_order: 'desc',
      }),
    enabled,
    placeholderData: keepPreviousData,
  });

  const attendanceQuery = useQuery<Attendance[]>({
    queryKey: ['student-detail', studentId, 'attendance'],
    queryFn: () => AttendanceService.getByStudent(studentId),
    enabled,
    placeholderData: keepPreviousData,
  });

  const isPending =
    studentQuery.isPending ||
    parentsQuery.isPending ||
    scoresQuery.isPending ||
    attendanceQuery.isPending;

  const isFetching =
    studentQuery.isFetching ||
    parentsQuery.isFetching ||
    scoresQuery.isFetching ||
    attendanceQuery.isFetching;

  const errorMessage = studentQuery.error
    ? getApiErrorMessage(
        studentQuery.error,
        'Không thể tải chi tiết sinh viên.',
      )
    : null;

  const refetchAll = () => {
    void Promise.all([
      studentQuery.refetch(),
      parentsQuery.refetch(),
      scoresQuery.refetch(),
      attendanceQuery.refetch(),
    ]);
  };

  return {
    studentQuery,
    parentsQuery,
    scoresQuery,
    attendanceQuery,
    isPending,
    isFetching,
    errorMessage,
    refetchAll,
  };
}
