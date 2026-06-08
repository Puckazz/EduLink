import { CalendarCheck, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  sub?: string;
  icon: React.ReactNode;
  iconBg: string;
  loading?: boolean;
}

function StatCard({ label, value, sub, icon, iconBg, loading }: StatCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 transition-colors hover:bg-muted/10">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconBg}`}>
          {icon}
        </div>
      </div>
      {loading ? (
        <>
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-3 w-32" />
        </>
      ) : (
        <>
          <span className="text-3xl font-bold tracking-tight text-foreground">{value}</span>
          {sub && <p className="text-sm text-muted-foreground">{sub}</p>}
        </>
      )}
    </div>
  );
}

interface ParentAttendanceStatCardsProps {
  overallRate: number | null;
  totalSessions: number;
  totalAbsent: number;
  totalLate: number;
  isLoading: boolean;
}

export function ParentAttendanceStatCards({
  overallRate,
  totalSessions,
  totalAbsent,
  totalLate,
  isLoading,
}: ParentAttendanceStatCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      <StatCard
        label="Tỷ lệ chuyên cần"
        value={
          overallRate !== null ? (
            <span className={overallRate >= 80 ? 'text-emerald-600' : 'text-red-500'}>
              {overallRate}%
            </span>
          ) : (
            '—'
          )
        }
        sub="Có mặt + đi muộn / tổng buổi"
        icon={<CheckCircle2 className="h-4 w-4 text-white" />}
        iconBg={overallRate !== null && overallRate >= 80 ? 'bg-emerald-500' : 'bg-slate-400'}
        loading={isLoading}
      />
      <StatCard
        label="Tổng buổi học"
        value={totalSessions}
        sub="Cộng dồn tất cả học kỳ"
        icon={<CalendarCheck className="h-4 w-4 text-white" />}
        iconBg="bg-sky-500"
        loading={isLoading}
      />
      <StatCard
        label="Đi muộn"
        value={
          <span className={totalLate > 0 ? 'text-amber-500' : 'text-foreground'}>
            {totalLate}
          </span>
        }
        sub="Tổng số buổi đến muộn"
        icon={<Clock className="h-4 w-4 text-white" />}
        iconBg={totalLate > 0 ? 'bg-amber-500' : 'bg-slate-400'}
        loading={isLoading}
      />
      <StatCard
        label="Vắng mặt"
        value={
          <span className={totalAbsent > 0 ? 'text-red-500' : 'text-foreground'}>
            {totalAbsent}
          </span>
        }
        sub="Tổng số buổi không tham dự"
        icon={<XCircle className="h-4 w-4 text-white" />}
        iconBg={totalAbsent > 0 ? 'bg-red-500' : 'bg-slate-400'}
        loading={isLoading}
      />
    </div>
  );
}
