interface PaginationBoundsParams {
  currentPage: number;
  pageSize: number;
  totalItems: number;
}

export function getPageWindow(
  currentPage: number,
  totalPages: number,
): number[] {
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

export function getPaginationBounds({
  currentPage,
  pageSize,
  totalItems,
}: PaginationBoundsParams) {
  if (totalItems === 0) {
    return {
      startItem: 0,
      endItem: 0,
    };
  }

  return {
    startItem: (currentPage - 1) * pageSize + 1,
    endItem: Math.min(currentPage * pageSize, totalItems),
  };
}
