import { AlertCircle, Database, Pencil, RefreshCcw, ChevronDown, ChevronRight } from 'lucide-react';
import React, { type ReactNode, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Checkbox } from '@/components/ui/checkbox';
import { TableCell, TableRow } from '@/components/ui/table';
import {
  DataTable,
  type DataTableColumn,
} from '@/components/shared/table/DataTable';
import type { ScorebookUiRow, StudentGroup } from '@/types/score';

interface ScoresTableCardProps {
  groups: StudentGroup[];
  isLoading: boolean;
  errorMessage: string | null;
  emptyMessage?: string;
  selectedScoreIds: Set<number>;
  onToggleSelect: (scoreId: number) => void;
  onToggleGroup: (scoreIds: number[], isSelected: boolean) => void;
  onRetry: () => void;
  onEditRow: (rowId: string) => void;
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

type LetterGrade = 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' | 'F';

function getLetterGrade(avg: number): LetterGrade {
  if (avg >= 9) {
    return 'A+';
  }

  if (avg >= 8.5) {
    return 'A';
  }

  if (avg >= 8) {
    return 'B+';
  }

  if (avg >= 7) {
    return 'B';
  }

  if (avg >= 5.5) {
    return 'C';
  }

  if (avg >= 4) {
    return 'D';
  }

  return 'F';
}

function getGPAScale(avg: number): number {
  if (avg >= 9.0) return 4.0;
  if (avg >= 8.5) return 4.0;
  if (avg >= 8.0) return 3.5;
  if (avg >= 7.0) return 3.0;
  if (avg >= 5.5) return 2.0;
  if (avg >= 4.0) return 1.0;
  return 0;
}

const SCORE_COLUMNS: DataTableColumn[] = [
  {
    key: 'select',
    label: '',
    className: 'w-10 px-4',
  },
  {
    key: 'student',
    label: 'Học sinh / Môn học',
    className: 'px-2 min-w-[280px]',
  },
  {
    key: 'credit',
    label: 'Số TC',
    align: 'center',
    className: 'w-[80px]',
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
    key: 'rank',
    label: 'Tổng kết',
    align: 'center',
    className: 'min-w-[130px]',
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

export function StudentRowGroup({
  group,
  onEditRow,
  selectedScoreIds,
  onToggleSelect,
  onToggleGroup,
}: {
  group: StudentGroup;
  onEditRow: (rowId: string) => void;
  selectedScoreIds: Set<number>;
  onToggleSelect: (scoreId: number) => void;
  onToggleGroup: (scoreIds: number[], isSelected: boolean) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  const validScoreIds = group.rows
    .filter((r) => r.score_id !== null)
    .map((r) => r.score_id as number);
  const selectedCount = validScoreIds.filter((id) =>
    selectedScoreIds.has(id),
  ).length;
  const isAllSelected =
    validScoreIds.length > 0 && selectedCount === validScoreIds.length;
  const isIndeterminate =
    selectedCount > 0 && selectedCount < validScoreIds.length;

  return (
    <React.Fragment key={group.student_id}>
      {/* Parent Row */}
      <TableRow className="border-border bg-muted/20 hover:bg-muted/30">
        <TableCell className="px-4">
          <Checkbox
            checked={isIndeterminate ? 'indeterminate' : isAllSelected}
            onCheckedChange={(c: boolean | 'indeterminate') =>
              onToggleGroup(validScoreIds, c === true || c === 'indeterminate')
            }
            disabled={validScoreIds.length === 0}
            aria-label="Select all scores for student"
          />
        </TableCell>
        <TableCell colSpan={9} className="px-2 py-2">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-md p-0"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
            <p className="font-medium text-foreground">
              {group.student_name}
            </p>
            <p className="text-xs text-muted-foreground">
              ({group.student_code})
            </p>
            <div className="ml-auto text-xs text-muted-foreground">
              <span className="cursor-pointer hover:underline" onClick={() => setIsExpanded(!isExpanded)}>
                {isExpanded ? '[-] Thu gọn' : '[+] Mở rộng'}
              </span>
            </div>
          </div>
        </TableCell>
      </TableRow>

      {/* Child Rows */}
      {isExpanded &&
        group.rows.map((row) => (
          <TableRow key={row.id} className="border-border bg-background">
            <TableCell className="px-4">
              {row.score_id !== null ? (
                <Checkbox
                  checked={selectedScoreIds.has(row.score_id)}
                  onCheckedChange={() => onToggleSelect(row.score_id as number)}
                  aria-label="Select score"
                />
              ) : null}
            </TableCell>
            <TableCell className="px-2 pl-10">
              <span className="text-sm text-foreground">{row.subject_name}</span>
            </TableCell>

            <TableCell className="text-center">
              <span className="text-sm text-muted-foreground">{row.credit ?? '--'}</span>
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
              {row.avg === null ? (
                <span className="text-sm text-muted-foreground">--</span>
              ) : (
                <StatusBadge 
                  status={getLetterGrade(row.avg)} 
                  label={`${getLetterGrade(row.avg)} (${getGPAScale(row.avg).toFixed(1)})`}
                  className="rounded-full px-2.5 py-0.5"
                />
              )}
            </TableCell>

            <TableCell className="text-center">
              <StatusBadge
                status={row.publish_status === 'PUBLISHED' ? 'Đã công bố' : 'Nháp'}
              />
            </TableCell>

            <TableCell className="px-4 text-right">
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground h-8 w-8"
                onClick={() => onEditRow(row.id)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
    </React.Fragment>
  );
}

export function ScoresTableCard({
  groups,
  isLoading,
  errorMessage,
  emptyMessage,
  selectedScoreIds,
  onToggleSelect,
  onToggleGroup,
  onRetry,
  onEditRow,
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
            data={groups}
            emptyMessage="Không có học sinh phù hợp bộ lọc."
            emptyState={
              <div className="flex flex-col items-center gap-2">
                <Database className="h-8 w-8 text-muted-foreground/70" />
                <p className="text-sm text-muted-foreground">
                  {emptyMessage ?? 'Không có học sinh phù hợp bộ lọc.'}
                </p>
              </div>
            }
            renderRow={(group) => (
              <StudentRowGroup
                key={group.student_id}
                group={group}
                onEditRow={onEditRow}
                selectedScoreIds={selectedScoreIds}
                onToggleSelect={onToggleSelect}
                onToggleGroup={onToggleGroup}
              />
            )}
          />
        </div>
      )}

      {footer}
    </div>
  );
}
