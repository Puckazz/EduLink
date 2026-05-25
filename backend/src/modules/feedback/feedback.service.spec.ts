import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { MessageSenderRole } from '@prisma/client';
import { FeedbackService } from './feedback.service';
import { PrismaService } from '../../prisma/prisma.service';
import {
  createPrismaMock,
  PrismaMock,
} from '../../common/testing/prisma-mock.helper';
import {
  createMockFeedback,
  createMockParent,
  createMockAdmin,
} from '../../common/testing/test-data.factory';
import { UploadService } from '../../common/upload/upload.service';

describe('FeedbackService', () => {
  let service: FeedbackService;
  let prismaMock: PrismaMock;

  const mockFeedback = createMockFeedback();
  const mockAdmin = createMockAdmin();

  beforeEach(async () => {
    prismaMock = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeedbackService,
        { provide: PrismaService, useValue: prismaMock },
        {
          provide: UploadService,
          useValue: {
            deleteByPublicId: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FeedbackService>(FeedbackService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    const dto = {
      title: 'Góp ý lịch thi',
      category: 'HOC_TAP' as any,
      content: 'Nội dung phản hồi.',
    };

    it('should create feedback without student_id and auto-notify admin', async () => {
      prismaMock.feedback.create.mockResolvedValue(mockFeedback);
      prismaMock.admin.findFirst.mockResolvedValue(mockAdmin);
      prismaMock.notification.create.mockResolvedValue({});

      const result = await service.create(100, dto);
      expect(result.feedback_id).toBe(1);
      expect(prismaMock.notification.create).toHaveBeenCalledTimes(1);
    });

    it('should create feedback with student_id when parent is linked', async () => {
      prismaMock.studentParent.findUnique.mockResolvedValue({
        student_id: 1000,
        parent_id: 100,
      });
      prismaMock.feedback.create.mockResolvedValue({
        ...mockFeedback,
        student_id: 1000,
      });
      prismaMock.admin.findFirst.mockResolvedValue(mockAdmin);
      prismaMock.notification.create.mockResolvedValue({});

      const result = await service.create(100, { ...dto, student_id: 1000 });
      expect(result.student_id).toBe(1000);
    });

    it('should throw ForbiddenException when parent is not linked to student', async () => {
      prismaMock.studentParent.findUnique.mockResolvedValue(null);
      await expect(
        service.create(100, { ...dto, student_id: 9999 }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findAll()', () => {
    it('should return paginated feedbacks with defaults', async () => {
      prismaMock.$transaction.mockResolvedValue([[mockFeedback], 1]);
      const result = await service.findAll();
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should filter by status when provided', async () => {
      prismaMock.$transaction.mockResolvedValue([[mockFeedback], 1]);
      await service.findAll({ status: 'OPEN' });
      const transactionCall = prismaMock.$transaction.mock.calls[0][0];
      expect(transactionCall).toBeDefined();
    });

    it('should return empty data when no feedbacks match filters', async () => {
      prismaMock.$transaction.mockResolvedValue([[], 0]);
      const result = await service.findAll({
        status: 'RESOLVED',
        search: 'unknown',
      });
      expect(result.data).toHaveLength(0);
      expect(result.totalPages).toBe(0);
    });

    it('should apply correct pagination', async () => {
      prismaMock.$transaction.mockResolvedValue([[mockFeedback], 25]);
      const result = await service.findAll({ page: 2, limit: 10 });
      expect(result.page).toBe(2);
      expect(result.totalPages).toBe(3);
    });
  });

  describe('findOne()', () => {
    it('should return feedback by id', async () => {
      prismaMock.feedback.findUnique.mockResolvedValue(mockFeedback);
      const result = await service.findOne(1);
      expect(result.feedback_id).toBe(1);
    });

    it('should throw NotFoundException when feedback not found', async () => {
      prismaMock.feedback.findUnique.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByParent()', () => {
    it('should return feedbacks for a parent', async () => {
      prismaMock.feedback.findMany.mockResolvedValue([mockFeedback]);
      const result = await service.findByParent(100);
      expect(result).toHaveLength(1);
    });
  });

  describe('addMessage()', () => {
    const mockMessage = {
      message_id: 1,
      content: 'Reply content',
      sender_role: 'ADMIN',
      sender_id: 1,
      created_at: new Date(),
      feedback_id: 1,
    };

    it('should add admin message and move status to IN_PROGRESS when OPEN', async () => {
      prismaMock.feedback.findUnique.mockResolvedValue({
        ...mockFeedback,
        status: 'OPEN',
      });
      prismaMock.$transaction.mockResolvedValue([mockMessage, {}]);
      prismaMock.notification.create.mockResolvedValue({});

      const result = await service.addMessage(1, 1, MessageSenderRole.ADMIN, {
        content: 'Reply content',
      });
      expect(result.message_id).toBe(1);
      expect(prismaMock.notification.create).toHaveBeenCalledTimes(1);
    });

    it('should add parent message and notify admin', async () => {
      prismaMock.feedback.findUnique.mockResolvedValue({
        ...mockFeedback,
        status: 'IN_PROGRESS',
      });
      prismaMock.$transaction.mockResolvedValue([mockMessage, {}]);
      prismaMock.parent.findUnique.mockResolvedValue(createMockParent());
      prismaMock.admin.findFirst.mockResolvedValue(mockAdmin);
      prismaMock.notification.create.mockResolvedValue({});

      const result = await service.addMessage(
        1,
        100,
        MessageSenderRole.PARENT,
        { content: 'Follow-up' },
      );
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException when feedback not found', async () => {
      prismaMock.feedback.findUnique.mockResolvedValue(null);
      await expect(
        service.addMessage(999, 1, MessageSenderRole.ADMIN, { content: 'msg' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus()', () => {
    it('should update feedback status successfully', async () => {
      prismaMock.feedback.findUnique.mockResolvedValue(mockFeedback);
      prismaMock.feedback.update.mockResolvedValue({
        ...mockFeedback,
        status: 'RESOLVED',
      });

      const result = await service.updateStatus(1, {
        status: 'RESOLVED' as any,
      });
      expect(result.status).toBe('RESOLVED');
    });

    it('should throw NotFoundException when feedback not found', async () => {
      prismaMock.feedback.findUnique.mockResolvedValue(null);
      await expect(
        service.updateStatus(999, { status: 'RESOLVED' as any }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove()', () => {
    it('should delete feedback successfully', async () => {
      prismaMock.feedback.findUnique.mockResolvedValue(mockFeedback);
      prismaMock.feedback.delete.mockResolvedValue(mockFeedback);
      const result = await service.remove(1);
      expect(result.message).toContain('1');
    });

    it('should throw NotFoundException when feedback not found', async () => {
      prismaMock.feedback.findUnique.mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
