import { Test, TestingModule } from '@nestjs/testing';
import { MajorService } from './major.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('MajorService', () => {
  let service: MajorService;
  const prismaMock = {
    major: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MajorService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<MajorService>(MajorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
