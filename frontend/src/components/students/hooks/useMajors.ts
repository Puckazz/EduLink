import { useQuery } from '@tanstack/react-query';
import { MajorService } from '@/services/major.service';
import type { Major } from '@/types/major';

export function useMajors(enabled = true) {
  return useQuery<Major[]>({
    queryKey: ['majors'],
    queryFn: () => MajorService.getAll(),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}
