import { Users, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function AttendanceStatsCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Students */}
      <Card className="shadow-sm border-slate-200">
        <CardContent className="p-5 flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <span className="text-sm font-bold text-slate-500">Tổng Sinh Viên</span>
            <Users className="h-6 w-6 text-slate-300" />
          </div>
          <span className="text-4xl font-extrabold text-slate-800 dark:text-slate-100">45</span>
        </CardContent>
      </Card>

      {/* Present */}
      <Card className="shadow-sm border-slate-200 relative overflow-hidden">
        <CardContent className="p-5 flex flex-col gap-3 pb-8">
          <div className="flex justify-between items-start">
            <span className="text-sm font-bold text-slate-500">Có Mặt</span>
            <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-emerald-300" strokeWidth={3} />
            </div>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-extrabold text-emerald-600">40</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-sm mb-1.5">+2%</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-100">
            <div className="h-full bg-emerald-500 w-[88%]" />
          </div>
        </CardContent>
      </Card>

      {/* Late */}
      <Card className="shadow-sm border-slate-200 relative overflow-hidden">
        <CardContent className="p-5 flex flex-col gap-3 pb-8">
          <div className="flex justify-between items-start">
            <span className="text-sm font-bold text-slate-500">Đi Muộn</span>
            <div className="h-8 w-8 rounded-full bg-amber-50 flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-300" strokeWidth={3} />
            </div>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-extrabold text-amber-500">2</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-100">
            <div className="h-full bg-amber-400 w-[15%]" />
          </div>
        </CardContent>
      </Card>

      {/* Absent */}
      <Card className="shadow-sm border-slate-200 relative overflow-hidden">
        <CardContent className="p-5 flex flex-col gap-3 pb-8">
          <div className="flex justify-between items-start">
            <span className="text-sm font-bold text-slate-500">Vắng Mặt</span>
            <div className="h-8 w-8 rounded-full bg-pink-50 flex items-center justify-center">
              <XCircle className="h-5 w-5 text-pink-300" strokeWidth={3} />
            </div>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-extrabold text-pink-600">3</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-100">
            <div className="h-full bg-pink-500 w-[20%]" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
