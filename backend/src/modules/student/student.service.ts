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
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StudentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createStudentDto: CreateStudentDto) {
    try {
      return await this.prisma.student.create({
        data: {
          ...createStudentDto,
          date_of_birth: createStudentDto.date_of_birth
            ? new Date(createStudentDto.date_of_birth)
            : undefined,
        },
        include: {
          parent: {
            select: {
              parent_id: true,
              full_name: true,
              phone: true,
            },
          },
        },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findAll() {
    return this.prisma.student.findMany({
      where: {
        deleted_at: null,
      },
      include: {
        parent: {
          select: {
            parent_id: true,
            full_name: true,
            phone: true,
          },
        },
      },
      orderBy: {
        student_id: 'asc',
      },
    });
  }

  async findOne(id: number) {
    const student = await this.prisma.student.findFirst({
      where: {
        student_id: id,
        deleted_at: null,
      },
      include: {
        parent: {
          select: {
            parent_id: true,
            full_name: true,
            phone: true,
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException('Không tìm thấy học sinh');
    }

    return student;
  }

  async findOneForParent(id: number, parentId: number) {
    const student = await this.findOne(id);

    if (student.parent_id !== parentId) {
      throw new ForbiddenException('Bạn không có quyền xem học sinh này');
    }

    return student;
  }

  async update(id: number, updateStudentDto: UpdateStudentDto) {
    await this.findOne(id);

    try {
      return await this.prisma.student.update({
        where: { student_id: id },
        data: {
          ...updateStudentDto,
          date_of_birth: updateStudentDto.date_of_birth
            ? new Date(updateStudentDto.date_of_birth)
            : updateStudentDto.date_of_birth,
        },
        include: {
          parent: {
            select: {
              parent_id: true,
              full_name: true,
              phone: true,
            },
          },
        },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.student.update({
      where: { student_id: id },
      data: {
        deleted_at: new Date(),
      },
    });
  }

  private handlePrismaError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('Mã học sinh đã tồn tại');
      }

      if (error.code === 'P2003') {
        throw new BadRequestException('Phụ huynh không tồn tại');
      }

      if (error.code === 'P2025') {
        throw new NotFoundException('Không tìm thấy học sinh');
      }
    }

    throw new BadRequestException('Không thể xử lý dữ liệu học sinh');
  }
}
