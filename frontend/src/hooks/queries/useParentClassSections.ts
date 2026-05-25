'use client';

import { useQuery } from '@tanstack/react-query';
import { useStudentStore } from '@/stores/useStudentStore';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { AttendanceService } from '@/services/attendance.service';
import type { ParentProfile } from '@/types/auth';
import type { StudentClassSection } from '@/services/attendance.service';

export function useParentClassSections(
  termId?: number | 'all',
  academicYearId?: number,
) {
  const profileQuery = useCurrentUser();
  const profile = profileQuery.data as ParentProfile | undefined;
  const students = profile?.students ?? [];

  const { selectedStudentId } = useStudentStore();
  const activeStudentId =
    selectedStudentId !== null &&
    students.some((s) => s.student_id === selectedStudentId)
      ? selectedStudentId
      : students[0]?.student_id ?? 0;

  const enabled = !!activeStudentId;

  const query = useQuery<StudentClassSection[]>({
    queryKey: [
      'parent',
      'class-sections',
      activeStudentId,
      academicYearId ?? 'all-years',
      termId ?? 'all-terms',
    ],
    queryFn: () =>
      AttendanceService.getEnrolledSectionsForParent(
        activeStudentId,
        termId === 'all' ? undefined : termId,
        academicYearId,
      ),
    enabled,
    staleTime: 2 * 60 * 1000,
  });

  return {
    sections: query.data ?? [],
    isLoading: query.isPending || profileQuery.isPending,
    isError: query.isError,
    refetch: query.refetch,
  };
}
