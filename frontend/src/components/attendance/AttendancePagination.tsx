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

interface AttendancePaginationProps {
  currentPage: number;
  totalPages: number;
  isBusy: boolean;
  onPageChange: (page: number) => void;
}

function getPageWindow(currentPage: number, totalPages: number): number[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }
  if (currentPage <= 3) {
    return [1, 2, 3, 4];
  }
  if (currentPage >= totalPages - 2) {
    return [totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [currentPage - 1, currentPage, currentPage + 1];
}

export function AttendancePagination({
  currentPage,
  totalPages,
  isBusy,
  onPageChange,
}: AttendancePaginationProps) {
  const safeTotalPages = Math.max(1, totalPages);
  const pageNumbers = getPageWindow(currentPage, safeTotalPages);
  const showLeftEllipsis = pageNumbers.length > 0 && pageNumbers[0] > 2;
  const showRightEllipsis =
    pageNumbers.length > 0 &&
    pageNumbers[pageNumbers.length - 1] < safeTotalPages - 1;

  return (
    <div className="flex justify-center pt-2">
      <Pagination className="mx-0 w-auto">
        <PaginationContent className="gap-2">
          <PaginationItem>
            <PaginationPrevious
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              aria-disabled={currentPage === 1 || isBusy}
              className={cn(
                'cursor-pointer',
                (currentPage === 1 || isBusy) && 'pointer-events-none opacity-50',
              )}
            />
          </PaginationItem>

          {pageNumbers[0] > 1 && (
            <PaginationItem>
              <PaginationLink
                onClick={() => onPageChange(1)}
                isActive={currentPage === 1}
                className={cn(
                  'cursor-pointer',
                  currentPage === 1 &&
                    'bg-primary border-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground',
                )}
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
                    'bg-primary border-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground',
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

          {pageNumbers[pageNumbers.length - 1] < safeTotalPages && (
            <PaginationItem>
              <PaginationLink
                onClick={() => onPageChange(safeTotalPages)}
                isActive={currentPage === safeTotalPages}
                className={cn(
                  'cursor-pointer',
                  currentPage === safeTotalPages &&
                    'bg-primary border-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground',
                )}
              >
                {safeTotalPages}
              </PaginationLink>
            </PaginationItem>
          )}

          <PaginationItem>
            <PaginationNext
              onClick={() => onPageChange(Math.min(safeTotalPages, currentPage + 1))}
              aria-disabled={currentPage === safeTotalPages || isBusy}
              className={cn(
                'cursor-pointer',
                (currentPage === safeTotalPages || isBusy) &&
                  'pointer-events-none opacity-50',
              )}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
