'use client';

import { useState, useMemo, useRef, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  CheckCircle2,
  Timer,
  XCircle,
  Minus,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type {
  StudentClassSection,
  AttendanceRecordStatus,
} from '@/services/attendance.service';


interface DaySession {
  subject_name: string;
  class_code: string;
  teacher_name: string;
  status: AttendanceRecordStatus;
  note: string | null;
  session_no: number;
}
interface DayData {
  sessions: DaySession[];
  dominant: AttendanceRecordStatus;
}


const DAY_VN = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const MONTH_VN = [
  'Tháng 1',
  'Tháng 2',
  'Tháng 3',
  'Tháng 4',
  'Tháng 5',
  'Tháng 6',
  'Tháng 7',
  'Tháng 8',
  'Tháng 9',
  'Tháng 10',
  'Tháng 11',
  'Tháng 12',
];

function toYMD(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function toLongLabel(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function buildDayMap(sections: StudentClassSection[]): Record<string, DayData> {
  const map: Record<string, DayData> = {};
  const priority: AttendanceRecordStatus[] = [
    'ABSENT',
    'LATE',
    'PRESENT',
    'NONE',
  ];
  for (const sec of sections) {
    for (const sess of sec.sessions) {
      const key = sess.session_date?.slice(0, 10);
      if (!key) continue;
      const status: AttendanceRecordStatus = sess.records[0]?.status ?? 'NONE';
      if (!map[key]) map[key] = { sessions: [], dominant: 'NONE' };
      map[key].sessions.push({
        subject_name: sec.subject.subject_name,
        class_code: sec.class_code,
        teacher_name: sec.teacher_name,
        status,
        session_no: sess.session_no,
        note: sess.records[0]?.note ?? null,
      });
    }
  }
  for (const k of Object.keys(map)) {
    const sts = map[k].sessions.map((s) => s.status);
    map[k].dominant = priority.find((p) => sts.includes(p)) ?? 'NONE';
  }
  return map;
}


const S: Record<
  AttendanceRecordStatus,
  {
    label: string;
    dot: string;
    badge: string;
    icon: React.ReactNode;
  }
> = {
  PRESENT: {
    label: 'Có mặt',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  LATE: {
    label: 'Đi muộn',
    dot: 'bg-amber-400',
    badge: 'bg-amber-100 text-amber-700 border border-amber-200',
    icon: <Timer className="h-3.5 w-3.5" />,
  },
  ABSENT: {
    label: 'Vắng mặt',
    dot: 'bg-red-500',
    badge: 'bg-red-100 text-red-700 border border-red-200',
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
  NONE: {
    label: 'Chưa ghi',
    dot: 'bg-slate-300',
    badge: 'bg-slate-100 text-slate-500 border border-slate-200',
    icon: <Minus className="h-3.5 w-3.5" />,
  },
};

function Badge({ status }: { status: AttendanceRecordStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${S[status].badge}`}
    >
      {S[status].icon}
      {S[status].label}
    </span>
  );
}


interface PopupProps {
  dateKey: string;
  data: DayData;
  rect: DOMRect;
  onClose: () => void;
  onKeepOpen: () => void;
  onDetail: () => void;
}

function HoverPopup({
  dateKey,
  data,
  rect,
  onClose,
  onKeepOpen,
  onDetail,
}: PopupProps) {
  const POPUP_W = 220;
  const { present, late, absent } = data.sessions.reduce(
    (acc, s) => {
      if (s.status === 'PRESENT') acc.present++;
      else if (s.status === 'LATE') acc.late++;
      else if (s.status === 'ABSENT') acc.absent++;
      return acc;
    },
    { present: 0, late: 0, absent: 0 },
  );

  const vpW = window.innerWidth;
  let left = rect.left;
  if (left + POPUP_W > vpW - 8) left = vpW - POPUP_W - 8;

  const above = rect.top > 260;
  const top = above ? rect.top - 8 : rect.bottom + 8;

  return (
    <div
      className="fixed z-50 w-[220px] overflow-hidden rounded-2xl border border-border bg-popover shadow-2xl"
      style={{ top, left, transform: above ? 'translateY(-100%)' : undefined }}
      onMouseEnter={onKeepOpen}
      onMouseLeave={onClose}
    >
      <div className="border-b border-border px-4 py-3">
        <p className="text-xs font-bold capitalize text-foreground leading-tight">
          {toLongLabel(dateKey)}
        </p>
        <p className="text-[11px] text-muted-foreground">
          {data.sessions.length} buổi học
        </p>
      </div>

      <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
        {[
          { label: 'Có mặt', val: present, color: 'text-emerald-600' },
          { label: 'Đi muộn', val: late, color: 'text-amber-600' },
          { label: 'Vắng', val: absent, color: 'text-red-600' },
        ].map(({ label, val, color }) => (
          <div key={label} className="flex flex-col items-center py-2.5">
            <span className={`text-lg font-black leading-none ${color}`}>
              {val}
            </span>
            <span className="mt-0.5 text-[9px] text-muted-foreground">
              {label}
            </span>
          </div>
        ))}
      </div>

      <div className="divide-y divide-border/50">
        {data.sessions.slice(0, 2).map((s, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-2 px-4 py-2.5"
          >
            <p className="min-w-0 truncate text-[11px] font-medium text-foreground">
              {s.subject_name}
            </p>
            <Badge status={s.status} />
          </div>
        ))}
        {data.sessions.length > 2 && (
          <p className="px-4 py-1.5 text-[10px] text-muted-foreground">
            +{data.sessions.length - 2} buổi khác...
          </p>
        )}
      </div>

      <div className="border-t border-border p-3">
        <button
          onClick={onDetail}
          className="w-full rounded-xl bg-slate-900 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-700 active:scale-95"
        >
          Xem chi tiết →
        </button>
      </div>
    </div>
  );
}


function DetailDialog({
  open,
  dateKey,
  data,
  onClose,
}: {
  open: boolean;
  dateKey: string | null;
  data: DayData | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md rounded-2xl border-border bg-card p-0 overflow-hidden">
        <DialogHeader className="border-b border-border px-5 py-4">
          <DialogTitle className="text-sm font-bold capitalize text-foreground">
            {dateKey ? toLongLabel(dateKey) : ''}
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            Chi tiết điểm danh từng buổi học
          </p>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto px-5 py-4 space-y-3">
          {data?.sessions.map((s, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl border border-border bg-background"
            >
              <div className="flex items-start justify-between gap-3 px-4 py-3 border-b border-border/60">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground leading-tight">
                    {s.subject_name}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {s.class_code} · Buổi số {s.session_no}
                  </p>
                </div>
                <Badge status={s.status} />
              </div>

              <div className="px-4 py-2.5 space-y-1.5">
                <p className="text-[11px] text-muted-foreground">
                  <span className="font-medium text-foreground">
                    Giáo viên:
                  </span>{' '}
                  {s.teacher_name}
                </p>

                {s.note && (
                  <div className="rounded-lg bg-muted/60 px-3 py-2 text-[11px] italic text-muted-foreground">
                    💬 {s.note}
                  </div>
                )}

                {s.status === 'ABSENT' && (
                  <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-[11px] text-red-700">
                    ⚠️ Buổi vắng này ảnh hưởng trực tiếp đến tỷ lệ chuyên cần.
                    Liên hệ nhà trường nếu có lý do.
                  </div>
                )}
                {s.status === 'LATE' && (
                  <div className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-[11px] text-amber-700">
                    ⏰ Đi muộn — nên thông báo cho giáo viên để được ghi nhận lý
                    do.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}


export interface ParentAttendanceCalendarCardProps {
  sections: StudentClassSection[];
  loading?: boolean;
}

export function ParentAttendanceCalendarCard({
  sections,
  loading = false,
}: ParentAttendanceCalendarCardProps) {
  const today = new Date();
  const defaultMonth = useMemo(() => {
    let latest: Date | null = null;
    for (const sec of sections) {
      for (const sess of sec.sessions) {
        if (!sess.session_date) continue;
        const d = new Date(`${sess.session_date.slice(0, 10)}T00:00:00`);
        if (!latest || d > latest) latest = d;
      }
    }
    if (latest) return new Date(latest.getFullYear(), latest.getMonth(), 1);
    return new Date(today.getFullYear(), today.getMonth(), 1);
  }, [sections, today]);

  const [viewDate, setViewDate] = useState(() => defaultMonth);

  const [hoverKey, setHoverKey] = useState<string | null>(null);
  const [hoverRect, setHoverRect] = useState<DOMRect | null>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [dialogKey, setDialogKey] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const dayMap = useMemo(() => buildDayMap(sections), [sections]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const todayYMD = toYMD(today);

  const cells = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const result: Array<{ day: number | null; key: string }> = [];
    for (let i = 0; i < firstDay; i++)
      result.push({ day: null, key: `pad-${i}` });
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      result.push({ day: d, key });
    }
    return result;
  }, [year, month]);


  const showPopup = useCallback((key: string, rect: DOMRect) => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setHoverKey(key);
    setHoverRect(rect);
  }, []);

  const scheduleHide = useCallback(() => {
    hoverTimer.current = setTimeout(() => {
      setHoverKey(null);
      setHoverRect(null);
    }, 120);
  }, []);

  const cancelHide = useCallback(() => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
  }, []);

  const openDetail = useCallback((key: string) => {
    setHoverKey(null);
    setHoverRect(null);
    setDialogKey(key);
    setDialogOpen(true);
  }, []);

  if (loading) return <Skeleton className="h-[380px] w-full rounded-2xl" />;

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-3 border-b border-border px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
            <CalendarDays className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">
              Lịch Điểm Danh
            </h2>
            <p className="text-sm text-muted-foreground">
              Di chuột vào ngày có màu để xem tổng quan · Click &quot;Xem chi
              tiết&quot; để xem đầy đủ
            </p>
          </div>
        </div>

        <div className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-bold text-foreground">
              {MONTH_VN[month]} {year}
            </h3>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setHoverKey(null);
                  setHoverRect(null);
                  setViewDate(
                    (d) => new Date(d.getFullYear(), d.getMonth() - 1, 1),
                  );
                }}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-background hover:bg-muted transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  setHoverKey(null);
                  setHoverRect(null);
                  setViewDate(
                    new Date(today.getFullYear(), today.getMonth(), 1),
                  );
                }}
                className="h-7 rounded-lg border border-border bg-background px-3 text-xs font-medium hover:bg-muted transition-colors"
              >
                Hôm nay
              </button>
              <button
                onClick={() => {
                  setHoverKey(null);
                  setHoverRect(null);
                  setViewDate(
                    (d) => new Date(d.getFullYear(), d.getMonth() + 1, 1),
                  );
                }}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-background hover:bg-muted transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mb-1.5 grid grid-cols-7 gap-1.5">
            {DAY_VN.map((d) => (
              <div
                key={d}
                className="py-1 text-center text-[11px] font-semibold text-muted-foreground"
              >
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {cells.map(({ day, key }) => {
              if (!day) return <div key={key} />;
              const data = dayMap[key];
              const isToday = key === todayYMD;

              return (
                <div
                  key={key}
                  className={`
                    relative flex flex-col items-center justify-center rounded-xl pt-1.5 pb-2 min-h-[52px] select-none
                    transition-all duration-150
                    ${data ? 'ring-1 ring-border/60 hover:bg-muted/30 cursor-default' : 'hover:bg-muted/40'}
                    ${isToday ? 'ring-2 ring-sky-400 ring-offset-1' : ''}
                  `}
                  onMouseEnter={
                    data
                      ? (e) => {
                          cancelHide();
                          showPopup(
                            key,
                            (
                              e.currentTarget as HTMLElement
                            ).getBoundingClientRect(),
                          );
                        }
                      : undefined
                  }
                  onMouseLeave={data ? scheduleHide : undefined}
                >
                  <span
                    className={`text-[13px] font-bold leading-none ${isToday ? 'text-sky-600' : 'text-foreground'}`}
                  >
                    {day}
                  </span>
                  {data && data.sessions.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap justify-center gap-[3px]">
                      {data.sessions.slice(0, 4).map((sess, si) => (
                        <span
                          key={si}
                          className={`h-1.5 w-1.5 rounded-full ${S[sess.status].dot}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 border-t border-border pt-4 text-[11px] text-muted-foreground">
            {(['PRESENT', 'LATE', 'ABSENT'] as AttendanceRecordStatus[]).map(
              (s) => (
                <span key={s} className="flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${S[s].dot}`} />
                  {S[s].label}
                </span>
              ),
            )}
            <span className="ml-auto flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full ring-2 ring-sky-400" />
              Hôm nay
            </span>
          </div>
        </div>
      </div>

      {hoverKey && hoverRect && dayMap[hoverKey] && (
        <HoverPopup
          dateKey={hoverKey}
          data={dayMap[hoverKey]}
          rect={hoverRect}
          onClose={scheduleHide}
          onKeepOpen={cancelHide}
          onDetail={() => openDetail(hoverKey)}
        />
      )}

      <DetailDialog
        open={dialogOpen}
        dateKey={dialogKey}
        data={dialogKey ? (dayMap[dialogKey] ?? null) : null}
        onClose={() => setDialogOpen(false)}
      />
    </>
  );
}
