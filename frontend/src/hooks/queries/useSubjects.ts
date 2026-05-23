'use client';

import { useQuery } from '@tanstack/react-query';
import { SubjectService } from '@/services/subject.service';

export function useSubjects(params?: {
  search?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: string;
}) {
  return useQuery({
    queryKey: ['subjects', params],
    queryFn: () => SubjectService.getPaginated(params),
    staleTime: 30_000,
  });
}
