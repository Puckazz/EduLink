import { Prisma } from '@prisma/client';
import { StudentListQueryDto } from './dto/student-list-query.dto';

interface BuildStudentListOptions {
  forcedParentId?: number;
  includeDeleted?: boolean;
}

export interface StudentListQueryBuildResult {
  where: Prisma.StudentWhereInput;
  orderBy: Prisma.StudentOrderByWithRelationInput;
  skip: number;
  take: number;
  page: number;
  limit: number;
}

export function buildStudentListQuery(
  query: StudentListQueryDto,
  options?: BuildStudentListOptions,
): StudentListQueryBuildResult {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.max(1, query.limit ?? 10);

  const andConditions: Prisma.StudentWhereInput[] = [];

  if (!options?.includeDeleted) {
    andConditions.push({ deleted_at: null });
  }

  if (options?.forcedParentId) {
    andConditions.push({ parents: { some: { parent_id: options.forcedParentId } } });
  } else if (query.parent_id) {
    andConditions.push({ parents: { some: { parent_id: query.parent_id } } });
  }

  if (query.major_id) {
    andConditions.push({ major_id: query.major_id });
  }

  if (query.status) {
    andConditions.push({ status: query.status });
  }

  if (query.class) {
    andConditions.push({
      class: {
        contains: query.class.trim(),
      },
    });
  }

  if (query.search?.trim()) {
    const keyword = query.search.trim();

    const searchConditions: Prisma.StudentWhereInput[] = [
      {
        student_code: {
          contains: keyword,
        },
      },
      {
        full_name: {
          contains: keyword,
        },
      },
      {
        class: {
          contains: keyword,
        },
      },
      {
        parents: {
          some: {
            parent: {
              full_name: {
                contains: keyword,
              },
            },
          },
        },
      },
    ];

    searchConditions.push({
      email: {
        contains: keyword,
      },
    } as Prisma.StudentWhereInput);

    andConditions.push({
      OR: searchConditions,
    });
  }

  const where: Prisma.StudentWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const orderBy: Prisma.StudentOrderByWithRelationInput = {
    [query.sort_by ?? 'student_id']: query.sort_order ?? 'asc',
  };

  return {
    where,
    orderBy,
    skip: (page - 1) * limit,
    take: limit,
    page,
    limit,
  };
}

export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number,
) {
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

  return {
    total,
    page,
    limit,
    total_pages: totalPages,
    has_prev: page > 1,
    has_next: totalPages > 0 && page < totalPages,
  };
}

export function mapStudentStatusToVietnamese(status: string): string {
  const statusMap: Record<string, string> = {
    DANG_HOC: 'Đang học',
    BAO_LUU: 'Bảo lưu',
    DINH_CHI: 'Đình chỉ',
  };

  return statusMap[status] ?? status;
}

export function mapStudentResponse<T extends Record<string, unknown>>(
  student: T,
): any {
  const result = { ...student } as any;

  if (typeof result.status === 'string') {
    result.status = mapStudentStatusToVietnamese(result.status);
  }

  if (Array.isArray(result.parents)) {
    const primary = result.parents.find((p: any) => p.is_primary);
    const first = result.parents[0];

    if (primary && primary.parent) {
      result.parent = primary.parent;
    } else if (first && first.parent) {
      result.parent = first.parent;
    } else {
      result.parent = null;
    }

    result.parents = result.parents.map((p: any) => ({
      is_primary: p.is_primary,
      ...p.parent,
    }));
  }

  return result;
}
