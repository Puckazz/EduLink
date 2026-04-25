import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
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
import { ScoreService } from '../score/score.service';
import { ScoreListQueryDto } from '../score/dto/score-list-query.dto';

@ApiTags('Me (Parent)')
@ApiBearerAuth()
@Roles('parent')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('me')
export class MeController {
  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly notificationService: NotificationService,
    private readonly scoreService: ScoreService,
  ) {}

  // GET /me/students/:id/attendances – Phụ huynh xem chuyên cần của con
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

  // GET /me/students/:id/scores – Phụ huynh xem điểm của con
  @ApiOperation({ summary: '[Parent] Phụ huynh xem điểm của con' })
  @ApiParam({ name: 'id', type: Number, description: 'ID của sinh viên' })
  @ApiResponse({ status: 200, description: 'Danh sách điểm của sinh viên.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @Get('students/:id/scores')
  getStudentScores(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: ScoreListQueryDto,
    @Request() req: { user: { userId: number } },
  ) {
    return this.scoreService.findByStudentForParent(id, req.user.userId, query);
  }

  // GET /me/notifications – Phụ huynh xem thông báo nhận được
  @ApiOperation({ summary: '[Parent] Phụ huynh xem thông báo nhận được' })
  @ApiResponse({ status: 200, description: 'Danh sách thông báo.' })
  @Get('notifications')
  getNotifications() {
    return this.notificationService.findForParent();
  }
}
