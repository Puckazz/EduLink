'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, MapPin, User, CalendarDays } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import type { StudentClassSection, ClassStatus } from '@/services/attendance.service';


const DAY_OF_WEEK_MAP: Record<string, number> = {
  'Chủ nhật': 0, 'Chủ Nhật': 0,
  'Thứ 2': 1, 'Thứ Hai': 1,
  'Thứ 3': 2, 'Thứ Ba': 2,
  'Thứ 4': 3, 'Thứ Tư': 3,
  'Thứ 5': 4, 'Thứ Năm': 4,
  'Thứ 6': 5, 'Thứ Sáu': 5,
  'Thứ 7': 6, 'Thứ Bảy': 6,
  CN: 0, T2: 1, T3: 2, T4: 3, T5: 4, T6: 5, T7: 6,
  Sunday: 0, Sun: 0, Monday: 1, Mon: 1, Tuesday: 2, Tue: 2,
  Wednesday: 3, Wed: 3, Thursday: 4, Thu: 4, Friday: 5, Fri: 5,
  Saturday: 6, Sat: 6,
};

const GRID_DAYS = [
  { label: 'Thứ 2', dayIndex: 1 },
  { label: 'Thứ 3', dayIndex: 2 },
  { label: 'Thứ 4', dayIndex: 3 },
  { label: 'Thứ 5', dayIndex: 4 },
  { label: 'Thứ 6', dayIndex: 5 },
  { label: 'Thứ 7', dayIndex: 6 },
  { label: 'CN',    dayIndex: 0 },
];

const TIME_PERIODS = [
  { id: 'morning',   label: 'Sáng',  sub: '07:00 – 12:00', startHour: 0,  endHour: 12 },
  { id: 'afternoon', label: 'Chiều', sub: '12:00 – 18:00', startHour: 12, endHour: 24 },
];

const STATUS_COLORS: Record<ClassStatus, {
  bg: string; border: string; title: string; meta: string; dot: string; label: string;
}> = {
  ONGOING:  { bg: 'bg-emerald-50', border: 'border-emerald-200', title: 'text-emerald-800', meta: 'text-emerald-600', dot: 'bg-emerald-500', label: 'Đang học' },
  UPCOMING: { bg: 'bg-violet-50',  border: 'border-violet-200',  title: 'text-violet-800',  meta: 'text-violet-600',  dot: 'bg-violet-500',  label: 'Sắp học'  },
  FINISHED: { bg: 'bg-slate-50',   border: 'border-slate-200',   title: 'text-slate-500',   meta: 'text-slate-400',   dot: 'bg-slate-400',   label: 'Kết thúc' },
};


function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekDates(monday: Date): Record<number, Date> {
  const map: Record<number, Date> = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const idx = d.getDay();
    map[idx] = d;
  }
  return map;
}

function fmtShort(d: Date) {
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

function getWeekNumber(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7);
}

function parseHour(t: string): number {
  return parseInt((t || '0').split(':')[0], 10);
}


function SectionCard({
  section,
  onClick,
}: {
  section: StudentClassSection;
  onClick: () => void;
}) {
  const c = STATUS_COLORS[section.status];
  return (
    <button
      onClick={onClick}
      className={`
        w-full rounded-xl border p-2.5 text-left
        transition-all hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]
        ${c.bg} ${c.border}
      `}
    >
      <div className="mb-1.5 flex items-center justify-between gap-1">
        <p className={`text-[12px] font-bold leading-tight ${c.title} flex-1 truncate`}>
          {section.subject.subject_name}
        </p>
        <span className={`h-2 w-2 shrink-0 rounded-full ${c.dot}`} />
      </div>
      <p className={`mb-1 text-[11px] font-medium ${c.meta}`}>
        {section.start_time} – {section.end_time}
      </p>
      <div className={`mb-0.5 flex items-center gap-1 text-[11px] ${c.meta}`}>
        <MapPin className="h-3 w-3 shrink-0" />
        <span className="truncate">{section.room}</span>
      </div>
      <div className={`flex items-center gap-1 text-[11px] ${c.meta}`}>
        <User className="h-3 w-3 shrink-0" />
        <span className="truncate">{section.teacher_name}</span>
      </div>
    </button>
  );
}


interface ParentScheduleWeeklyGridProps {
  sections: StudentClassSection[];
  loading?: boolean;
  onSectionClick: (section: StudentClassSection) => void;
}

export function ParentScheduleWeeklyGrid({
  sections,
  loading = false,
  onSectionClick,
}: ParentScheduleWeeklyGridProps) {
  const [weekOffset, setWeekOffset] = useState(0);

  const today    = useMemo(() => new Date(), []);
  const todayStr  = useMemo(() => today.toDateString(), [today]);


  const monday = useMemo(() => {
    const m = getMonday(today);
    m.setDate(m.getDate() + weekOffset * 7);
    return m;
  }, [today, weekOffset]);

  const sunday = useMemo(() => {
    const s = new Date(monday);
    s.setDate(monday.getDate() + 6);
    return s;
  }, [monday]);

  const weekDates = useMemo(() => getWeekDates(monday), [monday]);
  const weekNo    = getWeekNumber(monday);

  const sectionsByDay = useMemo(() => {
    const map: Record<number, StudentClassSection[]> = {};
    for (const s of sections) {
      if (s.status === 'UPCOMING') continue;
      const idx = DAY_OF_WEEK_MAP[s.day_of_week] ?? -1;
      if (idx === -1) continue;
      if (!map[idx]) map[idx] = [];
      map[idx].push(s);
    }
    for (const k of Object.keys(map)) {
      map[Number(k)].sort((a, b) => a.start_time.localeCompare(b.start_time));
    }
    return map;
  }, [sections]);


  if (loading) return <Skeleton className="h-[400px] w-full rounded-2xl" />;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
            <CalendarDays className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">Lịch Học Theo Tuần</h2>
            <p className="text-sm text-muted-foreground">Nhấp vào môn để xem chi tiết</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8"
            onClick={() => setWeekOffset((o) => o - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <span className="min-w-[200px] text-center text-sm font-semibold text-foreground">
            Tuần {weekNo}: {fmtShort(monday)} – {fmtShort(sunday)}
          </span>

          <Button variant="outline" size="icon" className="h-8 w-8"
            onClick={() => setWeekOffset((o) => o + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>

          {weekOffset !== 0 && (
            <Button variant="outline" size="sm" className="h-8 text-xs"
              onClick={() => setWeekOffset(0)}>
              Hôm nay
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] border-collapse">
          <thead>
            <tr>
              <th className="w-[88px] border-b border-r border-border bg-muted/40 px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">
                Thời gian
              </th>
              {GRID_DAYS.map(({ label, dayIndex }) => {
                const date   = weekDates[dayIndex];
                const isToday = date?.toDateString() === todayStr;
                return (
                  <th
                    key={dayIndex}
                    className={`border-b border-r border-border px-2 py-2.5 text-center text-xs font-semibold last:border-r-0 ${
                      isToday ? 'bg-primary text-primary-foreground' : 'bg-muted/40 text-foreground'
                    }`}
                  >
                    <div>{label}</div>
                    {date && (
                      <div className={`mt-0.5 text-[11px] font-normal ${isToday ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                        {fmtShort(date)}
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {TIME_PERIODS.map((period) => (
              <tr key={period.id} className="border-b border-border last:border-b-0">
                <td className="border-r border-border bg-muted/20 px-3 py-3 align-top">
                  <p className="text-xs font-bold text-foreground">{period.label}</p>
                  <p className="mt-0.5 text-[10px] leading-tight text-muted-foreground">
                    {period.sub}
                  </p>
                </td>

                {GRID_DAYS.map(({ dayIndex }) => {
                  const date    = weekDates[dayIndex];
                  const isToday = date?.toDateString() === todayStr;
                  const cells   = (sectionsByDay[dayIndex] ?? []).filter((s) => {
                    const h = parseHour(s.start_time);
                    return h >= period.startHour && h < period.endHour;
                  });

                  return (
                    <td
                      key={dayIndex}
                      className={`min-h-[110px] border-r border-border p-1.5 align-top last:border-r-0 ${
                        isToday ? 'bg-primary/5' : ''
                      }`}
                    >
                      <div className="flex flex-col gap-1.5">
                        {cells.map((s) => (
                          <SectionCard
                            key={s.section_id}
                            section={s}
                            onClick={() => onSectionClick(s)}
                          />
                        ))}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}

            {sections.length === 0 && (
              <tr>
                <td colSpan={8} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                      <CalendarDays className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">Không có lịch học nào.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-border px-5 py-3 text-[11px]">
        <span className="font-semibold text-muted-foreground">Chú thích:</span>
        {(['ONGOING', 'FINISHED'] as const).map((status) => {
          const c = STATUS_COLORS[status];
          return (
            <span
              key={status}
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-medium ${c.bg} ${c.border} ${c.title}`}
            >
              <span className={`h-2 w-2 shrink-0 rounded-full ${c.dot}`} />
              {c.label}
            </span>
          );
        })}
        <span className="ml-auto text-muted-foreground italic">
        </span>
      </div>
    </div>
  );
}
