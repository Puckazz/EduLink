import { BookOpen, CheckCircle2, TrendingUp } from 'lucide-react';

interface StudentSummaryCardsProps {
  averageScoreLabel: string;
  totalCredits: number;
  attendanceRate: number | null;
}

export function StudentSummaryCards({
  averageScoreLabel,
  totalCredits,
  attendanceRate,
}: StudentSummaryCardsProps) {
  const attendanceLabel = attendanceRate === null ? '-' : `${attendanceRate}%`;
  const attendanceProgress = attendanceRate !== null ? Math.min(attendanceRate, 100) : 0;

  const getAttendanceBarColor = () => {
    if (attendanceRate === null) return 'bg-slate-300';
    if (attendanceRate >= 80) return 'bg-emerald-500';
    if (attendanceRate >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3 items-stretch">
      <div className="relative flex flex-col justify-between gap-4 overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-6 text-white shadow-md">
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

      <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Tín chỉ đã ghi nhận
        </span>
        <div className="flex items-end justify-between">
          <div className="flex items-baseline gap-1 leading-none">
            <span className="text-4xl font-black tracking-tight text-slate-900">
              {totalCredits}
            </span>
            <span className="text-sm font-semibold text-slate-400">TC</span>
          </div>
          <div className="rounded-xl bg-blue-50 p-2.5">
            <BookOpen className="h-5 w-5 text-blue-500" />
          </div>
        </div>
        <p className="text-xs font-medium text-slate-400">
          Tính từ các học phần đã có điểm
        </p>
      </div>

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
