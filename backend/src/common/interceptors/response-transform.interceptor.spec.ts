import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of } from 'rxjs';
import { ResponseTransformInterceptor } from './response-transform.interceptor';

describe('ResponseTransformInterceptor', () => {
  let interceptor: ResponseTransformInterceptor;

  const createContext = (
    response: Partial<{ statusCode: number; headersSent: boolean }> = {},
  ) =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          originalUrl: '/teachers?page=1',
          url: '/teachers?page=1',
        }),
        getResponse: () => ({
          statusCode: 200,
          headersSent: false,
          ...response,
        }),
      }),
    }) as ExecutionContext;

  const run = async (payload: unknown, response = {}) => {
    const next = { handle: () => of(payload) } as CallHandler;
    return new Promise((resolve) => {
      interceptor.intercept(createContext(response), next).subscribe(resolve);
    });
  };

  beforeEach(() => {
    interceptor = new ResponseTransformInterceptor();
  });

  it('wraps a plain object in data', async () => {
    await expect(run({ teacher_id: 1 })).resolves.toMatchObject({
      success: true,
      statusCode: 200,
      path: '/teachers?page=1',
      data: { teacher_id: 1 },
    });
  });

  it('keeps paginated data and meta at the top level', async () => {
    await expect(
      run({
        data: [{ teacher_id: 1 }],
        meta: { totalItems: 1 },
      }),
    ).resolves.toMatchObject({
      success: true,
      data: [{ teacher_id: 1 }],
      meta: { totalItems: 1 },
    });
  });

  it('normalizes pagination to meta', async () => {
    await expect(
      run({
        data: [{ student_id: 1 }],
        pagination: { totalItems: 1 },
      }),
    ).resolves.toMatchObject({
      success: true,
      data: [{ student_id: 1 }],
      meta: { totalItems: 1 },
    });
  });

  it('extracts message and wraps the remaining payload', async () => {
    await expect(
      run({
        message: 'Đăng nhập thành công',
        user: { id: 1 },
      }),
    ).resolves.toMatchObject({
      success: true,
      message: 'Đăng nhập thành công',
      data: { user: { id: 1 } },
    });
  });

  it('keeps manually sent responses untouched', async () => {
    await expect(
      run(undefined, { headersSent: true }),
    ).resolves.toBeUndefined();
  });
});
