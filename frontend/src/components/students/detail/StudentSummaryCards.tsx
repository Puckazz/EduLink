import { BookOpen, CheckCircle2, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

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
  const attendanceLabel =
    attendanceRate === null ? '-' : `${attendanceRate}%`;

  // Parse GPA value for display (e.g. "3.85/4.0" or "8.5/10")
  const gpaRaw = averageScoreLabel; // e.g. "3.85/10" or "-"

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {/* Card 1 – GPA hiện tại (dark) */}
      <Card className="overflow-hidden border-slate-700/50 shadow-sm">
        <CardContent className="relative flex flex-col gap-3 p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
            GPA hiện tại
          </span>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-black tracking-tight text-white">
              {gpaRaw}
            </span>
            <div className="rounded-lg bg-white/10 p-2.5">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 2 – Tổng tín chỉ (white) */}
      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <CardContent className="relative flex flex-col gap-3 p-6 bg-white text-slate-900">
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
            Tổng tín chỉ
          </span>
          <div className="flex items-end justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black tracking-tight text-slate-900">
                {scoresCount}
              </span>
              <span className="text-base font-semibold text-slate-400">/145</span>
            </div>
            <div className="rounded-lg bg-blue-50 p-2.5">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-500 transition-all"
              style={{ width: `${Math.min((scoresCount / 145) * 100, 100)}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Card 3 – Tỷ lệ điểm danh (white) */}
      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <CardContent className="relative flex flex-col gap-3 p-6 bg-white text-slate-900">
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
            Tỷ lệ điểm danh
          </span>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-black tracking-tight text-slate-900">
              {attendanceLabel}
            </span>
            <div className="rounded-lg bg-emerald-50 p-2.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{
                width:
                  attendanceRate !== null
                    ? `${Math.min(attendanceRate, 100)}%`
                    : '0%',
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
