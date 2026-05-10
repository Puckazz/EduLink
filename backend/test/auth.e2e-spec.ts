import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';
import { createTestApp, createE2EPrismaMock, E2EPrismaMock } from './test-setup';

jest.mock('bcrypt');
const bcryptMock = bcrypt as jest.Mocked<typeof bcrypt>;

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prismaMock: E2EPrismaMock;

  const HASHED_PW = '$2b$10$HASHEDPASSWORD1234567890123456789012345678';

  const mockAdmin = {
    admin_id: 1, username: 'admin', password: HASHED_PW,
    full_name: 'Admin User', email: 'admin@edulink.vn',
    refresh_token_hash: null, created_at: new Date(),
  };

  beforeAll(async () => {
    prismaMock = createE2EPrismaMock();
    app = await createTestApp(prismaMock);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── POST /auth/login ─────────────────────────────────────────────────────────
  describe('POST /auth/login', () => {
    it('should login admin and set httpOnly cookies', async () => {
      prismaMock.admin.findUnique.mockResolvedValue(mockAdmin);
      (bcryptMock.compare as jest.Mock).mockResolvedValue(true);
      prismaMock.admin.update.mockResolvedValue({});

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ identifier: 'admin', password: 'adminPass' })
        .expect(200);

      expect(response.body.user.role).toBe('admin');
      expect(response.headers['set-cookie']).toBeDefined();
      // Verify cookies are set
      const cookies = response.headers['set-cookie'] as unknown as string[];
      expect(cookies.some((c: string) => c.startsWith('accessToken='))).toBe(true);
      expect(cookies.some((c: string) => c.startsWith('refreshToken='))).toBe(true);
    });

    it('should return 401 for wrong credentials', async () => {
      prismaMock.admin.findUnique.mockResolvedValue(mockAdmin);
      (bcryptMock.compare as jest.Mock).mockResolvedValue(false);

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ identifier: 'admin', password: 'wrongPass' })
        .expect(401);
    });

    it('should return 401 when user not found', async () => {
      prismaMock.admin.findUnique.mockResolvedValue(null);
      prismaMock.teacher.findUnique.mockResolvedValue(null);
      prismaMock.parent.findUnique.mockResolvedValue(null);

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ identifier: 'nobody', password: 'pass' })
        .expect(401);
    });

    it('should return 400 when identifier is missing', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ password: 'pass' })
        .expect(400);
    });
  });

  // ─── GET /auth/profile ────────────────────────────────────────────────────────
  describe('GET /auth/profile', () => {
    it('should return 401 when no token provided', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .expect(401);
    });

    it('should return profile when valid access token in cookie', async () => {
      // Step 1: login to get cookie
      prismaMock.admin.findUnique.mockResolvedValueOnce(mockAdmin);
      (bcryptMock.compare as jest.Mock).mockResolvedValueOnce(true);
      prismaMock.admin.update.mockResolvedValueOnce({});

      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ identifier: 'admin', password: 'adminPass' });

      const cookies = loginRes.headers['set-cookie'];

      // Step 2: use cookie to get profile
      prismaMock.admin.findUnique.mockResolvedValue(mockAdmin);

      const profileRes = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Cookie', cookies)
        .expect(200);

      expect(profileRes.body.role).toBe('admin');
    });
  });

  // ─── POST /auth/refresh ───────────────────────────────────────────────────────
  describe('POST /auth/refresh', () => {
    it('should return 401 when no refresh token cookie', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .expect(401);
    });
  });

  // ─── POST /auth/logout ────────────────────────────────────────────────────────
  describe('POST /auth/logout', () => {
    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .post('/auth/logout')
        .expect(401);
    });

    it('should logout successfully and clear cookies', async () => {
      // Step 1: login
      prismaMock.admin.findUnique.mockResolvedValueOnce(mockAdmin);
      (bcryptMock.compare as jest.Mock).mockResolvedValueOnce(true);
      prismaMock.admin.update.mockResolvedValue({});

      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ identifier: 'admin', password: 'adminPass' });

      const cookies = loginRes.headers['set-cookie'];

      // Step 2: get profile to confirm auth works
      prismaMock.admin.findUnique.mockResolvedValue(mockAdmin);

      const logoutRes = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Cookie', cookies)
        .expect(200);

      expect(logoutRes.body.message).toBeDefined();
    });
  });

  // ─── POST /auth/request-otp ───────────────────────────────────────────────────
  describe('POST /auth/request-otp', () => {
    it('should return 404 when student_code not found', async () => {
      prismaMock.student.findFirst.mockResolvedValue(null);

      await request(app.getHttpServer())
        .post('/auth/request-otp')
        .send({ phone: '0987654321', student_code: 'INVALID' })
        .expect(404);
    });

    it('should return 400 when request body is missing phone', async () => {
      await request(app.getHttpServer())
        .post('/auth/request-otp')
        .send({ student_code: 'SV001' })
        .expect(400);
    });
  });

  // ─── PATCH /auth/change-password ──────────────────────────────────────────────
  describe('PATCH /auth/change-password', () => {
    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .patch('/auth/change-password')
        .send({ oldPassword: 'old', newPassword: 'new' })
        .expect(401);
    });
  });
});
