import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ClassSectionService } from './class-section.service';
import { PrismaService } from '../../prisma/prisma.service';
import { createPrismaMock, PrismaMock } from '../../common/testing/prisma-mock.helper';
import { createMockClassSection, createMockStudent } from '../../common/testing/test-data.factory';

describe('ClassSectionService', () => {
  let service: ClassSectionService;
  let prismaMock: PrismaMock;

  const mockSection = createMockClassSection();
  const mockStudent = createMockStudent();

  beforeEach(async () => {
    prismaMock = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClassSectionService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<ClassSectionService>(ClassSectionService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    const dto = {
      class_code: 'L01', teacher_name: 'PGS.TS. Nguyễn A',
      day_of_week: 'Thứ 2', start_time: '7:30', end_time: '9:30',
      room: 'A1.202', semester: 'HK1-2024', subject_id: 1,
    };

    it('should create class section successfully', async () => {
      prismaMock.classSection.findUnique.mockResolvedValue(null);
      prismaMock.subject.findUnique.mockResolvedValue({ subject_id: 1 });
      prismaMock.classSection.create.mockResolvedValue(mockSection);

      const result = await service.create(dto);
      expect(result.section_id).toBe(1);
    });

    it('should throw ConflictException when class_code already exists', async () => {
      prismaMock.classSection.findUnique.mockResolvedValue(mockSection);
      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException when subject does not exist', async () => {
      prismaMock.classSection.findUnique.mockResolvedValue(null);
      prismaMock.subject.findUnique.mockResolvedValue(null);
      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll()', () => {
    it('should return all class sections without filters', async () => {
      prismaMock.classSection.findMany.mockResolvedValue([mockSection]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
    });

    it('should filter by semester and status', async () => {
      prismaMock.classSection.findMany.mockResolvedValue([mockSection]);
      await service.findAll('HK1-2024', 'ONGOING' as any);
      expect(prismaMock.classSection.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ semester: 'HK1-2024', status: 'ONGOING' }),
        }),
      );
    });

    it('should filter by teacherId when provided', async () => {
      prismaMock.classSection.findMany.mockResolvedValue([mockSection]);
      await service.findAll(undefined, undefined, 10);
      expect(prismaMock.classSection.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ teacher_id: 10 }) }),
      );
    });
  });

  describe('findOne()', () => {
    it('should return class section by id', async () => {
      prismaMock.classSection.findUnique.mockResolvedValue(mockSection);
      const result = await service.findOne(1);
      expect(result.section_id).toBe(1);
    });

    it('should throw NotFoundException when section not found', async () => {
      prismaMock.classSection.findUnique.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when teacher accesses another teacher section', async () => {
      prismaMock.classSection.findUnique.mockResolvedValue({ ...mockSection, teacher_id: 10 });
      await expect(service.findOne(1, 99)).rejects.toThrow(ForbiddenException);
    });

    it('should allow teacher to access their own section', async () => {
      prismaMock.classSection.findUnique.mockResolvedValue({ ...mockSection, teacher_id: 10 });
      const result = await service.findOne(1, 10);
      expect(result.section_id).toBe(1);
    });
  });

  describe('update()', () => {
    it('should update class section successfully', async () => {
      prismaMock.classSection.findUnique.mockResolvedValue(mockSection);
      prismaMock.classSection.update.mockResolvedValue({ ...mockSection, room: 'B2.101' });
      const result = await service.update(1, { room: 'B2.101' });
      expect(result.room).toBe('B2.101');
    });
  });

  describe('remove()', () => {
    it('should delete class section successfully', async () => {
      prismaMock.classSection.findUnique.mockResolvedValue(mockSection);
      prismaMock.classSection.delete.mockResolvedValue(mockSection);
      const result = await service.remove(1);
      expect(result.section_id).toBe(1);
    });
  });

  describe('getStats()', () => {
    it('should return correct attendance statistics', async () => {
      prismaMock.classSection.findUnique.mockResolvedValue(mockSection);
      prismaMock.classEnrollment.count.mockResolvedValue(20);
      prismaMock.attendanceSession.findMany.mockResolvedValue([
        {
          session_id: 1, session_no: 1, session_date: new Date(),
          records: [
            { status: 'PRESENT' }, { status: 'PRESENT' }, { status: 'ABSENT' }, { status: 'LATE' },
          ],
        },
      ]);

      const result = await service.getStats(1);
      expect(result.totalStudents).toBe(20);
      expect(result.totalSessions).toBe(1);
      expect(result.totalPresent).toBe(2);
      expect(result.totalAbsent).toBe(1);
      expect(result.totalLate).toBe(1);
    });
  });

  describe('addEnrollments()', () => {
    it('should add students to class section', async () => {
      prismaMock.classSection.findUnique.mockResolvedValue(mockSection);
      prismaMock.student.findMany.mockResolvedValue([mockStudent]);
      prismaMock.classEnrollment.createMany.mockResolvedValue({ count: 1 });
      prismaMock.attendanceSession.findMany.mockResolvedValue([]);

      const result = await service.addEnrollments(1, [1000]);
      expect(result.added).toBe(1);
    });

    it('should throw NotFoundException when some students do not exist', async () => {
      prismaMock.classSection.findUnique.mockResolvedValue(mockSection);
      prismaMock.student.findMany.mockResolvedValue([]);

      await expect(service.addEnrollments(1, [9999])).rejects.toThrow(NotFoundException);
    });

    it('should auto-create NONE attendance records for existing sessions', async () => {
      prismaMock.classSection.findUnique.mockResolvedValue(mockSection);
      prismaMock.student.findMany.mockResolvedValue([mockStudent]);
      prismaMock.classEnrollment.createMany.mockResolvedValue({ count: 1 });
      prismaMock.attendanceSession.findMany.mockResolvedValue([{ session_id: 1 }]);
      prismaMock.classEnrollment.findMany.mockResolvedValue([{ enrollment_id: 1 }]);
      prismaMock.attendanceRecord.createMany.mockResolvedValue({ count: 1 });

      await service.addEnrollments(1, [1000]);
      expect(prismaMock.attendanceRecord.createMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('removeEnrollment()', () => {
    it('should remove student from class section', async () => {
      prismaMock.classEnrollment.findFirst.mockResolvedValue({ enrollment_id: 1, section_id: 1 });
      prismaMock.classEnrollment.delete.mockResolvedValue({});
      const result = await service.removeEnrollment(1, 1);
      expect(result.message).toBeDefined();
    });

    it('should throw NotFoundException when enrollment not found', async () => {
      prismaMock.classEnrollment.findFirst.mockResolvedValue(null);
      await expect(service.removeEnrollment(1, 999)).rejects.toThrow(NotFoundException);
    });
  });
});
