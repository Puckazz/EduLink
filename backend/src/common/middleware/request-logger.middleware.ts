import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, body } = req;
    const startTime = Date.now();
    const userAgent = req.get('user-agent') || '-';

    // Log request
    const bodyLog =
      Object.keys(body || {}).length > 0
        ? ` | Body: ${JSON.stringify(this.sanitizeBody(body))}`
        : '';
    this.logger.log(`→ ${method} ${originalUrl}${bodyLog}`);

    // Capture response
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const { statusCode } = res;

      const logMessage = `← ${method} ${originalUrl} ${statusCode} ${duration}ms [${userAgent}]`;

      if (statusCode >= 500) {
        this.logger.error(logMessage);
      } else if (statusCode >= 400) {
        this.logger.warn(logMessage);
      } else {
        this.logger.log(logMessage);
      }
    });

    next();
  }

  /**
   * Ẩn các field nhạy cảm trong body log
   */
  private sanitizeBody(body: Record<string, any>): Record<string, any> {
    const sensitiveFields = [
      'password',
      'newPassword',
      'oldPassword',
      'otp',
      'otp_code',
    ];
    const sanitized = { ...body };

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '******';
      }
    }

    return sanitized;
  }
}
