import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { RequestOtpDto, VerifyOtpDto } from './dto/create-auth.dto';
import { SetPasswordDto, ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // ──────────────────────────────────────────────
  // 1) POST /auth/request-otp
  // ──────────────────────────────────────────────
  async requestOtp(dto: RequestOtpDto) {
    const { phone, student_code } = dto;

    // Validate: student exists
    const student = await this.prisma.student.findUnique({
      where: { student_code },
      include: { parent: true },
    });

    if (!student) {
      throw new NotFoundException('Không tìm thấy học sinh với mã này');
    }

    if (!student.parent) {
      throw new BadRequestException(
        'Học sinh chưa được liên kết với phụ huynh',
      );
    }

    // Validate: phone matches parent's phone
    if (student.parent.phone !== phone) {
      throw new BadRequestException(
        'Số điện thoại không khớp với phụ huynh của học sinh',
      );
    }

    // Delete old unused OTPs for this phone
    await this.prisma.otp.deleteMany({
      where: { phone, is_used: false },
    });

    // Generate random 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP — expires in 5 minutes
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await this.prisma.otp.create({
      data: {
        phone,
        otp_code: otpCode,
        expires_at: expiresAt,
      },
    });

    // Simulate SMS — log to console
    console.log(`\n========================================`);
    console.log(`📱 OTP sent to ${phone}: ${otpCode}`);
    console.log(`⏰ Expires at: ${expiresAt.toLocaleString()}`);
    console.log(`========================================\n`);

    return {
      message: 'Mã OTP đã được gửi đến số điện thoại của bạn',
      phone,
    };
  }

  // ──────────────────────────────────────────────
  // 2) POST /auth/verify-otp
  // ──────────────────────────────────────────────
  async verifyOtp(dto: VerifyOtpDto) {
    const { phone, otp } = dto;

    // Find latest unused OTP for this phone
    const otpRecord = await this.prisma.otp.findFirst({
      where: { phone, is_used: false },
      orderBy: { created_at: 'desc' },
    });

    if (!otpRecord) {
      throw new BadRequestException(
        'Không tìm thấy mã OTP. Vui lòng yêu cầu mã mới',
      );
    }

    // Check expired
    if (new Date() > otpRecord.expires_at) {
      throw new BadRequestException(
        'Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới',
      );
    }

    // Check correct code
    if (otpRecord.otp_code !== otp) {
      throw new BadRequestException('Mã OTP không đúng');
    }

    // Mark as used
    await this.prisma.otp.update({
      where: { id: otpRecord.id },
      data: { is_used: true },
    });

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

    const parent = await this.prisma.parent.findUnique({
      where: { phone },
    });

    if (!parent) {
      throw new NotFoundException(
        'Không tìm thấy phụ huynh với số điện thoại này',
      );
    }

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
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update parent: set password + activate account
    await this.prisma.parent.update({
      where: { phone },
      data: {
        password: hashedPassword,
        is_active: true,
      },
    });

    return {
      message: 'Đặt mật khẩu thành công. Tài khoản đã được kích hoạt',
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

      return {
        message: 'Đăng nhập thành công',
        accessToken: this.jwtService.sign(payload),
        user: {
          id: admin.admin_id,
          fullName: admin.full_name,
          email: admin.email,
          role: 'admin',
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

    return {
      message: 'Đăng nhập thành công',
      accessToken: this.jwtService.sign(payload),
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
            student_id: true,
            student_code: true,
            full_name: true,
            class: true,
          },
        },
      },
    });

    if (!parent) {
      throw new UnauthorizedException('Không tìm thấy tài khoản');
    }

    return { ...parent, role: 'parent' };
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

    let user: any;

    if (role === 'admin') {
      user = await this.prisma.admin.findUnique({
        where: { admin_id: userId },
      });
    } else {
      user = await this.prisma.parent.findUnique({
        where: { parent_id: userId },
      });
    }

    if (!user) {
      throw new UnauthorizedException('Không tìm thấy tài khoản');
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      throw new BadRequestException('Mật khẩu cũ không đúng');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    if (role === 'admin') {
      await this.prisma.admin.update({
        where: { admin_id: userId },
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
  async logout() {
    return { message: 'Đăng xuất thành công' };
  }
}
