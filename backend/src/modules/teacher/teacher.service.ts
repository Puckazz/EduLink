import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { TeacherListQueryDto } from './dto/teacher-list-query.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';

const teacherSelect = {
  teacher_id: true,
  username: true,
  full_name: true,
  email: true,
  phone: true,
  is_locked: true,
  locked_at: true,
  avatar_url: true,
  created_at: true,
  _count: {
    select: {
      classSections: true,
    },
  },
} satisfies Prisma.TeacherSelect;

type TeacherWithCount = Prisma.TeacherGetPayload<{
  select: typeof teacherSelect;
}>;

@Injectable()
export class TeacherService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTeacherDto: CreateTeacherDto) {
    const { password, ...rest } = createTeacherDto;

    try {
      const teacher = await this.prisma.teacher.create({
        data: {
          ...rest,
          password: await bcrypt.hash(password, 10),
        },
        select: teacherSelect,
      });

      return this.mapTeacherResponse(teacher);
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findAll(query: TeacherListQueryDto = {}) {
    const {
      page = '1',
      limit = '10',
      search,
      status,
      sort = 'created_desc',
    } = query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);

    const where: Prisma.TeacherWhereInput = {};
    const keyword = search?.trim();

    if (keyword) {
      where.OR = [
        { full_name: { contains: keyword } },
        { username: { contains: keyword } },
        { email: { contains: keyword } },
        { phone: { contains: keyword } },
      ];
    }

    if (status === 'locked') {
      where.is_locked = true;
    } else if (status === 'active') {
      where.is_locked = false;
    }

    let orderBy: Prisma.TeacherOrderByWithRelationInput = {
      created_at: 'desc',
    };
    if (sort === 'created_asc') orderBy = { created_at: 'asc' };
    else if (sort === 'name_asc') orderBy = { full_name: 'asc' };
    else if (sort === 'name_desc') orderBy = { full_name: 'desc' };

    const isSortingByName = sort === 'name_asc' || sort === 'name_desc';

    const [totalItems, teachers] = await Promise.all([
      this.prisma.teacher.count({ where }),
      this.prisma.teacher.findMany({
        where,
        select: teacherSelect,
        orderBy: isSortingByName ? undefined : orderBy,
        skip: isSortingByName ? undefined : (pageNum - 1) * limitNum,
        take: isSortingByName ? undefined : limitNum,
      }),
    ]);

    let finalTeachers = teachers;
    if (isSortingByName) {
      const order = sort === 'name_desc' ? -1 : 1;
      finalTeachers = [...teachers].sort((a, b) => {
        const nameA = a.full_name.trim().split(' ').pop() || '';
        const nameB = b.full_name.trim().split(' ').pop() || '';
        const cmp = nameA.localeCompare(nameB, 'vi');
        if (cmp !== 0) return cmp * order;
        return a.full_name.localeCompare(b.full_name, 'vi') * order;
      });
      const skip = (pageNum - 1) * limitNum;
      finalTeachers = finalTeachers.slice(skip, skip + limitNum);
    }

    return {
      data: finalTeachers.map((teacher) => this.mapTeacherResponse(teacher)),
      meta: {
        totalItems,
        totalPages: Math.ceil(totalItems / limitNum),
        currentPage: pageNum,
        pageSize: limitNum,
      },
    };
  }

  async findOne(id: number) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { teacher_id: id },
      select: teacherSelect,
    });

    if (!teacher) {
      throw new NotFoundException('Không tìm thấy giảng viên');
    }

    return this.mapTeacherResponse(teacher);
  }

  async update(id: number, updateTeacherDto: UpdateTeacherDto) {
    await this.findOne(id);

    const { password, ...rest } = updateTeacherDto;
    const data: Prisma.TeacherUpdateInput = { ...rest };

    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    try {
      const teacher = await this.prisma.teacher.update({
        where: { teacher_id: id },
        data,
        select: teacherSelect,
      });

      return this.mapTeacherResponse(teacher);
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async remove(id: number) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { teacher_id: id },
      select: teacherSelect,
    });

    if (!teacher) {
      throw new NotFoundException('Không tìm thấy giảng viên');
    }

    if (teacher._count.classSections > 0) {
      throw new BadRequestException(
        'Không thể xóa giảng viên vì đang được gán vào lớp học phần',
      );
    }

    await this.prisma.teacher.delete({
      where: { teacher_id: id },
    });

    return { message: 'Xóa giảng viên thành công' };
  }

  async setLockStatus(id: number, isLocked: boolean) {
    await this.findOne(id);

    try {
      const teacher = await this.prisma.teacher.update({
        where: { teacher_id: id },
        data: {
          is_locked: isLocked,
          locked_at: isLocked ? new Date() : null,
          ...(isLocked ? { refresh_token_hash: null } : {}),
        },
        select: teacherSelect,
      });

      return this.mapTeacherResponse(teacher);
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  private mapTeacherResponse(teacher: TeacherWithCount) {
    const { _count, ...rest } = teacher;
    return {
      ...rest,
      class_section_count: _count.classSections,
    };
  }

  private handlePrismaError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          'Tên đăng nhập, email hoặc số điện thoại đã được sử dụng',
        );
      }

      if (error.code === 'P2025') {
        throw new NotFoundException('Không tìm thấy giảng viên');
      }
    }

    throw new BadRequestException('Không thể xử lý dữ liệu giảng viên');
  }
}
