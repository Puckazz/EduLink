import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/auth.service';
import { beginAuthSessionEnd } from '@/lib/axios';

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);
    beginAuthSessionEnd();

    try {
      await queryClient.cancelQueries();
      await AuthService.logout();
    } finally {
      queryClient.clear();
      router.replace('/login');
      router.refresh();
      setIsLoggingOut(false);
    }
  };

  return {
    logout,
    isLoggingOut,
  };
}
