import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateParentDto } from './dto/create-parent.dto';
import { UpdateParentDto } from './dto/update-parent.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ParentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createParentDto: CreateParentDto) {
    try {
      const parent = await this.prisma.parent.create({
        data: createParentDto,
      });

      return parent;
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findAll() {
    const parents = await this.prisma.parent.findMany({
      select: {
        parent_id: true,
        username: true,
        full_name: true,
        phone: true,
        email: true,
        relationship: true,
        is_active: true,
        created_at: true,
      },
      orderBy: { created_at: 'desc' },
    });

    return { data: parents };
  }

  async findOne(id: number) {
    const parent = await this.prisma.parent.findUnique({
      where: { parent_id: id },
      select: {
        parent_id: true,
        username: true,
        full_name: true,
        phone: true,
        email: true,
        relationship: true,
        is_active: true,
        created_at: true,
        students: {
          where: { deleted_at: null },
          select: {
            student_id: true,
            student_code: true,
            full_name: true,
            status: true,
            class: true,
          },
        },
      },
    });

    if (!parent) {
      throw new NotFoundException('Không tìm thấy phụ huynh');
    }

    return parent;
  }

  async update(id: number, updateParentDto: UpdateParentDto) {
    await this.findOne(id);

    try {
      const parent = await this.prisma.parent.update({
        where: { parent_id: id },
        data: updateParentDto,
        select: {
          parent_id: true,
          username: true,
          full_name: true,
          phone: true,
          email: true,
          relationship: true,
          is_active: true,
          created_at: true,
        },
      });

      return parent;
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async remove(id: number) {
    await this.findOne(id);

    await this.prisma.parent.delete({
      where: { parent_id: id },
    });

    return { message: 'Xóa phụ huynh thành công' };
  }

  private handlePrismaError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('Số điện thoại hoặc email đã được sử dụng');
      }

      if (error.code === 'P2025') {
        throw new NotFoundException('Không tìm thấy phụ huynh');
      }
    }

    throw new BadRequestException('Không thể xử lý dữ liệu phụ huynh');
  }
}
