import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ClassStatus } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ClassSectionService } from './class-section.service';
import { AttendanceSessionService } from './attendance-session.service';
import { CreateClassSectionDto } from './dto/create-class-section.dto';
import { UpdateClassSectionDto } from './dto/update-class-section.dto';
import { CreateSessionDto } from './dto/create-session.dto';
import { BulkUpsertAttendanceDto } from './dto/bulk-upsert-attendance.dto';

@ApiTags('Class Sections & Attendance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'teacher')
@Controller('class-sections')
export class ClassSectionController {
  constructor(
    private readonly classSectionService: ClassSectionService,
    private readonly sessionService: AttendanceSessionService,
  ) {}

  // ──── Class Sections ──────────────────────────────────────────────────────

  @ApiOperation({ summary: 'Lấy danh sách lớp học phần (có thể lọc theo semester/status)' })
  @ApiQuery({ name: 'semester', required: false, example: 'HK1-2024' })
  @ApiQuery({ name: 'status', required: false, enum: ClassStatus })
  @ApiResponse({ status: 200, description: 'Danh sách lớp học phần' })
  @Get()
  findAll(
    @Req() req: any,
    @Query('semester') semester?: string,
    @Query('status') status?: ClassStatus,
  ) {
    const teacherId = req.user?.role === 'teacher' ? req.user.userId : undefined;
    return this.classSectionService.findAll(semester, status, teacherId);
  }

  @ApiOperation({ summary: 'Lấy chi tiết 1 lớp học phần' })
  @ApiParam({ name: 'id', type: Number })
  @Get(':id')
  findOne(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    const teacherId = req.user?.role === 'teacher' ? req.user.userId : undefined;
    return this.classSectionService.findOne(id, teacherId);
  }

  @ApiOperation({ summary: 'Tạo lớp học phần mới' })
  @Roles('admin')
  @Post()
  create(@Body() dto: CreateClassSectionDto) {
    return this.classSectionService.create(dto);
  }

  @ApiOperation({ summary: 'Cập nhật thông tin lớp học phần' })
  @ApiParam({ name: 'id', type: Number })
  @Roles('admin')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateClassSectionDto,
  ) {
    return this.classSectionService.update(id, dto);
  }

  @ApiOperation({ summary: 'Xóa lớp học phần' })
  @ApiParam({ name: 'id', type: Number })
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.classSectionService.remove(id);
  }

  @ApiOperation({ summary: 'Thống kê điểm danh tổng hợp của lớp' })
  @ApiParam({ name: 'id', type: Number })
  @Get(':id/stats')
  getStats(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    const teacherId = req.user?.role === 'teacher' ? req.user.userId : undefined;
    return this.classSectionService.getStats(id, teacherId);
  }

  // ──── Sessions ────────────────────────────────────────────────────────────

  @ApiOperation({ summary: 'Lấy danh sách buổi học của lớp' })
  @ApiParam({ name: 'id', type: Number })
  @Get(':id/sessions')
  findSessions(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    const teacherId = req.user?.role === 'teacher' ? req.user.userId : undefined;
    return this.sessionService.findSessions(id, teacherId);
  }

  @ApiOperation({ summary: 'Tạo buổi học mới (tự tạo records rỗng cho tất cả SV)' })
  @ApiParam({ name: 'id', type: Number })
  @Post(':id/sessions')
  createSession(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateSessionDto,
  ) {
    const teacherId = req.user?.role === 'teacher' ? req.user.userId : undefined;
    return this.sessionService.createSession(id, dto, teacherId);
  }

  // ──── Session Records ─────────────────────────────────────────────────────

  @ApiOperation({ summary: 'Lấy điểm danh chi tiết của 1 buổi học (có phân trang)' })
  @ApiParam({ name: 'id', type: Number, description: 'section_id' })
  @ApiParam({ name: 'sessionId', type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @Get(':id/sessions/:sessionId/records')
  getRecords(
    @Req() req: any,
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const teacherId = req.user?.role === 'teacher' ? req.user.userId : undefined;
    return this.sessionService.getSessionRecords(
      sessionId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      search,
      teacherId,
    );
  }

  @ApiOperation({ summary: 'Toggle publish/draft status của 1 buổi học' })
  @ApiParam({ name: 'id', type: Number, description: 'section_id' })
  @ApiParam({ name: 'sessionId', type: Number })
  @Patch(':id/sessions/:sessionId/publish')
  publishSession(@Req() req: any, @Param('sessionId', ParseIntPipe) sessionId: number) {
    const teacherId = req.user?.role === 'teacher' ? req.user.userId : undefined;
    return this.sessionService.publishSession(sessionId, teacherId);
  }

  @ApiOperation({ summary: 'Lưu điểm danh hàng loạt cho 1 buổi học' })
  @ApiParam({ name: 'id', type: Number, description: 'section_id' })
  @ApiParam({ name: 'sessionId', type: Number })
  @ApiResponse({ status: 200, description: 'Điểm danh đã được lưu' })
  @Patch(':id/sessions/:sessionId/records')
  bulkUpsert(
    @Req() req: any,
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @Body() dto: BulkUpsertAttendanceDto,
  ) {
    const teacherId = req.user?.role === 'teacher' ? req.user.userId : undefined;
    return this.sessionService.bulkUpsertRecords(sessionId, dto, teacherId);
  }
}
