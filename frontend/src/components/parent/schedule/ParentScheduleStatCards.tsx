import { BookOpen, PlayCircle, Award, CheckCircle2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { StudentClassSection } from '@/services/attendance.service';

// ─── Stat Card ─────────────────────────────────────────────────────────────────

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

// ─── Main ──────────────────────────────────────────────────────────────────────

interface ParentScheduleStatCardsProps {
  sections: StudentClassSection[];
  isLoading: boolean;
}

export function ParentScheduleStatCards({
  sections,
  isLoading,
}: ParentScheduleStatCardsProps) {
  const totalSections = sections.length;
  const ongoingSections = sections.filter((s) => s.status === 'ONGOING').length;
  const finishedSections = sections.filter((s) => s.status === 'FINISHED').length;
  const totalCredits = sections.reduce((sum, s) => sum + (s.subject.credit ?? 0), 0);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Tổng số môn học"
        value={totalSections}
        sub="Tất cả môn trong học kỳ này"
        icon={<BookOpen className="h-4 w-4 text-white" />}
        iconBg="bg-sky-500"
        loading={isLoading}
      />
      <StatCard
        label="Đang học"
        value={
          <span className={ongoingSections > 0 ? 'text-emerald-600' : 'text-foreground'}>
            {ongoingSections}
          </span>
        }
        sub="Số môn đang trong quá trình học"
        icon={<PlayCircle className="h-4 w-4 text-white" />}
        iconBg={ongoingSections > 0 ? 'bg-emerald-500' : 'bg-slate-400'}
        loading={isLoading}
      />
      <StatCard
        label="Đã hoàn thành"
        value={
          <span className={finishedSections > 0 ? 'text-slate-600' : 'text-foreground'}>
            {finishedSections}
          </span>
        }
        sub="Số môn đã kết thúc khóa học"
        icon={<CheckCircle2 className="h-4 w-4 text-white" />}
        iconBg={finishedSections > 0 ? 'bg-slate-500' : 'bg-slate-300'}
        loading={isLoading}
      />
      <StatCard
        label="Tổng tín chỉ"
        value={totalCredits}
        sub="Tổng số tín chỉ đăng ký"
        icon={<Award className="h-4 w-4 text-white" />}
        iconBg="bg-amber-500"
        loading={isLoading}
      />
    </div>
  );
}
