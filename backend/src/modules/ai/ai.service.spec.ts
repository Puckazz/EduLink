import { BadGatewayException, NotFoundException } from '@nestjs/common';
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
  let llm: { generateJson: jest.Mock };
  let feedbackService: {
    getStats: jest.Mock;
    getAnalytics: jest.Mock;
  };
  let contextBuilder: Record<string, jest.Mock>;

  beforeEach(() => {
    prisma = createPrismaMock();
    llm = { generateJson: jest.fn() };
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

    const result = await service.summarizeFeedback({});

    expect(result.urgentCount).toBe(0);
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
    llm.generateJson.mockResolvedValue({
      summary: 'Có 1 phản hồi học tập cần xử lý.',
      urgentCount: 1,
      suggestedActions: ['Kiểm tra bảng điểm trước khi phản hồi.'],
    });

    const result = await service.summarizeFeedback({ status: 'OPEN' });

    expect(result.categoryBreakdown).toEqual([
      { category: 'HOC_TAP', count: 1 },
    ]);
    expect(result.stats.total).toBe(6);
    expect(result.analytics.avgResponseHours).toBe(2.5);
    expect(result.suggestedActions).toHaveLength(1);
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
    llm.generateJson.mockRejectedValue(new BadGatewayException('Invalid JSON'));

    const result = await service.summarizeFeedback({});

    expect(result.summary).toContain('Có 1 phản hồi');
    expect(result.urgentCount).toBe(1);
    expect(result.stats.inProgress).toBe(1);
    expect(result.analytics.respondedCount).toBe(4);
    expect(result.categoryBreakdown).toEqual([
      { category: 'HOC_TAP', count: 1 },
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
});
