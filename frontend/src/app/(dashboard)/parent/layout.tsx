import { AuthGuard } from '@/components/auth/AuthGuard';

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard allowedRole="parent">{children}</AuthGuard>;
}
