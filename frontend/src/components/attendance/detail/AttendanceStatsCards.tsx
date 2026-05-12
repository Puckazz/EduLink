import { Users, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface Trend {
  present: number | null;
  late: number | null;
  absent: number | null;
}

interface Props {
  total: number;
  present: number;
  late: number;
  absent: number;
  trend?: Trend | null;
}

function TrendBadge({
  value,
  positiveIsGood = true,
}: {
  value: number | null | undefined;
  positiveIsGood?: boolean;
}) {
  if (value === null || value === undefined || value === 0) return null;

  const isPositive = value > 0;
  const isGood = positiveIsGood ? isPositive : !isPositive;
  const absVal = Math.abs(value);
  const sign = isPositive ? '+' : '-';

  return (
    <span
      className={`inline-flex items-center text-sm font-bold px-2 py-0.5 rounded-md ${
        isGood ? 'text-emerald-600 bg-emerald-50' : 'text-red-500 bg-red-50'
      }`}
    >
      {sign}{absVal}%
    </span>
  );
}

export function AttendanceStatsCards({ total, present, late, absent, trend }: Props) {
  const presentPct = total > 0 ? Math.round((present / total) * 100) : 0;
  const latePct    = total > 0 ? Math.round((late    / total) * 100) : 0;
  const absentPct  = total > 0 ? Math.round((absent  / total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

      <Card className="shadow-sm border-slate-200 rounded-2xl">
        <CardContent className="p-6 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <span className="text-base font-bold text-slate-600">Tổng Sinh Viên</span>
            <div className="h-11 w-11 rounded-full bg-slate-100 flex items-center justify-center">
              <Users className="h-6 w-6 text-slate-400" />
            </div>
          </div>
          <span className="text-5xl font-extrabold text-slate-800">{total}</span>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-slate-200 rounded-2xl">
        <CardContent className="p-6 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <span className="text-base font-bold text-slate-600">Có Mặt</span>
            <div className="h-11 w-11 rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-emerald-400" strokeWidth={2} />
            </div>
          </div>
          <div className="flex items-end gap-3">
            <span className="text-5xl font-extrabold text-emerald-500">{present}</span>
            <span className="mb-1.5">
              {trend ? (
                <TrendBadge value={trend.present} positiveIsGood={true} />
              ) : (
                total > 0 && (
                  <span className="inline-flex items-center text-sm font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">
                    {presentPct}%
                  </span>
                )
              )}
            </span>
          </div>
          <Progress
            value={presentPct}
            className="h-1.5 bg-emerald-100 [&>[data-slot=progress-indicator]]:bg-emerald-400"
          />
        </CardContent>
      </Card>

      <Card className="shadow-sm border-slate-200 rounded-2xl">
        <CardContent className="p-6 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <span className="text-base font-bold text-slate-600">Đi Muộn</span>
            <div className="h-11 w-11 rounded-full bg-amber-50 flex items-center justify-center">
              <Clock className="h-6 w-6 text-amber-400" strokeWidth={2} />
            </div>
          </div>
          <div className="flex items-end gap-3">
            <span className="text-5xl font-extrabold text-amber-500">{late}</span>
            <span className="mb-1.5">
              {trend ? (
                <TrendBadge value={trend.late} positiveIsGood={false} />
              ) : (
                total > 0 && late > 0 && (
                  <span className="inline-flex items-center text-sm font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">
                    {latePct}%
                  </span>
                )
              )}
            </span>
          </div>
          <Progress
            value={latePct}
            className="h-1.5 bg-amber-100 [&>[data-slot=progress-indicator]]:bg-amber-400"
          />
        </CardContent>
      </Card>

      <Card className="shadow-sm border-slate-200 rounded-2xl">
        <CardContent className="p-6 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <span className="text-base font-bold text-slate-600">Vắng Mặt</span>
            <div className="h-11 w-11 rounded-full bg-red-50 flex items-center justify-center">
              <XCircle className="h-6 w-6 text-red-400" strokeWidth={2} />
            </div>
          </div>
          <div className="flex items-end gap-3">
            <span className="text-5xl font-extrabold text-red-500">{absent}</span>
            <span className="mb-1.5">
              {trend ? (
                <TrendBadge value={trend.absent} positiveIsGood={false} />
              ) : (
                total > 0 && absent > 0 && (
                  <span className="inline-flex items-center text-sm font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">
                    {absentPct}%
                  </span>
                )
              )}
            </span>
          </div>
          <Progress
            value={absentPct}
            className="h-1.5 bg-red-100 [&>[data-slot=progress-indicator]]:bg-red-400"
          />
        </CardContent>
      </Card>

    </div>
  );
}
