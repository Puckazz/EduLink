import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ParentService } from '@/services/parent.service';
import type {
  ParentStatusFilter,
  ParentRelationshipFilter,
  ParentSortOption,
} from '@/types/parent';

interface UseParentsParams {
  currentPage: number;
  pageSize: number;
  search: string;
  status: ParentStatusFilter;
  relationship: ParentRelationshipFilter;
  sort: ParentSortOption;
}

export function useParents({
  currentPage,
  pageSize,
  search,
  status,
  relationship,
  sort,
}: UseParentsParams) {
  const query = useQuery({
    queryKey: ['parents', { currentPage, pageSize, search, status, relationship, sort }],
    queryFn: () =>
      ParentService.getAll({
        page: currentPage,
        limit: pageSize,
        search: search || undefined,
        status: status || undefined,
        relationship: relationship || undefined,
        sort: sort || undefined,
      }),
    placeholderData: keepPreviousData,
  });

  return {
    ...query,
    rows: query.data?.data ?? [],
    filteredRows: query.data?.data ?? [],
    totalItems: query.data?.meta.totalItems ?? 0,
    totalPages: query.data?.meta.totalPages ?? 1,
    effectivePage: query.data?.meta.currentPage ?? 1,
  };
}
