import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';
import { createTestApp, createE2EPrismaMock, E2EPrismaMock } from './test-setup';

jest.mock('bcrypt');
const bcryptMock = bcrypt as jest.Mocked<typeof bcrypt>;

describe('Score (e2e)', () => {
  let app: INestApplication;
  let prismaMock: E2EPrismaMock;
  let adminCookies: string[];

  const HASHED_PW = '$2b$10$HASHEDPASSWORD1234567890123456789012345678';

  const mockAdmin = {
    admin_id: 1, username: 'admin', password: HASHED_PW,
    full_name: 'Admin User', email: 'admin@edulink.vn',
    refresh_token_hash: null, created_at: new Date(),
  };

  const mockStudent = {
    student_id: 1000, student_code: 'SV001', full_name: 'Lê Văn C',
    deleted_at: null, major_id: 1,
  };

  const mockSubject = { subject_id: 1 };

  const mockScore = {
    score_id: 1, semester: 'HK1-2024', year: 2024,
    assignment: 8.5, midterm: 7.0, final: 8.0, avg: 7.85,
    note: null, publish_status: 'DRAFT',
    created_at: new Date(), updated_at: new Date(),
    student_id: 1000, subject_id: 1,
    subject: { subject_id: 1, subject_code: 'CS101', subject_name: 'Nhập môn lập trình', credit: 3 },
  };

  beforeAll(async () => {
    prismaMock = createE2EPrismaMock();
    app = await createTestApp(prismaMock);

    // Login as admin to get cookies
    prismaMock.admin.findUnique.mockResolvedValue(mockAdmin);
    (bcryptMock.compare as jest.Mock).mockResolvedValue(true);
    prismaMock.admin.update.mockResolvedValue({});

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ identifier: 'admin', password: 'adminPass' });

    adminCookies = loginRes.headers['set-cookie'] as unknown as string[];
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Restore admin auth mocks after each test clears them
    prismaMock.admin.findUnique.mockResolvedValue(mockAdmin);
  });

  // ─── POST /students/:id/scores ────────────────────────────────────────────────
  describe('POST /students/:id/scores', () => {
    it('should create score for a student (Admin)', async () => {
      prismaMock.student.findFirst.mockResolvedValue(mockStudent);
      prismaMock.subject.findUnique.mockResolvedValue(mockSubject);
      prismaMock.score.create.mockResolvedValue(mockScore);

      const response = await request(app.getHttpServer())
        .post('/students/1000/scores')
        .set('Cookie', adminCookies)
        .send({
          subject_id: 1, semester: 'HK1-2024', year: 2024,
          assignment: 8.5, midterm: 7.0, final: 8.0,
        })
        .expect(201);

      expect(response.body.score_id).toBe(1);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .post('/students/1000/scores')
        .send({ subject_id: 1, semester: 'HK1-2024', year: 2024 })
        .expect(401);
    });

    it('should return 404 when student does not exist', async () => {
      prismaMock.student.findFirst.mockResolvedValue(null);

      await request(app.getHttpServer())
        .post('/students/9999/scores')
        .set('Cookie', adminCookies)
        .send({ subject_id: 1, semester: 'HK1-2024', year: 2024 })
        .expect(404);
    });
  });

  // ─── GET /students/:id/scores ─────────────────────────────────────────────────
  describe('GET /students/:id/scores', () => {
    it('should return paginated scores for a student', async () => {
      prismaMock.student.findFirst.mockResolvedValue(mockStudent);
      prismaMock.$transaction.mockResolvedValue([[mockScore], 1]);

      const response = await request(app.getHttpServer())
        .get('/students/1000/scores')
        .set('Cookie', adminCookies)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.pagination.total).toBe(1);
    });
  });

  // ─── GET /scores/scorebook ────────────────────────────────────────────────────
  describe('GET /scores/scorebook', () => {
    it('should return scorebook data (Admin only)', async () => {
      prismaMock.student.findMany.mockResolvedValue([
        { ...mockStudent, major: { major_name: 'CNTT' }, scores: [mockScore] },
      ] as any);

      const response = await request(app.getHttpServer())
        .get('/scores/scorebook?subject_id=1&semester=HK1-2024')
        .set('Cookie', adminCookies)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .get('/scores/scorebook')
        .expect(401);
    });
  });

  // ─── PATCH /scores/:id ────────────────────────────────────────────────────────
  describe('PATCH /scores/:id', () => {
    it('should update score and recompute avg', async () => {
      prismaMock.score.findUnique.mockResolvedValue(mockScore);
      prismaMock.score.update.mockResolvedValue({ ...mockScore, final: 9.0, avg: 8.15 });

      const response = await request(app.getHttpServer())
        .patch('/scores/1')
        .set('Cookie', adminCookies)
        .send({ final: 9.0 })
        .expect(200);

      expect(response.body.final).toBe(9.0);
    });

    it('should return 404 when score not found', async () => {
      prismaMock.score.findUnique.mockResolvedValue(null);

      await request(app.getHttpServer())
        .patch('/scores/999')
        .set('Cookie', adminCookies)
        .send({ final: 9.0 })
        .expect(404);
    });
  });

  // ─── DELETE /scores/:id ───────────────────────────────────────────────────────
  describe('DELETE /scores/:id', () => {
    it('should delete score successfully', async () => {
      prismaMock.score.findUnique.mockResolvedValue(mockScore);
      prismaMock.score.delete.mockResolvedValue(mockScore);

      const response = await request(app.getHttpServer())
        .delete('/scores/1')
        .set('Cookie', adminCookies)
        .expect(200);

      expect(response.body.score_id).toBe(1);
    });
  });

  // ─── GET /me/students/:id/scores (Parent) ─────────────────────────────────────
  describe('GET /me/students/:id/scores (Parent)', () => {
    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .get('/me/students/1000/scores')
        .expect(401);
    });

    it('should return 403 when admin tries to access parent route', async () => {
      // Admin role is not allowed for @Roles('parent') guarded endpoint
      await request(app.getHttpServer())
        .get('/me/students/1000/scores')
        .set('Cookie', adminCookies)
        .expect(403);
    });
  });
});
