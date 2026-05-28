import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { TeacherService } from '@/services/teacher.service';
import type { TeacherSortOption } from '@/types/teacher';

interface UseTeachersParams {
  currentPage: number;
  pageSize: number;
  search: string;
  sort: TeacherSortOption;
}

export function useTeachers({
  currentPage,
  pageSize,
  search,
  sort,
}: UseTeachersParams) {
  const query = useQuery({
    queryKey: ['teachers', { currentPage, pageSize, search, sort }],
    queryFn: () =>
      TeacherService.getAll({
        page: currentPage,
        limit: pageSize,
        search: search || undefined,
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
