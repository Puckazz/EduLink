'use client';

import { useQuery } from '@tanstack/react-query';
import { DashboardService } from '@/services/dashboard.service';

export function useGpaByMajor(termId?: number) {
  return useQuery({
    queryKey: ['dashboard', 'gpa', termId ?? 'all'],
    queryFn: () => DashboardService.getGpaByMajor(termId),
    staleTime: 2 * 60 * 1000,
  });
}
