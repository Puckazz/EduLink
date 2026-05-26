import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

/**
 * Creates a NestJS test application with real AppModule
 * but mocked PrismaService.
 */
export async function createTestApp(
  prismaMock: Record<string, any>,
): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(PrismaService)
    .useValue(prismaMock)
    .compile();

  const app = moduleFixture.createNestApplication();
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.init();
  return app;
}

/**
 * Builds a minimal PrismaService mock for E2E tests.
 * Models listed here are those exercised by the E2E test suite.
 */
export function createE2EPrismaMock() {
  const model = () => ({
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    updateMany: jest.fn(),
    createMany: jest.fn(),
    deleteMany: jest.fn(),
    aggregate: jest.fn(),
  });

  const mock = {
    admin: model(),
    teacher: model(),
    parent: model(),
    student: model(),
    studentParent: model(),
    otp: model(),
    subject: model(),
    academicYear: model(),
    academicTerm: model(),
    score: model(),
    scoreLog: model(),
    attendance: model(),
    notification: model(),
    feedback: model(),
    feedbackMessage: model(),
    major: model(),
    classSection: model(),
    classEnrollment: model(),
    attendanceSession: model(),
    attendanceRecord: model(),
    $transaction: jest.fn((args) => {
      if (Array.isArray(args)) return Promise.all(args);
      return Promise.resolve(args(mock));
    }),
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  };

  return mock;
}

export type E2EPrismaMock = ReturnType<typeof createE2EPrismaMock>;
