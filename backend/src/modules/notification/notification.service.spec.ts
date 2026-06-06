import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { PrismaService } from '../../prisma/prisma.service';
import {
  createPrismaMock,
  PrismaMock,
} from '../../common/testing/prisma-mock.helper';
import { createMockNotification } from '../../common/testing/test-data.factory';

describe('NotificationService', () => {
  let service: NotificationService;
  let prismaMock: PrismaMock;

  const mockNotification = createMockNotification();

  beforeEach(async () => {
    prismaMock = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    prismaMock.userPreference.findMany.mockResolvedValue([]);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    it('should create broadcast notification (no target)', async () => {
      prismaMock.notification.create.mockResolvedValue(mockNotification);
      const result = await service.create(1, {
        title: 'Thông báo chung',
        content: 'Nội dung',
        target_role: null,
      });
      expect(result.notification_id).toBe(1);
    });

    it('should create targeted notification for parents', async () => {
      const targeted = createMockNotification({
        target_role: 'parent',
        target_id: 100,
      });
      prismaMock.notification.create.mockResolvedValue(targeted);
      const result = await service.create(1, {
        title: 'Thông báo phụ huynh',
        content: 'Nội dung',
        target_role: 'parent',
      });
      expect(result.target_role).toBe('parent');
    });
  });

  describe('findAll()', () => {
    it('should return all non-admin notifications', async () => {
      prismaMock.notification.findMany.mockResolvedValue([mockNotification]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect(prismaMock.notification.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('findForParent()', () => {
    it('should return broadcast and parent-targeted notifications with parentId', async () => {
      const notifications = [
        mockNotification,
        createMockNotification({ target_role: 'parent', target_id: 100 }),
      ];
      prismaMock.notification.findMany.mockResolvedValue(notifications);
      const result = await service.findForParent(100);
      expect(result).toHaveLength(2);
      expect(prismaMock.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ OR: expect.any(Array) }),
        }),
      );
    });

    it('should return broadcast and all-parent notifications without parentId', async () => {
      prismaMock.notification.findMany.mockResolvedValue([mockNotification]);
      const result = await service.findForParent();
      expect(result).toBeDefined();
    });

    it('should hide parent feedback notifications when disabled', async () => {
      prismaMock.notification.findMany.mockResolvedValue([
        createMockNotification({
          title: 'Nhà trường đã phản hồi',
          target_role: 'parent',
          target_id: 100,
          feedback_id: 1,
        }),
        createMockNotification({
          notification_id: 2,
          title: 'Thông báo chung',
          target_role: null,
        }),
      ]);
      prismaMock.userPreference.findMany.mockResolvedValue([
        { key: 'notif_feedback_reply', value: 'false' },
      ]);

      const result = await service.findForParent(100);

      expect(result).toHaveLength(1);
      expect(result[0].notification_id).toBe(2);
    });
  });

  describe('findForTeacher()', () => {
    it('should return teacher-targeted and broadcast notifications', async () => {
      prismaMock.notification.findMany.mockResolvedValue([mockNotification]);
      const result = await service.findForTeacher(10);
      expect(result).toBeDefined();
    });

    it('should hide teacher score reminders when disabled', async () => {
      prismaMock.notification.findMany.mockResolvedValue([
        createMockNotification({
          title: 'Nhắc nhở nhập điểm',
          target_role: 'teacher',
          target_id: 10,
        }),
        createMockNotification({
          notification_id: 2,
          title: 'Thông báo hệ thống',
          target_role: 'teacher',
          target_id: 10,
        }),
      ]);
      prismaMock.userPreference.findMany.mockResolvedValue([
        { key: 'notif_score_reminder', value: 'false' },
      ]);

      const result = await service.findForTeacher(10);

      expect(result).toHaveLength(1);
      expect(result[0].notification_id).toBe(2);
    });
  });

  describe('findForAdmin()', () => {
    it('should return admin-targeted notifications', async () => {
      const adminNotif = createMockNotification({ target_role: 'admin' });
      prismaMock.notification.findMany.mockResolvedValue([adminNotif]);
      const result = await service.findForAdmin(1);
      expect(result[0].target_role).toBe('admin');
    });

    it('should hide admin feedback notifications when disabled', async () => {
      prismaMock.notification.findMany.mockResolvedValue([
        createMockNotification({
          target_role: 'admin',
          target_id: 1,
          feedback_id: 1,
        }),
        createMockNotification({
          notification_id: 2,
          title: 'Thông báo hệ thống',
          target_role: 'admin',
          target_id: 1,
        }),
      ]);
      prismaMock.userPreference.findMany.mockResolvedValue([
        { key: 'notif_new_feedback', value: 'false' },
      ]);

      const result = await service.findForAdmin(1);

      expect(result).toHaveLength(1);
      expect(result[0].notification_id).toBe(2);
    });
  });

  describe('findOne()', () => {
    it('should return notification by id', async () => {
      prismaMock.notification.findUnique.mockResolvedValue(mockNotification);
      const result = await service.findOne(1);
      expect(result.notification_id).toBe(1);
    });

    it('should throw NotFoundException when not found', async () => {
      prismaMock.notification.findUnique.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update()', () => {
    it('should update notification successfully', async () => {
      prismaMock.notification.findUnique.mockResolvedValue(mockNotification);
      const updated = createMockNotification({ title: 'Updated Title' });
      prismaMock.notification.update.mockResolvedValue(updated);

      const result = await service.update(1, { title: 'Updated Title' });
      expect(result.title).toBe('Updated Title');
    });

    it('should throw NotFoundException when notification not found', async () => {
      prismaMock.notification.findUnique.mockResolvedValue(null);
      await expect(service.update(999, { title: 'X' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove()', () => {
    it('should delete notification successfully', async () => {
      prismaMock.notification.findUnique.mockResolvedValue(mockNotification);
      prismaMock.notification.delete.mockResolvedValue(mockNotification);
      const result = await service.remove(1);
      expect(result.notification_id).toBe(1);
    });

    it('should throw NotFoundException when notification not found', async () => {
      prismaMock.notification.findUnique.mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
