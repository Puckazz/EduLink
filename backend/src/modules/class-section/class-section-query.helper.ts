import { Prisma } from '@prisma/client';
import { ClassSectionListQueryDto } from './dto/class-section-list-query.dto';
import { getEffectiveStatusWhere } from './attendance-time.helper';

export interface ClassSectionListQueryBuildResult {
  where: Prisma.ClassSectionWhereInput;
  orderBy: Prisma.ClassSectionOrderByWithRelationInput;
  skip: number;
  take: number;
  page: number;
  limit: number;
}

export function buildClassSectionListQuery(
  query: ClassSectionListQueryDto,
  teacherId?: number,
  now = new Date(),
): ClassSectionListQueryBuildResult {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.max(1, query.limit ?? 12);

  const andConditions: Prisma.ClassSectionWhereInput[] = [];

  if (query.search?.trim()) {
    const keyword = query.search.trim();

    andConditions.push({
      OR: [
        { class_code: { contains: keyword } },
        { teacher_name: { contains: keyword } },
        { room: { contains: keyword } },
        { subject: { subject_code: { contains: keyword } } },
        { subject: { subject_name: { contains: keyword } } },
      ],
    });
  }

  if (query.term_id) {
    andConditions.push({ term_id: query.term_id });
  } else if (query.academic_year_id) {
    andConditions.push({
      term: { academic_year_id: query.academic_year_id },
    });
  }

  if (query.status) {
    andConditions.push(getEffectiveStatusWhere(query.status, now));
  }

  if (query.major_id) {
    andConditions.push({ subject: { major_id: query.major_id } });
  }

  if (teacherId) {
    andConditions.push({ teacher_id: teacherId });
  }

  return {
    where: andConditions.length > 0 ? { AND: andConditions } : {},
    orderBy: { created_at: 'desc' },
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
