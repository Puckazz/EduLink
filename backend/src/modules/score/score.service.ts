import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateScoreDto } from './dto/create-score.dto';
import { UpdateScoreDto } from './dto/update-score.dto';
import {
  BulkPublishDto,
  BulkUpdateScoreDto,
  ScorebookQueryDto,
} from './dto/scorebook.dto';
import { ScoreListQueryDto } from './dto/score-list-query.dto';
import { buildPaginationMeta, buildScoreListQuery } from './score-query.helper';
import {
  academicTermSelect,
  withEffectiveTermStatus,
} from '../academic-term/academic-term.service';

const scoreSelect = {
  score_id: true,
  term_id: true,
  term: {
    select: academicTermSelect,
  },
  assignment: true,
  midterm: true,
  final: true,
  avg: true,
  note: true,
  publish_status: true,
  created_at: true,
  updated_at: true,
  student_id: true,
  subject_id: true,
  subject: {
    select: {
      subject_id: true,
      subject_code: true,
      subject_name: true,
      credit: true,
    },
  },
  student: {
    select: {
      student_code: true,
      full_name: true,
    },
  },
} satisfies Prisma.ScoreSelect;

function withEffectiveScoreTerm<T extends { term: Parameters<typeof withEffectiveTermStatus>[0] }>(
  score: T,
) {
  return {
    ...score,
    term: withEffectiveTermStatus(score.term),
  };
}

function hideDraftScoreValues<T extends {
  publish_status: string;
  assignment: number | null;
  midterm: number | null;
  final: number | null;
  avg: number | null;
}>(score: T): T {
  if (score.publish_status === 'PUBLISHED') return score;

  return {
    ...score,
    assignment: null,
    midterm: null,
    final: null,
    avg: null,
  };
}

function getUpdatedScoreComponent(
  dto: UpdateScoreDto,
  key: 'assignment' | 'midterm' | 'final',
  currentValue: number | null,
) {
  if (!Object.prototype.hasOwnProperty.call(dto, key)) {
    return currentValue;
  }

  return dto[key] ?? null;
}

/** Compute weighted average: assignment 20%, midterm 30%, final 50% */
function computeAvg(
  assignment?: number | null,
  midterm?: number | null,
  final?: number | null,
): number | null {
  const weights: Array<[number | null | undefined, number]> = [
    [assignment, 0.2],
    [midterm, 0.3],
    [final, 0.5],
  ];

  const available = weights.filter(([v]) => v != null) as [number, number][];
  if (available.length === 0) return null;

  const totalWeight = available.reduce((s, [, w]) => s + w, 0);
  const total = available.reduce((s, [v, w]) => s + v * w, 0);
  return Math.round((total / totalWeight) * 100) / 100;
}

@Injectable()
export class ScoreService {
  constructor(private readonly prisma: PrismaService) {}

  async createForStudent(
    studentId: number,
    createScoreDto: CreateScoreDto,
    actor = 'Admin',
  ) {
    await this.ensureStudentExists(studentId);
    await this.ensureSubjectExists(createScoreDto.subject_id);
    await this.ensureTermExists(createScoreDto.term_id);

    const avg = computeAvg(
      createScoreDto.assignment,
      createScoreDto.midterm,
      createScoreDto.final,
    );

    try {
      const score = await this.prisma.score.create({
        data: {
          student_id: studentId,
          subject_id: createScoreDto.subject_id,
          term_id: createScoreDto.term_id,
          assignment: createScoreDto.assignment,
          midterm: createScoreDto.midterm,
          final: createScoreDto.final,
          avg,
          note: createScoreDto.note,
        },
        select: scoreSelect,
      });

      await this.logManualScoreAction(
        actor,
        'MANUAL_CREATE',
        score,
        'Tạo điểm',
      );

      return withEffectiveScoreTerm(score);
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findByStudent(studentId: number, query: ScoreListQueryDto) {
    await this.ensureStudentExists(studentId);

    const { where, orderBy, skip, take, page, limit } = buildScoreListQuery(
      studentId,
      query,
    );

    const [scores, total] = await this.prisma.$transaction([
      this.prisma.score.findMany({
        where,
        orderBy,
        skip,
        take,
        select: scoreSelect,
      }),
      this.prisma.score.count({ where }),
    ]);

    return {
      data: scores.map(withEffectiveScoreTerm),
      pagination: buildPaginationMeta(total, page, limit),
    };
  }

  async findByStudentForParent(
    studentId: number,
    parentId: number,
    query: ScoreListQueryDto,
  ) {
    const student = await this.ensureStudentExists(studentId);

    const link = await this.prisma.studentParent.findUnique({
      where: {
        student_id_parent_id: {
          student_id: studentId,
          parent_id: parentId,
        },
      },
    });

    if (!link) {
      throw new ForbiddenException(
        'Bạn không có quyền xem điểm của học sinh này',
      );
    }

    const result = await this.findByStudent(studentId, query);

    return {
      ...result,
      data: result.data.map(hideDraftScoreValues),
    };
  }

  async findOne(id: number) {
    const score = await this.prisma.score.findUnique({
      where: { score_id: id },
      select: scoreSelect,
    });

    if (!score) throw new NotFoundException('Không tìm thấy điểm');
    return withEffectiveScoreTerm(score);
  }

  async update(id: number, updateScoreDto: UpdateScoreDto, actor = 'Admin') {
    const existing = await this.findOne(id);

    const newAssignment = getUpdatedScoreComponent(
      updateScoreDto,
      'assignment',
      existing.assignment,
    );
    const newMidterm = getUpdatedScoreComponent(
      updateScoreDto,
      'midterm',
      existing.midterm,
    );
    const newFinal = getUpdatedScoreComponent(
      updateScoreDto,
      'final',
      existing.final,
    );
    const avg = computeAvg(newAssignment, newMidterm, newFinal);

    try {
      const score = await this.prisma.score.update({
        where: { score_id: id },
        data: { ...updateScoreDto, avg },
        select: scoreSelect,
      });

      await this.logManualScoreAction(
        actor,
        'MANUAL_EDIT',
        score,
        'Chỉnh sửa điểm',
      );

      return withEffectiveScoreTerm(score);
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async remove(id: number, actor = 'Admin') {
    const existing = await this.findOne(id);

    if (existing.publish_status === 'PUBLISHED') {
      throw new BadRequestException(
        'Không thể xóa điểm đã công bố. Vui lòng hủy công bố trước.',
      );
    }

    try {
      const score = await this.prisma.score.delete({
        where: { score_id: id },
        select: scoreSelect,
      });

      await this.logManualScoreAction(actor, 'MANUAL_DELETE', score, 'Xóa điểm');

      return withEffectiveScoreTerm(score);
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async getScorebook(query: ScorebookQueryDto) {
    const studentWhere: Prisma.StudentWhereInput = { deleted_at: null };

    if (query.major) {
      studentWhere.major = { major_name: query.major };
    }

    if (query.class) {
      studentWhere.class = query.class;
    }

    if (query.search?.trim()) {
      const kw = query.search.trim();
      studentWhere.OR = [
        { full_name: { contains: kw } },
        { student_code: { contains: kw } },
      ];
    }

    const students = await this.prisma.student.findMany({
      where: studentWhere,
      select: {
        student_id: true,
        student_code: true,
        full_name: true,
        class: true,
        major: { select: { major_name: true } },
        scores: {
          where: {
            ...(query.subject_id ? { subject_id: query.subject_id } : {}),
            ...(query.term_id
              ? { term_id: query.term_id }
              : query.academic_year_id
                ? { term: { academic_year_id: query.academic_year_id } }
                : {}),
          },
          select: scoreSelect,
        },
      },
      orderBy: { full_name: 'asc' },
    });

    const result = [];
    for (const student of students) {
      if (student.scores.length === 0) {
        if (query.subject_id) {
          result.push({
            student_id: student.student_id,
            student_code: student.student_code,
            full_name: student.full_name,
            class_name: student.class ?? '',
            major_name: student.major?.major_name ?? '',
            score: null,
          });
        }
      } else {
        for (const score of student.scores) {
          result.push({
            student_id: student.student_id,
            student_code: student.student_code,
            full_name: student.full_name,
            class_name: student.class ?? '',
            major_name: student.major?.major_name ?? '',
            score: withEffectiveScoreTerm(score),
          });
        }
      }
    }
    return result;
  }

  async bulkUpdate(dto: BulkUpdateScoreDto, adminName: string) {
    await this.ensureSubjectExists(dto.subject_id);
    await this.ensureTermExists(dto.term_id);

    const updatedIds: number[] = [];

    for (const row of dto.rows) {
      const avg = computeAvg(row.assignment, row.midterm, row.final);

      const existing = await this.prisma.score.findFirst({
        where: {
          student_id: row.student_id,
          subject_id: dto.subject_id,
          term_id: dto.term_id,
        },
        select: { score_id: true },
      });

      if (existing) {
        await this.prisma.score.update({
          where: { score_id: existing.score_id },
          data: {
            assignment: row.assignment,
            midterm: row.midterm,
            final: row.final,
            avg,
            note: row.note,
          },
        });
        updatedIds.push(existing.score_id);
      } else {
        await this.prisma.score.create({
          data: {
            student_id: row.student_id,
            subject_id: dto.subject_id,
            term_id: dto.term_id,
            assignment: row.assignment,
            midterm: row.midterm,
            final: row.final,
            avg,
            note: row.note,
          },
        });
        updatedIds.push(-1);
      }
    }

    await this.prisma.scoreLog.create({
      data: {
        actor: adminName,
        action: dto.log_action ?? 'BULK_IMPORT',
        description:
          dto.log_description ??
          `Import Excel và cập nhật ${dto.rows.length} học sinh.`,
      },
    });

    return { updated: dto.rows.length };
  }

  async bulkPublish(dto: BulkPublishDto, adminName: string) {
    const where: Prisma.ScoreWhereInput = {};

    if (dto.score_ids && dto.score_ids.length > 0) {
      where.score_id = { in: dto.score_ids };
    } else {
      if (dto.subject_id) where.subject_id = dto.subject_id;
      if (dto.term_id) where.term_id = dto.term_id;
      else if (dto.academic_year_id) {
        where.term = { academic_year_id: dto.academic_year_id };
      }
      if (dto.major || dto.class) {
        where.student = {
          deleted_at: null,
          ...(dto.major ? { major: { major_name: dto.major } } : {}),
          ...(dto.class ? { class: dto.class } : {}),
        };
      }
    }

    const result = await this.prisma.score.updateMany({
      where,
      data: { publish_status: dto.status },
    });

    const actionLabel = dto.status === 'PUBLISHED' ? 'Công bố' : 'Hủy công bố';

    await this.prisma.scoreLog.create({
      data: {
        actor: adminName,
        action: dto.status === 'PUBLISHED' ? 'PUBLISH' : 'UNPUBLISH',
        description: `${actionLabel} bảng điểm cho ${result.count} bản ghi.`,
      },
    });

    return { updated: result.count, status: dto.status };
  }

  async getLogs(limit = 50) {
    return this.prisma.scoreLog.findMany({
      orderBy: { created_at: 'desc' },
      take: limit,
    });
  }

  private async logManualScoreAction(
    actor: string,
    action: string,
    score: Prisma.ScoreGetPayload<{ select: typeof scoreSelect }>,
    actionLabel: string,
  ) {
    await this.prisma.scoreLog.create({
      data: {
        actor,
        action,
        student_code: score.student?.student_code,
        student_name: score.student?.full_name,
        description: `${actionLabel} sinh viên ${score.student?.student_code ?? `#${score.student_id}`} (${score.student?.full_name ?? 'Không rõ tên'}) môn ${score.subject?.subject_name ?? `#${score.subject_id}`}.`,
      },
    });
  }

  private async ensureStudentExists(studentId: number) {
    const student = await this.prisma.student.findFirst({
      where: { student_id: studentId, deleted_at: null },
      select: { student_id: true },
    });

    if (!student) throw new NotFoundException('Không tìm thấy học sinh');
    return student;
  }

  private async ensureSubjectExists(subjectId: number) {
    const subject = await this.prisma.subject.findUnique({
      where: { subject_id: subjectId },
      select: { subject_id: true },
    });

    if (!subject) throw new NotFoundException('Không tìm thấy môn học');
    return subject;
  }

  private async ensureTermExists(termId: number) {
    const term = await this.prisma.academicTerm.findUnique({
      where: { term_id: termId },
      select: { term_id: true },
    });

    if (!term) throw new NotFoundException('Không tìm thấy học kỳ');
    return term;
  }

  private handlePrismaError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002')
        throw new ConflictException('Điểm của môn học trong kỳ này đã tồn tại');
      if (error.code === 'P2003')
        throw new BadRequestException(
          'Dữ liệu học sinh hoặc môn học không hợp lệ',
        );
      if (error.code === 'P2025')
        throw new NotFoundException('Không tìm thấy điểm');
    }
    throw new BadRequestException('Không thể xử lý dữ liệu điểm');
  }
}
