import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { PrismaService } from '../../prisma/prisma.service';
import { createPrismaMock, PrismaMock } from '../../common/testing/prisma-mock.helper';
import { createMockAttendance, createMockStudent } from '../../common/testing/test-data.factory';

describe('AttendanceService', () => {
  let service: AttendanceService;
  let prismaMock: PrismaMock;

  const mockAttendance = createMockAttendance();
  const mockStudent = createMockStudent();

  beforeEach(async () => {
    prismaMock = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<AttendanceService>(AttendanceService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─── createForStudent ────────────────────────────────────────────────────────
  describe('createForStudent()', () => {
    it('should create attendance record successfully', async () => {
      prismaMock.student.findFirst.mockResolvedValue(mockStudent);
      prismaMock.attendance.create.mockResolvedValue(mockAttendance);

      const result = await service.createForStudent(1000, {
        semester: 'HK1-2024',
        total_sessions: 30,
        absent_sessions: 2,
      });

      expect(result.attendance_id).toBe(1);
      expect(prismaMock.attendance.create).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when student not found', async () => {
      prismaMock.student.findFirst.mockResolvedValue(null);
      await expect(
        service.createForStudent(9999, { semester: 'HK1-2024' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should default absent_sessions and total_sessions to 0 when not provided', async () => {
      prismaMock.student.findFirst.mockResolvedValue(mockStudent);
      prismaMock.attendance.create.mockResolvedValue(mockAttendance);
      await service.createForStudent(1000, { semester: 'HK1-2024' });
      expect(prismaMock.attendance.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            total_sessions: 0,
            absent_sessions: 0,
          }),
        }),
      );
    });
  });

  // ─── findByStudent ───────────────────────────────────────────────────────────
  describe('findByStudent()', () => {
    it('should return attendance list for a student', async () => {
      prismaMock.student.findFirst.mockResolvedValue(mockStudent);
      prismaMock.attendance.findMany.mockResolvedValue([mockAttendance]);

      const result = await service.findByStudent(1000);
      expect(result).toHaveLength(1);
    });

    it('should throw NotFoundException when student not found', async () => {
      prismaMock.student.findFirst.mockResolvedValue(null);
      await expect(service.findByStudent(9999)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── findByStudentForParent ──────────────────────────────────────────────────
  describe('findByStudentForParent()', () => {
    it('should return attendance when parent is linked to student', async () => {
      prismaMock.student.findFirst.mockResolvedValue(mockStudent);
      prismaMock.studentParent.findUnique.mockResolvedValue({ student_id: 1000, parent_id: 100 });
      prismaMock.attendance.findMany.mockResolvedValue([mockAttendance]);

      const result = await service.findByStudentForParent(1000, 100);
      expect(result).toHaveLength(1);
    });

    it('should throw ForbiddenException when parent is not linked', async () => {
      prismaMock.student.findFirst.mockResolvedValue(mockStudent);
      prismaMock.studentParent.findUnique.mockResolvedValue(null);
      await expect(service.findByStudentForParent(1000, 999)).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when student not found', async () => {
      prismaMock.student.findFirst.mockResolvedValue(null);
      await expect(service.findByStudentForParent(9999, 100)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── update ──────────────────────────────────────────────────────────────────
  describe('update()', () => {
    it('should update attendance record successfully', async () => {
      prismaMock.attendance.findUnique.mockResolvedValue(mockAttendance);
      const updated = createMockAttendance({ absent_sessions: 5 });
      prismaMock.attendance.update.mockResolvedValue(updated);

      const result = await service.update(1, { absent_sessions: 5 });
      expect(result.absent_sessions).toBe(5);
    });

    it('should throw NotFoundException when attendance record not found', async () => {
      prismaMock.attendance.findUnique.mockResolvedValue(null);
      await expect(service.update(999, { absent_sessions: 5 })).rejects.toThrow(NotFoundException);
    });
  });

  // ─── remove ──────────────────────────────────────────────────────────────────
  describe('remove()', () => {
    it('should delete attendance record successfully', async () => {
      prismaMock.attendance.findUnique.mockResolvedValue(mockAttendance);
      prismaMock.attendance.delete.mockResolvedValue(mockAttendance);
      const result = await service.remove(1);
      expect(result.attendance_id).toBe(1);
    });

    it('should throw NotFoundException when attendance not found', async () => {
      prismaMock.attendance.findUnique.mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── findOne ─────────────────────────────────────────────────────────────────
  describe('findOne()', () => {
    it('should return attendance record by id', async () => {
      prismaMock.attendance.findUnique.mockResolvedValue(mockAttendance);
      const result = await service.findOne(1);
      expect(result.attendance_id).toBe(1);
    });

    it('should throw NotFoundException when record not found', async () => {
      prismaMock.attendance.findUnique.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });
});
