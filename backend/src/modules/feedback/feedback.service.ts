import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { MessageSenderRole } from '@prisma/client';

export interface PaginatedFeedbacks {
  data: Awaited<ReturnType<FeedbackService['findAll']>>['data'];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FeedbackFilters {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

const FEEDBACK_INCLUDE = {
  parent: {
    select: {
      parent_id: true,
      full_name: true,
      phone: true,
      email: true,
    },
  },
  student: {
    select: {
      student_id: true,
      student_code: true,
      full_name: true,
      class: true,
    },
  },
  messages: {
    orderBy: { created_at: 'asc' as const },
  },
};

@Injectable()
export class FeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  // ── [Parent] Create new feedback ticket ─────────────────────────────────
  async create(parentId: number, dto: CreateFeedbackDto) {
    const { title, category, content, student_id } = dto;

    // Verify student belongs to this parent (if specified)
    if (student_id) {
      const link = await this.prisma.studentParent.findUnique({
        where: {
          student_id_parent_id: { student_id, parent_id: parentId },
        },
      });
      if (!link) {
        throw new ForbiddenException('Bạn không có quyền truy cập sinh viên này');
      }
    }

    const feedback = await this.prisma.feedback.create({
      data: {
        title,
        category,
        content,
        parent_id: parentId,
        student_id: student_id ?? null,
        // Create first message from parent content
        messages: {
          create: {
            content,
            sender_role: MessageSenderRole.PARENT,
            sender_id: parentId,
          },
        },
      },
      include: FEEDBACK_INCLUDE,
    });

    return feedback;
  }

  // ── [Admin] Get all feedbacks (paginated) ──────────────────────────────
  async findAll(filters?: FeedbackFilters) {
    const page = Math.max(1, filters?.page ?? 1);
    const limit = Math.min(100, Math.max(1, filters?.limit ?? 20));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (filters?.status && filters.status !== 'ALL') {
      where.status = filters.status;
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search } },
        { parent: { full_name: { contains: filters.search } } },
      ];
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.feedback.findMany({
        where,
        orderBy: { updated_at: 'desc' },
        skip,
        take: limit,
        include: {
          parent: {
            select: {
              parent_id: true,
              full_name: true,
              phone: true,
              email: true,
            },
          },
          student: {
            select: {
              student_id: true,
              student_code: true,
              full_name: true,
            },
          },
          messages: {
            orderBy: { created_at: 'desc' },
            take: 1,
          },
        },
      }),
      this.prisma.feedback.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ── [Admin/Parent] Get single feedback with full thread ──────────────────
  async findOne(id: number) {
    const feedback = await this.prisma.feedback.findUnique({
      where: { feedback_id: id },
      include: FEEDBACK_INCLUDE,
    });

    if (!feedback) {
      throw new NotFoundException(`Không tìm thấy phản hồi #${id}`);
    }

    return feedback;
  }

  // ── [Parent] Get my feedbacks ────────────────────────────────────────────
  async findByParent(parentId: number) {
    return this.prisma.feedback.findMany({
      where: { parent_id: parentId },
      orderBy: { updated_at: 'desc' },
      include: {
        student: {
          select: {
            student_id: true,
            student_code: true,
            full_name: true,
          },
        },
        messages: {
          orderBy: { created_at: 'desc' },
          take: 1,
        },
      },
    });
  }

  // ── [Admin/Parent] Add message to thread ────────────────────────────────
  async addMessage(
    feedbackId: number,
    senderId: number,
    senderRole: MessageSenderRole,
    dto: CreateMessageDto,
  ) {
    const feedback = await this.prisma.feedback.findUnique({
      where: { feedback_id: feedbackId },
    });

    if (!feedback) {
      throw new NotFoundException(`Không tìm thấy phản hồi #${feedbackId}`);
    }

    // Auto-update status: when admin replies, move to IN_PROGRESS (if still OPEN)
    const shouldUpdateStatus =
      senderRole === MessageSenderRole.ADMIN && feedback.status === 'OPEN';

    const [message] = await this.prisma.$transaction([
      this.prisma.feedbackMessage.create({
        data: {
          content: dto.content,
          sender_role: senderRole,
          sender_id: senderId,
          feedback_id: feedbackId,
        },
      }),
      this.prisma.feedback.update({
        where: { feedback_id: feedbackId },
        data: {
          updated_at: new Date(),
          ...(shouldUpdateStatus ? { status: 'IN_PROGRESS' } : {}),
          // Legacy field sync
          ...(senderRole === MessageSenderRole.ADMIN
            ? { reply_content: dto.content, replied_at: new Date() }
            : {}),
        },
      }),
    ]);

    return message;
  }

  // ── [Admin] Get thread messages ──────────────────────────────────────────
  async getMessages(feedbackId: number) {
    const exists = await this.prisma.feedback.findUnique({
      where: { feedback_id: feedbackId },
      select: { feedback_id: true },
    });

    if (!exists) {
      throw new NotFoundException(`Không tìm thấy phản hồi #${feedbackId}`);
    }

    return this.prisma.feedbackMessage.findMany({
      where: { feedback_id: feedbackId },
      orderBy: { created_at: 'asc' },
    });
  }

  // ── [Admin] Update feedback status ──────────────────────────────────────
  async updateStatus(id: number, dto: UpdateFeedbackDto) {
    const feedback = await this.prisma.feedback.findUnique({
      where: { feedback_id: id },
    });

    if (!feedback) {
      throw new NotFoundException(`Không tìm thấy phản hồi #${id}`);
    }

    return this.prisma.feedback.update({
      where: { feedback_id: id },
      data: { status: dto.status },
    });
  }

  // ── [Admin] Delete feedback ──────────────────────────────────────────────
  async remove(id: number) {
    const feedback = await this.prisma.feedback.findUnique({
      where: { feedback_id: id },
    });

    if (!feedback) {
      throw new NotFoundException(`Không tìm thấy phản hồi #${id}`);
    }

    await this.prisma.feedback.delete({ where: { feedback_id: id } });
    return { message: `Đã xóa phản hồi #${id}` };
  }
}
