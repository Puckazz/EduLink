import { BadRequestException, ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AcademicTermCode, Prisma } from '@prisma/client';
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
  };
  const mockTerm = createMockAcademicTerm({
    term_id: 1,
    academic_year_id: 1,
    academic_year: mockYear,
    code: AcademicTermCode.HK1,
    name: 'Học kỳ I - 2025 - 2026',
    start_date: new Date('2025-09-01'),
    end_date: new Date('2026-01-15'),
  });

  beforeEach(async () => {
    jest.useFakeTimers().setSystemTime(new Date('2025-10-01T00:00:00.000Z'));
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

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('should create term without manual status', async () => {
    prismaMock.academicTerm.create.mockResolvedValue(mockTerm);

    const result = await service.create({
      code: AcademicTermCode.HK1,
      academic_year_id: 1,
      start_date: '2025-09-01',
      end_date: '2026-01-15',
    });

    expect(result.term_id).toBe(1);
    expect(result.effectiveStatus).toBe('ONGOING');
    expect(prismaMock.academicTerm.updateMany).not.toHaveBeenCalled();
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

  it('should not remove a term that is already used', async () => {
    prismaMock.academicTerm.findUnique.mockResolvedValue(mockTerm);
    prismaMock.score.count.mockResolvedValue(1);
    prismaMock.attendance.count.mockResolvedValue(0);
    prismaMock.classSection.count.mockResolvedValue(0);

    await expect(service.remove(1)).rejects.toThrow(BadRequestException);
  });
});
