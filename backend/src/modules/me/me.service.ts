import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UploadService } from '../../common/upload/upload.service';

const AVATAR_SELECT = {
  admin_id: true,
  username: true,
  full_name: true,
  email: true,
  avatar_url: true,
  created_at: true,
};

const TEACHER_SELECT = {
  teacher_id: true,
  username: true,
  full_name: true,
  email: true,
  phone: true,
  avatar_url: true,
  created_at: true,
};

const PARENT_SELECT = {
  parent_id: true,
  username: true,
  full_name: true,
  email: true,
  phone: true,
  avatar_url: true,
  created_at: true,
};

@Injectable()
export class MeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
  ) {}

  async updateProfile(userId: number, role: string, dto: UpdateProfileDto) {
    if (role === 'admin') {
      const current = await this.prisma.admin.findUnique({
        where: { admin_id: userId },
        select: { avatar_url: true },
      });

      const admin = await this.prisma.admin
        .update({
          where: { admin_id: userId },
          data: {
            ...(dto.full_name !== undefined && { full_name: dto.full_name }),
            ...(dto.email !== undefined && { email: dto.email }),
            ...(dto.avatar_url !== undefined && { avatar_url: dto.avatar_url }),
          },
          select: AVATAR_SELECT,
        })
        .catch(() => {
          throw new BadRequestException(
            'Email đã được sử dụng bởi tài khoản khác.',
          );
        });

      await this.deletePreviousAvatarIfChanged(
        current?.avatar_url,
        dto.avatar_url,
      );
      return { ...admin, role: 'admin' };
    }

    if (role === 'teacher') {
      const current = await this.prisma.teacher.findUnique({
        where: { teacher_id: userId },
        select: { avatar_url: true },
      });

      const teacher = await this.prisma.teacher
        .update({
          where: { teacher_id: userId },
          data: {
            ...(dto.full_name !== undefined && { full_name: dto.full_name }),
            ...(dto.email !== undefined && { email: dto.email }),
            ...(dto.phone !== undefined && { phone: dto.phone }),
            ...(dto.avatar_url !== undefined && { avatar_url: dto.avatar_url }),
          },
          select: TEACHER_SELECT,
        })
        .catch(() => {
          throw new BadRequestException(
            'Email hoặc số điện thoại đã được sử dụng.',
          );
        });

      await this.deletePreviousAvatarIfChanged(
        current?.avatar_url,
        dto.avatar_url,
      );
      return { ...teacher, role: 'teacher' };
    }

    if (role === 'parent') {
      const current = await this.prisma.parent.findUnique({
        where: { parent_id: userId },
        select: { avatar_url: true },
      });

      const parent = await this.prisma.parent
        .update({
          where: { parent_id: userId },
          data: {
            ...(dto.full_name !== undefined && { full_name: dto.full_name }),
            ...(dto.email !== undefined && { email: dto.email }),
            ...(dto.phone !== undefined && { phone: dto.phone }),
            ...(dto.avatar_url !== undefined && { avatar_url: dto.avatar_url }),
          },
          select: PARENT_SELECT,
        })
        .catch(() => {
          throw new BadRequestException(
            'Email hoặc số điện thoại đã được sử dụng.',
          );
        });

      await this.deletePreviousAvatarIfChanged(
        current?.avatar_url,
        dto.avatar_url,
      );
      return { ...parent, role: 'parent' };
    }

    throw new BadRequestException('Role không hợp lệ.');
  }

  async deleteTemporaryAvatar(publicId: string) {
    if (!publicId?.trim()) {
      throw new BadRequestException('Thiếu publicId ảnh đại diện.');
    }

    await this.uploadService.deleteFile(publicId.trim(), 'image');
    return { message: 'Đã xóa ảnh tạm.' };
  }

  private async deletePreviousAvatarIfChanged(
    previousAvatarUrl?: string | null,
    nextAvatarUrl?: string | null,
  ) {
    if (nextAvatarUrl === undefined || previousAvatarUrl === nextAvatarUrl) {
      return;
    }

    const previousPublicId =
      this.uploadService.extractPublicIdFromUrl(previousAvatarUrl);

    if (!previousPublicId) {
      return;
    }

    await this.uploadService.deleteFile(previousPublicId, 'image');
  }
}
