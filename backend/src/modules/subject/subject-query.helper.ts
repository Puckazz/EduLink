import { Prisma } from '@prisma/client';
import { SubjectListQueryDto } from './dto/subject-list-query.dto';

export interface SubjectListQueryBuildResult {
  where: Prisma.SubjectWhereInput;
  orderBy: Prisma.SubjectOrderByWithRelationInput;
  skip: number;
  take: number;
  page: number;
  limit: number;
}

export function buildSubjectListQuery(
  query: SubjectListQueryDto,
): SubjectListQueryBuildResult {
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;

  const andConditions: Prisma.SubjectWhereInput[] = [];

  if (query.search?.trim()) {
    const keyword = query.search.trim();

    andConditions.push({
      OR: [
        {
          subject_code: {
            contains: keyword,
          },
        },
        {
          subject_name: {
            contains: keyword,
          },
        },
      ],
    });
  }

  if (query.major_id !== undefined) {
    andConditions.push({ major_id: query.major_id });
  }

  const where: Prisma.SubjectWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const orderBy: Prisma.SubjectOrderByWithRelationInput = {
    [query.sort_by ?? 'subject_id']: query.sort_order ?? 'asc',
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
