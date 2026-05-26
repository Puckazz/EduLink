'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import apiClient from '@/lib/axios';

type AuthRole = 'admin' | 'parent' | 'teacher';

const ROLE_HOME: Record<AuthRole, string> = {
  admin: '/admin',
  teacher: '/teacher',
  parent: '/parent',
};

interface AuthGuardProps {
  allowedRole: AuthRole;
  children: React.ReactNode;
}

export function AuthGuard({ allowedRole, children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      try {
        const res = await apiClient.get('/auth/profile', {
          _skipAuthRedirect: true,
        });
        if (cancelled) return;
        const profile = res.data;

        if (profile.role !== allowedRole) {
          // Logged in but wrong role → redirect to their home
          router.replace(ROLE_HOME[profile.role as AuthRole] ?? '/login');
          return;
        }

        setIsAuthorized(true);
      } catch {
        if (cancelled) return;
        // Not authenticated → redirect to login
        router.replace('/login');
      }
    };

    checkAuth();

    return () => {
      cancelled = true;
    };
  }, [allowedRole, router, pathname]);

  if (!isAuthorized) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
