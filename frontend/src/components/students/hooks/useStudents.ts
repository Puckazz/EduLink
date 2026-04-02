import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { StudentService } from '@/services/student.service';
import type {
  StudentListQuery,
  StudentListResponse,
  StudentStatusValue,
} from '@/types/student';

interface UseStudentsParams {
  currentPage: number;
  pageSize: number;
  search: string;
  majorId: string;
  status: '' | StudentStatusValue;
}

function buildStudentsQueryParams({
  currentPage,
  pageSize,
  search,
  majorId,
  status,
}: UseStudentsParams): StudentListQuery {
  return {
    page: currentPage,
    limit: pageSize,
    search: search || undefined,
    major_id: majorId ? Number(majorId) : undefined,
    status: status || undefined,
  };
}

export function useStudents(params: UseStudentsParams) {
  const queryParams = buildStudentsQueryParams(params);

  return useQuery<StudentListResponse>({
    queryKey: ['students', queryParams],
    queryFn: () => StudentService.getAll(queryParams),
    placeholderData: keepPreviousData,
  });
}
