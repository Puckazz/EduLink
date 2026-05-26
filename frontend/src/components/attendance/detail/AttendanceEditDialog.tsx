'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import type { SessionRecord, AttendanceRecordStatus } from '@/services/attendance.service';

interface Props {
  record: SessionRecord;
  onClose: () => void;
  onSave: (status: AttendanceRecordStatus, note: string) => void;
}

const STATUS_OPTIONS: {
  value: AttendanceRecordStatus;
  label: string;
  className: string;
  selectedClassName: string;
  dot: string;
}[] = [
  {
    value: 'PRESENT',
    label: 'Có mặt',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
    selectedClassName: 'ring-2 ring-emerald-500 scale-[1.02] shadow-sm',
    dot: 'bg-emerald-500',
  },
  {
    value: 'LATE',
    label: 'Đi muộn',
    className: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
    selectedClassName: 'ring-2 ring-amber-400 scale-[1.02] shadow-sm',
    dot: 'bg-amber-400',
  },
  {
    value: 'ABSENT',
    label: 'Vắng mặt',
    className: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
    selectedClassName: 'ring-2 ring-red-500 scale-[1.02] shadow-sm',
    dot: 'bg-red-500',
  },
  {
    value: 'NONE',
    label: 'Chưa có dữ liệu',
    className: 'bg-muted text-muted-foreground border-border hover:bg-muted/80',
    selectedClassName: 'ring-2 ring-border scale-[1.02] shadow-sm',
    dot: 'bg-muted-foreground/40',
  },
];

export function AttendanceEditDialog({ record, onClose, onSave }: Props) {
  const [status, setStatus] = useState<AttendanceRecordStatus>(record.status);
  const [note, setNote] = useState(record.note ?? '');

  const student = record.enrollment.student;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Chỉnh sửa điểm danh
          </p>
          <DialogTitle className="text-base font-bold text-foreground mt-0.5">
            {student.full_name}
          </DialogTitle>
          <p className="text-xs text-muted-foreground font-medium">{student.student_code}</p>
        </DialogHeader>

        <div className="px-6 py-5 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Trạng thái
            </label>
            <div className="grid grid-cols-2 gap-2">
              {STATUS_OPTIONS.map((opt) => {
                const isSelected = status === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setStatus(opt.value)}
                    className={`relative flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold border transition-all ${opt.className} ${
                      isSelected ? opt.selectedClassName : ''
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full shrink-0 ${opt.dot}`} />
                    {opt.label}
                    {isSelected && (
                      <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-background shadow-xs border border-border">
                        <Check className="h-2.5 w-2.5 text-foreground" strokeWidth={3} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Ghi chú
            </label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ví dụ: Nghỉ có phép, xe hỏng..."
              rows={3}
              className="resize-none bg-muted/40"
            />
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border bg-muted/20">
          <Button variant="outline" size="sm" onClick={onClose}>
            Hủy
          </Button>
          <Button size="sm" onClick={() => onSave(status, note)}>
            <Check className="h-4 w-4" />
            Xác nhận
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
