import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  // GET /dashboard/admin – Thống kê tổng quan hệ thống (Admin)
  @ApiOperation({ summary: '[Admin] Thống kê tổng quan hệ thống' })
  @ApiResponse({
    status: 200,
    description: 'Số sinh viên, phụ huynh, thông báo, phản hồi chờ xử lý.',
  })
  @Roles('admin')
  @Get('admin')
  getAdminDashboard() {
    return this.dashboardService.getAdminStats();
  }

  // GET /dashboard/me – Thông tin tổng quan của phụ huynh (Parent)
  @ApiOperation({ summary: '[Parent] Thông tin tổng quan của phụ huynh' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách con, điểm, chuyên cần.',
  })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @Roles('parent')
  @Get('me')
  getParentDashboard(@Request() req: { user: { userId: number } }) {
    return this.dashboardService.getParentDashboard(req.user.userId);
  }
}
