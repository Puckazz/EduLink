import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface TableSkeletonRowsProps {
  columns: number;
  rows?: number;
  cellClassName?: string;
  skeletonClassNames?: string[];
}

const DEFAULT_WIDTHS = ['w-40', 'w-56', 'w-28', 'w-32', 'w-24', 'w-12'];

export function TableSkeletonRows({
  columns,
  rows = 6,
  cellClassName,
  skeletonClassNames,
}: TableSkeletonRowsProps) {
  return (
    <>
      {Array.from({ length: rows }, (_, rowIndex) => (
        <tr key={rowIndex} className="border-b border-border last:border-b-0">
          {Array.from({ length: columns }, (_, columnIndex) => {
            const isLastColumn = columnIndex === columns - 1;
            const widthClass =
              skeletonClassNames?.[columnIndex] ??
              DEFAULT_WIDTHS[columnIndex % DEFAULT_WIDTHS.length];

            return (
              <td
                key={columnIndex}
                className={cn(
                  'px-6 py-4',
                  isLastColumn && 'text-right',
                  cellClassName,
                )}
              >
                <Skeleton
                  className={cn(
                    'h-5',
                    widthClass,
                    isLastColumn && 'ml-auto',
                  )}
                />
              </td>
            );
          })}
        </tr>
      ))}
    </>
  );
}
