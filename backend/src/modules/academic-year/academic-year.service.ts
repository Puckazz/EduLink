import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  type EffectiveStatus,
  getEffectiveAcademicStatusWhere,
  withEffectiveAcademicStatus,
} from '../academic-term/academic-period-status.helper';
import { CreateAcademicYearDto } from './dto/create-academic-year.dto';
import { UpdateAcademicYearDto } from './dto/update-academic-year.dto';

export const academicYearSelect = {
  academic_year_id: true,
  name: true,
  start_date: true,
  end_date: true,
  created_at: true,
  updated_at: true,
} satisfies Prisma.AcademicYearSelect;

function toDateOnly(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function ensureValidDateRange(startDate: Date, endDate: Date) {
  if (endDate < startDate) {
    throw new BadRequestException('Ngày kết thúc phải sau ngày bắt đầu');
  }
}

@Injectable()
export class AcademicYearService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(effectiveStatus?: EffectiveStatus) {
    const years = await this.prisma.academicYear.findMany({
      where: effectiveStatus
        ? getEffectiveAcademicStatusWhere(effectiveStatus)
        : {},
      select: academicYearSelect,
      orderBy: { start_date: 'desc' },
    });
    return years.map((year) => withEffectiveAcademicStatus(year));
  }

  async findOne(id: number) {
    const year = await this.prisma.academicYear.findUnique({
      where: { academic_year_id: id },
      select: academicYearSelect,
    });
    if (!year) throw new NotFoundException('Không tìm thấy năm học');
    return withEffectiveAcademicStatus(year);
  }

  async create(dto: CreateAcademicYearDto) {
    const startDate = toDateOnly(dto.start_date);
    const endDate = toDateOnly(dto.end_date);
    ensureValidDateRange(startDate, endDate);

    try {
      const year = await this.prisma.academicYear.create({
        data: {
          name: dto.name.trim(),
          start_date: startDate,
          end_date: endDate,
        },
        select: academicYearSelect,
      });
      return withEffectiveAcademicStatus(year);
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async update(id: number, dto: UpdateAcademicYearDto) {
    const existing = await this.findOne(id);
    const startDate = dto.start_date
      ? toDateOnly(dto.start_date)
      : existing.start_date;
    const endDate = dto.end_date ? toDateOnly(dto.end_date) : existing.end_date;
    ensureValidDateRange(startDate, endDate);

    try {
      const year = await this.prisma.academicYear.update({
        where: { academic_year_id: id },
        data: {
          ...(dto.name !== undefined && { name: dto.name.trim() }),
          ...(dto.start_date !== undefined && { start_date: startDate }),
          ...(dto.end_date !== undefined && { end_date: endDate }),
        },
        select: academicYearSelect,
      });
      return withEffectiveAcademicStatus(year);
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    const terms = await this.prisma.academicTerm.count({
      where: { academic_year_id: id },
    });
    if (terms > 0) {
      throw new BadRequestException('Không thể xóa năm học đã có học kỳ');
    }

    const year = await this.prisma.academicYear.delete({
      where: { academic_year_id: id },
      select: academicYearSelect,
    });
    return withEffectiveAcademicStatus(year);
  }

  async ensureExists(id: number) {
    const year = await this.prisma.academicYear.findUnique({
      where: { academic_year_id: id },
      select: academicYearSelect,
    });
    if (!year) throw new NotFoundException('Không tìm thấy năm học');
    return withEffectiveAcademicStatus(year);
  }

  private handlePrismaError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('Năm học này đã tồn tại');
      }
    }
    throw error;
  }
}
