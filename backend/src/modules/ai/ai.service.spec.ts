import {
  BadGatewayException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { AiService } from './ai.service';
import { LlmProviderService } from './llm-provider.service';
import {
  createPrismaMock,
  PrismaMock,
} from '../../common/testing/prisma-mock.helper';
import { PrismaService } from '../../prisma/prisma.service';
import { FeedbackService } from '../feedback/feedback.service';
import { AiContextBuilder } from './ai-context.builder';

describe('AiService', () => {
  let service: AiService;
  let prisma: PrismaMock;
  let llm: { generateJson: jest.Mock; generateText: jest.Mock };
  let feedbackService: {
    getStats: jest.Mock;
    getAnalytics: jest.Mock;
  };
  let contextBuilder: Record<string, jest.Mock>;

  beforeEach(() => {
    prisma = createPrismaMock();
    llm = { generateJson: jest.fn(), generateText: jest.fn() };
    feedbackService = {
      getStats: jest.fn().mockResolvedValue({
        open: 2,
        inProgress: 1,
        resolved: 3,
        total: 6,
      }),
      getAnalytics: jest.fn().mockResolvedValue({
        trend: [],
        categoryBreakdown: [{ category: 'HOC_TAP', count: 2 }],
        avgResponseHours: 2.5,
        resolutionRate: 50,
        totalInPeriod: 6,
        respondedCount: 4,
      }),
    };
    contextBuilder = {
      validateOwnership: jest.fn().mockResolvedValue(undefined),
      validateConversationOwnership: jest.fn(),
      getStudentsForParent: jest.fn().mockResolvedValue([]),
      buildStudentContext: jest.fn().mockResolvedValue({
        studentName: 'Nguyễn Văn B',
        studentCode: 'SV001',
        className: 'CNTT2024A',
        majorName: 'Công nghệ Thông tin',
        scores: [],
        attendances: [],
        schedule: [],
        recentNotifications: [],
      }),
      getChatHistory: jest.fn().mockResolvedValue([]),
    };
    service = new AiService(
      prisma as unknown as PrismaService,
      llm as unknown as LlmProviderService,
      feedbackService as unknown as FeedbackService,
      contextBuilder as unknown as AiContextBuilder,
    );
  });

  it('generates notification draft', async () => {
    llm.generateJson.mockResolvedValue({
      title: 'Thông báo lịch thi',
      content: 'Kính gửi Quý phụ huynh...',
    });

    const result = await service.generateNotificationDraft({
      brief: 'Lịch thi cuối kỳ bắt đầu từ 15/6',
      recipient: 'parents',
      isUrgent: false,
    });

    expect(result.title).toBe('Thông báo lịch thi');
    expect(result.content).toContain('Kính gửi');
  });

  it('throws BadGatewayException when notification JSON is incomplete', async () => {
    llm.generateJson.mockResolvedValue({ title: '' });

    await expect(
      service.generateNotificationDraft({ brief: 'Test' }),
    ).rejects.toThrow(BadGatewayException);
  });

  it('returns deterministic feedback summary when no open feedback exists', async () => {
    prisma.feedback.findMany.mockResolvedValue([]);
    prisma.feedback.count.mockResolvedValueOnce(0).mockResolvedValueOnce(0);
    prisma.feedback.groupBy.mockResolvedValue([]);

    const result = await service.summarizeFeedback({});

    expect(result.urgentCount).toBe(0);
    expect(result.totalMatched).toBe(0);
    expect(result.sampleSize).toBe(0);
    expect(result.summary).toContain('Không có phản hồi');
    expect(result.stats.open).toBe(2);
    expect(result.analytics.resolutionRate).toBe(50);
    expect(llm.generateJson).not.toHaveBeenCalled();
  });

  it('summarizes feedback and computes category breakdown', async () => {
    prisma.feedback.findMany.mockResolvedValue([
      {
        feedback_id: 1,
        title: 'Cần hỗ trợ điểm số',
        category: 'HOC_TAP',
        status: 'OPEN',
        content: 'Phụ huynh cần kiểm tra điểm.',
        parent: { full_name: 'Nguyễn Văn A' },
        student: { full_name: 'Nguyễn B', student_code: 'SV001', class: 'K1' },
        messages: [],
      },
    ]);
    prisma.feedback.count.mockResolvedValueOnce(3).mockResolvedValueOnce(1);
    prisma.feedback.groupBy.mockResolvedValue([
      { category: 'HOC_TAP', _count: { _all: 3 } },
    ]);
    llm.generateJson.mockResolvedValue({
      summary: 'Có 3 phản hồi học tập cần xử lý.',
      suggestedActions: ['Kiểm tra bảng điểm trước khi phản hồi.'],
    });

    const result = await service.summarizeFeedback({ status: 'OPEN' });

    expect(result.categoryBreakdown).toEqual([
      { category: 'HOC_TAP', count: 3 },
    ]);
    expect(result.totalMatched).toBe(3);
    expect(result.sampleSize).toBe(1);
    expect(result.urgentCount).toBe(1);
    expect(result.stats.total).toBe(6);
    expect(result.analytics.avgResponseHours).toBe(2.5);
    expect(result.suggestedActions).toHaveLength(1);
  });

  it('rejects resolved status for active feedback summary', async () => {
    await expect(
      service.summarizeFeedback({ status: 'RESOLVED' }),
    ).rejects.toThrow(BadRequestException);
    expect(prisma.feedback.findMany).not.toHaveBeenCalled();
  });

  it('rejects invalid feedback summary categories', async () => {
    await expect(
      service.summarizeFeedback({ category: 'UNKNOWN' }),
    ).rejects.toThrow(BadRequestException);
    expect(prisma.feedback.findMany).not.toHaveBeenCalled();
  });

  it('returns fallback feedback summary when AI JSON fails', async () => {
    prisma.feedback.findMany.mockResolvedValue([
      {
        feedback_id: 1,
        title: 'Cần hỗ trợ gấp',
        category: 'HOC_TAP',
        status: 'OPEN',
        content: 'Phụ huynh cần kiểm tra điểm thi gấp.',
        parent: { full_name: 'Nguyễn Văn A' },
        student: null,
        messages: [],
      },
    ]);
    prisma.feedback.count.mockResolvedValueOnce(5).mockResolvedValueOnce(1);
    prisma.feedback.groupBy.mockResolvedValue([
      { category: 'HOC_TAP', _count: { _all: 5 } },
    ]);
    llm.generateJson.mockRejectedValue(new BadGatewayException('Invalid JSON'));

    const result = await service.summarizeFeedback({});

    expect(result.summary).toContain('Có 5 phản hồi');
    expect(result.urgentCount).toBe(1);
    expect(result.totalMatched).toBe(5);
    expect(result.sampleSize).toBe(1);
    expect(result.stats.inProgress).toBe(1);
    expect(result.analytics.respondedCount).toBe(4);
    expect(result.categoryBreakdown).toEqual([
      { category: 'HOC_TAP', count: 5 },
    ]);
  });

  it('suggests feedback reply with thread context', async () => {
    prisma.feedback.findUnique.mockResolvedValue({
      feedback_id: 1,
      title: 'Xin hỗ trợ',
      category: 'KHAC',
      status: 'OPEN',
      content: 'Nội dung phản hồi',
      parent: { full_name: 'Phụ huynh A' },
      student: null,
      messages: [{ sender_role: 'PARENT', content: 'Nội dung phản hồi' }],
    });
    llm.generateJson.mockResolvedValue({
      content: 'Nhà trường đã tiếp nhận và sẽ kiểm tra.',
    });

    const result = await service.suggestFeedbackReply(1);

    expect(result.content).toContain('Nhà trường');
    expect(llm.generateJson).toHaveBeenCalledTimes(1);
  });

  it('throws NotFoundException when feedback does not exist', async () => {
    prisma.feedback.findUnique.mockResolvedValue(null);

    await expect(service.suggestFeedbackReply(999)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('does not return orphaned conversations without a linked student', async () => {
    const createdAt = new Date('2026-06-01T00:00:00Z');
    prisma.chatConversation.findMany.mockResolvedValue([
      {
        conversation_id: 1,
        title: 'Tình hình điểm số',
        student_id: 10,
        created_at: createdAt,
      },
    ]);

    const result = await service.getConversations(7);

    expect(prisma.chatConversation.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          parent_id: 7,
          student_id: { not: null },
        },
      }),
    );
    expect(result).toEqual([
      {
        conversation_id: 1,
        title: 'Tình hình điểm số',
        student_id: 10,
        created_at: createdAt,
      },
    ]);
  });

  it('rejects invalid conversation student filters', async () => {
    await expect(service.getConversations(7, Number.NaN)).rejects.toThrow(
      BadRequestException,
    );
    expect(prisma.chatConversation.findMany).not.toHaveBeenCalled();
  });

  it('rejects chat when the conversation no longer has a student', async () => {
    contextBuilder.validateConversationOwnership.mockResolvedValue({
      conversation_id: 1,
      parent_id: 7,
      student_id: null,
    });

    await expect(
      service.chat(7, { conversationId: 1, message: 'Xin chào' }),
    ).rejects.toThrow(NotFoundException);
    expect(contextBuilder.buildStudentContext).not.toHaveBeenCalled();
    expect(llm.generateText).not.toHaveBeenCalled();
  });

  it('revalidates student ownership and scopes context by parent when chatting', async () => {
    contextBuilder.validateConversationOwnership.mockResolvedValue({
      conversation_id: 1,
      parent_id: 7,
      student_id: 10,
    });
    contextBuilder.getChatHistory.mockResolvedValue([
      { role: 'USER', content: 'Tin nhắn cũ' },
    ]);
    llm.generateText.mockResolvedValue('Nhà trường đã ghi nhận.');
    prisma.chatHistory.create.mockResolvedValue({});

    const result = await service.chat(7, {
      conversationId: 1,
      message: 'Con tôi có thông báo gì mới không?',
    });

    expect(contextBuilder.validateOwnership).toHaveBeenCalledWith(7, 10);
    expect(contextBuilder.buildStudentContext).toHaveBeenCalledWith(7, 10);
    expect(result.reply).toBe('Nhà trường đã ghi nhận.');
  });
});
