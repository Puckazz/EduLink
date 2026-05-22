import {
  Controller,
  Get,
  Patch,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
  Request,
  Body,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AttendanceService } from '../attendance/attendance.service';
import { NotificationService } from '../notification/notification.service';
import { ScoreService } from '../score/score.service';
import { ScoreListQueryDto } from '../score/dto/score-list-query.dto';
import { ClassSectionService } from '../class-section/class-section.service';
import { MeService } from './me.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

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
    private readonly meService: MeService,
  ) {}

  @ApiOperation({ summary: '[All] Cập nhật hồ sơ cá nhân' })
  @ApiBody({ type: UpdateProfileDto })
  @ApiResponse({ status: 200, description: 'Hồ sơ sau khi cập nhật.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ hoặc email/SĐT đã tồn tại.' })
  @Roles('admin', 'teacher', 'parent')
  @Patch('profile')
  updateProfile(
    @Request() req: { user: { userId: number; role: string } },
    @Body() dto: UpdateProfileDto,
  ) {
    return this.meService.updateProfile(req.user.userId, req.user.role, dto);
  }

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
