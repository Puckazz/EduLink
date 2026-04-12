import { Test, TestingModule } from '@nestjs/testing';
import { ScoreService } from './score.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('ScoreService', () => {
  let service: ScoreService;

  const prismaServiceMock = {
    score: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    student: {
      findFirst: jest.fn(),
    },
    subject: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScoreService,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
      ],
    }).compile();

    service = module.get<ScoreService>(ScoreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
