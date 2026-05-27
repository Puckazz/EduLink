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
  const totalSessions = attendance.reduce(
    (sum, record) => sum + record.total_sessions,
    0,
  );
  const absentSessions = attendance.reduce(
    (sum, record) => sum + record.absent_sessions,
    0,
  );
  const lateSessions = attendance.reduce(
    (sum, record) => sum + record.late_sessions,
    0,
  );
  const presentSessions = Math.max(
    0,
    totalSessions - absentSessions - lateSessions,
  );
  const attendanceRate =
    totalSessions > 0
      ? Math.round(((presentSessions + lateSessions) / totalSessions) * 100)
      : null;
  const latestRecordWithAbsence =
    attendance.find((record) => record.absent_sessions > 0) ?? null;

  const getRecordRate = (record: Attendance) => {
    if (record.total_sessions === 0) return null;

    const present = Math.max(
      0,
      record.total_sessions - record.absent_sessions - record.late_sessions,
    );
    return Math.round(
      ((present + record.late_sessions) / record.total_sessions) * 100,
    );
  };

  return (
    <Card className="border-slate-100 bg-white shadow-sm">
      <CardContent className="space-y-5 p-6">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
              <CalendarDays className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold tracking-tight text-slate-900">
              Tổng quan chuyên cần
            </h2>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-slate-400">Tỷ lệ có mặt</p>
            <p className="text-xs font-bold text-slate-700">
              {attendanceRate === null ? '-' : `${attendanceRate}%`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <StatBox label="Có mặt" value={presentSessions} className="text-emerald-600" />
          <StatBox label="Vắng" value={absentSessions} className="text-red-600" />
          <StatBox label="Trễ" value={lateSessions} className="text-amber-600" />
        </div>

        {attendance.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-400">
            Chưa có dữ liệu chuyên cần.
          </p>
        ) : (
          <div className="space-y-2">
            {attendance.slice(0, 3).map((record) => {
              const rate = getRecordRate(record);

              return (
                <div
                  key={record.attendance_id}
                  className="rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2.5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="min-w-0 truncate text-sm font-semibold text-slate-800">
                      {record.term.name}
                    </p>
                    <span className="shrink-0 text-xs font-bold text-slate-500">
                      {rate === null ? '-' : `${rate}%`}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {record.total_sessions} buổi • Vắng {record.absent_sessions} • Trễ{' '}
                    {record.late_sessions}
                  </p>
                </div>
              );
            })}
          </div>
        )}

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
            <span className="h-2.5 w-2.5 rounded-sm bg-amber-500" />
            Trễ
          </span>
        </div>

        {latestRecordWithAbsence && (
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Ghi chú gần nhất:
            </p>
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-700 leading-relaxed italic">
              &ldquo;{latestRecordWithAbsence.term.name}: Vắng{' '}
              {latestRecordWithAbsence.absent_sessions}/
              {latestRecordWithAbsence.total_sessions} buổi. Cần nhắc nhở sinh
              viên.&rdquo;
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatBox({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className: string;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 text-center">
      <p className={`text-lg font-black leading-none ${className}`}>{value}</p>
      <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
    </div>
  );
}
