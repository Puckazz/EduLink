'use client';

import { useQuery } from '@tanstack/react-query';
import { AcademicYearService } from '@/services/academic-year.service';
import type { AcademicPeriodStatus } from '@/types/academic-term';

export function useAcademicYears(effectiveStatus?: AcademicPeriodStatus) {
  const query = useQuery({
    queryKey: ['academic-years', effectiveStatus ?? 'all'],
    queryFn: () => AcademicYearService.getAll(effectiveStatus),
    staleTime: 5 * 60 * 1000,
  });

  const years = query.data ?? [];
  const activeYear =
    years.find((year) => year.effectiveStatus === 'ONGOING') ??
    years[0] ??
    null;

  return {
    years,
    activeYear,
    isLoading: query.isPending,
    isError: query.isError,
    refetch: query.refetch,
  };
}
