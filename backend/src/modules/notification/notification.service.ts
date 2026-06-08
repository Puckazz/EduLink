import { Injectable, NotFoundException } from '@nestjs/common';
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

type NotificationRecord = Prisma.NotificationGetPayload<{
  select: typeof notificationSelect;
}>;

const notificationPreferenceKeys = {
  admin: [
    'notif_new_feedback',
    'notif_score_published',
    'notif_attendance_alert',
    'notif_system',
  ],
  parent: [
    'notif_score_new',
    'notif_attendance_absent',
    'notif_feedback_reply',
    'notif_system',
  ],
  teacher: [
    'notif_attendance_reminder',
    'notif_score_reminder',
    'notif_system',
  ],
} as const;

type NotificationRole = keyof typeof notificationPreferenceKeys;

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

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

  async findAll() {
    return this.prisma.notification.findMany({
      where: {
        OR: [
          { target_role: null },
          { target_role: 'parent' },
          { target_role: 'teacher' },
        ],
      },
      select: notificationSelect,
      orderBy: { created_at: 'desc' },
    });
  }

  async findForAdmin(adminId: number) {
    return this.findForRole(
      'admin',
      adminId,
      {
        OR: [
          { target_role: 'admin', target_id: null },
          { target_role: 'admin', target_id: adminId },
        ],
      },
    );
  }

  async findForParent(parentId?: number, limit?: number) {
    return this.findForRole(
      'parent',
      parentId,
      {
        OR: [
          { target_role: null },
          { target_role: 'parent', target_id: null },
          ...(parentId ? [{ target_role: 'parent', target_id: parentId }] : []),
        ],
      },
      limit,
    );
  }

  async findForTeacher(teacherId?: number, limit?: number) {
    return this.findForRole(
      'teacher',
      teacherId,
      {
        OR: [
          { target_role: null },
          { target_role: 'teacher', target_id: null },
          ...(teacherId
            ? [{ target_role: 'teacher', target_id: teacherId }]
            : []),
        ],
      },
      limit,
    );
  }

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

  async update(id: number, dto: UpdateNotificationDto) {
    await this.findOne(id);

    return this.prisma.notification.update({
      where: { notification_id: id },
      data: dto,
      select: notificationSelect,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.notification.delete({
      where: { notification_id: id },
      select: notificationSelect,
    });
  }

  private async findForRole(
    role: NotificationRole,
    userId: number | undefined,
    where: Prisma.NotificationWhereInput,
    limit?: number,
  ) {
    if (!userId) {
      return this.prisma.notification.findMany({
        where,
        select: notificationSelect,
        orderBy: { created_at: 'desc' },
        ...(limit ? { take: limit } : {}),
      });
    }

    const prefMap = await this.getPreferenceMap(role, userId);
    const hasDisabledPreference = [...prefMap.values()].some(
      (value) => value === 'false',
    );

    const notifications = await this.prisma.notification.findMany({
      where,
      select: notificationSelect,
      orderBy: { created_at: 'desc' },
      ...(limit && !hasDisabledPreference ? { take: limit } : {}),
    });

    if (!hasDisabledPreference) {
      return limit ? notifications.slice(0, limit) : notifications;
    }

    const filtered = notifications.filter((notification) => {
      const key = this.resolvePreferenceKey(role, notification);
      return prefMap.get(key) !== 'false';
    });

    return limit ? filtered.slice(0, limit) : filtered;
  }

  private async getPreferenceMap(role: NotificationRole, userId: number) {
    const prefs = await this.prisma.userPreference.findMany({
      where: {
        role,
        user_id: userId,
        key: { in: [...notificationPreferenceKeys[role]] },
      },
      select: { key: true, value: true },
    });

    return new Map(prefs.map((pref) => [pref.key, pref.value]));
  }

  private resolvePreferenceKey(
    role: NotificationRole,
    notification: NotificationRecord,
  ) {
    const text = `${notification.title} ${notification.content}`.toLowerCase();

    if (role === 'admin') {
      if (notification.feedback_id || text.includes('phản hồi')) {
        return 'notif_new_feedback';
      }
      if (this.includesAny(text, ['điểm', 'score'])) {
        return 'notif_score_published';
      }
      if (this.includesAny(text, ['vắng', 'điểm danh', 'chuyên cần'])) {
        return 'notif_attendance_alert';
      }
      return 'notif_system';
    }

    if (role === 'parent') {
      if (notification.feedback_id || text.includes('phản hồi')) {
        return 'notif_feedback_reply';
      }
      if (this.includesAny(text, ['điểm', 'score'])) {
        return 'notif_score_new';
      }
      if (this.includesAny(text, ['vắng', 'điểm danh', 'chuyên cần'])) {
        return 'notif_attendance_absent';
      }
      return 'notif_system';
    }

    if (this.includesAny(text, ['vắng', 'điểm danh', 'chuyên cần'])) {
      return 'notif_attendance_reminder';
    }
    if (this.includesAny(text, ['điểm', 'score', 'nhập điểm'])) {
      return 'notif_score_reminder';
    }
    return 'notif_system';
  }

  private includesAny(text: string, keywords: string[]) {
    return keywords.some((keyword) => text.includes(keyword));
  }
}
