import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class MeService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Cập nhật hồ sơ cá nhân tùy theo role.
   * - Admin: full_name, email
   * - Teacher: full_name, email, phone
   * - Parent: full_name, email, phone
   */
  async updateProfile(
    userId: number,
    role: string,
    dto: UpdateProfileDto,
  ) {
    if (role === 'admin') {
      const admin = await this.prisma.admin.update({
        where: { admin_id: userId },
        data: {
          ...(dto.full_name !== undefined && { full_name: dto.full_name }),
          ...(dto.email !== undefined && { email: dto.email }),
        },
        select: {
          admin_id: true,
          username: true,
          full_name: true,
          email: true,
          created_at: true,
        },
      }).catch(() => {
        throw new BadRequestException('Email đã được sử dụng bởi tài khoản khác.');
      });
      return { ...admin, role: 'admin' };
    }

    if (role === 'teacher') {
      const teacher = await this.prisma.teacher.update({
        where: { teacher_id: userId },
        data: {
          ...(dto.full_name !== undefined && { full_name: dto.full_name }),
          ...(dto.email !== undefined && { email: dto.email }),
          ...(dto.phone !== undefined && { phone: dto.phone }),
        },
        select: {
          teacher_id: true,
          username: true,
          full_name: true,
          email: true,
          phone: true,
          created_at: true,
        },
      }).catch(() => {
        throw new BadRequestException('Email hoặc số điện thoại đã được sử dụng.');
      });
      return { ...teacher, role: 'teacher' };
    }

    if (role === 'parent') {
      const parent = await this.prisma.parent.update({
        where: { parent_id: userId },
        data: {
          ...(dto.full_name !== undefined && { full_name: dto.full_name }),
          ...(dto.email !== undefined && { email: dto.email }),
          ...(dto.phone !== undefined && { phone: dto.phone }),
        },
        select: {
          parent_id: true,
          username: true,
          full_name: true,
          email: true,
          phone: true,
          created_at: true,
        },
      }).catch(() => {
        throw new BadRequestException('Email hoặc số điện thoại đã được sử dụng.');
      });
      return { ...parent, role: 'parent' };
    }

    throw new BadRequestException('Role không hợp lệ.');
  }
}