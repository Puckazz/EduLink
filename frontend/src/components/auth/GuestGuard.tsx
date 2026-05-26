'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/auth.service';

type AuthRole = 'admin' | 'parent' | 'teacher';

const ROLE_HOME: Record<AuthRole, string> = {
  admin: '/admin',
  teacher: '/teacher',
  parent: '/parent',
};

interface GuestGuardProps {
  children: React.ReactNode;
}

/**
 * Reverse auth guard: redirects authenticated users away from login page.
 */
export function GuestGuard({ children }: GuestGuardProps) {
  const router = useRouter();
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      try {
        const profile = await AuthService.getProfile();
        if (cancelled) return;
        // Already logged in → redirect to their home
        router.replace(ROLE_HOME[profile.role as AuthRole] ?? '/admin');
      } catch {
        if (cancelled) return;
        // Not authenticated → show login page
        setIsGuest(true);
      }
    };

    checkAuth();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!isGuest) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
