import { Prisma } from '@prisma/client';
import { ScoreListQueryDto } from './dto/score-list-query.dto';

export interface ScoreListQueryBuildResult {
  where: Prisma.ScoreWhereInput;
  orderBy: Prisma.ScoreOrderByWithRelationInput;
  skip: number;
  take: number;
  page: number;
  limit: number;
}

export function buildScoreListQuery(
  studentId: number,
  query: ScoreListQueryDto,
): ScoreListQueryBuildResult {
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;

  const andConditions: Prisma.ScoreWhereInput[] = [{ student_id: studentId }];

  if (query.subject_id) {
    andConditions.push({ subject_id: query.subject_id });
  }

  if (query.semester?.trim()) {
    andConditions.push({
      semester: {
        equals: query.semester.trim(),
      },
    });
  }

  if (query.year) {
    andConditions.push({ year: query.year } as Prisma.ScoreWhereInput);
  }

  const where: Prisma.ScoreWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const orderBy: Prisma.ScoreOrderByWithRelationInput = {
    [query.sort_by ?? 'score_id']: query.sort_order ?? 'asc',
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
