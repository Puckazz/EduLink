'use client';

import { useQuery } from '@tanstack/react-query';
import { SubjectService } from '@/services/subject.service';

export function useSubjects(params?: {
  search?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: string;
  major_id?: number;
}) {
  return useQuery({
    queryKey: ['subjects', params],
    queryFn: () => SubjectService.getPaginated(params),
    staleTime: 30_000,
  });
}

export function useSubjectsByMajor(majorId: number) {
  return useQuery({
    queryKey: ['subjects', 'major', majorId],
    queryFn: () => SubjectService.getAllForMajor(majorId),
    staleTime: 30_000,
  });
}
