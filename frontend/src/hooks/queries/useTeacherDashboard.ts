'use client';

import { useQuery } from '@tanstack/react-query';
import { DashboardService } from '@/services/dashboard.service';

export function useTeacherDashboard() {
  return useQuery({
    queryKey: ['dashboard', 'teacher'],
    queryFn: () => DashboardService.getTeacherStats(),
    staleTime: 2 * 60 * 1000,
  });
}
