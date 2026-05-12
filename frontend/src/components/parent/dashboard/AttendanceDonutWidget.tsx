import { CalendarCheck } from 'lucide-react';
import type { Attendance } from '@/types/attendance';

interface AttendanceDonutWidgetProps {
  attendance: Attendance[];
  isLoading: boolean;
}

export function AttendanceDonutWidget({ attendance, isLoading }: AttendanceDonutWidgetProps) {
  const totalSessions = attendance.reduce((s, a) => s + a.total_sessions, 0);
  const absentSessions = attendance.reduce((s, a) => s + a.absent_sessions, 0);
  const presentSessions = Math.max(0, totalSessions - absentSessions);
  const rate = totalSessions > 0 ? Math.round((presentSessions / totalSessions) * 100) : 0;

  const isPresent = rate >= 80;

  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - rate / 100);

  const today = new Date().toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
  });

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-slate-50 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white">
            <CalendarCheck className="h-3.5 w-3.5" />
          </div>
          <span className="text-sm font-bold text-slate-900">Điểm danh</span>
        </div>
        <span className="text-xs text-slate-400">Hôm nay, {today}</span>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-5 py-6">
        {isLoading ? (
          <div className="h-40 w-40 animate-pulse rounded-full bg-slate-100" />
        ) : (
          <>
            <div className="relative flex items-center justify-center">
              <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="-rotate-90"
              >
                <circle
                  cx={cx} cy={cy} r={radius}
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="16"
                />
                <circle
                  cx={cx} cy={cy} r={radius}
                  fill="none"
                  stroke={isPresent ? '#0f172a' : '#ef4444'}
                  strokeWidth="16"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={totalSessions === 0 ? circumference : offset}
                  className="transition-all duration-700"
                />
              </svg>
              <span className="absolute text-3xl font-black text-slate-900 tabular-nums">
                {totalSessions > 0 ? `${rate}%` : '—'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  totalSessions === 0
                    ? 'bg-slate-300'
                    : isPresent
                      ? 'bg-emerald-500'
                      : 'bg-red-500'
                }`}
              />
              <span
                className={`text-sm font-bold ${
                  totalSessions === 0
                    ? 'text-slate-400'
                    : isPresent
                      ? 'text-emerald-600'
                      : 'text-red-600'
                }`}
              >
                {totalSessions === 0
                  ? 'Chưa có dữ liệu'
                  : isPresent
                    ? 'Có mặt'
                    : 'Vắng mặt'}
              </span>
            </div>

            {totalSessions > 0 && (
              <div className="text-center text-xs text-slate-400 space-y-0.5 leading-relaxed">
                <p>Đã tham gia {presentSessions}/{totalSessions} buổi học</p>
                {absentSessions > 0 && (
                  <p className="text-red-400 font-medium">Vắng {absentSessions} buổi</p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
