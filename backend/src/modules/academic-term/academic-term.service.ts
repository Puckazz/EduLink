import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AcademicPeriodStatus, AcademicTermCode, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  getEffectiveAcademicStatusWhere,
  withEffectiveAcademicStatus,
} from './academic-period-status.helper';
import { CreateAcademicTermDto } from './dto/create-academic-term.dto';
import { UpdateAcademicTermDto } from './dto/update-academic-term.dto';

const academicYearSelect = {
  academic_year_id: true,
  name: true,
  start_date: true,
  end_date: true,
  status: true,
} satisfies Prisma.AcademicYearSelect;

export const academicTermSelect = {
  term_id: true,
  code: true,
  name: true,
  start_date: true,
  end_date: true,
  status: true,
  created_at: true,
  updated_at: true,
  academic_year_id: true,
  academic_year: {
    select: academicYearSelect,
  },
} satisfies Prisma.AcademicTermSelect;

function toDateOnly(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function defaultTermName(code: AcademicTermCode, academicYearName: string) {
  const label =
    code === AcademicTermCode.HK1
      ? 'Học kỳ I'
      : code === AcademicTermCode.HK2
        ? 'Học kỳ II'
        : 'Học kỳ hè';
  return `${label} - ${academicYearName}`;
}

function ensureDateRange(startDate: Date, endDate: Date) {
  if (endDate < startDate) {
    throw new BadRequestException('Ngày kết thúc học kỳ phải sau ngày bắt đầu');
  }
}

function ensureWithinAcademicYear(
  startDate: Date,
  endDate: Date,
  academicYear: { start_date: Date; end_date: Date },
) {
  if (startDate < academicYear.start_date || endDate > academicYear.end_date) {
    throw new BadRequestException(
      'Ngày học kỳ phải nằm trong khoảng thời gian của năm học',
    );
  }
}

function withEffectiveTermStatus<
  T extends {
    start_date: Date;
    end_date: Date;
    status: AcademicPeriodStatus;
    academic_year: {
      start_date: Date;
      end_date: Date;
      status: AcademicPeriodStatus;
    };
  },
>(term: T): T {
  return {
    ...withEffectiveAcademicStatus(term),
    academic_year: withEffectiveAcademicStatus(term.academic_year),
  };
}

@Injectable()
export class AcademicTermService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(academicYearId?: number, status?: AcademicPeriodStatus) {
    const terms = await this.prisma.academicTerm.findMany({
      where: {
        ...(academicYearId ? { academic_year_id: academicYearId } : {}),
        ...(status ? getEffectiveAcademicStatusWhere(status) : {}),
      },
      select: academicTermSelect,
      orderBy: [
        { academic_year: { start_date: 'desc' } },
        { start_date: 'asc' },
        { code: 'asc' },
      ],
    });
    return terms.map((term) => withEffectiveTermStatus(term));
  }

  async findActive() {
    const term = await this.prisma.academicTerm.findFirst({
      where: getEffectiveAcademicStatusWhere(AcademicPeriodStatus.ONGOING),
      select: academicTermSelect,
      orderBy: [{ start_date: 'desc' }, { code: 'asc' }],
    });
    if (!term) throw new NotFoundException('Chưa có học kỳ đang diễn ra');
    return withEffectiveTermStatus(term);
  }

  async findOne(id: number) {
    const term = await this.prisma.academicTerm.findUnique({
      where: { term_id: id },
      select: academicTermSelect,
    });
    if (!term) throw new NotFoundException('Không tìm thấy học kỳ');
    return withEffectiveTermStatus(term);
  }

  async create(dto: CreateAcademicTermDto) {
    const academicYear = await this.ensureAcademicYearExists(
      dto.academic_year_id,
    );
    const startDate = toDateOnly(dto.start_date);
    const endDate = toDateOnly(dto.end_date);
    ensureDateRange(startDate, endDate);
    ensureWithinAcademicYear(startDate, endDate, academicYear);

    try {
      return await this.prisma.$transaction(async (tx) => {
        if (dto.status === AcademicPeriodStatus.ONGOING) {
          await tx.academicTerm.updateMany({
            where: { status: AcademicPeriodStatus.ONGOING },
            data: { status: AcademicPeriodStatus.FINISHED },
          });
        }

        const term = await tx.academicTerm.create({
          data: {
            code: dto.code,
            academic_year_id: dto.academic_year_id,
            name:
              dto.name?.trim() || defaultTermName(dto.code, academicYear.name),
            start_date: startDate,
            end_date: endDate,
            status: dto.status ?? AcademicPeriodStatus.UPCOMING,
          },
          select: academicTermSelect,
        });
        return withEffectiveTermStatus(term);
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async update(id: number, dto: UpdateAcademicTermDto) {
    const existing = await this.findOne(id);
    const academicYear = dto.academic_year_id
      ? await this.ensureAcademicYearExists(dto.academic_year_id)
      : existing.academic_year;
    const startDate = dto.start_date
      ? toDateOnly(dto.start_date)
      : existing.start_date;
    const endDate = dto.end_date ? toDateOnly(dto.end_date) : existing.end_date;
    ensureDateRange(startDate, endDate);
    ensureWithinAcademicYear(startDate, endDate, academicYear);

    const nextCode = dto.code ?? existing.code;
    const autoName =
      dto.name === undefined &&
      (dto.code !== undefined || dto.academic_year_id !== undefined);

    try {
      return await this.prisma.$transaction(async (tx) => {
        if (dto.status === AcademicPeriodStatus.ONGOING) {
          await tx.academicTerm.updateMany({
            where: {
              status: AcademicPeriodStatus.ONGOING,
              term_id: { not: id },
            },
            data: { status: AcademicPeriodStatus.FINISHED },
          });
        }

        const term = await tx.academicTerm.update({
          where: { term_id: id },
          data: {
            ...(dto.code !== undefined && { code: dto.code }),
            ...(dto.academic_year_id !== undefined && {
              academic_year_id: dto.academic_year_id,
            }),
            ...(dto.name !== undefined && { name: dto.name.trim() }),
            ...(autoName && {
              name: defaultTermName(nextCode, academicYear.name),
            }),
            ...(dto.start_date !== undefined && { start_date: startDate }),
            ...(dto.end_date !== undefined && { end_date: endDate }),
            ...(dto.status !== undefined && { status: dto.status }),
          },
          select: academicTermSelect,
        });
        return withEffectiveTermStatus(term);
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async activate(id: number) {
    await this.findOne(id);
    return this.prisma.$transaction(async (tx) => {
      await tx.academicTerm.updateMany({
        where: { status: AcademicPeriodStatus.ONGOING, term_id: { not: id } },
        data: { status: AcademicPeriodStatus.FINISHED },
      });
      const term = await tx.academicTerm.update({
        where: { term_id: id },
        data: { status: AcademicPeriodStatus.ONGOING },
        select: academicTermSelect,
      });
      return withEffectiveTermStatus(term);
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    const [scores, attendances, sections] = await Promise.all([
      this.prisma.score.count({ where: { term_id: id } }),
      this.prisma.attendance.count({ where: { term_id: id } }),
      this.prisma.classSection.count({ where: { term_id: id } }),
    ]);
    if (scores + attendances + sections > 0) {
      throw new BadRequestException(
        'Không thể xóa học kỳ đã có dữ liệu điểm, chuyên cần hoặc lớp học phần',
      );
    }

    const term = await this.prisma.academicTerm.delete({
      where: { term_id: id },
      select: academicTermSelect,
    });
    return withEffectiveTermStatus(term);
  }

  async ensureExists(id: number) {
    const term = await this.prisma.academicTerm.findUnique({
      where: { term_id: id },
      select: { term_id: true },
    });
    if (!term) throw new NotFoundException('Không tìm thấy học kỳ');
    return term;
  }

  private async ensureAcademicYearExists(id: number) {
    const academicYear = await this.prisma.academicYear.findUnique({
      where: { academic_year_id: id },
      select: academicYearSelect,
    });
    if (!academicYear) throw new NotFoundException('Không tìm thấy năm học');
    return academicYear;
  }

  private handlePrismaError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('Học kỳ này đã tồn tại trong năm học');
      }
    }
    throw error;
  }
}
