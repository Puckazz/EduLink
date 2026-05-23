import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

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
  constructor(private readonly prisma: PrismaService) {}

  async updateProfile(userId: number, role: string, dto: UpdateProfileDto) {
    if (role === 'admin') {
      const admin = await this.prisma.admin
        .update({
          where: { admin_id: userId },
          data: {
            ...(dto.full_name !== undefined && { full_name: dto.full_name }),
            ...(dto.email !== undefined && { email: dto.email }),
          },
          select: AVATAR_SELECT,
        })
        .catch(() => {
          throw new BadRequestException(
            'Email đã được sử dụng bởi tài khoản khác.',
          );
        });
      return { ...admin, role: 'admin' };
    }

    if (role === 'teacher') {
      const teacher = await this.prisma.teacher
        .update({
          where: { teacher_id: userId },
          data: {
            ...(dto.full_name !== undefined && { full_name: dto.full_name }),
            ...(dto.email !== undefined && { email: dto.email }),
            ...(dto.phone !== undefined && { phone: dto.phone }),
          },
          select: TEACHER_SELECT,
        })
        .catch(() => {
          throw new BadRequestException(
            'Email hoặc số điện thoại đã được sử dụng.',
          );
        });
      return { ...teacher, role: 'teacher' };
    }

    if (role === 'parent') {
      const parent = await this.prisma.parent
        .update({
          where: { parent_id: userId },
          data: {
            ...(dto.full_name !== undefined && { full_name: dto.full_name }),
            ...(dto.email !== undefined && { email: dto.email }),
            ...(dto.phone !== undefined && { phone: dto.phone }),
          },
          select: PARENT_SELECT,
        })
        .catch(() => {
          throw new BadRequestException(
            'Email hoặc số điện thoại đã được sử dụng.',
          );
        });
      return { ...parent, role: 'parent' };
    }

    throw new BadRequestException('Role không hợp lệ.');
  }

  async updateAvatar(userId: number, role: string, avatarUrl: string) {
    if (role === 'admin') {
      const admin = await this.prisma.admin.update({
        where: { admin_id: userId },
        data: { avatar_url: avatarUrl },
        select: AVATAR_SELECT,
      });
      return { ...admin, role: 'admin' };
    }

    if (role === 'teacher') {
      const teacher = await this.prisma.teacher.update({
        where: { teacher_id: userId },
        data: { avatar_url: avatarUrl },
        select: TEACHER_SELECT,
      });
      return { ...teacher, role: 'teacher' };
    }

    if (role === 'parent') {
      const parent = await this.prisma.parent.update({
        where: { parent_id: userId },
        data: { avatar_url: avatarUrl },
        select: PARENT_SELECT,
      });
      return { ...parent, role: 'parent' };
    }

    throw new BadRequestException('Role không hợp lệ.');
  }
}
