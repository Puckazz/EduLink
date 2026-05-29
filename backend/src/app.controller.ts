import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PrismaService } from './prisma/prisma.service';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @ApiOperation({
    summary: 'Kiểm tra kết nối database cho Render Cron Job',
  })
  @ApiResponse({
    status: 200,
    description: 'Database phản hồi thành công với SELECT 1.',
  })
  @ApiResponse({
    status: 503,
    description: 'Không thể query database.',
  })
  @Get('health-db')
  async healthDb() {
    try {
      const rows = await this.prisma.$queryRaw<
        Array<{ result: number | bigint }>
      >`
        SELECT 1 AS result
      `;
      const result = rows[0]?.result;

      return {
        status: 'ok',
        database: 'ok',
        result: typeof result === 'bigint' ? Number(result) : (result ?? null),
        checkedAt: new Date().toISOString(),
      };
    } catch {
      throw new ServiceUnavailableException({
        message: 'Database health check failed',
        database: 'unavailable',
      });
    }
  }
}
