import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export type DataTableAlign = 'left' | 'center' | 'right';

export interface DataTableColumn {
  key: string;
  label: string;
  align?: DataTableAlign;
  className?: string;
}

interface DataTableProps<T> {
  columns: DataTableColumn[];
  data: T[];
  emptyMessage: string;
  emptyState?: ReactNode;
  colSpan?: number;
  tableClassName?: string;
  renderRow: (row: T, index: number) => ReactNode;
}

function getAlignClassName(align: DataTableAlign | undefined): string {
  if (align === 'center') {
    return 'text-center';
  }

  if (align === 'right') {
    return 'text-right';
  }

  return 'text-left';
}

export function DataTable<T>({
  columns,
  data,
  emptyMessage,
  emptyState,
  colSpan,
  tableClassName,
  renderRow,
}: DataTableProps<T>) {
  const resolvedColSpan = colSpan ?? columns.length;

  return (
    <Table className={tableClassName}>
      <TableHeader className="bg-muted/50">
        <TableRow className="border-border hover:bg-transparent">
          {columns.map((column) => (
            <TableHead
              key={column.key}
              className={cn(
                'text-xs font-semibold uppercase tracking-wider text-muted-foreground',
                getAlignClassName(column.align),
                column.className,
              )}
            >
              {column.label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>

      <TableBody>
        {data.length === 0 ? (
          <TableRow className="border-border">
            <TableCell
              colSpan={resolvedColSpan}
              className="px-6 py-12 text-center text-sm text-muted-foreground"
            >
              {emptyState ?? emptyMessage}
            </TableCell>
          </TableRow>
        ) : (
          data.map((row, index) => renderRow(row, index))
        )}
      </TableBody>
    </Table>
  );
}
