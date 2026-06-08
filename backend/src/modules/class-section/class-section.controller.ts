import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ClassSectionService } from './class-section.service';
import { AttendanceSessionService } from './attendance-session.service';
import { ImportClassSectionService } from './import-class-section.service';
import { CreateClassSectionDto } from './dto/create-class-section.dto';
import { UpdateClassSectionDto } from './dto/update-class-section.dto';
import { ClassSectionListQueryDto } from './dto/class-section-list-query.dto';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { BulkUpsertAttendanceDto } from './dto/bulk-upsert-attendance.dto';
import { IsArray, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { EFFECTIVE_STATUS_VALUES } from '../academic-term/academic-period-status.helper';

class AddEnrollmentsDto {
  @ApiProperty({ type: [Number], example: [1, 2, 3] })
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  studentIds: number[];
}

@ApiTags('Class Sections & Attendance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'teacher')
@Controller('class-sections')
export class ClassSectionController {
  constructor(
    private readonly classSectionService: ClassSectionService,
    private readonly sessionService: AttendanceSessionService,
    private readonly importService: ImportClassSectionService,
  ) {}

  @ApiOperation({
    summary: 'Lấy danh sách lớp học phần (có thể lọc, phân trang)',
  })
  @ApiQuery({ name: 'term_id', required: false, example: 1 })
  @ApiQuery({ name: 'academic_year_id', required: false, example: 1 })
  @ApiQuery({ name: 'major_id', required: false, example: 1 })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({
    name: 'effectiveStatus',
    required: false,
    enum: EFFECTIVE_STATUS_VALUES,
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Danh sách lớp học phần' })
  @Get()
  findAll(@Req() req: any, @Query() query: ClassSectionListQueryDto) {
    const teacherId =
      req.user?.role === 'teacher' ? req.user.userId : undefined;
    return this.classSectionService.findAll(query, teacherId);
  }

  @ApiOperation({ summary: '[Admin/Teacher] Lấy danh sách giảng viên' })
  @Get('teachers')
  findAllTeachers() {
    return this.classSectionService.findAllTeachers();
  }

  @ApiOperation({
    summary: '[Admin/Teacher] Lấy chuyên ngành có lớp học phần',
  })
  @Get('majors')
  findAvailableMajors(@Req() req: any) {
    const teacherId =
      req.user?.role === 'teacher' ? req.user.userId : undefined;
    return this.classSectionService.findAvailableMajors(teacherId);
  }

  @ApiOperation({ summary: 'Lấy chi tiết 1 lớp học phần' })
  @ApiParam({ name: 'id', type: Number })
  @Get(':id')
  findOne(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    const teacherId =
      req.user?.role === 'teacher' ? req.user.userId : undefined;
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
    const teacherId =
      req.user?.role === 'teacher' ? req.user.userId : undefined;
    return this.classSectionService.getStats(id, teacherId);
  }

  @ApiOperation({ summary: '[Admin] Lấy danh sách sinh viên trong lớp' })
  @ApiParam({ name: 'id', type: Number })
  @Get(':id/enrollments')
  getEnrollments(@Param('id', ParseIntPipe) id: number) {
    return this.classSectionService.getEnrollments(id);
  }

  @ApiOperation({ summary: '[Admin] Thêm sinh viên vào lớp (bulk)' })
  @ApiParam({ name: 'id', type: Number })
  @Roles('admin')
  @Post(':id/enrollments')
  addEnrollments(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddEnrollmentsDto,
  ) {
    return this.classSectionService.addEnrollments(id, dto.studentIds);
  }

  @ApiOperation({ summary: '[Admin] Xóa sinh viên khỏi lớp' })
  @ApiParam({ name: 'id', type: Number })
  @ApiParam({ name: 'eid', type: Number, description: 'enrollment_id' })
  @Roles('admin')
  @Delete(':id/enrollments/:eid')
  removeEnrollment(
    @Param('id', ParseIntPipe) id: number,
    @Param('eid', ParseIntPipe) eid: number,
  ) {
    return this.classSectionService.removeEnrollment(id, eid);
  }

  @ApiOperation({ summary: '[Admin] Tải file Excel mẫu import lớp học phần' })
  @Roles('admin')
  @Get('import/template')
  downloadTemplate(@Res() res: Response) {
    const buffer = this.importService.generateTemplate();
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="template-import-lop-hoc.xlsx"',
    );
    res.send(buffer);
  }

  @ApiOperation({ summary: '[Admin] Import lớp học phần từ file Excel' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @Roles('admin')
  @Post('import')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  async importFromFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      return { message: 'Vui lòng tải lên file Excel.' };
    }
    return this.importService.importFromBuffer(file.buffer);
  }

  @ApiOperation({ summary: 'Lấy danh sách buổi học của lớp' })
  @ApiParam({ name: 'id', type: Number })
  @Get(':id/sessions')
  findSessions(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    const teacherId =
      req.user?.role === 'teacher' ? req.user.userId : undefined;
    return this.sessionService.findSessions(id, teacherId);
  }

  @ApiOperation({
    summary: 'Tạo buổi học mới (tự tạo records rỗng cho tất cả SV)',
  })
  @ApiParam({ name: 'id', type: Number })
  @Post(':id/sessions')
  createSession(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateSessionDto,
  ) {
    const teacherId =
      req.user?.role === 'teacher' ? req.user.userId : undefined;
    return this.sessionService.createSession(id, dto, teacherId);
  }

  @ApiOperation({ summary: 'Sửa ngày / ghi chú của 1 buổi học' })
  @ApiParam({ name: 'id', type: Number, description: 'section_id' })
  @ApiParam({ name: 'sessionId', type: Number })
  @Patch(':id/sessions/:sessionId')
  updateSession(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @Body() dto: UpdateSessionDto,
  ) {
    const teacherId =
      req.user?.role === 'teacher' ? req.user.userId : undefined;
    return this.sessionService.updateSession(id, sessionId, dto, teacherId);
  }

  @ApiOperation({
    summary: '[Admin] Xóa buổi học (cascade xóa toàn bộ records điểm danh)',
  })
  @ApiParam({ name: 'id', type: Number, description: 'section_id' })
  @ApiParam({ name: 'sessionId', type: Number })
  @Roles('admin')
  @Delete(':id/sessions/:sessionId')
  deleteSession(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Param('sessionId', ParseIntPipe) sessionId: number,
  ) {
    return this.sessionService.deleteSession(id, sessionId);
  }

  @ApiOperation({
    summary: 'Lấy điểm danh chi tiết của 1 buổi học (có phân trang)',
  })
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
    const teacherId =
      req.user?.role === 'teacher' ? req.user.userId : undefined;
    return this.sessionService.getSessionRecords(
      sessionId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      search,
      teacherId,
    );
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
    const teacherId =
      req.user?.role === 'teacher' ? req.user.userId : undefined;
    return this.sessionService.bulkUpsertRecords(sessionId, dto, teacherId);
  }

}
