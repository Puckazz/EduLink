import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, map } from 'rxjs';

interface StandardResponse<T = unknown> {
  success: true;
  statusCode: number;
  timestamp: string;
  path: string;
  message?: string;
  data: T | null;
  meta?: unknown;
}

@Injectable()
export class ResponseTransformInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<StandardResponse | unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();

    return next.handle().pipe(
      map((payload) => {
        if (payload === undefined && response.headersSent) {
          return payload;
        }

        return this.toStandardResponse(payload, request, response);
      }),
    );
  }

  private toStandardResponse(
    payload: unknown,
    request: Request,
    response: Response,
  ): StandardResponse {
    const body: StandardResponse = {
      success: true,
      statusCode: response.statusCode,
      timestamp: new Date().toISOString(),
      path: request.originalUrl ?? request.url,
      data: null,
    };

    if (!this.isPlainObject(payload)) {
      body.data = payload ?? null;
      return body;
    }

    if (this.isStandardResponse(payload)) {
      return payload as unknown as StandardResponse;
    }

    const result = payload as Record<string, unknown>;
    const { message, meta, pagination, data, ...rest } = result;

    if (typeof message === 'string') {
      body.message = message;
    } else if (message !== undefined) {
      rest.message = message;
    }

    const responseMeta = meta ?? pagination;
    if (responseMeta !== undefined) {
      body.meta = responseMeta;
    }

    if (this.hasOwn(result, 'data')) {
      body.data =
        Object.keys(rest).length > 0 ? { data, ...rest } : (data ?? null);
      return body;
    }

    body.data = Object.keys(rest).length > 0 ? rest : null;
    return body;
  }

  private isPlainObject(value: unknown): value is Record<string, unknown> {
    return (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value) &&
      !(value instanceof Date) &&
      !Buffer.isBuffer(value)
    );
  }

  private isStandardResponse(value: Record<string, unknown>) {
    return value.success === true && typeof value.statusCode === 'number';
  }

  private hasOwn(value: Record<string, unknown>, key: string) {
    return Object.prototype.hasOwnProperty.call(value, key);
  }
}
