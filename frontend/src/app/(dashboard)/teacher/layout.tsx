import { AuthGuard } from '@/components/auth/AuthGuard';

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard allowedRole="teacher">{children}</AuthGuard>;
}
