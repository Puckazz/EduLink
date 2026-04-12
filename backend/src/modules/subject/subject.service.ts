import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { SubjectListQueryDto } from './dto/subject-list-query.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { PrismaService } from '../../prisma/prisma.service';
import {
  buildPaginationMeta,
  buildSubjectListQuery,
} from './subject-query.helper';

const subjectSelect = {
  subject_id: true,
  subject_code: true,
  subject_name: true,
  credit: true,
  _count: {
    select: {
      scores: true,
    },
  },
} satisfies Prisma.SubjectSelect;

@Injectable()
export class SubjectService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSubjectDto: CreateSubjectDto) {
    try {
      return await this.prisma.subject.create({
        data: createSubjectDto,
        select: subjectSelect,
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findAll(query: SubjectListQueryDto) {
    const { where, orderBy, skip, take, page, limit } =
      buildSubjectListQuery(query);

    const [subjects, total] = await this.prisma.$transaction([
      this.prisma.subject.findMany({
        where,
        select: subjectSelect,
        orderBy,
        skip,
        take,
      }),
      this.prisma.subject.count({ where }),
    ]);

    return {
      data: subjects,
      pagination: buildPaginationMeta(total, page, limit),
    };
  }

  async findOne(id: number) {
    const subject = await this.prisma.subject.findUnique({
      where: {
        subject_id: id,
      },
      select: subjectSelect,
    });

    if (!subject) {
      throw new NotFoundException('Không tìm thấy môn học');
    }

    return subject;
  }

  async update(id: number, updateSubjectDto: UpdateSubjectDto) {
    await this.findOne(id);

    try {
      return await this.prisma.subject.update({
        where: { subject_id: id },
        data: updateSubjectDto,
        select: subjectSelect,
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async remove(id: number) {
    await this.findOne(id);

    try {
      return await this.prisma.subject.delete({
        where: { subject_id: id },
        select: subjectSelect,
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  private handlePrismaError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('Mã môn học đã tồn tại');
      }

      if (error.code === 'P2003') {
        throw new BadRequestException(
          'Không thể xóa môn học vì đang có điểm liên kết',
        );
      }

      if (error.code === 'P2025') {
        throw new NotFoundException('Không tìm thấy môn học');
      }
    }

    throw new BadRequestException('Không thể xử lý dữ liệu môn học');
  }
}
