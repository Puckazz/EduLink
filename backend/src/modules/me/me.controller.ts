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
import { ClassSectionService } from '../class-section/class-section.service';

@ApiTags('Me')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('me')
export class MeController {
  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly notificationService: NotificationService,
    private readonly scoreService: ScoreService,
    private readonly classSectionService: ClassSectionService,
  ) {}

  // GET /me/students/:id/attendances – Phụ huynh xem chuyên cần của con
  @ApiOperation({ summary: '[Parent] Phụ huynh xem chuyên cần của con' })
  @ApiParam({ name: 'id', type: Number, description: 'ID của sinh viên' })
  @ApiResponse({ status: 200, description: 'Danh sách chuyên cần của sinh viên.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @Roles('parent')
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
  @Roles('parent')
  @Get('students/:id/scores')
  getStudentScores(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: ScoreListQueryDto,
    @Request() req: { user: { userId: number } },
  ) {
    return this.scoreService.findByStudentForParent(id, req.user.userId, query);
  }

  // GET /me/notifications – Phụ huynh / Giáo viên xem thông báo nhận được
  @ApiOperation({ summary: '[Parent, Teacher] Xem thông báo nhận được' })
  @ApiResponse({ status: 200, description: 'Danh sách thông báo.' })
  @Roles('parent', 'teacher')
  @Get('notifications')
  getNotifications(@Request() req: { user: { userId: number; role: string } }) {
    if (req.user.role === 'teacher') {
      return this.notificationService.findForTeacher(req.user.userId);
    }
    return this.notificationService.findForParent(req.user.userId);
  }

  // GET /me/students/:id/class-sections – Phụ huynh xem lịch học & điểm danh lớp của con
  @ApiOperation({ summary: '[Parent] Phụ huynh xem lịch học và điểm danh lớp của con' })
  @ApiParam({ name: 'id', type: Number, description: 'ID của sinh viên' })
  @ApiResponse({ status: 200, description: 'Danh sách lớp học phần con đã đăng ký và điểm danh.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @Roles('parent')
  @Get('students/:id/class-sections')
  getStudentClassSections(
    @Param('id', ParseIntPipe) id: number,
    @Query('semester') semester: string | undefined,
    @Request() req: { user: { userId: number } },
  ) {
    return this.classSectionService.findEnrolledSectionsForParent(
      id,
      req.user.userId,
      semester,
    );
  }
}
