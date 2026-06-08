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
  const section = {
    section_id: 1,
    teacher_id: 10,
    term_id: 1,
    start_time: '7:30',
    end_time: '9:30',
    term: {
      start_date: new Date('2025-01-01T00:00:00.000Z'),
      end_date: new Date('2025-01-31T00:00:00.000Z'),
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

  describe('createSession()', () => {
    beforeEach(() => {
      prismaMock.classSection.findUnique.mockResolvedValue(section);
      prismaMock.attendanceSession.findUnique.mockResolvedValue(null);
      prismaMock.attendanceSession.create.mockResolvedValue({
        session_id: 2,
        section_id: 1,
        session_no: 2,
        session_date: new Date('2025-01-13T00:00:00.000Z'),
        note: null,
      });
      prismaMock.classEnrollment.findMany.mockResolvedValue([]);
    });

    it('allows teacher to create a session for their section inside the term', async () => {
      const result = await service.createSession(
        1,
        {
          session_no: 2,
          session_date: '2025-01-13',
        },
        10,
      );

      expect(result.session_no).toBe(2);
      expect(prismaMock.attendanceSession.create).toHaveBeenCalledTimes(1);
      expect(attendanceSummaryMock.syncForSection).toHaveBeenCalledWith(1, 1);
    });

    it('blocks teacher from creating a session outside the term', async () => {
      await expect(
        service.createSession(
          1,
          {
            session_no: 2,
            session_date: '2025-02-03',
          },
          10,
        ),
      ).rejects.toThrow(ForbiddenException);

      expect(prismaMock.attendanceSession.create).not.toHaveBeenCalled();
    });

    it('allows admin to create a session outside the term', async () => {
      const result = await service.createSession(1, {
        session_no: 2,
        session_date: '2025-02-03',
      });

      expect(result.session_no).toBe(2);
      expect(prismaMock.attendanceSession.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateSession()', () => {
    beforeEach(() => {
      prismaMock.classSection.findUnique.mockResolvedValue(section);
      prismaMock.attendanceSession.findFirst.mockResolvedValue({
        session_id: 1,
        section_id: 1,
        session_no: 1,
        session_date: new Date('2025-01-06T00:00:00.000Z'),
        note: null,
      });
      prismaMock.attendanceRecord.count.mockResolvedValue(0);
      prismaMock.attendanceSession.update.mockResolvedValue({
        session_id: 1,
        section_id: 1,
        session_no: 1,
        session_date: new Date('2025-01-13T00:00:00.000Z'),
        note: 'Học bù',
        _count: { records: 10 },
      });
    });

    it('allows teacher to update an unchecked session for their section inside the term', async () => {
      const result = await service.updateSession(
        1,
        1,
        { session_date: '2025-01-13', note: 'Học bù' },
        10,
      );

      expect(result.note).toBe('Học bù');
      expect(prismaMock.attendanceSession.update).toHaveBeenCalledTimes(1);
    });

    it('blocks teacher from updating a session with real attendance data', async () => {
      prismaMock.attendanceRecord.count.mockResolvedValue(1);

      await expect(
        service.updateSession(1, 1, { session_date: '2025-01-13' }, 10),
      ).rejects.toThrow(ForbiddenException);

      expect(prismaMock.attendanceSession.update).not.toHaveBeenCalled();
    });

    it('blocks teacher from moving a session outside the term', async () => {
      await expect(
        service.updateSession(1, 1, { session_date: '2025-02-03' }, 10),
      ).rejects.toThrow(ForbiddenException);

      expect(prismaMock.attendanceSession.update).not.toHaveBeenCalled();
    });

    it('allows admin to update a session without teacher limits', async () => {
      prismaMock.attendanceRecord.count.mockResolvedValue(1);

      const result = await service.updateSession(1, 1, {
        session_date: '2025-02-03',
      });

      expect(result.session_id).toBe(1);
      expect(prismaMock.attendanceRecord.count).not.toHaveBeenCalled();
      expect(prismaMock.attendanceSession.update).toHaveBeenCalledTimes(1);
    });
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

    it('does not compare trend when the current session has no attendance data', async () => {
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
          records: [{ status: 'NONE', note: null, updated_at: new Date() }],
        },
      ]);
      prismaMock.attendanceRecord.groupBy.mockResolvedValue([
        { status: 'NONE', _count: 1 },
      ]);
      prismaMock.attendanceSession.findUnique.mockResolvedValueOnce(session);
      prismaMock.attendanceSession.findUnique.mockResolvedValueOnce({
        session_id: 2,
        section_id: 1,
        session_no: 2,
      });

      const result = await service.getSessionRecords(1, 1, 10);

      expect(result.trend).toBeNull();
      expect(prismaMock.attendanceSession.findUnique).toHaveBeenCalledTimes(2);
    });

    it('keeps session stats based on all students when records are searched', async () => {
      prismaMock.classEnrollment.count
        .mockResolvedValueOnce(1)
        .mockResolvedValueOnce(23);
      prismaMock.classEnrollment.findMany.mockResolvedValue([
        {
          enrollment_id: 101,
          student: {
            student_id: 1001,
            student_code: 'SV001',
            full_name: 'Nguyễn Văn A',
            email: null,
          },
          records: [{ status: 'PRESENT', note: null, updated_at: new Date() }],
        },
      ]);
      prismaMock.attendanceRecord.groupBy.mockResolvedValue([
        { status: 'PRESENT', _count: 20 },
        { status: 'LATE', _count: 1 },
        { status: 'ABSENT', _count: 2 },
      ]);

      const result = await service.getSessionRecords(1, 1, 10, 'SV001');

      expect(result.meta.total).toBe(1);
      expect(result.stats).toEqual({
        total: 23,
        present: 20,
        late: 1,
        absent: 2,
      });
      expect(prismaMock.classEnrollment.count).toHaveBeenNthCalledWith(1, {
        where: {
          section_id: 1,
          student: {
            OR: [
              { full_name: { contains: 'SV001' } },
              { student_code: { contains: 'SV001' } },
            ],
          },
        },
      });
      expect(prismaMock.classEnrollment.count).toHaveBeenNthCalledWith(2, {
        where: { section_id: 1 },
      });
    });
  });
});
