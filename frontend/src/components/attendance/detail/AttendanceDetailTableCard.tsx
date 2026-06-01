import { Pencil } from 'lucide-react';
import { type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TableCell, TableRow } from '@/components/ui/table';
import {
  DataTable,
  type DataTableColumn,
} from '@/components/shared/table/DataTable';
import type { SessionRecord } from '@/services/attendance.service';

const STATUS_CONFIG = {
  PRESENT: {
    label: 'Có mặt',
    variant: 'default' as const,
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50',
    dot: 'bg-emerald-500',
  },
  LATE: {
    label: 'Đi muộn',
    variant: 'default' as const,
    className: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50',
    dot: 'bg-amber-400',
  },
  ABSENT: {
    label: 'Vắng mặt',
    variant: 'default' as const,
    className: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-50',
    dot: 'bg-red-500',
  },
  NONE: {
    label: 'Chưa có dữ liệu',
    variant: 'secondary' as const,
    className: '',
    dot: 'bg-muted-foreground/40',
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
  isReadOnly?: boolean;
  onEdit: (record: SessionRecord) => void;
  footer?: ReactNode;
}

export function AttendanceDetailTableCard({
  records,
  isLoading,
  isReadOnly = false,
  onEdit,
  footer,
}: Props) {
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
              <div className="h-7 w-24 bg-muted rounded-full" />
              <div className="h-7 w-32 bg-muted rounded" />
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

            return (
              <TableRow
                key={record.enrollment_id}
                className="hover:bg-muted/30 transition-colors group"
              >
                <TableCell className="py-3.5 px-5 text-center">
                  <span className="text-sm font-semibold text-muted-foreground">
                    {index + 1}
                  </span>
                </TableCell>

                <TableCell className="py-3.5 px-5">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0 text-xs font-bold text-foreground">
                      {initials}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-foreground text-sm truncate">
                        {record.enrollment.student.full_name}
                      </span>
                      <span className="text-xs text-muted-foreground font-medium">
                        {record.enrollment.student.student_code}
                      </span>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <Badge
                    variant="outline"
                    className={`inline-flex items-center gap-1.5 font-semibold text-xs ${cfg.className}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                  </Badge>
                </TableCell>

                <TableCell>
                  {record.note ? (
                    <span className="text-sm text-foreground font-medium">{record.note}</span>
                  ) : (
                    <span className="text-sm text-muted-foreground/50 italic">—</span>
                  )}
                </TableCell>

                <TableCell className="text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(record)}
                    disabled={isReadOnly}
                    title={isReadOnly ? 'Chưa nằm trong thời gian mở điểm danh.' : undefined}
                    className="h-8 px-2.5 text-xs font-semibold"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Sửa
                  </Button>
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
