import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentListQueryDto } from './dto/student-list-query.dto';
import { AssignParentDto } from './dto/assign-parent.dto';
import { AttendanceService } from '../attendance/attendance.service';
import { CreateAttendanceDto } from '../attendance/dto/create-attendance.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Students')
@ApiBearerAuth()
@Controller('students')
export class StudentController {
  constructor(
    private readonly studentService: StudentService,
    private readonly attendanceService: AttendanceService,
  ) {}

  // ─── PARENT routes ────────────────────────────────────────────────────────

  @ApiOperation({ summary: '[Parent] Lấy danh sách sinh viên của phụ huynh hiện tại' })
  @ApiResponse({ status: 200, description: 'Danh sách sinh viên.' })
  @Roles('parent')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('me/students')
  getMyStudents(
    @Query() query: StudentListQueryDto,
    @Request()
    req: { user: { userId: number } },
  ) {
    return this.studentService.getStudentsForCurrentParent(req.user.userId, query);
  }

  @ApiOperation({ summary: '[Parent] Lấy chi tiết một sinh viên của phụ huynh hiện tại' })
  @ApiParam({ name: 'id', type: Number, description: 'ID của sinh viên' })
  @ApiResponse({ status: 200, description: 'Thông tin sinh viên.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @Roles('parent')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('me/students/:id')
  getMyStudentById(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { userId: number } },
  ) {
    return this.studentService.findOneForParent(id, req.user.userId);
  }

  // ─── ADMIN CRUD ────────────────────────────────────────────────────────────

  @ApiOperation({ summary: '[Admin] Tạo sinh viên mới' })
  @ApiBody({ type: CreateStudentDto })
  @ApiResponse({ status: 201, description: 'Sinh viên đã được tạo.' })
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentService.create(createStudentDto);
  }

  @ApiOperation({ summary: '[Admin] Lấy danh sách sinh viên (có thể lọc, phân trang)' })
  @ApiResponse({ status: 200, description: 'Danh sách sinh viên.' })
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  findAll(@Query() query: StudentListQueryDto) {
    return this.studentService.findAll(query);
  }

  @ApiOperation({ summary: '[Admin] Lấy chi tiết sinh viên theo ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID của sinh viên' })
  @ApiResponse({ status: 200, description: 'Thông tin sinh viên.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sinh viên.' })
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.studentService.findOne(id);
  }

  @ApiOperation({ summary: '[Admin] Cập nhật thông tin sinh viên' })
  @ApiParam({ name: 'id', type: Number, description: 'ID của sinh viên' })
  @ApiBody({ type: UpdateStudentDto })
  @ApiResponse({ status: 200, description: 'Sinh viên đã được cập nhật.' })
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStudentDto: UpdateStudentDto,
  ) {
    return this.studentService.update(id, updateStudentDto);
  }

  @ApiOperation({ summary: '[Admin] Xoá mềm sinh viên' })
  @ApiParam({ name: 'id', type: Number, description: 'ID của sinh viên' })
  @ApiResponse({ status: 200, description: 'Sinh viên đã được xoá.' })
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.studentService.remove(id);
  }

  // ─── ADMIN: Attendance ─────────────────────────────────────────────────────

  @ApiOperation({ summary: '[Admin] Lấy dữ liệu chuyên cần của sinh viên' })
  @ApiParam({ name: 'id', type: Number, description: 'ID của sinh viên' })
  @ApiResponse({ status: 200, description: 'Danh sách chuyên cần.' })
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id/attendances')
  getAttendances(@Param('id', ParseIntPipe) id: number) {
    return this.attendanceService.findByStudent(id);
  }

  @ApiOperation({ summary: '[Admin] Ghi nhận chuyên cần' })
  @ApiParam({ name: 'id', type: Number, description: 'ID của sinh viên' })
  @ApiBody({ type: CreateAttendanceDto })
  @ApiResponse({ status: 201, description: 'Đã ghi nhận chuyên cần.' })
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':id/attendances')
  createAttendance(
    @Param('id', ParseIntPipe) id: number,
    @Body() createAttendanceDto: CreateAttendanceDto,
  ) {
    return this.attendanceService.createForStudent(id, createAttendanceDto);
  }

  // ─── Parent linkage ────────────────────────────────────────────────────────

  @ApiOperation({ summary: '[Admin] Gán phụ huynh cho sinh viên' })
  @ApiParam({ name: 'id', type: Number, description: 'ID của sinh viên' })
  @ApiBody({ type: AssignParentDto })
  @ApiResponse({ status: 201, description: 'Phụ huynh đã được gán.' })
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':id/parents')
  assignParent(
    @Param('id', ParseIntPipe) id: number,
    @Body() assignParentDto: AssignParentDto,
  ) {
    return this.studentService.assignParentToStudent(id, assignParentDto.parent_id);
  }

  @ApiOperation({ summary: '[Admin] Lấy danh sách phụ huynh của sinh viên' })
  @ApiParam({ name: 'id', type: Number, description: 'ID của sinh viên' })
  @ApiResponse({ status: 200, description: 'Danh sách phụ huynh.' })
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id/parents')
  getParents(@Param('id', ParseIntPipe) id: number) {
    return this.studentService.getParentsOfStudent(id);
  }

  @ApiOperation({ summary: '[Admin] Gỡ liên kết phụ huynh khỏi sinh viên' })
  @ApiParam({ name: 'id', type: Number, description: 'ID của sinh viên' })
  @ApiParam({ name: 'pid', type: Number, description: 'ID của phụ huynh' })
  @ApiResponse({ status: 200, description: 'Đã gỡ liên kết.' })
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id/parents/:pid')
  removeParent(
    @Param('id', ParseIntPipe) id: number,
    @Param('pid', ParseIntPipe) pid: number,
  ) {
    return this.studentService.removeParentFromStudent(id, pid);
  }
}
