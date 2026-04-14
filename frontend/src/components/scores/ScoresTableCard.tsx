import { AlertCircle, Database, Pencil, RefreshCcw } from 'lucide-react';
import { type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { TableCell, TableRow } from '@/components/ui/table';
import {
  DataTable,
  type DataTableColumn,
} from '@/components/shared/table/DataTable';
import type { ScorebookRow } from '@/types/score';

interface ScoresTableCardProps {
  rows: ScorebookRow[];
  isLoading: boolean;
  errorMessage: string | null;
  emptyMessage?: string;
  onRetry: () => void;
  onEditStudent: (studentId: number) => void;
  footer?: ReactNode;
}

function ScoresTableSkeleton() {
  return (
    <div className="space-y-3 px-6 py-5">
      {Array.from({ length: 8 }, (_, index) => (
        <Skeleton key={index} className="h-11 w-full" />
      ))}
    </div>
  );
}

function getScoreText(value: number | null): string {
  return value === null ? '--' : value.toFixed(2);
}

const SCORE_COLUMNS: DataTableColumn[] = [
  {
    key: 'student',
    label: 'Học sinh',
    className: 'px-6',
  },
  {
    key: 'assignment',
    label: 'Thường xuyên',
    align: 'center',
  },
  {
    key: 'midterm',
    label: 'Giữa kỳ',
    align: 'center',
  },
  {
    key: 'final',
    label: 'Cuối kỳ',
    align: 'center',
  },
  {
    key: 'avg',
    label: 'Trung bình',
    align: 'center',
  },
  {
    key: 'publish',
    label: 'Trạng thái',
    align: 'center',
  },
  {
    key: 'actions',
    label: 'Thao tác',
    align: 'right',
    className: 'w-20 px-4',
  },
];

export function ScoresTableCard({
  rows,
  isLoading,
  errorMessage,
  emptyMessage,
  onRetry,
  onEditStudent,
  footer,
}: ScoresTableCardProps) {
  return (
    <div className="overflow-hidden border border-border bg-card rounded-xl">
      {errorMessage ? (
        <div className="flex flex-col items-center justify-center gap-4 px-6 py-14 text-center">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">
              Không thể tải dữ liệu bảng điểm
            </p>
            <p className="text-sm text-muted-foreground">{errorMessage}</p>
          </div>
          <Button variant="outline" className="gap-2" onClick={onRetry}>
            <RefreshCcw className="h-4 w-4" />
            Thử lại
          </Button>
        </div>
      ) : isLoading ? (
        <ScoresTableSkeleton />
      ) : (
        <div className="overflow-x-auto">
          <DataTable
            columns={SCORE_COLUMNS}
            data={rows}
            emptyMessage="Không có học sinh phù hợp bộ lọc."
            emptyState={
              <div className="flex flex-col items-center gap-2">
                <Database className="h-8 w-8 text-muted-foreground/70" />
                <p className="text-sm text-muted-foreground">
                  {emptyMessage ?? 'Không có học sinh phù hợp bộ lọc.'}
                </p>
              </div>
            }
            renderRow={(row) => (
              <TableRow key={row.student_id} className="border-border">
                <TableCell className="px-6">
                  <p className="font-medium text-foreground">
                    {row.student_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {row.student_code}
                  </p>
                </TableCell>

                <TableCell className="text-center">
                  {getScoreText(row.assignment)}
                </TableCell>
                <TableCell className="text-center">
                  {getScoreText(row.midterm)}
                </TableCell>
                <TableCell className="text-center">
                  {getScoreText(row.final)}
                </TableCell>
                <TableCell className="text-center font-semibold">
                  {getScoreText(row.avg)}
                </TableCell>

                <TableCell className="text-center">
                  <StatusBadge
                    status={
                      row.publish_status === 'PUBLISHED' ? 'Đã công bố' : 'Nháp'
                    }
                  />
                </TableCell>

                <TableCell className="px-4 text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground"
                    onClick={() => onEditStudent(row.student_id)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            )}
          />
        </div>
      )}

      {footer}
    </div>
  );
}
