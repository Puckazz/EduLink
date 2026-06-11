import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
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

  @ApiOperation({ summary: '[Admin] GPA trung bình theo khoa (theo kỳ)' })
  @ApiResponse({
    status: 200,
    description: 'GPA theo khoa và danh sách kỳ học.',
  })
  @Roles('admin')
  @Get('admin/gpa')
  getGpaByMajor(@Query('termId') termId?: string) {
    return this.dashboardService.getGpaByMajor(
      termId ? parseInt(termId, 10) : undefined,
    );
  }

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

  @ApiOperation({ summary: '[Teacher] Thống kê tổng quan của giảng viên' })
  @ApiResponse({
    status: 200,
    description: 'Lớp dạy, buổi học, chuyên cần và thông báo mới nhất.',
  })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @Roles('teacher')
  @Get('teacher')
  getTeacherDashboard(@Request() req: { user: { userId: number } }) {
    return this.dashboardService.getTeacherDashboard(req.user.userId);
  }
}
