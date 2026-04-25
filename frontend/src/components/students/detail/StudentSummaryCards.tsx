import { BookOpen, CheckCircle2, TrendingUp } from 'lucide-react';

interface StudentSummaryCardsProps {
  averageScoreLabel: string;
  scoresCount: number;
  attendanceRate: number | null;
}

export function StudentSummaryCards({
  averageScoreLabel,
  scoresCount,
  attendanceRate,
}: StudentSummaryCardsProps) {
  const attendanceLabel = attendanceRate === null ? '-' : `${attendanceRate}%`;
  const creditProgress = Math.min((scoresCount / 145) * 100, 100);
  const attendanceProgress = attendanceRate !== null ? Math.min(attendanceRate, 100) : 0;

  const getAttendanceBarColor = () => {
    if (attendanceRate === null) return 'bg-slate-300';
    if (attendanceRate >= 80) return 'bg-emerald-500';
    if (attendanceRate >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3 items-stretch">
      {/* Card 1 – GPA (dark gradient) */}
      <div className="relative flex flex-col justify-between gap-4 overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-6 text-white shadow-md">
        {/* Glow */}
        <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-indigo-500/20 blur-2xl" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          GPA Hiện tại
        </span>
        <div className="flex items-end justify-between">
          <span className="text-4xl font-black leading-none tracking-tight text-white">
            {averageScoreLabel}
          </span>
          <div className="rounded-xl bg-white/10 p-2.5 backdrop-blur-sm">
            <TrendingUp className="h-5 w-5 text-indigo-300" />
          </div>
        </div>
      </div>

      {/* Card 2 – Tổng tín chỉ */}
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Tổng tín chỉ
        </span>
        <div className="flex items-end justify-between">
          <div className="flex items-baseline gap-1 leading-none">
            <span className="text-4xl font-black tracking-tight text-slate-900">
              {scoresCount}
            </span>
            <span className="text-sm font-semibold text-slate-400">/145</span>
          </div>
          <div className="rounded-xl bg-blue-50 p-2.5">
            <BookOpen className="h-5 w-5 text-blue-500" />
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-blue-500 transition-all duration-500"
            style={{ width: `${creditProgress}%` }}
          />
        </div>
      </div>

      {/* Card 3 – Tỷ lệ điểm danh */}
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Tỷ lệ điểm danh
        </span>
        <div className="flex items-end justify-between">
          <span className="text-4xl font-black leading-none tracking-tight text-slate-900">
            {attendanceLabel}
          </span>
          <div className="rounded-xl bg-emerald-50 p-2.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all duration-500 ${getAttendanceBarColor()}`}
            style={{ width: `${attendanceProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
