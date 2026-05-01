import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { RequestOtpDto, VerifyOtpDto } from './dto/create-auth.dto';
import { SetPasswordDto, ChangePasswordDto } from './dto/change-password.dto';
import {
  RequestForgotPasswordOtpDto,
  ResetForgotPasswordDto,
} from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';

type AuthRole = 'admin' | 'parent' | 'teacher';

interface AuthPayload {
  sub: number;
  username?: string;
  phone?: string;
  role: AuthRole;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private readonly otpExpiryMs = 5 * 60 * 1000;
  private readonly accessTokenFallbackExpiry = '15m';
  private readonly refreshTokenFallbackExpiry = '7d';

  // ──────────────────────────────────────────────
  // 1) POST /auth/request-otp
  // ──────────────────────────────────────────────
  async requestOtp(dto: RequestOtpDto) {
    const { phone, student_code } = dto;

    // Validate: student exists
    const student = await this.prisma.student.findFirst({
      where: {
        student_code,
        deleted_at: null,
      },
      include: {
        parents: {
          include: {
            parent: true,
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException('Không tìm thấy học sinh với mã này');
    }

    if (!student.parents || student.parents.length === 0) {
      throw new BadRequestException(
        'Học sinh chưa được liên kết với phụ huynh',
      );
    }

    const matchedParent = student.parents
      .map((p) => p.parent)
      .find((p) => p.phone === phone);

    if (!matchedParent) {
      throw new BadRequestException(
        'Số điện thoại không khớp với bất kỳ phụ huynh nào của học sinh',
      );
    }

    if (matchedParent.is_active || !!matchedParent.password) {
      throw new BadRequestException(
        'Tài khoản của phụ huynh này đã được kích hoạt',
      );
    }

    await this.issueOtp(phone, 'OTP sent');

    return {
      message: 'Mã OTP đã được gửi đến số điện thoại của bạn',
      phone,
    };
  }

  // ──────────────────────────────────────────────
  // 1.1) POST /auth/forgot-password/request-otp
  // ──────────────────────────────────────────────
  async requestForgotPasswordOtp(dto: RequestForgotPasswordOtpDto) {
    const { phone } = dto;

    const parent = await this.findParentByPhoneOrThrow(phone);

    if (!parent.is_active || !parent.password) {
      throw new BadRequestException(
        'Tài khoản chưa sẵn sàng để quên mật khẩu. Vui lòng kích hoạt tài khoản trước',
      );
    }

    await this.issueOtp(phone, 'Forgot-password OTP sent');

    return {
      message: 'Mã OTP đặt lại mật khẩu đã được gửi đến số điện thoại của bạn',
      phone,
    };
  }

  // ──────────────────────────────────────────────
  // 2) POST /auth/verify-otp
  // ──────────────────────────────────────────────
  async verifyOtp(dto: VerifyOtpDto) {
    const { phone, otp } = dto;

    const otpRecord = await this.getLatestUnusedOtpOrThrow(phone);
    this.assertOtpNotExpired(otpRecord.expires_at);
    this.assertOtpCodeMatch(otpRecord.otp_code, otp, 'Mã OTP không đúng');
    await this.markOtpUsed(otpRecord.id);

    return {
      message: 'Xác thực OTP thành công. Vui lòng đặt mật khẩu',
      phone,
    };
  }

  // ──────────────────────────────────────────────
  // 3) POST /auth/set-password
  // ──────────────────────────────────────────────
  async setPassword(dto: SetPasswordDto) {
    const { phone, password } = dto;

    await this.findParentByPhoneOrThrow(phone);

    // Verify that OTP was verified (check for a used OTP record)
    const verifiedOtp = await this.prisma.otp.findFirst({
      where: { phone, is_used: true },
      orderBy: { created_at: 'desc' },
    });

    if (!verifiedOtp) {
      throw new BadRequestException(
        'Vui lòng xác thực OTP trước khi đặt mật khẩu',
      );
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password);
    await this.updateParentPassword(phone, hashedPassword, true);

    return {
      message: 'Đặt mật khẩu thành công. Tài khoản đã được kích hoạt',
      phone,
    };
  }

  // ──────────────────────────────────────────────
  // 3.1) POST /auth/forgot-password/reset
  // ──────────────────────────────────────────────
  async resetForgotPassword(dto: ResetForgotPasswordDto) {
    const { phone, otp, newPassword } = dto;

    const parent = await this.findParentByPhoneOrThrow(phone);

    if (!parent.is_active || !parent.password) {
      throw new BadRequestException(
        'Tài khoản chưa sẵn sàng để đặt lại mật khẩu',
      );
    }

    const otpRecord = await this.getLatestUnusedOtpOrThrow(
      phone,
      'Mã OTP không hợp lệ',
    );
    this.assertOtpCodeMatch(otpRecord.otp_code, otp, 'Mã OTP không hợp lệ');
    this.assertOtpNotExpired(otpRecord.expires_at);

    const hashedPassword = await this.hashPassword(newPassword);

    await this.prisma.$transaction([
      this.prisma.otp.update({
        where: { id: otpRecord.id },
        data: { is_used: true },
      }),
      this.prisma.parent.update({
        where: { phone },
        data: { password: hashedPassword },
      }),
    ]);

    return {
      message: 'Đặt lại mật khẩu thành công',
      phone,
    };
  }

  // ──────────────────────────────────────────────
  // 4) POST /auth/login
  // ──────────────────────────────────────────────
  async login(dto: LoginDto) {
    const { identifier, password } = dto;

    // --- Try Admin login first (by username) ---
    const admin = await this.prisma.admin.findUnique({
      where: { username: identifier },
    });

    if (admin) {
      const isPasswordValid = await bcrypt.compare(password, admin.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Tài khoản hoặc mật khẩu không đúng');
      }

      const payload = {
        sub: admin.admin_id,
        username: admin.username,
        role: 'admin' as const,
      };

      const tokens = await this.generateTokens(payload);
      await this.updateUserRefreshTokenHash(
        admin.admin_id,
        'admin',
        tokens.refreshToken,
      );

      return {
        message: 'Đăng nhập thành công',
        ...tokens,
        user: {
          id: admin.admin_id,
          fullName: admin.full_name,
          email: admin.email,
          role: 'admin',
        },
      };
    }

    // --- Try Teacher login (by username) ---
    const teacher = await this.prisma.teacher.findUnique({
      where: { username: identifier },
    });

    if (teacher) {
      if (!teacher.password) {
        throw new UnauthorizedException('Tài khoản chưa đặt mật khẩu.');
      }
      const isPasswordValid = await bcrypt.compare(password, teacher.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Tài khoản hoặc mật khẩu không đúng');
      }

      const payload = {
        sub: teacher.teacher_id,
        username: teacher.username,
        role: 'teacher' as const,
      };

      const tokens = await this.generateTokens(payload);
      await this.updateUserRefreshTokenHash(
        teacher.teacher_id,
        'teacher',
        tokens.refreshToken,
      );

      return {
        message: 'Đăng nhập thành công',
        ...tokens,
        user: {
          id: teacher.teacher_id,
          fullName: teacher.full_name,
          email: teacher.email,
          role: 'teacher',
        },
      };
    }

    // --- Try Parent login (by phone) ---
    const parent = await this.prisma.parent.findUnique({
      where: { phone: identifier },
    });

    if (!parent) {
      throw new UnauthorizedException('Tài khoản hoặc mật khẩu không đúng');
    }

    if (!parent.is_active) {
      throw new UnauthorizedException(
        'Tài khoản chưa được kích hoạt. Vui lòng xác thực OTP và đặt mật khẩu',
      );
    }

    if (!parent.password) {
      throw new UnauthorizedException(
        'Tài khoản chưa đặt mật khẩu. Vui lòng hoàn tất quy trình kích hoạt',
      );
    }

    const isPasswordValid = await bcrypt.compare(password, parent.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Tài khoản hoặc mật khẩu không đúng');
    }

    const payload = {
      sub: parent.parent_id,
      phone: parent.phone,
      role: 'parent' as const,
    };

    const tokens = await this.generateTokens(payload);
    await this.updateUserRefreshTokenHash(
      parent.parent_id,
      'parent',
      tokens.refreshToken,
    );

    return {
      message: 'Đăng nhập thành công',
      ...tokens,
      user: {
        id: parent.parent_id,
        fullName: parent.full_name,
        phone: parent.phone,
        email: parent.email,
        role: 'parent',
      },
    };
  }

  // ──────────────────────────────────────────────
  // 4.1) POST /auth/refresh
  // ──────────────────────────────────────────────
  async refresh(refreshToken?: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Không tìm thấy refresh token');
    }

    let payload: AuthPayload;
    try {
      payload = this.jwtService.verify<AuthPayload>(refreshToken, {
        secret: this.getRefreshTokenSecret(),
      });
    } catch {
      throw new UnauthorizedException(
        'Refresh token không hợp lệ hoặc đã hết hạn',
      );
    }

    if (payload.role === 'admin') {
      const user = await this.prisma.admin.findUnique({
        where: { admin_id: payload.sub },
        select: {
          admin_id: true,
          username: true,
          full_name: true,
          email: true,
          refresh_token_hash: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('Không tìm thấy tài khoản');
      }

      if (!user.refresh_token_hash) {
        throw new UnauthorizedException('Phiên đăng nhập không hợp lệ');
      }

      const isRefreshTokenValid = await bcrypt.compare(
        refreshToken,
        user.refresh_token_hash,
      );
      if (!isRefreshTokenValid) {
        throw new UnauthorizedException('Refresh token không hợp lệ');
      }

      const accessToken = await this.jwtService.signAsync(
        {
          sub: user.admin_id,
          username: user.username,
          role: 'admin',
        },
        {
          secret: this.getAccessTokenSecret(),
          expiresIn: this.getAccessTokenExpiresIn() as any,
        },
      );

      return {
        message: 'Làm mới phiên đăng nhập thành công',
        accessToken,
        refreshToken,
        user: {
          id: user.admin_id,
          fullName: user.full_name,
          email: user.email,
          role: 'admin',
        },
      };
    }

    if (payload.role === 'teacher') {
      const user = await this.prisma.teacher.findUnique({
        where: { teacher_id: payload.sub },
        select: {
          teacher_id: true,
          username: true,
          full_name: true,
          email: true,
          refresh_token_hash: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('Không tìm thấy tài khoản');
      }

      if (!user.refresh_token_hash) {
        throw new UnauthorizedException('Phiên đăng nhập không hợp lệ');
      }

      const isRefreshTokenValid = await bcrypt.compare(
        refreshToken,
        user.refresh_token_hash,
      );
      if (!isRefreshTokenValid) {
        throw new UnauthorizedException('Refresh token không hợp lệ');
      }

      const accessToken = await this.jwtService.signAsync(
        {
          sub: user.teacher_id,
          username: user.username,
          role: 'teacher',
        },
        {
          secret: this.getAccessTokenSecret(),
          expiresIn: this.getAccessTokenExpiresIn() as any,
        },
      );

      return {
        message: 'Làm mới phiên đăng nhập thành công',
        accessToken,
        refreshToken,
        user: {
          id: user.teacher_id,
          fullName: user.full_name,
          email: user.email,
          role: 'teacher',
        },
      };
    }

    const user = await this.prisma.parent.findUnique({
      where: { parent_id: payload.sub },
      select: {
        parent_id: true,
        phone: true,
        full_name: true,
        email: true,
        refresh_token_hash: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Không tìm thấy tài khoản');
    }

    if (!user.refresh_token_hash) {
      throw new UnauthorizedException('Phiên đăng nhập không hợp lệ');
    }

    const isRefreshTokenValid = await bcrypt.compare(
      refreshToken,
      user.refresh_token_hash,
    );
    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }

    const accessToken = await this.jwtService.signAsync(
      {
        sub: user.parent_id,
        phone: user.phone,
        role: 'parent',
      },
      {
        secret: this.getAccessTokenSecret(),
        expiresIn: this.getAccessTokenExpiresIn() as any,
      },
    );

    return {
      message: 'Làm mới phiên đăng nhập thành công',
      accessToken,
      refreshToken,
      user: {
        id: user.parent_id,
        fullName: user.full_name,
        phone: user.phone,
        email: user.email,
        role: 'parent',
      },
    };
  }

  // ──────────────────────────────────────────────
  // 5) GET /auth/profile (Protected)
  // ──────────────────────────────────────────────
  async getProfile(currentUser: { userId: number; role: string }) {
    const { userId, role } = currentUser;

    if (role === 'admin') {
      const admin = await this.prisma.admin.findUnique({
        where: { admin_id: userId },
        select: {
          admin_id: true,
          username: true,
          full_name: true,
          email: true,
          created_at: true,
        },
      });

      if (!admin) {
        throw new UnauthorizedException('Không tìm thấy tài khoản');
      }

      return { ...admin, role: 'admin' };
    }

    if (role === 'teacher') {
      const teacher = await this.prisma.teacher.findUnique({
        where: { teacher_id: userId },
        select: {
          teacher_id: true,
          username: true,
          full_name: true,
          email: true,
          created_at: true,
        },
      });

      if (!teacher) {
        throw new UnauthorizedException('Không tìm thấy tài khoản');
      }

      return { ...teacher, role: 'teacher' };
    }

    const parent = await this.prisma.parent.findUnique({
      where: { parent_id: userId },
      select: {
        parent_id: true,
        full_name: true,
        phone: true,
        email: true,
        is_active: true,
        created_at: true,
        students: {
          select: {
            student: {
              select: {
                student_id: true,
                student_code: true,
                full_name: true,
                class: true,
                study_year: true,
                major: {
                  select: {
                    major_name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!parent) {
      throw new UnauthorizedException('Không tìm thấy tài khoản');
    }

    return {
      ...parent,
      students: parent.students.map((s) => s.student),
      role: 'parent',
    };
  }

  // ──────────────────────────────────────────────
  // 6) PUT /auth/change-password (Protected)
  // ──────────────────────────────────────────────
  async changePassword(
    currentUser: { userId: number; role: string },
    dto: ChangePasswordDto,
  ) {
    const { userId, role } = currentUser;
    const { oldPassword, newPassword } = dto;

    const user = await this.findUserForPasswordChange(userId, role);

    if (!user) {
      throw new UnauthorizedException('Không tìm thấy tài khoản');
    }

    const isOldPasswordValid = await this.verifyPassword(
      oldPassword,
      user.password,
    );
    if (!isOldPasswordValid) {
      throw new BadRequestException('Mật khẩu cũ không đúng');
    }

    const hashedNewPassword = await this.hashPassword(newPassword);

    if (role === 'admin') {
      await this.prisma.admin.update({
        where: { admin_id: userId },
        data: { password: hashedNewPassword },
      });
    } else if (role === 'teacher') {
      await this.prisma.teacher.update({
        where: { teacher_id: userId },
        data: { password: hashedNewPassword },
      });
    } else {
      await this.prisma.parent.update({
        where: { parent_id: userId },
        data: { password: hashedNewPassword },
      });
    }

    return { message: 'Đổi mật khẩu thành công' };
  }

  // ──────────────────────────────────────────────
  // 7) POST /auth/logout
  // ──────────────────────────────────────────────
  async logout(currentUser: { userId: number; role: AuthRole }) {
    const { userId, role } = currentUser;

    if (role === 'admin') {
      await this.prisma.admin.update({
        where: { admin_id: userId },
        data: { refresh_token_hash: null },
      });
    } else if (role === 'teacher') {
      await this.prisma.teacher.update({
        where: { teacher_id: userId },
        data: { refresh_token_hash: null },
      });
    } else {
      await this.prisma.parent.update({
        where: { parent_id: userId },
        data: { refresh_token_hash: null },
      });
    }

    return { message: 'Đăng xuất thành công' };
  }

  getAccessTokenMaxAgeMs() {
    return this.parseDurationToMs(
      this.getAccessTokenExpiresIn(),
      15 * 60 * 1000,
    );
  }

  getRefreshTokenMaxAgeMs() {
    return this.parseDurationToMs(
      this.getRefreshTokenExpiresIn(),
      7 * 24 * 60 * 60 * 1000,
    );
  }

  private async findParentByPhoneOrThrow(phone: string) {
    const parent = await this.prisma.parent.findUnique({ where: { phone } });

    if (!parent) {
      throw new NotFoundException(
        'Không tìm thấy phụ huynh với số điện thoại này',
      );
    }

    return parent;
  }

  private async clearUnusedOtp(phone: string) {
    await this.prisma.otp.deleteMany({
      where: { phone, is_used: false },
    });
  }

  private generateOtpCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private getOtpExpiresAt() {
    return new Date(Date.now() + this.otpExpiryMs);
  }

  private logOtp(
    phone: string,
    otpCode: string,
    expiresAt: Date,
    label: string,
  ) {
    console.log(`\n========================================`);
    console.log(`📱 ${label} to ${phone}: ${otpCode}`);
    console.log(`⏰ Expires at: ${expiresAt.toLocaleString()}`);
    console.log(`========================================\n`);
  }

  private async issueOtp(phone: string, label: string) {
    await this.clearUnusedOtp(phone);

    const otpCode = this.generateOtpCode();
    const expiresAt = this.getOtpExpiresAt();

    await this.prisma.otp.create({
      data: {
        phone,
        otp_code: otpCode,
        expires_at: expiresAt,
      },
    });

    this.logOtp(phone, otpCode, expiresAt, label);
  }

  private async getLatestUnusedOtpOrThrow(
    phone: string,
    notFoundMessage = 'Không tìm thấy mã OTP. Vui lòng yêu cầu mã mới',
  ) {
    const otpRecord = await this.prisma.otp.findFirst({
      where: { phone, is_used: false },
      orderBy: { created_at: 'desc' },
    });

    if (!otpRecord) {
      throw new BadRequestException(notFoundMessage);
    }

    return otpRecord;
  }

  private assertOtpNotExpired(expiresAt: Date) {
    if (new Date() > expiresAt) {
      throw new BadRequestException(
        'Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới',
      );
    }
  }

  private assertOtpCodeMatch(
    actualOtp: string,
    inputOtp: string,
    mismatchMessage: string,
  ) {
    if (actualOtp !== inputOtp) {
      throw new BadRequestException(mismatchMessage);
    }
  }

  private async markOtpUsed(otpId: number) {
    await this.prisma.otp.update({
      where: { id: otpId },
      data: { is_used: true },
    });
  }

  private async hashPassword(plainPassword: string) {
    return bcrypt.hash(plainPassword, 10);
  }

  private async verifyPassword(plainPassword: string, hashedPassword: string) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  private async updateParentPassword(
    phone: string,
    hashedPassword: string,
    shouldActivate: boolean,
  ) {
    await this.prisma.parent.update({
      where: { phone },
      data: {
        password: hashedPassword,
        ...(shouldActivate ? { is_active: true } : {}),
      },
    });
  }

  private async findUserForPasswordChange(userId: number, role: string) {
    if (role === 'admin') {
      return this.prisma.admin.findUnique({
        where: { admin_id: userId },
      });
    }

    if (role === 'teacher') {
      return this.prisma.teacher.findUnique({
        where: { teacher_id: userId },
      });
    }

    return this.prisma.parent.findUnique({
      where: { parent_id: userId },
    });
  }

  private getAccessTokenSecret() {
    return this.configService.get<string>('JWT_SECRET');
  }

  private getRefreshTokenSecret() {
    return this.configService.get<string>(
      'JWT_REFRESH_SECRET',
      this.getAccessTokenSecret(),
    );
  }

  private getAccessTokenExpiresIn() {
    return this.configService.get<string>(
      'JWT_EXPIRATION',
      this.accessTokenFallbackExpiry,
    );
  }

  private getRefreshTokenExpiresIn() {
    return this.configService.get<string>(
      'JWT_REFRESH_EXPIRATION',
      this.refreshTokenFallbackExpiry,
    );
  }

  private async generateTokens(payload: AuthPayload): Promise<AuthTokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.getAccessTokenSecret(),
        expiresIn: this.getAccessTokenExpiresIn() as any,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.getRefreshTokenSecret(),
        expiresIn: this.getRefreshTokenExpiresIn() as any,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async updateUserRefreshTokenHash(
    userId: number,
    role: AuthRole,
    refreshToken: string,
  ) {
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    if (role === 'admin') {
      await this.prisma.admin.update({
        where: { admin_id: userId },
        data: { refresh_token_hash: refreshTokenHash },
      });
      return;
    }

    if (role === 'teacher') {
      await this.prisma.teacher.update({
        where: { teacher_id: userId },
        data: { refresh_token_hash: refreshTokenHash },
      });
      return;
    }

    await this.prisma.parent.update({
      where: { parent_id: userId },
      data: { refresh_token_hash: refreshTokenHash },
    });
  }

  private parseDurationToMs(value: string | number, fallbackMs: number) {
    if (typeof value === 'number') {
      return value > 0 ? value * 1000 : fallbackMs;
    }

    const normalized = value?.trim();
    const match = normalized.match(/^(\d+)(ms|s|m|h|d)$/i);

    if (!match) {
      return fallbackMs;
    }

    const amount = Number(match[1]);
    const unit = match[2].toLowerCase();

    if (unit === 'ms') return amount;
    if (unit === 's') return amount * 1000;
    if (unit === 'm') return amount * 60 * 1000;
    if (unit === 'h') return amount * 60 * 60 * 1000;
    return amount * 24 * 60 * 60 * 1000;
  }
}
