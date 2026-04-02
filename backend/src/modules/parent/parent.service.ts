import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateParentDto } from './dto/create-parent.dto';
import { UpdateParentDto } from './dto/update-parent.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { StudentListQueryDto } from '../student/dto/student-list-query.dto';
import {
  buildPaginationMeta,
  buildStudentListQuery,
  mapStudentResponse,
} from '../student/student-query.helper';

@Injectable()
export class ParentService {
  constructor(private readonly prisma: PrismaService) {}

  create(createParentDto: CreateParentDto) {
    return 'This action adds a new parent';
  }

  findAll() {
    return `This action returns all parent`;
  }

  findOne(id: number) {
    return `This action returns a #${id} parent`;
  }

  update(id: number, updateParentDto: UpdateParentDto) {
    return `This action updates a #${id} parent`;
  }

  remove(id: number) {
    return `This action removes a #${id} parent`;
  }

  async getStudentsByParentId(parentId: number, query: StudentListQueryDto) {
    const parent = await this.prisma.parent.findUnique({
      where: { parent_id: parentId },
      select: { parent_id: true },
    });

    if (!parent) {
      throw new NotFoundException('Không tìm thấy phụ huynh');
    }

    const { where, orderBy, skip, take, page, limit } = buildStudentListQuery(
      query,
      {
        forcedParentId: parentId,
      },
    );

    const [students, total] = await this.prisma.$transaction([
      this.prisma.student.findMany({
        where,
        include: {
          parent: {
            select: {
              parent_id: true,
              full_name: true,
              phone: true,
            },
          },
          major: {
            select: {
              major_id: true,
              major_code: true,
              major_name: true,
            },
          },
        },
        orderBy,
        skip,
        take,
      }),
      this.prisma.student.count({ where }),
    ]);

    return {
      data: students.map((student) => mapStudentResponse(student)),
      pagination: buildPaginationMeta(total, page, limit),
    };
  }
}
