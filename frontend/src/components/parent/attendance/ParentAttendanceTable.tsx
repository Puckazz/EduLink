'use client';

import { CalendarCheck, BookOpen, ShieldCheck, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { Attendance } from '@/types/attendance';


function RateChip({ rate }: { rate: number | null }) {
  if (rate === null) return <span className="text-sm text-muted-foreground">—</span>;
  const color =
    rate >= 80
      ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
      : rate >= 60
        ? 'bg-amber-100 text-amber-700 border-amber-200'
        : 'bg-red-100 text-red-600 border-red-200';
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${color}`}>
      {rate}%
    </span>
  );
}


function AttendanceStatus({ rate }: { rate: number | null }) {
  if (rate === null)
    return <span className="text-xs text-muted-foreground">Chưa có dữ liệu</span>;
  if (rate >= 80)
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
        <ShieldCheck className="h-3.5 w-3.5" /> Đạt yêu cầu
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-500">
      <AlertCircle className="h-3.5 w-3.5" /> Chưa đạt
    </span>
  );
}


function AttendanceTableSkeleton() {
  return (
    <div className="space-y-2 p-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-xl" />
      ))}
    </div>
  );
}

function AttendanceTableEmpty() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
        <BookOpen className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-muted-foreground">
        Không có dữ liệu chuyên cần cho học kỳ này.
      </p>
    </div>
  );
}


interface ParentAttendanceTableProps {
  records: Attendance[];
  loading: boolean;
}

export function ParentAttendanceTable({
  records,
  loading,
}: ParentAttendanceTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
        <h2 className="text-base font-bold text-foreground">Chi Tiết Theo Học Kỳ</h2>
      </div>

      {loading ? (
        <AttendanceTableSkeleton />
      ) : records.length === 0 ? (
        <AttendanceTableEmpty />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  {[
                    { label: 'Học kỳ',    align: 'left'   },
                    { label: 'Tổng buổi', align: 'center' },
                    { label: 'Có mặt',    align: 'center' },
                    { label: 'Đi muộn',   align: 'center' },
                    { label: 'Vắng mặt',  align: 'center' },
                    { label: 'Tỷ lệ',     align: 'center' },
                    { label: 'Trạng thái',align: 'center' },
                  ].map(({ label, align }) => (
                    <th
                      key={label}
                      className={`py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground ${
                        align === 'left' ? 'px-5 text-left' : 'px-3 text-center'
                      }`}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {records.map((att) => {
                  const late    = att.late_sessions;
                  const present = Math.max(0, att.total_sessions - att.absent_sessions - late);
                  const rate =
                    att.total_sessions > 0
                      ? Math.round(((present + late) / att.total_sessions) * 100)
                      : null;

                  return (
                    <tr key={att.attendance_id} className="group transition-colors hover:bg-muted/30">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                            <CalendarCheck className="h-4 w-4 text-slate-500" />
                          </span>
                          <span className="font-semibold text-foreground">
                            {att.term.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-4 text-center">
                        <span className="font-medium text-foreground">{att.total_sessions}</span>
                        <span className="ml-1 text-xs text-muted-foreground">buổi</span>
                      </td>
                      <td className="px-3 py-4 text-center font-semibold text-emerald-600">
                        {present}
                      </td>
                      <td className="px-3 py-4 text-center">
                        <span className={late > 0 ? 'font-semibold text-amber-500' : 'text-muted-foreground'}>
                          {late}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-center">
                        <span className={att.absent_sessions > 0 ? 'font-semibold text-red-500' : 'text-muted-foreground'}>
                          {att.absent_sessions}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-center">
                        <RateChip rate={rate} />
                      </td>
                      <td className="px-3 py-4 text-center">
                        <AttendanceStatus rate={rate} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-border px-5 py-3">
            <p className="text-xs text-muted-foreground">Hiển thị {records.length} học kỳ</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" />Đạt (≥ 80%)</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-400" />Đi muộn</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-400" />Vắng mặt</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
