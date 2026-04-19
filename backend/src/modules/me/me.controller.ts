import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AttendanceService } from '../attendance/attendance.service';
import { NotificationService } from '../notification/notification.service';

@ApiTags('Me (Parent)')
@ApiBearerAuth()
@Roles('parent')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('me')
export class MeController {
  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly notificationService: NotificationService,
  ) {}

  // STT 4: GET /me/students/:id/attendances – Phụ huynh xem chuyên cần của con
  @ApiOperation({ summary: '[Parent] Phụ huynh xem chuyên cần của con' })
  @ApiParam({ name: 'id', type: Number, description: 'ID của sinh viên' })
  @ApiResponse({ status: 200, description: 'Danh sách chuyên cần của sinh viên.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @Get('students/:id/attendances')
  getStudentAttendances(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { userId: number } },
  ) {
    return this.attendanceService.findByStudentForParent(id, req.user.userId);
  }

  // STT 5: GET /me/notifications – Phụ huynh xem thông báo nhận được
  @ApiOperation({ summary: '[Parent] Phụ huynh xem thông báo nhận được' })
  @ApiResponse({ status: 200, description: 'Danh sách thông báo.' })
  @Get('notifications')
  getNotifications() {
    // Currently returns all notifications. Later can be filtered by parent_id.
    return this.notificationService.findForParent();
  }
}
