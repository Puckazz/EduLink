import { Users, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  total: number;
  present: number;
  late: number;
  absent: number;
}

export function AttendanceStatsCards({ total, present, late, absent }: Props) {
  const presentPct = total > 0 ? Math.round((present / total) * 100) : 0;
  const latePct    = total > 0 ? Math.round((late    / total) * 100) : 0;
  const absentPct  = total > 0 ? Math.round((absent  / total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Students */}
      <Card className="shadow-sm border-slate-200">
        <CardContent className="p-5 flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <span className="text-sm font-bold text-slate-500">Tổng Sinh Viên</span>
            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-slate-400" />
            </div>
          </div>
          <span className="text-4xl font-extrabold text-slate-800">{total}</span>
        </CardContent>
      </Card>

      {/* Present */}
      <Card className="shadow-sm border-slate-200 relative overflow-hidden">
        <CardContent className="p-5 flex flex-col gap-3 pb-8">
          <div className="flex justify-between items-start">
            <span className="text-sm font-bold text-slate-500">Có Mặt</span>
            <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" strokeWidth={2.5} />
            </div>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-extrabold text-emerald-600">{present}</span>
            {total > 0 && (
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded mb-1.5">
                {presentPct}%
              </span>
            )}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-100">
            <div className="h-full bg-emerald-500 transition-all" style={{ width: `${presentPct}%` }} />
          </div>
        </CardContent>
      </Card>

      {/* Late */}
      <Card className="shadow-sm border-slate-200 relative overflow-hidden">
        <CardContent className="p-5 flex flex-col gap-3 pb-8">
          <div className="flex justify-between items-start">
            <span className="text-sm font-bold text-slate-500">Đi Muộn</span>
            <div className="h-8 w-8 rounded-full bg-amber-50 flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-400" strokeWidth={2.5} />
            </div>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-extrabold text-amber-500">{late}</span>
            {total > 0 && (
              <span className="text-xs font-bold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded mb-1.5">
                {latePct}%
              </span>
            )}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-100">
            <div className="h-full bg-amber-400 transition-all" style={{ width: `${latePct}%` }} />
          </div>
        </CardContent>
      </Card>

      {/* Absent */}
      <Card className="shadow-sm border-slate-200 relative overflow-hidden">
        <CardContent className="p-5 flex flex-col gap-3 pb-8">
          <div className="flex justify-between items-start">
            <span className="text-sm font-bold text-slate-500">Vắng Mặt</span>
            <div className="h-8 w-8 rounded-full bg-red-50 flex items-center justify-center">
              <XCircle className="h-5 w-5 text-red-400" strokeWidth={2.5} />
            </div>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-extrabold text-red-600">{absent}</span>
            {total > 0 && (
              <span className="text-xs font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded mb-1.5">
                {absentPct}%
              </span>
            )}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-100">
            <div className="h-full bg-red-500 transition-all" style={{ width: `${absentPct}%` }} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
