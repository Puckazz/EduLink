import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentListQueryDto } from './dto/student-list-query.dto';
import { PrismaService } from '../../prisma/prisma.service';
import {
  buildPaginationMeta,
  buildStudentListQuery,
  mapStudentResponse,
} from './student-query.helper';

@Injectable()
export class StudentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createStudentDto: CreateStudentDto) {
    try {
      const student = await this.prisma.student.create({
        data: {
          ...createStudentDto,
          date_of_birth: createStudentDto.date_of_birth
            ? new Date(createStudentDto.date_of_birth)
            : undefined,
        },
        include: {
          parents: {
            include: {
              parent: {
                select: {
                  parent_id: true,
                  full_name: true,
                  phone: true,
                  email: true,
                },
              },
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
      });

      return mapStudentResponse(student);
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findAll(query: StudentListQueryDto) {
    const { where, orderBy, skip, take, page, limit } =
      buildStudentListQuery(query);

    const [students, total] = await this.prisma.$transaction([
      this.prisma.student.findMany({
        where,
        include: {
          parents: {
            include: {
              parent: {
                select: {
                  parent_id: true,
                  full_name: true,
                  phone: true,
                  email: true,
                },
              },
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

  async findOne(id: number) {
    const student = await this.prisma.student.findFirst({
      where: {
        student_id: id,
        deleted_at: null,
      },
      include: {
        parents: {
          include: {
            parent: {
              select: {
                parent_id: true,
                full_name: true,
                phone: true,
                email: true,
              },
            },
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
    });

    if (!student) {
      throw new NotFoundException('Không tìm thấy học sinh');
    }

    return mapStudentResponse(student);
  }

  async findOneForParent(id: number, parentId: number) {
    // Need to check if this specific parent is linked to the student
    const link = await this.prisma.studentParent.findUnique({
      where: {
        student_id_parent_id: {
          student_id: id,
          parent_id: parentId,
        },
      },
    });

    if (!link) {
      throw new ForbiddenException('Bạn không có quyền xem học sinh này');
    }

    return this.findOne(id);
  }

  async getStudentsForCurrentParent(
    parentId: number,
    query: StudentListQueryDto,
  ) {
    const parent = await this.prisma.parent.findUnique({
      where: { parent_id: parentId },
      select: { parent_id: true },
    });

    if (!parent) {
      throw new NotFoundException('Không tìm thấy phụ huynh');
    }

    const { where, orderBy, skip, take, page, limit } = buildStudentListQuery(
      query,
      { forcedParentId: parentId },
    );

    const [students, total] = await this.prisma.$transaction([
      this.prisma.student.findMany({
        where,
        include: {
          parents: {
            include: {
              parent: {
                select: {
                  parent_id: true,
                  full_name: true,
                  phone: true,
                  email: true,
                },
              },
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

  async update(id: number, updateStudentDto: UpdateStudentDto) {
    await this.findOne(id);

    try {
      const student = await this.prisma.student.update({
        where: { student_id: id },
        data: {
          ...updateStudentDto,
          date_of_birth: updateStudentDto.date_of_birth
            ? new Date(updateStudentDto.date_of_birth)
            : updateStudentDto.date_of_birth,
        },
        include: {
          parents: {
            include: {
              parent: {
                select: {
                  parent_id: true,
                  full_name: true,
                  phone: true,
                  email: true,
                },
              },
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
      });

      return mapStudentResponse(student);
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async remove(id: number) {
    await this.findOne(id);

    const student = await this.prisma.student.update({
      where: { student_id: id },
      data: {
        deleted_at: new Date(),
      },
    });

    return mapStudentResponse(student);
  }

  // ─── STUDENT - PARENT linkage ──────────────────────────────────────────────

  async assignParentToStudent(studentId: number, parentId: number) {
    await this.findOne(studentId);

    const parent = await this.prisma.parent.findUnique({
      where: { parent_id: parentId },
    });

    if (!parent) {
      throw new NotFoundException('Không tìm thấy phụ huynh');
    }

    // Check if student has any parents to decide if this should be primary
    const parentCount = await this.prisma.studentParent.count({
      where: { student_id: studentId },
    });

    const student = await this.prisma.student.update({
      where: { student_id: studentId },
      data: {
        parents: {
          upsert: {
            where: {
              student_id_parent_id: {
                student_id: studentId,
                parent_id: parentId,
              },
            },
            create: {
              parent_id: parentId,
              is_primary: parentCount === 0,
            },
            update: {},
          },
        },
      },
      include: {
        parents: {
          include: {
            parent: {
              select: {
                parent_id: true,
                full_name: true,
                phone: true,
                email: true,
              },
            },
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
    });

    return mapStudentResponse(student);
  }

  async getParentsOfStudent(studentId: number) {
    const student = await this.prisma.student.findFirst({
      where: { student_id: studentId, deleted_at: null },
      include: {
        parents: {
          include: {
            parent: {
              select: {
                parent_id: true,
                full_name: true,
                phone: true,
                email: true,
                relationship: true,
                is_active: true,
                created_at: true,
              },
            },
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException('Không tìm thấy học sinh');
    }

    return {
      data: student.parents ? student.parents.map((p) => ({ ...p.parent, is_primary: p.is_primary })) : [],
    };
  }

  async removeParentFromStudent(studentId: number, parentId: number) {
    const student = await this.prisma.student.findFirst({
      where: { student_id: studentId, deleted_at: null },
    });

    if (!student) {
      throw new NotFoundException('Không tìm thấy học sinh');
    }

    const link = await this.prisma.studentParent.findUnique({
      where: {
        student_id_parent_id: {
          student_id: studentId,
          parent_id: parentId,
        },
      },
    });

    if (!link) {
      throw new BadRequestException(
        'Phụ huynh này không được liên kết với học sinh',
      );
    }

    const updated = await this.prisma.student.update({
      where: { student_id: studentId },
      data: {
        parents: {
          delete: {
            student_id_parent_id: {
              student_id: studentId,
              parent_id: parentId,
            },
          },
        },
      },
      include: {
        parents: {
          include: {
            parent: {
              select: {
                parent_id: true,
                full_name: true,
                phone: true,
                email: true,
              },
            },
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
    });

    return mapStudentResponse(updated);
  }

  private handlePrismaError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('Mã học sinh đã tồn tại');
      }

      if (error.code === 'P2003') {
        throw new BadRequestException(
          'Phụ huynh hoặc chuyên ngành không tồn tại',
        );
      }

      if (error.code === 'P2025') {
        throw new NotFoundException('Không tìm thấy học sinh');
      }
    }

    throw new BadRequestException('Không thể xử lý dữ liệu học sinh');
  }
}
