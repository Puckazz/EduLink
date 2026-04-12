import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateScoreDto } from './dto/create-score.dto';
import { ScoreListQueryDto } from './dto/score-list-query.dto';
import { UpdateScoreDto } from './dto/update-score.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { buildPaginationMeta, buildScoreListQuery } from './score-query.helper';

const scoreSelect = {
  score_id: true,
  semester: true,
  year: true,
  score_value: true,
  created_at: true,
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
} satisfies Prisma.ScoreSelect;

@Injectable()
export class ScoreService {
  constructor(private readonly prisma: PrismaService) {}

  async createForStudent(studentId: number, createScoreDto: CreateScoreDto) {
    await this.ensureStudentExists(studentId);
    await this.ensureSubjectExists(createScoreDto.subject_id);

    try {
      return await this.prisma.score.create({
        data: {
          student_id: studentId,
          subject_id: createScoreDto.subject_id,
          semester: createScoreDto.semester,
          year: createScoreDto.year,
          score_value: createScoreDto.score_value,
        },
        select: scoreSelect,
      });
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
      data: scores,
      pagination: buildPaginationMeta(total, page, limit),
    };
  }

  async findByStudentForParent(
    studentId: number,
    parentId: number,
    query: ScoreListQueryDto,
  ) {
    const student = await this.ensureStudentExists(studentId);

    if (student.parent_id !== parentId) {
      throw new ForbiddenException(
        'Bạn không có quyền xem điểm của học sinh này',
      );
    }

    return this.findByStudent(studentId, query);
  }

  async findOne(id: number) {
    const score = await this.prisma.score.findUnique({
      where: { score_id: id },
      select: scoreSelect,
    });

    if (!score) {
      throw new NotFoundException('Không tìm thấy điểm');
    }

    return score;
  }

  async update(id: number, updateScoreDto: UpdateScoreDto) {
    const score = await this.findOne(id);

    if (updateScoreDto.subject_id) {
      await this.ensureSubjectExists(updateScoreDto.subject_id);
    }

    if (
      updateScoreDto.subject_id ||
      updateScoreDto.semester ||
      updateScoreDto.year
    ) {
      const duplicate = await this.prisma.score.findFirst({
        where: {
          student_id: score.student_id,
          subject_id: updateScoreDto.subject_id ?? score.subject_id,
          semester: updateScoreDto.semester ?? score.semester,
          year: updateScoreDto.year ?? score.year,
          NOT: {
            score_id: id,
          },
        },
        select: {
          score_id: true,
        },
      });

      if (duplicate) {
        throw new ConflictException('Điểm của môn học trong kỳ này đã tồn tại');
      }
    }

    try {
      return await this.prisma.score.update({
        where: { score_id: id },
        data: updateScoreDto,
        select: scoreSelect,
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async remove(id: number) {
    await this.findOne(id);

    try {
      return await this.prisma.score.delete({
        where: { score_id: id },
        select: scoreSelect,
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  private async ensureStudentExists(studentId: number) {
    const student = await this.prisma.student.findFirst({
      where: {
        student_id: studentId,
        deleted_at: null,
      },
      select: {
        student_id: true,
        parent_id: true,
      },
    });

    if (!student) {
      throw new NotFoundException('Không tìm thấy học sinh');
    }

    return student;
  }

  private async ensureSubjectExists(subjectId: number) {
    const subject = await this.prisma.subject.findUnique({
      where: {
        subject_id: subjectId,
      },
      select: {
        subject_id: true,
      },
    });

    if (!subject) {
      throw new NotFoundException('Không tìm thấy môn học');
    }

    return subject;
  }

  private handlePrismaError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('Điểm của môn học trong kỳ này đã tồn tại');
      }

      if (error.code === 'P2003') {
        throw new BadRequestException(
          'Không thể xử lý điểm vì dữ liệu học sinh hoặc môn học không hợp lệ',
        );
      }

      if (error.code === 'P2025') {
        throw new NotFoundException('Không tìm thấy điểm');
      }
    }

    throw new BadRequestException('Không thể xử lý dữ liệu điểm');
  }
}
