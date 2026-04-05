import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, CookieOptions } from 'express';
import { AuthService } from './auth.service';
import { RequestOtpDto, VerifyOtpDto } from './dto/create-auth.dto';
import { SetPasswordDto, ChangePasswordDto } from './dto/change-password.dto';
import {
  RequestForgotPasswordOtpDto,
  ResetForgotPasswordDto,
} from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OtpRateLimitGuard } from './guards/otp-rate-limit.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * POST /auth/request-otp — Yêu cầu OTP (Public, rate-limited)
   */
  @UseGuards(OtpRateLimitGuard)
  @Post('request-otp')
  async requestOtp(@Body() dto: RequestOtpDto) {
    return this.authService.requestOtp(dto);
  }

  /**
   * POST /auth/forgot-password/request-otp — Yêu cầu OTP quên mật khẩu (Public, rate-limited)
   */
  @UseGuards(OtpRateLimitGuard)
  @Post('forgot-password/request-otp')
  async requestForgotPasswordOtp(@Body() dto: RequestForgotPasswordOtpDto) {
    return this.authService.requestForgotPasswordOtp(dto);
  }

  /**
   * POST /auth/verify-otp — Xác thực OTP (Public)
   */
  @Post('verify-otp')
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }

  /**
   * POST /auth/set-password — Đặt mật khẩu sau OTP (Public)
   */
  @Post('set-password')
  async setPassword(@Body() dto: SetPasswordDto) {
    return this.authService.setPassword(dto);
  }

  /**
   * POST /auth/forgot-password/reset — Đặt lại mật khẩu bằng OTP (Public)
   */
  @Post('forgot-password/reset')
  async resetForgotPassword(@Body() dto: ResetForgotPasswordDto) {
    return this.authService.resetForgotPassword(dto);
  }

  /**
   * POST /auth/login — Đăng nhập bằng phone + password (Public)
   */
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const loginResult = await this.authService.login(dto);
    this.setAuthCookies(res, loginResult.accessToken, loginResult.refreshToken);

    return {
      message: loginResult.message,
      user: loginResult.user,
    };
  }

  /**
   * POST /auth/refresh — Làm mới access token từ refresh token trong cookie (Public)
   */
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshResult = await this.authService.refresh(
      req.cookies?.refreshToken,
    );
    this.setAuthCookies(
      res,
      refreshResult.accessToken,
      refreshResult.refreshToken,
    );

    return {
      message: refreshResult.message,
      user: refreshResult.user,
    };
  }

  /**
   * GET /auth/profile — Lấy thông tin người dùng (Protected)
   */
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req) {
    return this.authService.getProfile(req.user);
  }

  /**
   * PUT /auth/change-password — Đổi mật khẩu (Protected)
   */
  @UseGuards(JwtAuthGuard)
  @Put('change-password')
  async changePassword(@Req() req, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(req.user, dto);
  }

  /**
   * POST /auth/logout — Đăng xuất (Protected)
   */
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Req() req, @Res({ passthrough: true }) res: Response) {
    this.clearAuthCookies(res);
    return this.authService.logout(req.user);
  }

  private setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ) {
    const accessCookieOptions = this.getBaseCookieOptions(
      this.authService.getAccessTokenMaxAgeMs(),
    );
    const refreshCookieOptions = this.getBaseCookieOptions(
      this.authService.getRefreshTokenMaxAgeMs(),
    );

    res.cookie('accessToken', accessToken, accessCookieOptions);
    res.cookie('refreshToken', refreshToken, refreshCookieOptions);
  }

  private clearAuthCookies(res: Response) {
    const clearCookieOptions = this.getBaseCookieOptions();
    res.clearCookie('accessToken', clearCookieOptions);
    res.clearCookie('refreshToken', clearCookieOptions);
  }

  private getBaseCookieOptions(maxAge?: number): CookieOptions {
    const sameSite = this.getCookieSameSite();
    const secureFromEnv = this.configService.get<string>('COOKIE_SECURE');
    const isProduction =
      this.configService.get<string>('NODE_ENV') === 'production';
    const secure =
      secureFromEnv !== undefined
        ? secureFromEnv === 'true'
        : sameSite === 'none' || isProduction;
    const domain = this.configService.get<string>('COOKIE_DOMAIN');

    return {
      httpOnly: true,
      secure,
      sameSite,
      path: '/',
      ...(maxAge ? { maxAge } : {}),
      ...(domain ? { domain } : {}),
    };
  }

  private getCookieSameSite(): CookieOptions['sameSite'] {
    const sameSite = this.configService
      .get<string>('COOKIE_SAME_SITE', 'lax')
      .toLowerCase();

    if (sameSite === 'strict') {
      return 'strict';
    }
    if (sameSite === 'none') {
      return 'none';
    }
    return 'lax';
  }
}
