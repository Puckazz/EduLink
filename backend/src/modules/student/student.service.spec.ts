import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { StudentService } from './student.service';
import { PrismaService } from '../../prisma/prisma.service';
import {
  createPrismaMock,
  PrismaMock,
} from '../../common/testing/prisma-mock.helper';
import {
  createMockStudent,
  createMockParent,
} from '../../common/testing/test-data.factory';

describe('StudentService', () => {
  let service: StudentService;
  let prismaMock: PrismaMock;

  const mockStudent = createMockStudent();

  beforeEach(async () => {
    prismaMock = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<StudentService>(StudentService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    const dto = {
      student_code: 'SV001',
      full_name: 'Lê Văn C',
      date_of_birth: '2002-05-10',
      major_id: 1,
    };

    it('should create student successfully', async () => {
      prismaMock.student.create.mockResolvedValue(mockStudent);
      const result = await service.create(dto);
      expect(result.student_code).toBe('SV001');
    });

    it('should throw ConflictException on duplicate student_code (P2002)', async () => {
      const p2002 = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint',
        {
          code: 'P2002',
          clientVersion: '5.0.0',
          meta: {},
          batchRequestIdx: undefined,
        },
      );
      prismaMock.student.create.mockRejectedValue(p2002);
      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException on invalid major (P2003)', async () => {
      const p2003 = new Prisma.PrismaClientKnownRequestError(
        'Foreign key constraint',
        {
          code: 'P2003',
          clientVersion: '5.0.0',
          meta: {},
          batchRequestIdx: undefined,
        },
      );
      prismaMock.student.create.mockRejectedValue(p2003);
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll()', () => {
    it('should return paginated student list', async () => {
      prismaMock.$transaction.mockResolvedValue([[mockStudent], 1]);
      const result = await service.findAll({ page: 1, limit: 10 } as any);
      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });

    it('should handle Vietnamese name sorting correctly', async () => {
      const students = [
        createMockStudent({ student_id: 1, full_name: 'Trần Thị Anh' }),
        createMockStudent({ student_id: 2, full_name: 'Lê Văn Bình' }),
      ];
      prismaMock.$transaction.mockResolvedValue([students, 2]);
      const result = await service.findAll({
        sort_by: 'full_name',
        sort_order: 'asc',
      } as any);
      expect(result.data).toHaveLength(2);
    });

    it('should return empty list when no students found', async () => {
      prismaMock.$transaction.mockResolvedValue([[], 0]);
      const result = await service.findAll({} as any);
      expect(result.data).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
    });
  });

  describe('findOne()', () => {
    it('should return student by id', async () => {
      prismaMock.student.findFirst.mockResolvedValue(mockStudent);
      const result = await service.findOne(1000);
      expect(result.student_id).toBe(1000);
    });

    it('should throw NotFoundException when student not found', async () => {
      prismaMock.student.findFirst.mockResolvedValue(null);
      await expect(service.findOne(9999)).rejects.toThrow(NotFoundException);
    });

    it('should not return soft-deleted students', async () => {
      prismaMock.student.findFirst.mockResolvedValue(null);
      await expect(service.findOne(1000)).rejects.toThrow(NotFoundException);
      expect(prismaMock.student.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ deleted_at: null }),
        }),
      );
    });
  });

  describe('findOneForParent()', () => {
    it('should return student when parent is linked', async () => {
      prismaMock.studentParent.findUnique.mockResolvedValue({
        student_id: 1000,
        parent_id: 100,
      });
      prismaMock.student.findFirst.mockResolvedValue(mockStudent);
      const result = await service.findOneForParent(1000, 100);
      expect(result.student_id).toBe(1000);
    });

    it('should throw ForbiddenException when parent is not linked', async () => {
      prismaMock.studentParent.findUnique.mockResolvedValue(null);
      await expect(service.findOneForParent(1000, 999)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('update()', () => {
    it('should update student successfully', async () => {
      prismaMock.student.findFirst.mockResolvedValue(mockStudent);
      const updated = createMockStudent({ full_name: 'Updated Name' });
      prismaMock.student.update.mockResolvedValue(updated);
      const result = await service.update(1000, { full_name: 'Updated Name' });
      expect(result.full_name).toBe('Updated Name');
    });

    it('should convert date_of_birth string to Date object', async () => {
      prismaMock.student.findFirst.mockResolvedValue(mockStudent);
      prismaMock.student.update.mockResolvedValue(mockStudent);
      await service.update(1000, { date_of_birth: '2002-05-10' });
      expect(prismaMock.student.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ date_of_birth: expect.any(Date) }),
        }),
      );
    });
  });

  describe('remove()', () => {
    it('should soft-delete student by setting deleted_at', async () => {
      prismaMock.student.findFirst.mockResolvedValue(mockStudent);
      const deletedStudent = createMockStudent({ deleted_at: new Date() });
      prismaMock.student.update.mockResolvedValue(deletedStudent);

      const result = await service.remove(1000);
      expect(prismaMock.student.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ deleted_at: expect.any(Date) }),
        }),
      );
    });
  });

  describe('assignParentToStudent()', () => {
    const mockParent = createMockParent();

    it('should link parent to student successfully', async () => {
      prismaMock.student.findFirst.mockResolvedValue(mockStudent);
      prismaMock.parent.findUnique.mockResolvedValue(mockParent);
      prismaMock.studentParent.count.mockResolvedValue(0);
      prismaMock.student.update.mockResolvedValue(mockStudent);

      await service.assignParentToStudent(1000, { parent_id: 100 });
      expect(prismaMock.student.update).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when parent not found', async () => {
      prismaMock.student.findFirst.mockResolvedValue(mockStudent);
      prismaMock.parent.findUnique.mockResolvedValue(null);
      await expect(
        service.assignParentToStudent(1000, { parent_id: 999 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getParentsOfStudent()', () => {
    it('should return list of parents for a student', async () => {
      prismaMock.student.findFirst.mockResolvedValue({
        ...mockStudent,
        parents: [{ parent: mockParent, is_primary: true }],
      });
      const result = await service.getParentsOfStudent(1000);
      expect(result.data).toHaveLength(1);
    });

    it('should return empty list when student has no parents', async () => {
      prismaMock.student.findFirst.mockResolvedValue({
        ...mockStudent,
        parents: [],
      });
      const result = await service.getParentsOfStudent(1000);
      expect(result.data).toHaveLength(0);
    });

    it('should throw NotFoundException when student not found', async () => {
      prismaMock.student.findFirst.mockResolvedValue(null);
      await expect(service.getParentsOfStudent(9999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('removeParentFromStudent()', () => {
    it('should remove parent link successfully', async () => {
      prismaMock.student.findFirst.mockResolvedValue(mockStudent);
      prismaMock.studentParent.findUnique.mockResolvedValue({
        student_id: 1000,
        parent_id: 100,
      });
      prismaMock.student.update.mockResolvedValue(mockStudent);
      await service.removeParentFromStudent(1000, 100);
      expect(prismaMock.student.update).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequestException when parent is not linked to student', async () => {
      prismaMock.student.findFirst.mockResolvedValue(mockStudent);
      prismaMock.studentParent.findUnique.mockResolvedValue(null);
      await expect(service.removeParentFromStudent(1000, 999)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});

const mockParent = createMockParent();
