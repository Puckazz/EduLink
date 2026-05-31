'use client';

import { StudentCard } from './StudentCard';
import { LatestScoresWidget } from './LatestScoresWidget';
import { AttendanceDonutWidget } from './AttendanceDonutWidget';
import { NotificationsWidget } from './NotificationsWidget';
import { ActionShortcuts } from './ActionShortcuts';
import { useParentDashboard } from '@/hooks/queries/useParentDashboard';

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-16 rounded-2xl bg-slate-100" />
      <div className="h-44 rounded-2xl bg-slate-100" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-72 rounded-2xl bg-slate-100" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-36 rounded-2xl bg-slate-100" />
        ))}
      </div>
    </div>
  );
}

export function ParentDashboardPageClient() {
  const {
    profile,
    activeStudent,
    activeStudentMeta,
    scores,
    attendance,
    notifications,
    isPending,
    isError,
  } = useParentDashboard();

  if (isPending) return <DashboardSkeleton />;

  if (isError || !profile || !activeStudent) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-lg font-bold text-slate-700">
            Không thể tải thông tin
          </p>
          <p className="text-sm text-slate-400">Vui lòng thử đăng nhập lại.</p>
        </div>
      </div>
    );
  }

  const gpaLabel =
    activeStudentMeta?.gpa_4 !== null && activeStudentMeta?.gpa_4 !== undefined
      ? `${activeStudentMeta.gpa_4.toFixed(2)} / 4.0`
      : '-';

  return (
    <div className="space-y-6 pb-12">
      <div className="space-y-0.5">
        <h1 className="text-2xl font-extrabold tracking-tight text-primary">
          Tổng quan
        </h1>
        <p className="text-sm text-slate-500">
          Chào mừng trở lại! Dưới đây là thông tin hoạt động của con bạn hôm
          nay.
        </p>
      </div>

      <StudentCard
        student={activeStudent}
        gpa={gpaLabel}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <LatestScoresWidget scores={scores} isLoading={false} />
        <AttendanceDonutWidget attendance={attendance} isLoading={false} />
        <NotificationsWidget
          notifications={notifications}
          isLoading={false}
        />
      </div>

      <ActionShortcuts />
    </div>
  );
}
