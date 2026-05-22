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
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'updated_at' | 'created_at';
  sortOrder?: 'asc' | 'desc';
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

  private async getSystemAdminId(): Promise<number> {
    const admin = await this.prisma.admin.findFirst({
      select: { admin_id: true },
      orderBy: { admin_id: 'asc' },
    });
    if (!admin) throw new Error('Không tìm thấy admin nào trong hệ thống');
    return admin.admin_id;
  }

  async create(parentId: number, dto: CreateFeedbackDto) {
    const { title, category, content, student_id } = dto;

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

    const parentName = feedback.parent?.full_name ?? 'Phụ huynh';
    const systemAdminId = await this.getSystemAdminId();
    await this.prisma.notification.create({
      data: {
        title: `Phản hồi mới từ ${parentName}`,
        content: `"${title}" — ${content.slice(0, 120)}${content.length > 120 ? '...' : ''}`,
        admin_id: systemAdminId,
        target_role: 'admin',
        target_id: systemAdminId,
        feedback_id: feedback.feedback_id,
      },
    });

    return feedback;
  }

  async findAll(filters?: FeedbackFilters) {
    const page = Math.max(1, filters?.page ?? 1);
    const limit = Math.min(100, Math.max(1, filters?.limit ?? 20));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (filters?.status && filters.status !== 'ALL') {
      where.status = filters.status;
    }

    if (filters?.category && filters.category !== 'ALL') {
      where.category = filters.category;
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search } },
        { parent: { full_name: { contains: filters.search } } },
      ];
    }

    const sortBy = filters?.sortBy === 'created_at' ? 'created_at' : 'updated_at';
    const sortOrder = filters?.sortOrder === 'asc' ? 'asc' : 'desc';

    const [data, total] = await this.prisma.$transaction([
      this.prisma.feedback.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
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
          ...(senderRole === MessageSenderRole.ADMIN
            ? { reply_content: dto.content, replied_at: new Date() }
            : {}),
        },
      }),
    ]);

    if (senderRole === MessageSenderRole.ADMIN) {
      await this.prisma.notification.create({
        data: {
          title: `Nhà trường đã phản hồi: ${feedback.title}`,
          content: dto.content.slice(0, 150) + (dto.content.length > 150 ? '...' : ''),
          admin_id: senderId,
          target_role: 'parent',
          target_id: feedback.parent_id,
          feedback_id: feedbackId,
        },
      });
    } else {
      const parent = await this.prisma.parent.findUnique({
        where: { parent_id: senderId },
        select: { full_name: true },
      });
      const parentName = parent?.full_name ?? 'Phụ huynh';
      const systemAdminId = await this.getSystemAdminId();
      await this.prisma.notification.create({
        data: {
          title: `${parentName} gửi thêm phản hồi: ${feedback.title}`,
          content: dto.content.slice(0, 150) + (dto.content.length > 150 ? '...' : ''),
          admin_id: systemAdminId,
          target_role: 'admin',
          target_id: systemAdminId,
          feedback_id: feedbackId,
        },
      });
    }

    return message;
  }

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

  async getStats() {
    const [open, inProgress, resolved, total] = await this.prisma.$transaction([
      this.prisma.feedback.count({ where: { status: 'OPEN' } }),
      this.prisma.feedback.count({ where: { status: 'IN_PROGRESS' } }),
      this.prisma.feedback.count({ where: { status: 'RESOLVED' } }),
      this.prisma.feedback.count(),
    ]);
    return { open, inProgress, resolved, total };
  }

  async getAnalytics() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const feedbacks = await this.prisma.feedback.findMany({
      where: { created_at: { gte: sixMonthsAgo } },
      select: {
        feedback_id: true,
        category: true,
        status: true,
        created_at: true,
        messages: {
          where: { sender_role: 'ADMIN' },
          orderBy: { created_at: 'asc' },
          take: 1,
          select: { created_at: true },
        },
      },
    });

    const monthMap: Record<string, { month: string; total: number; resolved: number }> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('vi-VN', { month: 'short', year: '2-digit' });
      monthMap[key] = { month: label, total: 0, resolved: 0 };
    }
    for (const fb of feedbacks) {
      const d = new Date(fb.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (monthMap[key]) {
        monthMap[key].total += 1;
        if (fb.status === 'RESOLVED') monthMap[key].resolved += 1;
      }
    }
    const trend = Object.values(monthMap);

    const categoryCount: Record<string, number> = {};
    for (const fb of feedbacks) {
      categoryCount[fb.category] = (categoryCount[fb.category] ?? 0) + 1;
    }
    const categoryBreakdown = Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    let totalResponseMs = 0;
    let respondedCount = 0;
    for (const fb of feedbacks) {
      if (fb.messages.length > 0) {
        const firstReply = new Date(fb.messages[0].created_at).getTime();
        const created = new Date(fb.created_at).getTime();
        const diff = firstReply - created;
        if (diff > 0) {
          totalResponseMs += diff;
          respondedCount += 1;
        }
      }
    }
    const avgResponseHours =
      respondedCount > 0
        ? Math.round((totalResponseMs / respondedCount / 3_600_000) * 10) / 10
        : null;

    const resolvedCount = feedbacks.filter((f) => f.status === 'RESOLVED').length;
    const resolutionRate =
      feedbacks.length > 0 ? Math.round((resolvedCount / feedbacks.length) * 100) : 0;

    return {
      trend,
      categoryBreakdown,
      avgResponseHours,
      resolutionRate,
      totalInPeriod: feedbacks.length,
      respondedCount,
    };
  }

  async getExportData(filters?: Pick<FeedbackFilters, 'status' | 'category' | 'search'>) {
    const where: Record<string, unknown> = {};
    if (filters?.status && filters.status !== 'ALL') where.status = filters.status;
    if (filters?.category && filters.category !== 'ALL') where.category = filters.category;
    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search } },
        { parent: { full_name: { contains: filters.search } } },
      ];
    }

    return this.prisma.feedback.findMany({
      where,
      orderBy: { updated_at: 'desc' },
      include: {
        parent: { select: { full_name: true, phone: true, email: true } },
        student: { select: { student_code: true, full_name: true } },
        messages: { orderBy: { created_at: 'asc' } },
      },
    });
  }
}

