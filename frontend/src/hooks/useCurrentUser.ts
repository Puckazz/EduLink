import { useQuery } from '@tanstack/react-query';
import { AuthService } from '@/services/auth.service';

export function useCurrentUser() {
  return useQuery({
    queryKey: ['auth', 'profile'],
    queryFn: () => AuthService.getProfile(),
    staleTime: 5 * 60 * 1000,
  });
}
