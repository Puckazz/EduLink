import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import {
  createPrismaMock,
  PrismaMock,
} from '../../common/testing/prisma-mock.helper';
import { AttendanceSessionService } from './attendance-session.service';
import { AttendanceSummaryService } from './attendance-summary.service';

describe('AttendanceSessionService', () => {
  let service: AttendanceSessionService;
  let prismaMock: PrismaMock;
  let attendanceSummaryMock: {
    syncForSection: jest.Mock;
  };

  const session = {
    session_id: 1,
    section_id: 1,
    session_no: 1,
    session_date: new Date('2025-01-06T00:00:00.000Z'),
    section: {
      section_id: 1,
      teacher_id: 10,
      term_id: 1,
      start_time: '7:30',
      end_time: '9:30',
      term: {
        start_date: new Date('2025-01-01T00:00:00.000Z'),
        end_date: new Date('2025-01-31T00:00:00.000Z'),
      },
    },
  };

  beforeEach(async () => {
    prismaMock = createPrismaMock();
    prismaMock.attendanceSession.findUnique.mockResolvedValue(session);
    prismaMock.classEnrollment.findMany.mockResolvedValue([]);
    prismaMock.attendanceSession.count.mockResolvedValue(1);
    attendanceSummaryMock = {
      syncForSection: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceSessionService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: AttendanceSummaryService, useValue: attendanceSummaryMock },
      ],
    }).compile();

    service = module.get(AttendanceSessionService);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('bulkUpsertRecords()', () => {
    const dto = {
      records: [{ enrollmentId: 1, status: 'PRESENT' as const, note: '' }],
    };

    it('allows teacher to save attendance inside the time window', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2025-01-06T00:15:00.000Z'));

      const result = await service.bulkUpsertRecords(1, dto, 10);

      expect(result.updated).toBe(1);
      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    });

    it('blocks teacher outside the time window', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2025-01-06T03:00:01.000Z'));

      await expect(service.bulkUpsertRecords(1, dto, 10)).rejects.toThrow(
        ForbiddenException,
      );
      expect(prismaMock.attendanceRecord.upsert).not.toHaveBeenCalled();
    });

    it('allows admin to save attendance outside the time window', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2025-01-06T03:00:01.000Z'));

      const result = await service.bulkUpsertRecords(1, dto);

      expect(result.updated).toBe(1);
      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    });

    it('keeps blocking teachers assigned to another section', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2025-01-06T00:15:00.000Z'));

      await expect(service.bulkUpsertRecords(1, dto, 99)).rejects.toThrow(
        ForbiddenException,
      );
      expect(prismaMock.attendanceRecord.upsert).not.toHaveBeenCalled();
    });
  });

  describe('getSessionRecords()', () => {
    it('returns enrolled students for admin even when attendance records do not exist yet', async () => {
      prismaMock.classEnrollment.count.mockResolvedValue(1);
      prismaMock.classEnrollment.findMany.mockResolvedValue([
        {
          enrollment_id: 101,
          student: {
            student_id: 1001,
            student_code: 'SV001',
            full_name: 'Nguyễn Văn A',
            email: null,
          },
          records: [],
        },
      ]);
      prismaMock.attendanceRecord.groupBy.mockResolvedValue([]);

      const result = await service.getSessionRecords(1, 1, 10);

      expect(result.meta.total).toBe(1);
      expect(result.stats.total).toBe(1);
      expect(result.data).toEqual([
        expect.objectContaining({
          enrollment_id: 101,
          record_id: 0,
          status: 'NONE',
        }),
      ]);
      expect(prismaMock.classEnrollment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { section_id: 1 },
        }),
      );
    });
  });
});
