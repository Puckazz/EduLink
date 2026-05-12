'use client';

import { useState, useRef, type ReactNode } from 'react';
import { Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { TableCell, TableRow } from '@/components/ui/table';
import {
  DataTable,
  type DataTableColumn,
} from '@/components/shared/table/DataTable';
import type { SessionRecord, AttendanceRecordStatus } from '@/services/attendance.service';

// ── Status config ──────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  PRESENT: {
    label: 'Có mặt',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50',
    dot: 'bg-emerald-500',
    btnActive: 'bg-emerald-500 text-white border-emerald-500 shadow-sm',
    btnIdle: 'bg-white text-emerald-600 border-emerald-200 hover:bg-emerald-50',
  },
  LATE: {
    label: 'Đi muộn',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50',
    dot: 'bg-amber-400',
    btnActive: 'bg-amber-400 text-white border-amber-400 shadow-sm',
    btnIdle: 'bg-white text-amber-600 border-amber-200 hover:bg-amber-50',
  },
  ABSENT: {
    label: 'Vắng mặt',
    badgeClass: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-50',
    dot: 'bg-red-500',
    btnActive: 'bg-red-500 text-white border-red-500 shadow-sm',
    btnIdle: 'bg-white text-red-600 border-red-200 hover:bg-red-50',
  },
  NONE: {
    label: 'Chưa có dữ liệu',
    badgeClass: '',
    dot: 'bg-muted-foreground/40',
    btnActive: 'bg-slate-400 text-white border-slate-400 shadow-sm',
    btnIdle: 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50',
  },
} as const;

const INLINE_STATUSES: AttendanceRecordStatus[] = ['PRESENT', 'LATE', 'ABSENT'];

// ── Table columns ──────────────────────────────────────────────────────────────

const COLUMNS: DataTableColumn[] = [
  { key: 'stt', label: 'STT', className: 'w-[4%] py-3.5 px-4 text-center' },
  { key: 'student', label: 'Sinh viên', className: 'py-3.5 px-4 w-[22%]' },
  { key: 'status', label: 'Điểm danh nhanh', className: 'w-[40%] px-4' },
  { key: 'note', label: 'Ghi chú', className: 'w-[34%] px-4' },
];

// ── Inline note cell ───────────────────────────────────────────────────────────

function InlineNoteCell({
  initialNote,
  onBlur,
}: {
  initialNote: string;
  onBlur: (val: string) => void;
}) {
  const [value, setValue] = useState(initialNote);
  const ref = useRef<HTMLInputElement>(null);

  return (
    <input
      ref={ref}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => onBlur(value)}
      placeholder="Thêm ghi chú..."
      className="w-full rounded-lg border border-transparent bg-transparent px-2.5 py-1.5 text-sm text-slate-700 placeholder:text-slate-300 transition-colors outline-none
        hover:border-slate-200 hover:bg-slate-50
        focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
    />
  );
}

// ── Inline status buttons ──────────────────────────────────────────────────────

interface InlineStatusButtonsProps {
  currentStatus: AttendanceRecordStatus;
  onChange: (status: AttendanceRecordStatus) => void;
}

function InlineStatusButtons({ currentStatus, onChange }: InlineStatusButtonsProps) {
  return (
    <div className="flex items-center gap-1.5">
      {INLINE_STATUSES.map((s) => {
        const cfg = STATUS_CONFIG[s];
        const isActive = currentStatus === s;
        return (
          <button
            key={s}
            onClick={() => onChange(s)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all duration-150
              ${isActive ? cfg.btnActive : cfg.btnIdle}`}
          >
            {isActive && <Check className="h-3 w-3" strokeWidth={3} />}
            {cfg.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Main table card ────────────────────────────────────────────────────────────

interface Props {
  records: SessionRecord[];
  isLoading?: boolean;
  onStatusChange: (enrollmentId: number, status: AttendanceRecordStatus, note: string) => void;
  footer?: ReactNode;
}

export function TeacherAttendanceDetailTableCard({
  records,
  isLoading,
  onStatusChange,
  footer,
}: Props) {
  // Local note state to allow inline editing without re-fetching
  const [localNotes, setLocalNotes] = useState<Record<number, string>>({});

  const getNote = (record: SessionRecord) =>
    localNotes[record.enrollment_id] ?? record.note ?? '';

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="divide-y divide-border">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse">
              <div className="h-9 w-9 rounded-full bg-muted shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-muted rounded w-1/3" />
                <div className="h-2.5 bg-muted rounded w-1/5" />
              </div>
              <div className="flex gap-2">
                <div className="h-7 w-20 bg-muted rounded-lg" />
                <div className="h-7 w-20 bg-muted rounded-lg" />
                <div className="h-7 w-20 bg-muted rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <DataTable
          columns={COLUMNS}
          data={records}
          emptyMessage="Không có sinh viên trong buổi học này."
          renderRow={(record, index) => {
            const cfg = STATUS_CONFIG[record.status] ?? STATUS_CONFIG.NONE;
            const initials = record.enrollment.student.full_name
              .split(' ')
              .slice(-2)
              .map((w) => w[0])
              .join('')
              .toUpperCase();
            const currentNote = getNote(record);

            return (
              <TableRow
                key={record.enrollment_id}
                className="hover:bg-muted/30 transition-colors group"
              >
                {/* STT */}
                <TableCell className="py-3 px-4 text-center">
                  <span className="text-sm font-semibold text-muted-foreground">
                    {index + 1}
                  </span>
                </TableCell>

                {/* Student */}
                <TableCell className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0 text-xs font-bold text-foreground">
                      {initials}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-foreground text-sm truncate">
                        {record.enrollment.student.full_name}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground font-medium">
                          {record.enrollment.student.student_code}
                        </span>
                        {/* Current status indicator (compact) */}
                        <Badge
                          variant="outline"
                          className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0 h-4 ${cfg.badgeClass}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </TableCell>

                {/* Inline status buttons */}
                <TableCell className="py-3 px-4">
                  <InlineStatusButtons
                    currentStatus={record.status}
                    onChange={(newStatus) => {
                      onStatusChange(record.enrollment_id, newStatus, currentNote);
                    }}
                  />
                </TableCell>

                {/* Inline note input */}
                <TableCell className="py-3 px-2">
                  <InlineNoteCell
                    key={`note-${record.record_id}-${record.note}`}
                    initialNote={currentNote}
                    onBlur={(val) => {
                      setLocalNotes((prev) => ({
                        ...prev,
                        [record.enrollment_id]: val,
                      }));
                      onStatusChange(record.enrollment_id, record.status, val);
                    }}
                  />
                </TableCell>
              </TableRow>
            );
          }}
        />
      </div>
      {footer}
    </div>
  );
}
