import {
  BadGatewayException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, FeedbackStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { GenerateNotificationDto } from './dto/generate-notification.dto';
import { FeedbackSummaryQueryDto } from './dto/feedback-summary-query.dto';
import { ChatDto } from './dto/chat.dto';
import { ChatHistoryQueryDto } from './dto/chat-history-query.dto';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { ConversationResponseDto } from './dto/conversation-response.dto';
import {
  ChatResponseDto,
  ChatHistoryResponseDto,
} from './dto/chat-response.dto';
import {
  FeedbackCategoryBreakdownDto,
  FeedbackSummaryResponseDto,
  GenerateNotificationResponseDto,
  SuggestFeedbackReplyResponseDto,
} from './dto/ai-responses.dto';
import { LlmProviderService } from './llm-provider.service';
import { FeedbackService } from '../feedback/feedback.service';
import { AiContextBuilder } from './ai-context.builder';
import {
  ACTIVE_FEEDBACK_STATUSES,
  FEEDBACK_CATEGORY_LABELS,
} from './ai-prompt.config';
import {
  buildConversationTitlePrompt,
  buildFeedbackReplyPrompt,
  buildFeedbackSummaryPrompt,
  buildNotificationDraftPrompt,
  buildParentChatPrompt,
  shouldIncludeParentUsageGuide,
} from './ai-prompt.templates';

interface AiNotificationJson {
  title?: string;
  content?: string;
}

interface AiFeedbackSummaryJson {
  summary?: string;
  urgentCount?: number;
  suggestedActions?: string[];
}

interface AiReplyJson {
  content?: string;
}

@Injectable()
export class AiService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly llm: LlmProviderService,
    private readonly feedbackService: FeedbackService,
    private readonly contextBuilder: AiContextBuilder,
  ) {}

  async generateNotificationDraft(
    dto: GenerateNotificationDto,
  ): Promise<GenerateNotificationResponseDto> {
    const prompt = buildNotificationDraftPrompt({
      brief: dto.brief,
      recipient: dto.recipient ?? 'all',
      isUrgent: dto.isUrgent,
    });

    const result = await this.llm.generateJson<AiNotificationJson>(prompt, {
      temperature: 0.25,
      maxOutputTokens: 700,
    });

    return {
      title: this.requireText(result.title, 'Tiêu đề AI không hợp lệ').slice(
        0,
        120,
      ),
      content: this.requireText(
        result.content,
        'Nội dung AI không hợp lệ',
      ).slice(0, 500),
    };
  }

  async summarizeFeedback(
    query: FeedbackSummaryQueryDto,
  ): Promise<FeedbackSummaryResponseDto> {
    const where = this.buildFeedbackWhere(query);
    const [feedbacks, stats, analytics] = await Promise.all([
      this.prisma.feedback.findMany({
        where,
        orderBy: { updated_at: 'desc' },
        take: 20,
        include: {
          parent: { select: { full_name: true } },
          student: {
            select: { full_name: true, student_code: true, class: true },
          },
          messages: {
            orderBy: { created_at: 'desc' },
            take: 2,
            select: { content: true, sender_role: true, created_at: true },
          },
        },
      }),
      this.feedbackService.getStats(),
      this.feedbackService.getAnalytics(),
    ]);

    const categoryBreakdown = this.buildCategoryBreakdown(feedbacks);
    if (feedbacks.length === 0) {
      return {
        summary:
          'Không có phản hồi OPEN/IN_PROGRESS phù hợp với bộ lọc hiện tại.',
        urgentCount: 0,
        stats,
        analytics,
        categoryBreakdown,
        suggestedActions: ['Tiếp tục theo dõi hộp thư phản hồi.'],
      };
    }

    const prompt = buildFeedbackSummaryPrompt({
      feedbacks,
      stats,
      analytics,
    });

    let result: AiFeedbackSummaryJson;
    try {
      result = await this.llm.generateJson<AiFeedbackSummaryJson>(prompt, {
        temperature: 0.1,
        maxOutputTokens: 384,
      });
    } catch (error) {
      if (error instanceof BadGatewayException) {
        return this.buildFallbackFeedbackSummary(
          feedbacks,
          categoryBreakdown,
          stats,
          analytics,
        );
      }
      throw error;
    }

    return {
      summary: this.requireText(
        result.summary,
        'Tóm tắt AI không hợp lệ',
      ).slice(0, 220),
      urgentCount: this.toNonNegativeNumber(result.urgentCount),
      stats,
      analytics,
      categoryBreakdown,
      suggestedActions: Array.isArray(result.suggestedActions)
        ? result.suggestedActions
            .filter((item) => typeof item === 'string' && item.trim())
            .slice(0, 3)
        : [],
    };
  }

  async suggestFeedbackReply(
    feedbackId: number,
  ): Promise<SuggestFeedbackReplyResponseDto> {
    const feedback = await this.prisma.feedback.findUnique({
      where: { feedback_id: feedbackId },
      include: {
        parent: { select: { full_name: true } },
        student: {
          select: { full_name: true, student_code: true, class: true },
        },
        messages: {
          orderBy: { created_at: 'asc' },
          select: { content: true, sender_role: true, created_at: true },
        },
      },
    });

    if (!feedback) {
      throw new NotFoundException(`Không tìm thấy phản hồi #${feedbackId}`);
    }

    const prompt = buildFeedbackReplyPrompt(feedback);

    const result = await this.llm.generateJson<AiReplyJson>(prompt, {
      temperature: 0.35,
      maxOutputTokens: 900,
    });

    return {
      content: this.requireText(
        result.content,
        'Gợi ý trả lời AI không hợp lệ',
      ).slice(0, 700),
    };
  }

  private buildFeedbackWhere(
    query: FeedbackSummaryQueryDto,
  ): Prisma.FeedbackWhereInput {
    const where: Prisma.FeedbackWhereInput = {
      status: { in: ACTIVE_FEEDBACK_STATUSES },
    };

    if (query.status && query.status !== 'ALL') {
      where.status = ACTIVE_FEEDBACK_STATUSES.includes(
        query.status as FeedbackStatus,
      )
        ? (query.status as FeedbackStatus)
        : { in: [] };
    }

    if (query.category && query.category !== 'ALL') {
      where.category =
        query.category as Prisma.EnumFeedbackCategoryFilter['equals'];
    }

    if (query.search?.trim()) {
      const keyword = query.search.trim();
      where.OR = [
        { title: { contains: keyword } },
        { content: { contains: keyword } },
        { parent: { full_name: { contains: keyword } } },
        { student: { full_name: { contains: keyword } } },
      ];
    }

    return where;
  }

  private buildCategoryBreakdown(
    feedbacks: Array<{ category: string }>,
  ): FeedbackCategoryBreakdownDto[] {
    const counts = feedbacks.reduce<Record<string, number>>((acc, feedback) => {
      acc[feedback.category] = (acc[feedback.category] ?? 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).map(([category, count]) => ({
      category,
      count,
    }));
  }

  private buildFallbackFeedbackSummary(
    feedbacks: Array<{
      title: string;
      category: string;
      content: string;
      messages: Array<{ content: string }>;
    }>,
    categoryBreakdown: FeedbackCategoryBreakdownDto[],
    stats: Awaited<ReturnType<FeedbackService['getStats']>>,
    analytics: Awaited<ReturnType<FeedbackService['getAnalytics']>>,
  ): FeedbackSummaryResponseDto {
    const urgentCount = feedbacks.filter((feedback) =>
      this.isUrgentFeedback(feedback),
    ).length;
    const topCategories = categoryBreakdown
      .slice()
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(
        (item) =>
          `${FEEDBACK_CATEGORY_LABELS[item.category] ?? item.category}: ${item.count}`,
      )
      .join(', ');

    return {
      summary: `Có ${feedbacks.length} phản hồi đang cần xử lý${topCategories ? `; nhóm chính gồm ${topCategories}` : ''}.`,
      urgentCount,
      stats,
      analytics,
      categoryBreakdown,
      suggestedActions: [
        urgentCount > 0
          ? 'Ưu tiên kiểm tra các phản hồi có dấu hiệu khẩn cấp.'
          : 'Xử lý theo thứ tự phản hồi mới cập nhật.',
        'Gộp các phản hồi cùng chủ đề trước khi trả lời.',
      ],
    };
  }

  private isUrgentFeedback(feedback: {
    title: string;
    content: string;
    messages: Array<{ content: string }>;
  }) {
    const haystack = [
      feedback.title,
      feedback.content,
      ...feedback.messages.map((message) => message.content),
    ]
      .join(' ')
      .toLowerCase();

    return /(khẩn|gấp|ngay|sức khỏe|tai nạn|kỷ luật|nguy hiểm|bạo lực|thi|học phí|quá hạn|không hài lòng)/i.test(
      haystack,
    );
  }

  private requireText(value: unknown, message: string) {
    if (typeof value !== 'string' || !value.trim()) {
      throw new BadGatewayException(message);
    }
    return value.trim();
  }

  private toNonNegativeNumber(value: unknown) {
    const parsed = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) return 0;
    return Math.round(parsed);
  }

  async createConversation(
    parentId: number,
    dto: CreateConversationDto,
  ): Promise<ConversationResponseDto> {
    await this.contextBuilder.validateOwnership(parentId, dto.studentId);
    const conversation = await this.prisma.chatConversation.create({
      data: {
        parent_id: parentId,
        student_id: dto.studentId,
        title: dto.title?.trim() || 'Trò chuyện mới',
      },
    });
    return {
      conversation_id: conversation.conversation_id,
      title: conversation.title,
      student_id: conversation.student_id,
      created_at: conversation.created_at,
    };
  }

  async getConversations(
    parentId: number,
    studentId?: number,
  ): Promise<ConversationResponseDto[]> {
    if (studentId) {
      await this.contextBuilder.validateOwnership(parentId, studentId);
    }
    const conversations = await this.prisma.chatConversation.findMany({
      where: {
        parent_id: parentId,
        ...(studentId ? { student_id: studentId } : {}),
      },
      orderBy: { created_at: 'desc' },
    });
    return conversations.map((c) => ({
      conversation_id: c.conversation_id,
      title: c.title,
      student_id: c.student_id,
      created_at: c.created_at,
    }));
  }

  async updateConversation(
    parentId: number,
    id: number,
    dto: UpdateConversationDto,
  ): Promise<ConversationResponseDto> {
    await this.contextBuilder.validateConversationOwnership(parentId, id);
    const updated = await this.prisma.chatConversation.update({
      where: { conversation_id: id },
      data: { title: dto.title.trim() },
    });
    return {
      conversation_id: updated.conversation_id,
      title: updated.title,
      student_id: updated.student_id,
      created_at: updated.created_at,
    };
  }

  async deleteConversation(
    parentId: number,
    id: number,
  ): Promise<{ deleted: boolean }> {
    await this.contextBuilder.validateConversationOwnership(parentId, id);
    await this.prisma.chatConversation.delete({
      where: { conversation_id: id },
    });
    return { deleted: true };
  }

  async chat(parentId: number, dto: ChatDto): Promise<ChatResponseDto> {
    const conversation =
      await this.contextBuilder.validateConversationOwnership(
        parentId,
        dto.conversationId,
      );

    const studentId = conversation.student_id;
    if (!studentId) {
      throw new NotFoundException(
        'Không tìm thấy học sinh liên kết với cuộc hội thoại này',
      );
    }

    const [context, history] = await Promise.all([
      this.contextBuilder.buildStudentContext(studentId),
      this.contextBuilder.getChatHistory(dto.conversationId, 10),
    ]);

    const sources: string[] = [];
    if (shouldIncludeParentUsageGuide(dto.message)) {
      sources.push('Hướng dẫn sử dụng');
    }
    if (context.scores.length > 0) sources.push('Điểm số');
    if (context.attendances.length > 0) sources.push('Chuyên cần');
    if (context.schedule.length > 0) sources.push('Lịch học');
    if (context.recentNotifications.length > 0) sources.push('Thông báo');

    const conversationHistory = history
      .reverse()
      .map((h) => `${h.role === 'USER' ? 'Phụ huynh' : 'Trợ lý'}: ${h.content}`)
      .join('\n');

    const prompt = buildParentChatPrompt(
      context,
      conversationHistory,
      dto.message,
    );

    const reply = await this.llm.generateText(prompt, {
      label: `parent-chat:${dto.conversationId}`,
      temperature: 0.4,
      maxOutputTokens: 1200,
      thinkingBudget: 0,
    });

    await this.prisma.$transaction([
      this.prisma.chatHistory.create({
        data: {
          conversation_id: dto.conversationId,
          role: 'USER',
          content: dto.message,
        },
      }),
      this.prisma.chatHistory.create({
        data: {
          conversation_id: dto.conversationId,
          role: 'ASSISTANT',
          content: reply,
        },
      }),
    ]);

    if (history.length === 0) {
      await this.setFallbackConversationTitle(dto.conversationId, dto.message);
      void this.generateConversationTitle(dto.conversationId, dto.message);
    }

    return { reply, sources };
  }

  private async setFallbackConversationTitle(
    conversationId: number,
    message: string,
  ) {
    const title = this.buildFallbackConversationTitle(message);
    if (!title) return;

    await this.prisma.chatConversation.update({
      where: { conversation_id: conversationId },
      data: { title },
    });
  }

  private async generateConversationTitle(
    conversationId: number,
    message: string,
  ) {
    try {
      const titlePrompt = buildConversationTitlePrompt(message);

      const autoTitle = await this.llm.generateText(titlePrompt, {
        label: `chat-title:${conversationId}`,
        temperature: 0.2,
        maxOutputTokens: 80,
        thinkingBudget: 0,
        timeoutMs: 12_000,
      });

      const cleanedTitle =
        autoTitle
          .replace(/["'""*#]/g, '')
          .split(/[\n\r]+/)
          .map((l) => l.replace(/^tiêu\s*đề\s*[:：]?\s*/i, '').trim())
          .find((l) => l.length > 2) ?? '';

      if (cleanedTitle.length > 0) {
        await this.prisma.chatConversation.update({
          where: { conversation_id: conversationId },
          data: { title: cleanedTitle },
        });
      }
    } catch (error) {
      console.error('Failed to auto-title conversation:', error);
    }
  }

  private buildFallbackConversationTitle(message: string) {
    const normalized = message
      .replace(/\s+/g, ' ')
      .replace(/^["'“”]+|["'“”?.!]+$/g, '')
      .trim();

    if (!normalized) return '';

    const lower = normalized.toLowerCase();
    if (lower.includes('điểm')) return 'Tình hình điểm số';
    if (lower.includes('chuyên cần') || lower.includes('đi học')) {
      return 'Tình hình chuyên cần';
    }
    if (lower.includes('thông báo')) return 'Thông báo mới';
    if (lower.includes('lịch học') || lower.includes('thời khóa biểu')) {
      return 'Lịch học của con';
    }

    if (normalized.length <= 42) return normalized;
    return `${normalized.slice(0, 39).trim()}...`;
  }

  async getChatHistory(
    parentId: number,
    conversationId: number,
    query: ChatHistoryQueryDto,
  ): Promise<ChatHistoryResponseDto> {
    await this.contextBuilder.validateConversationOwnership(
      parentId,
      conversationId,
    );

    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, 50);
    const skip = (page - 1) * limit;

    const where = {
      conversation_id: conversationId,
    };

    const [data, total] = await Promise.all([
      this.prisma.chatHistory.findMany({
        where,
        orderBy: [{ created_at: 'desc' }, { chat_id: 'desc' }],
        skip,
        take: limit,
        select: {
          chat_id: true,
          conversation_id: true,
          role: true,
          content: true,
          created_at: true,
        },
      }),
      this.prisma.chatHistory.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async clearChatHistory(parentId: number): Promise<{ deleted: number }> {
    const result = await this.prisma.chatConversation.deleteMany({
      where: { parent_id: parentId },
    });
    return { deleted: result.count };
  }

  async clearChatHistoryByStudent(
    parentId: number,
    studentId: number,
  ): Promise<{ deleted: number }> {
    await this.contextBuilder.validateOwnership(parentId, studentId);
    const result = await this.prisma.chatConversation.deleteMany({
      where: { parent_id: parentId, student_id: studentId },
    });
    return { deleted: result.count };
  }
}
