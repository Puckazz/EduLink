import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import {
  createPrismaMock,
  PrismaMock,
} from '../../common/testing/prisma-mock.helper';
import { AttendanceSummaryService } from './attendance-summary.service';

describe('AttendanceSummaryService', () => {
  let service: AttendanceSummaryService;
  let prismaMock: PrismaMock;

  beforeEach(async () => {
    prismaMock = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceSummaryService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get(AttendanceSummaryService);
  });

  afterEach(() => jest.clearAllMocks());

  it('aggregates attendance across all student sections in the same term', async () => {
    prismaMock.classEnrollment.findMany.mockResolvedValue([
      {
        enrollment_id: 1,
        section: { sessions: [{ session_id: 1 }, { session_id: 2 }] },
        records: [{ status: 'PRESENT' }, { status: 'ABSENT' }],
      },
      {
        enrollment_id: 2,
        section: {
          sessions: [{ session_id: 3 }, { session_id: 4 }, { session_id: 5 }],
        },
        records: [{ status: 'LATE' }, { status: 'ABSENT' }, { status: 'NONE' }],
      },
    ]);

    await service.syncForStudentTerm(1000, 1);

    expect(prismaMock.classEnrollment.findMany).toHaveBeenCalledWith({
      where: {
        student_id: 1000,
        section: { term_id: 1 },
      },
      select: {
        enrollment_id: true,
        section: {
          select: {
            sessions: {
              select: { session_id: true },
            },
          },
        },
        records: {
          select: { status: true },
        },
      },
    });
    expect(prismaMock.attendance.upsert).toHaveBeenCalledWith({
      where: {
        student_id_term_id: {
          student_id: 1000,
          term_id: 1,
        },
      },
      create: {
        student_id: 1000,
        term_id: 1,
        total_sessions: 5,
        absent_sessions: 2,
        late_sessions: 1,
      },
      update: {
        total_sessions: 5,
        absent_sessions: 2,
        late_sessions: 1,
      },
    });
  });
});
