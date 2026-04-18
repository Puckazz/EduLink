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
  // Compute totals from semester-level records
  const totalSessions = attendance.reduce((s, a) => s + a.total_sessions, 0);
  const absentSessions = attendance.reduce((s, a) => s + a.absent_sessions, 0);
  const presentSessions = Math.max(0, totalSessions - absentSessions);

  const attendanceRate =
    totalSessions > 0
      ? Math.round((presentSessions / totalSessions) * 100)
      : null;

  // Generate a visual representation of the last 10 "virtual" session slots
  // based on aggregated data – shade absent ones red, present green
  const today = new Date();
  const slots: { day: number; present: boolean | null }[] = [];

  // Build a simple visual from present/absent ratio
  const filledSlots = Math.min(totalSessions, 10);
  const presentInTen =
    filledSlots > 0 ? Math.round((presentSessions / totalSessions) * filledSlots) : 0;

  for (let i = 0; i < 10; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - (9 - i));
    let present: boolean | null = null;
    if (i < filledSlots) {
      present = i < presentInTen;
    }
    slots.push({ day: date.getDate(), present });
  }

  const monthYear = today.toLocaleDateString('vi-VN', {
    month: 'long',
    year: 'numeric',
  });

  const getCellStyle = (present: boolean | null) => {
    if (present === null) return 'bg-slate-100 text-slate-400';
    if (present) return 'bg-emerald-500 text-white';
    return 'bg-red-500 text-white';
  };

  // Latest semester info for the note
  const latestRecord = attendance[attendance.length - 1] ?? null;

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardContent className="space-y-5 p-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-slate-600" />
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

        {/* 5x2 grid of visual slots */}
        <div className="grid grid-cols-5 gap-2">
          {slots.map((slot, idx) => (
            <div key={idx} className="flex flex-col items-center gap-1">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold transition-colors select-none ${getCellStyle(slot.present)}`}
              >
                {slot.day}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-emerald-500" />
            Có mặt
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-red-500" />
            Vắng
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-slate-200" />
            Chưa đánh dấu
          </span>
        </div>

        {/* Note based on latest semester */}
        {latestRecord && latestRecord.absent_sessions > 0 && (
          <div className="space-y-1.5">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
              Ghi chú gần nhất:
            </p>
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 leading-relaxed italic">
              &ldquo;Học kỳ {latestRecord.semester}: Vắng {latestRecord.absent_sessions}/{latestRecord.total_sessions} buổi. Cần nhắc nhở sinh viên.&rdquo;
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
