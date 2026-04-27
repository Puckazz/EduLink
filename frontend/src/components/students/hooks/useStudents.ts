import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { StudentService } from '@/services/student.service';
import type {
  StudentListQuery,
  StudentListResponse,
  StudentStatusValue,
  StudentSortOption,
} from '@/types/student';

interface UseStudentsParams {
  currentPage: number;
  pageSize: number;
  search: string;
  majorId: string;
  status: '' | StudentStatusValue;
  sort: StudentSortOption;
}

function buildStudentsQueryParams({
  currentPage,
  pageSize,
  search,
  majorId,
  status,
  sort,
}: UseStudentsParams): StudentListQuery {
  let sort_by: StudentListQuery['sort_by'] = 'created_at';
  let sort_order: StudentListQuery['sort_order'] = 'desc';

  if (sort === 'created_asc') { sort_by = 'created_at'; sort_order = 'asc'; }
  else if (sort === 'name_asc') { sort_by = 'full_name'; sort_order = 'asc'; }
  else if (sort === 'name_desc') { sort_by = 'full_name'; sort_order = 'desc'; }
  else if (sort === 'id_asc') { sort_by = 'student_id'; sort_order = 'asc'; }
  else if (sort === 'id_desc') { sort_by = 'student_id'; sort_order = 'desc'; }

  return {
    page: currentPage,
    limit: pageSize,
    search: search || undefined,
    major_id: majorId ? Number(majorId) : undefined,
    status: status || undefined,
    sort_by,
    sort_order,
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
