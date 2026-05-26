import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  const createController = (env: Record<string, string | undefined>) => {
    const authService = {
      getAccessTokenMaxAgeMs: jest.fn(),
      getRefreshTokenMaxAgeMs: jest.fn(),
    };
    const configService = {
      get: jest.fn((key: string, defaultValue?: string) => {
        return env[key] ?? defaultValue;
      }),
    } as unknown as ConfigService;

    return new AuthController(authService as any, configService) as any;
  };

  it('uses cross-site compatible cookies by default in production', () => {
    const controller = createController({ NODE_ENV: 'production' });

    expect(controller.getBaseCookieOptions()).toMatchObject({
      httpOnly: true,
      path: '/',
      sameSite: 'none',
      secure: true,
    });
  });

  it('keeps local development cookies relaxed without requiring HTTPS', () => {
    const controller = createController({ NODE_ENV: 'development' });

    expect(controller.getBaseCookieOptions()).toMatchObject({
      sameSite: 'lax',
      secure: false,
    });
  });

  it('forces Secure when SameSite=None is configured', () => {
    const controller = createController({
      COOKIE_SAME_SITE: 'none',
      COOKIE_SECURE: 'false',
      NODE_ENV: 'development',
    });

    expect(controller.getBaseCookieOptions()).toMatchObject({
      sameSite: 'none',
      secure: true,
    });
  });
});
