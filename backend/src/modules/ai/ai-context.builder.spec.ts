import { AiContextBuilder } from './ai-context.builder';
import {
  createPrismaMock,
  PrismaMock,
} from '../../common/testing/prisma-mock.helper';
import { PrismaService } from '../../prisma/prisma.service';

describe('AiContextBuilder', () => {
  let prisma: PrismaMock;
  let builder: AiContextBuilder;

  beforeEach(() => {
    prisma = createPrismaMock();
    builder = new AiContextBuilder(prisma as unknown as PrismaService);
  });

  it('loads parent notifications only for broadcasts and the current parent', async () => {
    prisma.student.findUniqueOrThrow.mockResolvedValue({
      full_name: 'Nguyễn Văn B',
      student_code: 'SV001',
      class: 'CNTT2024A',
      major: { major_name: 'Công nghệ Thông tin' },
    });
    prisma.score.findMany.mockResolvedValue([]);
    prisma.attendance.findMany.mockResolvedValue([]);
    prisma.classSection.findMany.mockResolvedValue([]);
    prisma.notification.findMany.mockResolvedValue([]);

    await builder.buildStudentContext(7, 10);

    expect(prisma.notification.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [
            { target_role: null, target_id: null },
            { target_role: 'parent', target_id: null },
            { target_role: 'parent', target_id: 7 },
          ],
        },
      }),
    );
  });
});
