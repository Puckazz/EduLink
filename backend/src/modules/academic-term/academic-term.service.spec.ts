import { BadRequestException, ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AcademicPeriodStatus, AcademicTermCode, Prisma } from '@prisma/client';
import {
  createPrismaMock,
  PrismaMock,
} from '../../common/testing/prisma-mock.helper';
import { createMockAcademicTerm } from '../../common/testing/test-data.factory';
import { PrismaService } from '../../prisma/prisma.service';
import { AcademicTermService } from './academic-term.service';

describe('AcademicTermService', () => {
  let service: AcademicTermService;
  let prismaMock: PrismaMock;

  const mockYear = {
    academic_year_id: 1,
    name: '2025 - 2026',
    start_date: new Date('2025-09-01'),
    end_date: new Date('2026-08-31'),
    status: AcademicPeriodStatus.ONGOING,
  };
  const mockTerm = createMockAcademicTerm({
    term_id: 1,
    academic_year_id: 1,
    academic_year: mockYear,
    code: AcademicTermCode.HK1,
    name: 'Học kỳ I - 2025 - 2026',
    start_date: new Date('2025-09-01'),
    end_date: new Date('2026-01-15'),
    status: AcademicPeriodStatus.ONGOING,
  });

  beforeEach(async () => {
    prismaMock = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AcademicTermService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get(AcademicTermService);
    prismaMock.academicYear.findUnique.mockResolvedValue(mockYear);
  });

  afterEach(() => jest.clearAllMocks());

  it('should create term and finish existing ongoing term when requested', async () => {
    prismaMock.academicTerm.create.mockResolvedValue(mockTerm);

    const result = await service.create({
      code: AcademicTermCode.HK1,
      academic_year_id: 1,
      start_date: '2025-09-01',
      end_date: '2026-01-15',
      status: AcademicPeriodStatus.ONGOING,
    });

    expect(result.term_id).toBe(1);
    expect(prismaMock.academicTerm.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: AcademicPeriodStatus.ONGOING },
        data: { status: AcademicPeriodStatus.FINISHED },
      }),
    );
    expect(prismaMock.academicTerm.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: 'Học kỳ I - 2025 - 2026',
        }),
      }),
    );
  });

  it('should reject term dates outside academic year', async () => {
    await expect(
      service.create({
        code: AcademicTermCode.HK1,
        academic_year_id: 1,
        start_date: '2025-01-01',
        end_date: '2025-01-15',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw ConflictException on duplicate code/year', async () => {
    const p2002Error = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed',
      {
        code: 'P2002',
        clientVersion: '5.0.0',
        meta: {},
        batchRequestIdx: undefined,
      },
    );
    prismaMock.academicTerm.create.mockRejectedValue(p2002Error);

    await expect(
      service.create({
        code: AcademicTermCode.HK1,
        academic_year_id: 1,
        start_date: '2025-09-01',
        end_date: '2026-01-15',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('should activate only one term', async () => {
    prismaMock.academicTerm.findUnique.mockResolvedValue(mockTerm);
    prismaMock.academicTerm.update.mockResolvedValue(mockTerm);

    const result = await service.activate(1);

    expect(result.status).toBe(AcademicPeriodStatus.ONGOING);
    expect(prismaMock.academicTerm.updateMany).toHaveBeenCalledWith({
      where: {
        status: AcademicPeriodStatus.ONGOING,
        term_id: { not: 1 },
      },
      data: { status: AcademicPeriodStatus.FINISHED },
    });
    expect(prismaMock.academicTerm.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { term_id: 1 },
        data: { status: AcademicPeriodStatus.ONGOING },
      }),
    );
  });

  it('should not remove a term that is already used', async () => {
    prismaMock.academicTerm.findUnique.mockResolvedValue(mockTerm);
    prismaMock.score.count.mockResolvedValue(1);
    prismaMock.attendance.count.mockResolvedValue(0);
    prismaMock.classSection.count.mockResolvedValue(0);

    await expect(service.remove(1)).rejects.toThrow(BadRequestException);
  });
});
