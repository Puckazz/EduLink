import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ParentService } from '@/services/parent.service';
import type { Parent, ParentStatusFilter } from '@/types/parent';

interface UseParentsParams {
  currentPage: number;
  pageSize: number;
  search: string;
  status: ParentStatusFilter;
}

interface ParentsDerivedResult {
  rows: Parent[];
  filteredRows: Parent[];
  totalItems: number;
  totalPages: number;
  effectivePage: number;
}

function matchesSearch(parent: Parent, normalizedSearch: string): boolean {
  if (!normalizedSearch) {
    return true;
  }

  const haystack = [parent.full_name, parent.phone, parent.email ?? '']
    .join(' ')
    .toLowerCase();

  return haystack.includes(normalizedSearch);
}

function matchesStatus(parent: Parent, status: ParentStatusFilter): boolean {
  if (!status) {
    return true;
  }

  return status === 'active' ? parent.is_active : !parent.is_active;
}

function deriveParents({
  allParents,
  currentPage,
  pageSize,
  search,
  status,
}: {
  allParents: Parent[];
  currentPage: number;
  pageSize: number;
  search: string;
  status: ParentStatusFilter;
}): ParentsDerivedResult {
  const normalizedSearch = search.trim().toLowerCase();

  const filteredRows = allParents.filter(
    (parent) =>
      matchesSearch(parent, normalizedSearch) && matchesStatus(parent, status),
  );

  const totalItems = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const effectivePage = Math.min(currentPage, totalPages);
  const startIndex = (effectivePage - 1) * pageSize;
  const rows = filteredRows.slice(startIndex, startIndex + pageSize);

  return {
    rows,
    filteredRows,
    totalItems,
    totalPages,
    effectivePage,
  };
}

export function useParents({
  currentPage,
  pageSize,
  search,
  status,
}: UseParentsParams) {
  const query = useQuery({
    queryKey: ['parents'],
    queryFn: () => ParentService.getAll(),
    placeholderData: keepPreviousData,
  });

  const allParents = query.data?.data ?? [];
  const derived = deriveParents({
    allParents,
    currentPage,
    pageSize,
    search,
    status,
  });

  return {
    ...query,
    ...derived,
  };
}
