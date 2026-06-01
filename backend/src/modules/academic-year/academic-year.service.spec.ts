import { BadRequestException, ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import {
  createPrismaMock,
  PrismaMock,
} from '../../common/testing/prisma-mock.helper';
import { createMockAcademicYear } from '../../common/testing/test-data.factory';
import { PrismaService } from '../../prisma/prisma.service';
import { AcademicYearService } from './academic-year.service';

describe('AcademicYearService', () => {
  let service: AcademicYearService;
  let prismaMock: PrismaMock;
  const mockYear = createMockAcademicYear();

  beforeEach(async () => {
    prismaMock = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AcademicYearService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get(AcademicYearService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should create academic year', async () => {
    prismaMock.academicYear.create.mockResolvedValue(mockYear);

    const result = await service.create({
      name: '2024 - 2025',
      start_date: '2024-09-01',
      end_date: '2025-08-31',
    });

    expect(result.academic_year_id).toBe(1);
    expect(prismaMock.academicYear.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: '2024 - 2025',
        }),
      }),
    );
    expect(result.effectiveStatus).toBeDefined();
  });

  it('should reject invalid date range', async () => {
    await expect(
      service.create({
        name: '2024 - 2025',
        start_date: '2025-08-31',
        end_date: '2024-09-01',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw ConflictException on duplicate name', async () => {
    const p2002Error = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed',
      {
        code: 'P2002',
        clientVersion: '5.0.0',
        meta: {},
        batchRequestIdx: undefined,
      },
    );
    prismaMock.academicYear.create.mockRejectedValue(p2002Error);

    await expect(
      service.create({
        name: '2024 - 2025',
        start_date: '2024-09-01',
        end_date: '2025-08-31',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('should not remove year that has terms', async () => {
    prismaMock.academicYear.findUnique.mockResolvedValue(mockYear);
    prismaMock.academicTerm.count.mockResolvedValue(1);

    await expect(service.remove(1)).rejects.toThrow(BadRequestException);
  });
});
