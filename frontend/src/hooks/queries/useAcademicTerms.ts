'use client';

import { useQuery } from '@tanstack/react-query';
import {
  AcademicTermService,
  type AcademicTermQuery,
} from '@/services/academic-term.service';
import { getEffectiveAcademicStatus } from '@/lib/academic-calendar';

export function useAcademicTerms(options: AcademicTermQuery = {}) {
  const termsQuery = useQuery({
    queryKey: [
      'academic-terms',
      options.academicYearId ?? 'all',
      options.status ?? 'all',
    ],
    queryFn: () => AcademicTermService.getAll(options),
    staleTime: 5 * 60 * 1000,
  });

  const terms = termsQuery.data ?? [];
  const activeTerm =
    terms.find(
      (term) =>
        getEffectiveAcademicStatus(term.start_date, term.end_date) === 'ONGOING',
    ) ??
    terms[0] ??
    null;

  return {
    terms,
    activeTerm,
    isLoading: termsQuery.isPending,
    isError: termsQuery.isError,
    refetch: termsQuery.refetch,
  };
}
