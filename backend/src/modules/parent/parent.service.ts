import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { CreateParentDto } from './dto/create-parent.dto';
import { UpdateParentDto } from './dto/update-parent.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ParentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createParentDto: CreateParentDto) {
    const { password, ...rest } = createParentDto;
    const data: Prisma.ParentCreateInput = { ...rest };

    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    try {
      const parent = await this.prisma.parent.create({ data });
      return parent;
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findAll(query: any = {}) {
    const {
      page = '1',
      limit = '10',
      search,
      status,
      relationship,
      sort = 'created_desc',
    } = query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit as string, 10) || 10);

    const where: Prisma.ParentWhereInput = {};

    if (search) {
      where.OR = [
        { full_name: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
      ];
    }

    if (status === 'locked') {
      where.is_locked = true;
    } else if (status === 'active') {
      where.is_active = true;
      where.is_locked = false;
    } else if (status === 'inactive') {
      where.is_active = false;
      where.is_locked = false;
    }

    if (relationship) {
      where.relationship = relationship as any;
    }

    let orderBy: Prisma.ParentOrderByWithRelationInput = { created_at: 'desc' };
    if (sort === 'created_asc') orderBy = { created_at: 'asc' };
    else if (sort === 'name_asc') orderBy = { full_name: 'asc' };
    else if (sort === 'name_desc') orderBy = { full_name: 'desc' };

    const isSortingByName = sort === 'name_asc' || sort === 'name_desc';

    const [totalItems, parents] = await Promise.all([
      this.prisma.parent.count({ where }),
      this.prisma.parent.findMany({
        where,
        orderBy: isSortingByName ? undefined : orderBy,
        skip: isSortingByName ? undefined : (pageNum - 1) * limitNum,
        take: isSortingByName ? undefined : limitNum,
        select: {
          parent_id: true,
          username: true,
          full_name: true,
          phone: true,
          email: true,
          relationship: true,
          is_active: true,
          is_locked: true,
          locked_at: true,
          created_at: true,
          students: {
            where: { student: { deleted_at: null } },
            select: {
              student: {
                select: {
                  student_id: true,
                  student_code: true,
                  full_name: true,
                  status: true,
                  class: true,
                },
              },
            },
          },
        },
      }),
    ]);

    let finalParents = parents;
    if (isSortingByName) {
      finalParents.sort((a, b) => {
        const nameA = a.full_name.trim().split(' ').pop() || '';
        const nameB = b.full_name.trim().split(' ').pop() || '';
        const order = sort === 'name_desc' ? -1 : 1;

        const cmp = nameA.localeCompare(nameB, 'vi');
        if (cmp !== 0) return cmp * order;
        return a.full_name.localeCompare(b.full_name, 'vi') * order;
      });
      const skip = (pageNum - 1) * limitNum;
      finalParents = finalParents.slice(skip, skip + limitNum);
    }

    return {
      data: finalParents.map((p) => ({
        ...p,
        students: p.students.map((s) => s.student),
      })),
      meta: {
        totalItems,
        totalPages: Math.ceil(totalItems / limitNum),
        currentPage: pageNum,
        pageSize: limitNum,
      },
    };
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
        is_locked: true,
        locked_at: true,
        created_at: true,
        students: {
          where: { student: { deleted_at: null } },
          select: {
            student: {
              select: {
                student_id: true,
                student_code: true,
                full_name: true,
                status: true,
                class: true,
              },
            },
          },
        },
      },
    });

    if (!parent) {
      throw new NotFoundException('Không tìm thấy phụ huynh');
    }

    return {
      ...parent,
      students: parent.students.map((s) => s.student),
    };
  }

  async update(id: number, updateParentDto: UpdateParentDto) {
    await this.findOne(id);

    const { password, ...rest } = updateParentDto;
    const dataToUpdate: Prisma.ParentUpdateInput = { ...rest };

    if (password) {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    try {
      const parent = await this.prisma.parent.update({
        where: { parent_id: id },
        data: dataToUpdate,
        select: {
          parent_id: true,
          username: true,
          full_name: true,
          phone: true,
          email: true,
          relationship: true,
          is_active: true,
          is_locked: true,
          locked_at: true,
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

  async setLockStatus(id: number, isLocked: boolean) {
    await this.findOne(id);

    try {
      return await this.prisma.parent.update({
        where: { parent_id: id },
        data: {
          is_locked: isLocked,
          locked_at: isLocked ? new Date() : null,
          ...(isLocked ? { refresh_token_hash: null } : {}),
        },
        select: {
          parent_id: true,
          username: true,
          full_name: true,
          phone: true,
          email: true,
          relationship: true,
          is_active: true,
          is_locked: true,
          locked_at: true,
          created_at: true,
        },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
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
