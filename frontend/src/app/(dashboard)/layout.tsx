import { cookies } from 'next/headers';
import { DashboardLayoutClient } from '@/components/dashboard/DashboardLayoutClient';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get('sidebar_state')?.value !== 'false';

  return (
    <DashboardLayoutClient defaultOpen={defaultOpen}>
      {children}
    </DashboardLayoutClient>
  );
}
