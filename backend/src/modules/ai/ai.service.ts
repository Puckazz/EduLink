import {
  BadGatewayException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, FeedbackStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { GenerateNotificationDto } from './dto/generate-notification.dto';
import { FeedbackSummaryQueryDto } from './dto/feedback-summary-query.dto';
import {
  FeedbackCategoryBreakdownDto,
  FeedbackSummaryResponseDto,
  GenerateNotificationResponseDto,
  SuggestFeedbackReplyResponseDto,
} from './dto/ai-responses.dto';
import { LlmProviderService } from './llm-provider.service';
import { FeedbackService } from '../feedback/feedback.service';

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

const FEEDBACK_CATEGORY_LABELS: Record<string, string> = {
  HOC_TAP: 'Học tập & Điểm số',
  TAI_CHINH: 'Tài chính & Học phí',
  THOI_KHOA_BIEU: 'Thời khóa biểu',
  KY_LUAT: 'Kỷ luật',
  KY_TUC_XA: 'Ký túc xá',
  SUC_KHOE: 'Sức khỏe',
  HOAT_DONG: 'Hoạt động ngoại khóa',
  KHAC: 'Khác',
};

const FEEDBACK_STATUS_LABELS: Record<string, string> = {
  OPEN: 'Chờ xử lý',
  IN_PROGRESS: 'Đang xử lý',
  RESOLVED: 'Đã giải quyết',
};

const ACTIVE_FEEDBACK_STATUSES: FeedbackStatus[] = [
  FeedbackStatus.OPEN,
  FeedbackStatus.IN_PROGRESS,
];

@Injectable()
export class AiService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly llm: LlmProviderService,
    private readonly feedbackService: FeedbackService,
  ) {}

  async generateNotificationDraft(
    dto: GenerateNotificationDto,
  ): Promise<GenerateNotificationResponseDto> {
    const recipientLabel = this.getRecipientLabel(dto.recipient ?? 'all');
    const prompt = `Bạn là trợ lý hành chính của hệ thống quản lý giáo dục EduLink.
Nhiệm vụ: viết nháp thông báo tiếng Việt trang trọng, rõ ràng, ngắn gọn để admin xem lại trước khi gửi.

Ràng buộc:
- Chỉ dựa trên ý chính được cung cấp, không tự bịa ngày/địa điểm/quy định.
- Nếu thiếu chi tiết, viết trung tính và để admin có thể chỉnh sửa.
- Trả về JSON hợp lệ, không markdown, không giải thích.
- Schema: {"title":"string","content":"string"}
- Tiêu đề tối đa 120 ký tự. Nội dung tối đa 500 ký tự.

Đối tượng nhận: ${recipientLabel}
Mức độ khẩn cấp: ${dto.isUrgent ? 'Quan trọng/khẩn cấp' : 'Thông thường'}
Ý chính: ${this.escapeText(dto.brief)}`;

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

    const prompt = `Bạn là trợ lý vận hành trường học. Hãy tóm tắt các phản hồi phụ huynh đang cần xử lý cho admin.

Ràng buộc:
- Chỉ dùng dữ liệu trong danh sách, không suy đoán ngoài dữ liệu.
- Ưu tiên phát hiện phản hồi khẩn cấp dựa trên nội dung như sức khỏe, kỷ luật, tài chính gấp, lịch học/thi sát hạn, phụ huynh không hài lòng mạnh.
- Trả về JSON hợp lệ, không markdown, không giải thích.
- Schema: {"summary":"string","urgentCount":number,"suggestedActions":["string"]}
- summary tối đa 180 ký tự; suggestedActions tối đa 3 mục, mỗi mục tối đa 80 ký tự.
- Không liệt kê chi tiết từng ID nếu không cần.

Số liệu hệ thống:
${JSON.stringify({
  statusCounts: stats,
  sixMonthAnalytics: {
    totalInPeriod: analytics.totalInPeriod,
    respondedCount: analytics.respondedCount,
    avgResponseHours: analytics.avgResponseHours,
    resolutionRate: analytics.resolutionRate,
    topCategories: analytics.categoryBreakdown.slice(0, 5),
  },
})}

Danh sách phản hồi:
${JSON.stringify(
  feedbacks.map((feedback) => ({
    id: feedback.feedback_id,
    title: feedback.title,
    category: FEEDBACK_CATEGORY_LABELS[feedback.category] ?? feedback.category,
    status: FEEDBACK_STATUS_LABELS[feedback.status] ?? feedback.status,
    parent: feedback.parent?.full_name,
    student: feedback.student
      ? `${feedback.student.full_name} (${feedback.student.student_code}${feedback.student.class ? `, lớp ${feedback.student.class}` : ''})`
      : null,
    content: this.truncate(feedback.content, 180),
    latestMessages: feedback.messages
      .slice()
      .reverse()
      .map((message) => ({
        role: message.sender_role,
        content: this.truncate(message.content, 120),
      })),
  })),
  null,
  2,
)}`;

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

    const prompt = `Bạn là admin trường học đang trả lời phụ huynh trong hệ thống EduLink.

Ràng buộc:
- Viết tiếng Việt lịch sự, đồng cảm, chuyên nghiệp.
- Không hứa chắc kết quả nếu dữ liệu chưa có; dùng câu như "Nhà trường sẽ kiểm tra" khi cần.
- Không tự bịa thông tin về lịch, học phí, điểm số, quy định.
- Trả về JSON hợp lệ, không markdown, không giải thích.
- Schema: {"content":"string"}
- content tối đa 700 ký tự.

Ngữ cảnh phản hồi:
${JSON.stringify(
  {
    title: feedback.title,
    category: FEEDBACK_CATEGORY_LABELS[feedback.category] ?? feedback.category,
    status: FEEDBACK_STATUS_LABELS[feedback.status] ?? feedback.status,
    parent: feedback.parent?.full_name,
    student: feedback.student
      ? `${feedback.student.full_name} (${feedback.student.student_code}${feedback.student.class ? `, lớp ${feedback.student.class}` : ''})`
      : null,
    originalContent: feedback.content,
    thread: feedback.messages.map((message) => ({
      role: message.sender_role,
      content: message.content,
    })),
  },
  null,
  2,
)}`;

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

  private getRecipientLabel(recipient: 'all' | 'parents' | 'teachers') {
    if (recipient === 'parents') return 'Phụ huynh';
    if (recipient === 'teachers') return 'Giáo viên';
    return 'Tất cả người dùng';
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

  private escapeText(value: string) {
    return value.replace(/[`$]/g, '').trim();
  }

  private truncate(value: string, maxLength: number) {
    const trimmed = value.trim();
    if (trimmed.length <= maxLength) return trimmed;
    return `${trimmed.slice(0, maxLength - 3)}...`;
  }
}
