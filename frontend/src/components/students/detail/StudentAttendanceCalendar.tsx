'use client';

import { CalendarDays } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { Attendance } from '@/types/attendance';

interface StudentAttendanceCalendarProps {
  attendance: Attendance[];
}

export function StudentAttendanceCalendar({
  attendance,
}: StudentAttendanceCalendarProps) {
  const totalSessions = attendance.reduce((s, a) => s + a.total_sessions, 0);
  const absentSessions = attendance.reduce((s, a) => s + a.absent_sessions, 0);
  const presentSessions = Math.max(0, totalSessions - absentSessions);

  const today = new Date();
  const monthYear = today.toLocaleDateString('vi-VN', {
    month: 'long',
    year: 'numeric',
  });

  const filledSlots = Math.min(totalSessions, 10);
  const presentInTen =
    filledSlots > 0 ? Math.round((presentSessions / totalSessions) * filledSlots) : 0;

  const slots: { day: number; present: boolean | null }[] = [];
  for (let i = 0; i < 10; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - (9 - i));
    let present: boolean | null = null;
    if (i < filledSlots) {
      present = i < presentInTen;
    }
    slots.push({ day: date.getDate(), present });
  }

  const getCellStyle = (present: boolean | null) => {
    if (present === null) return 'bg-slate-100 text-slate-400';
    if (present) return 'bg-emerald-500 text-white shadow-sm';
    return 'bg-red-500 text-white shadow-sm';
  };

  const latestRecord = attendance[attendance.length - 1] ?? null;

  return (
    <Card className="border-slate-100 bg-white shadow-sm">
      <CardContent className="space-y-5 p-6">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
              <CalendarDays className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold tracking-tight text-slate-900">
              Lịch sử điểm danh
            </h2>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-slate-400 capitalize">{monthYear}</p>
            <p className="text-xs font-bold text-slate-700">
              {presentSessions}/{totalSessions} ngày
            </p>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {slots.map((slot, idx) => (
            <div key={idx} className="flex flex-col items-center gap-1">
              <div
                className={`flex h-10 w-full items-center justify-center rounded-lg text-sm font-bold transition-all select-none ${getCellStyle(slot.present)}`}
              >
                {slot.day}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-500 pt-0.5">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
            Có mặt
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-red-500" />
            Vắng
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-slate-200" />
            Chưa đánh dấu
          </span>
        </div>

        {latestRecord && latestRecord.absent_sessions > 0 && (
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Ghi chú gần nhất:
            </p>
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-700 leading-relaxed italic">
              &ldquo;{latestRecord.term.name}: Vắng {latestRecord.absent_sessions}/{latestRecord.total_sessions} buổi. Cần nhắc nhở sinh viên.&rdquo;
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
