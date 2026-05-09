import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

const notificationSelect = {
  notification_id: true,
  title: true,
  content: true,
  created_at: true,
  admin_id: true,
  target_role: true,
  target_id: true,
  feedback_id: true,
  admin: {
    select: {
      admin_id: true,
      full_name: true,
      email: true,
    },
  },
} satisfies Prisma.NotificationSelect;

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Admin: Tạo thông báo mới ─────────────────────────────────────────────
  async create(adminId: number, dto: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: {
        title: dto.title,
        content: dto.content,
        admin_id: adminId,
        target_role: dto.target_role,
      },
      select: notificationSelect,
    });
  }

  // ─── Admin: Lấy tất cả thông báo đã gửi (broadcast hoặc theo nhóm) ────────
  async findAll() {
    return this.prisma.notification.findMany({
      where: {
        OR: [
          { target_role: null },
          { target_role: 'parent' },
          { target_role: 'teacher' }
        ]
      },
      select: notificationSelect,
      orderBy: { created_at: 'desc' },
    });
  }

  // ─── Admin: Lấy thông báo phản hồi nhận được (targeted cho admin) ──────────
  async findForAdmin(adminId: number) {
    return this.prisma.notification.findMany({
      where: { target_role: 'admin' },
      select: notificationSelect,
      orderBy: { created_at: 'desc' },
    });
  }

  // ─── Parent: Lấy thông báo dành cho phụ huynh ───────────────────────────────────
  // 1) broadcast: target_role IS NULL
  // 2) gửi cho tất cả phụ huynh: target_role='parent', target_id IS NULL
  // 3) targeted riêng: target_role='parent', target_id=parentId
  async findForParent(parentId?: number) {
    return this.prisma.notification.findMany({
      where: {
        OR: [
          { target_role: null },
          { target_role: 'parent', target_id: null },
          ...(parentId ? [{ target_role: 'parent', target_id: parentId }] : []),
        ],
      },
      select: notificationSelect,
      orderBy: { created_at: 'desc' },
    });
  }

  // ─── Teacher: Lấy thông báo dành cho giáo viên ───────────────────────────────
  // 1) broadcast: target_role IS NULL
  // 2) gửi cho tất cả giáo viên: target_role='teacher', target_id IS NULL
  // 3) targeted riêng: target_role='teacher', target_id=teacherId
  async findForTeacher(teacherId?: number) {
    return this.prisma.notification.findMany({
      where: {
        OR: [
          { target_role: null },
          { target_role: 'teacher', target_id: null },
          ...(teacherId ? [{ target_role: 'teacher', target_id: teacherId }] : []),
        ],
      },
      select: notificationSelect,
      orderBy: { created_at: 'desc' },
    });
  }

  // ─── Admin/Parent: Lấy chi tiết thông báo ────────────────────────────────
  async findOne(id: number) {
    const notification = await this.prisma.notification.findUnique({
      where: { notification_id: id },
      select: notificationSelect,
    });

    if (!notification) {
      throw new NotFoundException('Không tìm thấy thông báo');
    }

    return notification;
  }

  // ─── Admin: Cập nhật thông báo ────────────────────────────────────────────
  async update(id: number, dto: UpdateNotificationDto) {
    await this.findOne(id);

    return this.prisma.notification.update({
      where: { notification_id: id },
      data: dto,
      select: notificationSelect,
    });
  }

  // ─── Admin: Xóa thông báo ─────────────────────────────────────────────────
  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.notification.delete({
      where: { notification_id: id },
      select: notificationSelect,
    });
  }
}
