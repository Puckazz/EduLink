'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/useCurrentUser';

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
  const { data: profile, isPending, isError } = useCurrentUser();

  useEffect(() => {
    if (isPending) return;

    if (isError || !profile) {
      router.replace('/login');
      return;
    }

    if (profile.role !== allowedRole) {
      router.replace(ROLE_HOME[profile.role as AuthRole] ?? '/login');
    }
  }, [allowedRole, isError, isPending, profile, router]);

  if (isPending || isError || !profile || profile.role !== allowedRole) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
