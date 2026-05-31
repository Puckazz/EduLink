import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { TeacherService } from '@/services/teacher.service';
import type { TeacherSortOption, TeacherStatusFilter } from '@/types/teacher';

interface UseTeachersParams {
  currentPage: number;
  pageSize: number;
  search: string;
  status: TeacherStatusFilter;
  sort: TeacherSortOption;
}

export function useTeachers({
  currentPage,
  pageSize,
  search,
  status,
  sort,
}: UseTeachersParams) {
  const query = useQuery({
    queryKey: ['teachers', { currentPage, pageSize, search, status, sort }],
    queryFn: () =>
      TeacherService.getAll({
        page: currentPage,
        limit: pageSize,
        search: search || undefined,
        status: status || undefined,
        sort,
      }),
    placeholderData: keepPreviousData,
  });

  return {
    ...query,
    rows: query.data?.data ?? [],
    totalItems: query.data?.meta.totalItems ?? 0,
    totalPages: query.data?.meta.totalPages ?? 1,
    effectivePage: query.data?.meta.currentPage ?? 1,
  };
}
