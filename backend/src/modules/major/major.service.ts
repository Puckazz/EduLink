import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateMajorDto } from './dto/create-major.dto';
import { UpdateMajorDto } from './dto/update-major.dto';
import { PrismaService } from '../../prisma/prisma.service';

const majorSelect = {
  major_id: true,
  major_code: true,
  major_name: true,
  created_at: true,
  _count: {
    select: {
      students: true,
    },
  },
} satisfies Prisma.MajorSelect;

@Injectable()
export class MajorService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createMajorDto: CreateMajorDto) {
    try {
      return await this.prisma.major.create({
        data: createMajorDto,
        select: majorSelect,
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findAll() {
    return this.prisma.major.findMany({
      select: majorSelect,
      orderBy: {
        major_name: 'asc',
      },
    });
  }

  async findOne(id: number) {
    const major = await this.prisma.major.findUnique({
      where: { major_id: id },
      select: majorSelect,
    });

    if (!major) {
      throw new NotFoundException('Không tìm thấy chuyên ngành');
    }

    return major;
  }

  async update(id: number, updateMajorDto: UpdateMajorDto) {
    await this.findOne(id);

    try {
      return await this.prisma.major.update({
        where: { major_id: id },
        data: updateMajorDto,
        select: majorSelect,
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async remove(id: number) {
    await this.findOne(id);

    try {
      return await this.prisma.major.delete({
        where: { major_id: id },
        select: majorSelect,
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  private handlePrismaError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('Mã chuyên ngành đã tồn tại');
      }

      if (error.code === 'P2003') {
        throw new BadRequestException(
          'Không thể xóa chuyên ngành vì đang có sinh viên liên kết',
        );
      }

      if (error.code === 'P2025') {
        throw new NotFoundException('Không tìm thấy chuyên ngành');
      }
    }

    throw new BadRequestException('Không thể xử lý dữ liệu chuyên ngành');
  }
}
