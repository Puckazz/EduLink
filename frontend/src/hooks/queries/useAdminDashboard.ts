'use client';

import { useQuery } from '@tanstack/react-query';
import { DashboardService } from '@/services/dashboard.service';

export function useAdminDashboard() {
  return useQuery({
    queryKey: ['dashboard', 'admin'],
    queryFn: () => DashboardService.getAdminStats(),
    staleTime: 2 * 60 * 1000,
  });
}
