import { Pencil } from 'lucide-react';
import { type ReactNode } from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import {
  DataTable,
  type DataTableColumn,
} from '@/components/shared/table/DataTable';
import type { SessionRecord } from '@/services/attendance.service';

const STATUS_CONFIG = {
  PRESENT: {
    label: 'Có mặt',
    className: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20',
    dot: 'bg-emerald-500',
  },
  LATE: {
    label: 'Đi muộn',
    className: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-500/20',
    dot: 'bg-amber-400',
  },
  ABSENT: {
    label: 'Vắng mặt',
    className: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20',
    dot: 'bg-red-500',
  },
  NONE: {
    label: 'Chưa có dữ liệu',
    className: 'bg-slate-100 text-slate-500 ring-1 ring-inset ring-slate-200',
    dot: 'bg-slate-300',
  },
} as const;

const COLUMNS: DataTableColumn[] = [
  { key: 'stt', label: 'STT', className: 'w-[5%] py-3.5 px-5 text-center' },
  { key: 'student', label: 'Sinh viên', className: 'py-3.5 px-5 w-[35%]' },
  { key: 'status', label: 'Trạng thái', className: 'w-[20%]' },
  { key: 'note', label: 'Ghi chú', className: 'w-[30%]' },
  { key: 'actions', label: 'Thao tác', align: 'center', className: 'w-[10%]' },
];

interface Props {
  records: SessionRecord[];
  isLoading?: boolean;
  onEdit: (record: SessionRecord) => void;
  footer?: ReactNode;
}

export function AttendanceDetailTableCard({ records, isLoading, onEdit, footer }: Props) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden mt-6">
        <div className="divide-y divide-slate-100">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse">
              <div className="h-9 w-9 rounded-full bg-slate-100 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-slate-100 rounded w-1/3" />
                <div className="h-2.5 bg-slate-100 rounded w-1/5" />
              </div>
              <div className="h-7 w-24 bg-slate-100 rounded-full" />
              <div className="h-7 w-32 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden mt-6">
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

            return (
              <TableRow key={record.record_id} className="hover:bg-slate-50/60 transition-colors">
                {/* STT */}
                <TableCell className="py-3.5 px-5 text-center">
                  <span className="text-sm font-semibold text-slate-400">
                    {index + 1}
                  </span>
                </TableCell>

                {/* Student */}
                <TableCell className="py-3.5 px-5">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-xs font-bold text-slate-600">
                      {initials}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-slate-800 text-sm truncate">
                        {record.enrollment.student.full_name}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {record.enrollment.student.student_code}
                      </span>
                    </div>
                  </div>
                </TableCell>

                {/* Status Badge — View only */}
                <TableCell>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${cfg.className}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                  </span>
                </TableCell>

                {/* Note — View only */}
                <TableCell>
                  {record.note ? (
                    <span className="text-sm text-slate-600 font-medium">{record.note}</span>
                  ) : (
                    <span className="text-sm text-slate-300 italic">—</span>
                  )}
                </TableCell>

                {/* Actions */}
                <TableCell className="text-center">
                  <button
                    onClick={() => onEdit(record)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 shadow-xs hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800 transition-all"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Sửa
                  </button>
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
