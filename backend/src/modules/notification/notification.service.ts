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
      },
      select: notificationSelect,
    });
  }

  // ─── Admin: Lấy tất cả thông báo ─────────────────────────────────────────
  async findAll() {
    return this.prisma.notification.findMany({
      select: notificationSelect,
      orderBy: { created_at: 'desc' },
    });
  }

  // ─── Parent: Lấy thông báo dành cho phụ huynh ────────────────────────────
  // Notification model hiện chưa có trường parent_id (broadcast), nên trả về tất cả.
  // Khi sau này thêm targeting, chỉ cần thêm where clause ở đây.
  async findForParent() {
    return this.prisma.notification.findMany({
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
