'use client';

import { useQuery } from '@tanstack/react-query';
import { StudentService } from '@/services/student.service';
import type { StudentListResponse } from '@/types/student';

export function useStudentParentLinks() {
  return useQuery<StudentListResponse>({
    queryKey: ['students', 'parent-links'],
    queryFn: () => StudentService.getAll({ limit: 1000 }),
    staleTime: 5 * 60 * 1000,
  });
}
