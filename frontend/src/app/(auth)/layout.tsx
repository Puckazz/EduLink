import { GuestGuard } from '@/components/auth/GuestGuard';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GuestGuard>
      <div className="flex min-h-dvh flex-col items-center justify-center bg-muted/40 p-4 sm:p-6">
        <div className="w-full max-w-275">{children}</div>
        <footer className="mt-4 text-center text-sm font-medium text-muted-foreground">
          &copy; {new Date().getFullYear()} EduLink. All rights reserved.
        </footer>
      </div>
    </GuestGuard>
  );
}
