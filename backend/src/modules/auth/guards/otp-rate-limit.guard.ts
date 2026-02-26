import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

interface RateLimitEntry {
  count: number;
  firstRequestAt: number;
}

@Injectable()
export class OtpRateLimitGuard implements CanActivate {
  private readonly store = new Map<string, RateLimitEntry>();
  private readonly MAX_REQUESTS = 5;
  private readonly WINDOW_MS = 60 * 60 * 1000; // 1 hour

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const phone: string = request.body?.phone;

    if (!phone) {
      return true; // Let validation pipe handle missing phone
    }

    const now = Date.now();
    const entry = this.store.get(phone);

    if (!entry || now - entry.firstRequestAt > this.WINDOW_MS) {
      // First request or window expired — reset
      this.store.set(phone, { count: 1, firstRequestAt: now });
      return true;
    }

    if (entry.count >= this.MAX_REQUESTS) {
      const remainingMs = this.WINDOW_MS - (now - entry.firstRequestAt);
      const remainingMin = Math.ceil(remainingMs / 60000);
      throw new HttpException(
        {
          message: `Bạn đã yêu cầu OTP quá ${this.MAX_REQUESTS} lần. Vui lòng thử lại sau ${remainingMin} phút.`,
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    entry.count++;
    return true;
  }
}
