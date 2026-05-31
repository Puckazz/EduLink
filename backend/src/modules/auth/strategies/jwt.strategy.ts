import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../prisma/prisma.service';

export interface JwtPayload {
  sub: number;
  username?: string;
  phone?: string;
  role: 'admin' | 'parent' | 'teacher';
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (request: any) => request?.cookies?.accessToken ?? null,
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload.sub || !payload.role) {
      throw new UnauthorizedException('Token không hợp lệ');
    }

    if (payload.role === 'parent') {
      const parent = await this.prisma.parent.findUnique({
        where: { parent_id: payload.sub },
        select: { is_locked: true },
      });

      if (!parent || parent.is_locked) {
        throw new UnauthorizedException(
          'Tài khoản phụ huynh đang bị khóa. Vui lòng liên hệ quản trị viên',
        );
      }
    }

    if (payload.role === 'teacher') {
      const teacher = await this.prisma.teacher.findUnique({
        where: { teacher_id: payload.sub },
        select: { is_locked: true },
      });

      if (!teacher || teacher.is_locked) {
        throw new UnauthorizedException(
          'Tài khoản giảng viên đang bị khóa. Vui lòng liên hệ quản trị viên',
        );
      }
    }

    return {
      userId: payload.sub,
      username: payload.username,
      phone: payload.phone,
      role: payload.role,
    };
  }
}
