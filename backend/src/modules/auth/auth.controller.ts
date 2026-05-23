import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiCookieAuth,
  ApiBody,
} from '@nestjs/swagger';
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

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * POST /auth/request-otp
   */
  @ApiOperation({ summary: 'Yêu cầu gửi OTP về số điện thoại' })
  @ApiBody({ type: RequestOtpDto })
  @ApiResponse({ status: 201, description: 'OTP đã được gửi thành công.' })
  @ApiResponse({ status: 429, description: 'Quá nhiều yêu cầu.' })
  @UseGuards(OtpRateLimitGuard)
  @Post('request-otp')
  async requestOtp(@Body() dto: RequestOtpDto) {
    return this.authService.requestOtp(dto);
  }

  /**
   * POST /auth/forgot-password/request-otp
   */
  @ApiOperation({ summary: 'Yêu cầu OTP để đặt lại mật khẩu' })
  @ApiBody({ type: RequestForgotPasswordOtpDto })
  @ApiResponse({ status: 201, description: 'OTP quên mật khẩu đã được gửi.' })
  @ApiResponse({ status: 429, description: 'Quá nhiều yêu cầu.' })
  @UseGuards(OtpRateLimitGuard)
  @Post('forgot-password/request-otp')
  async requestForgotPasswordOtp(@Body() dto: RequestForgotPasswordOtpDto) {
    return this.authService.requestForgotPasswordOtp(dto);
  }

  /**
   * POST /auth/verify-otp
   */
  @ApiOperation({ summary: 'Xác thực OTP' })
  @ApiBody({ type: VerifyOtpDto })
  @ApiResponse({ status: 201, description: 'OTP hợp lệ.' })
  @ApiResponse({
    status: 400,
    description: 'OTP không hợp lệ hoặc đã hết hạn.',
  })
  @Post('verify-otp')
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }

  /**
   * POST /auth/set-password
   */
  @ApiOperation({ summary: 'Đặt mật khẩu lần đầu sau khi xác thực OTP' })
  @ApiBody({ type: SetPasswordDto })
  @ApiResponse({ status: 201, description: 'Mật khẩu đã được đặt.' })
  @Post('set-password')
  async setPassword(@Body() dto: SetPasswordDto) {
    return this.authService.setPassword(dto);
  }

  /**
   * POST /auth/forgot-password/reset
   */
  @ApiOperation({ summary: 'Đặt lại mật khẩu bằng OTP quên mật khẩu' })
  @ApiBody({ type: ResetForgotPasswordDto })
  @ApiResponse({ status: 201, description: 'Mật khẩu đã được đặt lại.' })
  @Post('forgot-password/reset')
  async resetForgotPassword(@Body() dto: ResetForgotPasswordDto) {
    return this.authService.resetForgotPassword(dto);
  }

  /**
   * POST /auth/login
   */
  @ApiOperation({
    summary: 'Đăng nhập bằng số điện thoại / username và mật khẩu',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Đăng nhập thành công, trả về thông tin user.',
  })
  @ApiResponse({ status: 401, description: 'Sai thông tin đăng nhập.' })
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
   * POST /auth/refresh
   */
  @ApiOperation({
    summary: 'Làm mới access token từ refresh token trong cookie',
  })
  @ApiCookieAuth('refreshToken')
  @ApiResponse({ status: 200, description: 'Token đã được làm mới.' })
  @ApiResponse({
    status: 401,
    description: 'Refresh token không hợp lệ hoặc hết hạn.',
  })
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
   * GET /auth/profile
   */
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy thông tin người dùng hiện tại' })
  @ApiResponse({ status: 200, description: 'Thông tin người dùng.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực.' })
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req) {
    return this.authService.getProfile(req.user);
  }

  /**
   * PUT /auth/change-password
   */
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Đổi mật khẩu (yêu cầu đăng nhập)' })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({ status: 200, description: 'Mật khẩu đã được đổi.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực.' })
  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  async changePassword(@Req() req, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(req.user, dto);
  }

  /**
   * POST /auth/logout
   */
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Đăng xuất và xoá cookie' })
  @ApiResponse({ status: 200, description: 'Đã đăng xuất thành công.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực.' })
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
    if (sameSite === 'strict') return 'strict';
    if (sameSite === 'none') return 'none';
    return 'lax';
  }
}
