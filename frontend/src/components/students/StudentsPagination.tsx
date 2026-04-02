import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { cn } from '@/lib/utils';
import {
  getPaginationBounds,
  getPageWindow,
} from '@/components/students/utils/pagination';

interface StudentsPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  isBusy: boolean;
  onPageChange: (page: number) => void;
}

export function StudentsPagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  isBusy,
  onPageChange,
}: StudentsPaginationProps) {
  const { startItem, endItem } = getPaginationBounds({
    currentPage,
    pageSize,
    totalItems,
  });

  const pageNumbers = getPageWindow(currentPage, totalPages);
  const showLeftEllipsis = pageNumbers.length > 0 && pageNumbers[0] > 2;
  const showRightEllipsis =
    pageNumbers.length > 0 &&
    pageNumbers[pageNumbers.length - 1] < totalPages - 1;

  return (
    <div className="flex items-center justify-between border-t border-border px-6 py-3">
      <p className="text-sm text-muted-foreground">
        Hiển thị{' '}
        <span className="font-semibold text-foreground">{startItem}</span> đến{' '}
        <span className="font-semibold text-foreground">{endItem}</span> trong
        số <span className="font-semibold text-foreground">{totalItems}</span>{' '}
        kết quả
      </p>

      <Pagination className="mx-0 w-auto">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              aria-disabled={currentPage === 1 || isBusy}
              className={cn(
                'cursor-pointer',
                (currentPage === 1 || isBusy) &&
                  'pointer-events-none opacity-50',
              )}
            />
          </PaginationItem>

          {pageNumbers[0] > 1 && (
            <PaginationItem key={1}>
              <PaginationLink
                onClick={() => onPageChange(1)}
                isActive={currentPage === 1}
                className="cursor-pointer"
              >
                1
              </PaginationLink>
            </PaginationItem>
          )}

          {showLeftEllipsis && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}

          {pageNumbers.map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                onClick={() => onPageChange(page)}
                isActive={currentPage === page}
                className={cn(
                  'cursor-pointer',
                  currentPage === page &&
                    'bg-primary text-primary-foreground border-primary hover:bg-primary/90 hover:text-primary-foreground',
                )}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}

          {showRightEllipsis && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}

          {pageNumbers[pageNumbers.length - 1] < totalPages && (
            <PaginationItem>
              <PaginationLink
                onClick={() => onPageChange(totalPages)}
                isActive={currentPage === totalPages}
                className="cursor-pointer"
              >
                {totalPages}
              </PaginationLink>
            </PaginationItem>
          )}

          <PaginationItem>
            <PaginationNext
              onClick={() =>
                onPageChange(Math.min(totalPages, currentPage + 1))
              }
              aria-disabled={currentPage === totalPages || isBusy}
              className={cn(
                'cursor-pointer',
                (currentPage === totalPages || isBusy) &&
                  'pointer-events-none opacity-50',
              )}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
