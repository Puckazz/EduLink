'use client';

import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SessionRecord, AttendanceRecordStatus } from '@/services/attendance.service';

interface Props {
  record: SessionRecord;
  onClose: () => void;
  onSave: (status: AttendanceRecordStatus, note: string) => void;
}

const STATUS_OPTIONS: { value: AttendanceRecordStatus; label: string; color: string; ring: string }[] = [
  {
    value: 'PRESENT',
    label: 'Có mặt',
    color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
    ring: 'ring-emerald-600/30',
  },
  {
    value: 'LATE',
    label: 'Đi muộn',
    color: 'bg-amber-50 text-amber-700 hover:bg-amber-100',
    ring: 'ring-amber-500/30',
  },
  {
    value: 'ABSENT',
    label: 'Vắng mặt',
    color: 'bg-red-50 text-red-700 hover:bg-red-100',
    ring: 'ring-red-600/30',
  },
  {
    value: 'NONE',
    label: 'Chưa có dữ liệu',
    color: 'bg-slate-100 text-slate-600 hover:bg-slate-200',
    ring: 'ring-slate-400/30',
  },
];

export function AttendanceEditDialog({ record, onClose, onSave }: Props) {
  const [status, setStatus] = useState<AttendanceRecordStatus>(record.status);
  const [note, setNote] = useState(record.note ?? '');

  const student = record.enrollment.student;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              Chỉnh sửa điểm danh
            </p>
            <h2 className="text-base font-extrabold text-slate-800 mt-0.5">
              {student.full_name}
            </h2>
            <p className="text-xs text-slate-500 font-medium">{student.student_code}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Status picker */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
              Trạng thái
            </label>
            <div className="grid grid-cols-2 gap-2">
              {STATUS_OPTIONS.map((opt) => {
                const isSelected = status === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setStatus(opt.value)}
                    className={`relative flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-bold transition-all ring-1 ring-inset ${opt.color} ${
                      isSelected
                        ? `${opt.ring} shadow-sm scale-[1.02]`
                        : 'ring-transparent'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white shadow-xs">
                        <Check className="h-3 w-3 text-slate-700" strokeWidth={3} />
                      </span>
                    )}
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Note input */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
              Ghi chú
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ví dụ: Nghỉ có phép, xe hỏng..."
              rows={3}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="font-semibold"
          >
            Hủy
          </Button>
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm"
            onClick={() => onSave(status, note)}
          >
            <Check className="mr-1.5 h-3.5 w-3.5" />
            Xác nhận
          </Button>
        </div>
      </div>
    </div>
  );
}
