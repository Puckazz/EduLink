import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ScoreService } from './score.service';
import { PrismaService } from '../../prisma/prisma.service';
import {
  createPrismaMock,
  PrismaMock,
} from '../../common/testing/prisma-mock.helper';
import {
  createMockScore,
  createMockStudent,
} from '../../common/testing/test-data.factory';

describe('ScoreService', () => {
  let service: ScoreService;
  let prismaMock: PrismaMock;

  const mockScore = createMockScore();
  const mockStudent = createMockStudent();
  const mockSubject = { subject_id: 1 };
  const mockTerm = { term_id: 1 };

  beforeEach(async () => {
    prismaMock = createPrismaMock();
    prismaMock.academicTerm.findUnique.mockResolvedValue(mockTerm);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScoreService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<ScoreService>(ScoreService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('avg computation (via createForStudent)', () => {
    beforeEach(() => {
      prismaMock.student.findFirst.mockResolvedValue(mockStudent);
      prismaMock.subject.findUnique.mockResolvedValue(mockSubject);
    });

    it('should compute avg with all three components: assignment*0.2 + midterm*0.3 + final*0.5', async () => {
      prismaMock.score.create.mockResolvedValue({
        ...mockScore,
        assignment: 8.5,
        midterm: 7.0,
        final: 8.0,
        avg: 7.8,
      });
      const result = await service.createForStudent(1000, {
        subject_id: 1,
        term_id: 1,
        assignment: 8.5,
        midterm: 7.0,
        final: 8.0,
      });
      expect(result.avg).toBeCloseTo(7.8, 1);
    });

    it('should compute avg with partial components (only midterm and final)', async () => {
      prismaMock.score.create.mockResolvedValue({
        ...mockScore,
        assignment: null,
        midterm: 7.0,
        final: 8.0,
        avg: 7.63,
      });
      const result = await service.createForStudent(1000, {
        subject_id: 1,
        term_id: 1,
        midterm: 7.0,
        final: 8.0,
      });
      expect(result.avg).toBeDefined();
    });

    it('should return null avg when no score components provided', async () => {
      prismaMock.score.create.mockResolvedValue({
        ...mockScore,
        assignment: null,
        midterm: null,
        final: null,
        avg: null,
      });
      const result = await service.createForStudent(1000, {
        subject_id: 1,
        term_id: 1,
      });
      expect(result.avg).toBeNull();
    });
  });

  describe('createForStudent()', () => {
    it('should create score successfully', async () => {
      prismaMock.student.findFirst.mockResolvedValue(mockStudent);
      prismaMock.subject.findUnique.mockResolvedValue(mockSubject);
      prismaMock.score.create.mockResolvedValue(mockScore);

      const result = await service.createForStudent(1000, {
        subject_id: 1,
        term_id: 1,
        assignment: 8.5,
        midterm: 7.0,
        final: 8.0,
      });
      expect(result.score_id).toBe(mockScore.score_id);
    });

    it('should throw NotFoundException when student does not exist', async () => {
      prismaMock.student.findFirst.mockResolvedValue(null);
      await expect(
        service.createForStudent(9999, {
          subject_id: 1,
          term_id: 1,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when subject does not exist', async () => {
      prismaMock.student.findFirst.mockResolvedValue(mockStudent);
      prismaMock.subject.findUnique.mockResolvedValue(null);
      await expect(
        service.createForStudent(1000, {
          subject_id: 999,
          term_id: 1,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException on duplicate score (P2002)', async () => {
      prismaMock.student.findFirst.mockResolvedValue(mockStudent);
      prismaMock.subject.findUnique.mockResolvedValue(mockSubject);
      const p2002Error = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        {
          code: 'P2002',
          clientVersion: '5.0.0',
          meta: {},
          batchRequestIdx: undefined,
        },
      );
      prismaMock.score.create.mockRejectedValue(p2002Error);
      await expect(
        service.createForStudent(1000, {
          subject_id: 1,
          term_id: 1,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findByStudent()', () => {
    it('should return paginated scores for a student', async () => {
      prismaMock.student.findFirst.mockResolvedValue(mockStudent);
      prismaMock.$transaction.mockResolvedValue([[mockScore], 1]);

      const result = await service.findByStudent(1000, {
        page: 1,
        limit: 10,
      } as any);

      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });

    it('should return empty data when student has no scores', async () => {
      prismaMock.student.findFirst.mockResolvedValue(mockStudent);
      prismaMock.$transaction.mockResolvedValue([[], 0]);

      const result = await service.findByStudent(1000, {} as any);
      expect(result.data).toHaveLength(0);
    });
  });

  describe('findByStudentForParent()', () => {
    it('should return scores when parent is linked to student', async () => {
      prismaMock.student.findFirst.mockResolvedValue(mockStudent);
      prismaMock.studentParent.findUnique.mockResolvedValue({
        student_id: 1000,
        parent_id: 100,
      });
      prismaMock.$transaction.mockResolvedValue([[mockScore], 1]);

      const result = await service.findByStudentForParent(1000, 100, {} as any);
      expect(result.data).toHaveLength(1);
    });

    it('should hide draft score values for parent', async () => {
      prismaMock.student.findFirst.mockResolvedValue(mockStudent);
      prismaMock.studentParent.findUnique.mockResolvedValue({
        student_id: 1000,
        parent_id: 100,
      });
      prismaMock.$transaction.mockResolvedValue([
        [{ ...mockScore, publish_status: 'DRAFT' }],
        1,
      ]);

      const result = await service.findByStudentForParent(1000, 100, {} as any);

      expect(result.data[0].assignment).toBeNull();
      expect(result.data[0].midterm).toBeNull();
      expect(result.data[0].final).toBeNull();
      expect(result.data[0].avg).toBeNull();
    });

    it('should throw ForbiddenException when parent is not linked to student', async () => {
      prismaMock.student.findFirst.mockResolvedValue(mockStudent);
      prismaMock.studentParent.findUnique.mockResolvedValue(null);

      await expect(
        service.findByStudentForParent(1000, 999, {} as any),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findOne()', () => {
    it('should return score by id', async () => {
      prismaMock.score.findUnique.mockResolvedValue(mockScore);
      const result = await service.findOne(1);
      expect(result.score_id).toBe(1);
    });

    it('should throw NotFoundException when score not found', async () => {
      prismaMock.score.findUnique.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update()', () => {
    it('should update score and recompute avg', async () => {
      prismaMock.score.findUnique.mockResolvedValue(mockScore);
      const updated = { ...mockScore, final: 9.0, avg: 8.15 };
      prismaMock.score.update.mockResolvedValue(updated);

      const result = await service.update(1, { final: 9.0 });
      expect(result.final).toBe(9.0);
    });

    it('should clear score components and reset avg when values are null', async () => {
      prismaMock.score.findUnique.mockResolvedValue(mockScore);
      prismaMock.score.update.mockResolvedValue({
        ...mockScore,
        assignment: null,
        midterm: null,
        final: null,
        avg: null,
      });

      const result = await service.update(1, {
        assignment: null,
        midterm: null,
        final: null,
      });

      expect(prismaMock.score.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            assignment: null,
            midterm: null,
            final: null,
            avg: null,
          }),
        }),
      );
      expect(result.avg).toBeNull();
    });

    it('should throw NotFoundException when score not found', async () => {
      prismaMock.score.findUnique.mockResolvedValue(null);
      await expect(service.update(999, { final: 9.0 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove()', () => {
    it('should delete score successfully', async () => {
      prismaMock.score.findUnique.mockResolvedValue(mockScore);
      prismaMock.score.delete.mockResolvedValue(mockScore);
      const result = await service.remove(1);
      expect(result.score_id).toBe(1);
    });

    it('should throw NotFoundException when score not found', async () => {
      prismaMock.score.findUnique.mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });

    it('should block deleting published score', async () => {
      prismaMock.score.findUnique.mockResolvedValue({
        ...mockScore,
        publish_status: 'PUBLISHED',
      });

      await expect(service.remove(1)).rejects.toThrow(BadRequestException);
      expect(prismaMock.score.delete).not.toHaveBeenCalled();
    });
  });

  describe('getScorebook()', () => {
    it('should return scorebook with students and their scores', async () => {
      const studentWithScore = {
        student_id: 1000,
        student_code: 'SV001',
        full_name: 'Lê Văn C',
        class: '2022_CNTT',
        major: { major_name: 'CNTT' },
        scores: [mockScore],
      };
      prismaMock.student.findMany.mockResolvedValue([studentWithScore] as any);

      const result = await service.getScorebook({
        term_id: 1,
        subject_id: 1,
      });
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].score).not.toBeNull();
    });

    it('should include students with no scores when subject_id is provided', async () => {
      const studentWithNoScore = {
        student_id: 1001,
        student_code: 'SV002',
        full_name: 'Nguyễn D',
        class: '2022_CNTT',
        major: { major_name: 'CNTT' },
        scores: [],
      };
      prismaMock.student.findMany.mockResolvedValue([
        studentWithNoScore,
      ] as any);

      const result = await service.getScorebook({ subject_id: 1 });
      expect(result[0].score).toBeNull();
    });

    it('should exclude students with no scores when no subject_id filter', async () => {
      const studentWithNoScore = {
        student_id: 1001,
        student_code: 'SV002',
        full_name: 'Nguyễn D',
        class: '2022_CNTT',
        major: null,
        scores: [],
      };
      prismaMock.student.findMany.mockResolvedValue([
        studentWithNoScore,
      ] as any);

      const result = await service.getScorebook({});
      expect(result).toHaveLength(0);
    });
  });

  describe('bulkUpdate()', () => {
    it('should update existing scores and create new ones', async () => {
      const existingScore = { score_id: 1 };
      prismaMock.subject.findUnique.mockResolvedValue(mockSubject);
      prismaMock.score.findFirst
        .mockResolvedValueOnce(existingScore)
        .mockResolvedValueOnce(null);
      prismaMock.score.update.mockResolvedValue({});
      prismaMock.score.create.mockResolvedValue({});
      prismaMock.scoreLog.create.mockResolvedValue({});

      const dto = {
        subject_id: 1,
        term_id: 1,
        rows: [
          { student_id: 1000, assignment: 8.0, midterm: 7.0, final: 8.0 },
          { student_id: 1001, assignment: 7.0, midterm: 6.0, final: 7.0 },
        ],
      };
      const result = await service.bulkUpdate(dto, 'Admin');
      expect(result.updated).toBe(2);
      expect(prismaMock.scoreLog.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('bulkPublish()', () => {
    it('should publish scores by score_ids', async () => {
      prismaMock.score.updateMany.mockResolvedValue({ count: 3 });
      prismaMock.scoreLog.create.mockResolvedValue({});

      const result = await service.bulkPublish(
        { score_ids: [1, 2, 3], status: 'PUBLISHED' },
        'Admin',
      );
      expect(result.updated).toBe(3);
      expect(result.status).toBe('PUBLISHED');
    });

    it('should unpublish scores by filter', async () => {
      prismaMock.score.updateMany.mockResolvedValue({ count: 5 });
      prismaMock.scoreLog.create.mockResolvedValue({});

      const result = await service.bulkPublish(
        { term_id: 1, status: 'DRAFT' },
        'Admin',
      );
      expect(result.status).toBe('DRAFT');
    });
  });
});
