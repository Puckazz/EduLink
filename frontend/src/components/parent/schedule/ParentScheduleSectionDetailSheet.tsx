'use client';

import { X, BookOpen, User, MapPin, Clock, Calendar, Award, CheckCircle2, Timer, XCircle, Minus } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet';
import type {
  StudentClassSection,
  ClassStatus,
  AttendanceRecordStatus,
} from '@/types/attendance';


const STATUS_BADGE: Record<ClassStatus, string> = {
  ONGOING:  'bg-emerald-100 text-emerald-700 border-emerald-200',
  UPCOMING: 'bg-violet-100 text-violet-700 border-violet-200',
  FINISHED: 'bg-slate-100 text-slate-500 border-slate-200',
};

const STATUS_LABEL: Record<ClassStatus, string> = {
  ONGOING:  'Đang học',
  UPCOMING: 'Chưa mở',
  FINISHED: 'Kết thúc',
};

const DAY_VN: Record<string, string> = {
  'Thứ 2': 'Thứ Hai',   'Thứ Hai': 'Thứ Hai',
  'Thứ 3': 'Thứ Ba',    'Thứ Ba': 'Thứ Ba',
  'Thứ 4': 'Thứ Tư',    'Thứ Tư': 'Thứ Tư',
  'Thứ 5': 'Thứ Năm',   'Thứ Năm': 'Thứ Năm',
  'Thứ 6': 'Thứ Sáu',   'Thứ Sáu': 'Thứ Sáu',
  'Thứ 7': 'Thứ Bảy',   'Thứ Bảy': 'Thứ Bảy',
  'Chủ nhật': 'Chủ Nhật', 'Chủ Nhật': 'Chủ Nhật',
  T2: 'Thứ Hai', T3: 'Thứ Ba', T4: 'Thứ Tư',
  T5: 'Thứ Năm', T6: 'Thứ Sáu', T7: 'Thứ Bảy', CN: 'Chủ Nhật',
  Mon: 'Thứ Hai',   Monday: 'Thứ Hai',
  Tue: 'Thứ Ba',    Tuesday: 'Thứ Ba',
  Wed: 'Thứ Tư',    Wednesday: 'Thứ Tư',
  Thu: 'Thứ Năm',   Thursday: 'Thứ Năm',
  Fri: 'Thứ Sáu',   Friday: 'Thứ Sáu',
  Sat: 'Thứ Bảy',   Saturday: 'Thứ Bảy',
  Sun: 'Chủ Nhật',  Sunday: 'Chủ Nhật',
};

const RECORD_STATUS_CONFIG: Record<AttendanceRecordStatus, {
  label: string;
  dot: string;
  badge: string;
  icon: React.ReactNode;
}> = {
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


function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        {icon}
      </div>
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}


interface ParentScheduleSectionDetailSheetProps {
  section: StudentClassSection | null;
  open: boolean;
  onClose: () => void;
}

export function ParentScheduleSectionDetailSheet({
  section,
  open,
  onClose,
}: ParentScheduleSectionDetailSheetProps) {
  if (!section) return null;

  const sessionStats = section.sessions.reduce(
    (acc, sess) => {
      const status = sess.records[0]?.status ?? 'NONE';
      acc[status] = (acc[status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        showCloseButton={false}
        className="w-full sm:max-w-[480px] overflow-y-auto p-0 border-border bg-card"
      >
        <SheetHeader className="border-b border-border px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="mb-1.5 flex items-center gap-2">
                <span className="inline-flex rounded-md bg-muted px-2 py-0.5 text-xs font-mono font-medium text-foreground">
                  {section.class_code}
                </span>
                <span
                  className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${STATUS_BADGE[section.effectiveStatus]}`}
                >
                  {STATUS_LABEL[section.effectiveStatus]}
                </span>
              </div>
              <SheetTitle className="text-base font-bold text-foreground leading-tight">
                {section.subject.subject_name}
              </SheetTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {section.subject.subject_code}
              </p>
            </div>
            <SheetClose className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors">
              <X className="h-4 w-4" />
            </SheetClose>
          </div>
        </SheetHeader>

        <div className="px-5 py-5 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <InfoRow
              icon={<User className="h-3.5 w-3.5" />}
              label="Giảng viên"
              value={section.teacher_name}
            />
            <InfoRow
              icon={<MapPin className="h-3.5 w-3.5" />}
              label="Phòng học"
              value={section.room}
            />
            <InfoRow
              icon={<Clock className="h-3.5 w-3.5" />}
              label="Thời gian"
              value={`${section.start_time} – ${section.end_time}`}
            />
            <InfoRow
              icon={<Calendar className="h-3.5 w-3.5" />}
              label="Lịch học"
              value={DAY_VN[section.day_of_week] ?? section.day_of_week}
            />
            <InfoRow
              icon={<BookOpen className="h-3.5 w-3.5" />}
              label="Học kỳ"
              value={section.term.name}
            />
            <InfoRow
              icon={<Award className="h-3.5 w-3.5" />}
              label="Số tín chỉ"
              value={section.subject.credit != null ? `${section.subject.credit} TC` : '—'}
            />
          </div>

          {section.sessions.length > 0 && (
            <div>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Tóm tắt điểm danh ({section.sessions.length} buổi)
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {(['PRESENT', 'LATE', 'ABSENT', 'NONE'] as AttendanceRecordStatus[]).map(
                  (status) => {
                    const cfg = RECORD_STATUS_CONFIG[status];
                    const count = sessionStats[status] ?? 0;
                    return (
                      <div
                        key={status}
                        className="flex flex-col items-center gap-1 rounded-xl border border-border bg-background p-3"
                      >
                        <span className={`text-xl font-black ${
                          status === 'PRESENT' ? 'text-emerald-600'
                          : status === 'LATE' ? 'text-amber-500'
                          : status === 'ABSENT' ? 'text-red-500'
                          : 'text-slate-400'
                        }`}>
                          {count}
                        </span>
                        <span className="text-[10px] text-center text-muted-foreground leading-tight">
                          {cfg.label}
                        </span>
                      </div>
                    );
                  },
                )}
              </div>
            </div>
          )}

          {section.sessions.length > 0 && (
            <div>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Chi Tiết Các Buổi Học
              </h3>
              <div className="space-y-2">
                {section.sessions.map((sess) => {
                  const recordStatus: AttendanceRecordStatus =
                    sess.records[0]?.status ?? 'NONE';
                  const cfg = RECORD_STATUS_CONFIG[recordStatus];
                  const dateLabel = sess.session_date
                    ? new Date(`${sess.session_date.slice(0, 10)}T00:00:00`).toLocaleDateString(
                        'vi-VN',
                        { day: '2-digit', month: '2-digit', year: 'numeric' },
                      )
                    : '—';

                  return (
                    <div
                      key={sess.session_id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-2.5"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`h-2 w-2 shrink-0 rounded-full ${cfg.dot}`} />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground">
                            Buổi {sess.session_no}
                          </p>
                          <p className="text-[11px] text-muted-foreground">{dateLabel}</p>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold shrink-0 ${cfg.badge}`}
                      >
                        {cfg.icon}
                        {cfg.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
