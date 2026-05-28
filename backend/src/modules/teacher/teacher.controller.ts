import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { TeacherListQueryDto } from './dto/teacher-list-query.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { TeacherService } from './teacher.service';

@ApiTags('Teachers')
@ApiBearerAuth()
@Roles('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('teachers')
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @ApiOperation({ summary: '[Admin] Tạo tài khoản giảng viên mới' })
  @ApiBody({ type: CreateTeacherDto })
  @ApiResponse({ status: 201, description: 'Giảng viên đã được tạo.' })
  @Post()
  create(@Body() createTeacherDto: CreateTeacherDto) {
    return this.teacherService.create(createTeacherDto);
  }

  @ApiOperation({ summary: '[Admin] Lấy danh sách giảng viên' })
  @ApiResponse({ status: 200, description: 'Danh sách giảng viên.' })
  @Get()
  findAll(@Query() query: TeacherListQueryDto) {
    return this.teacherService.findAll(query);
  }

  @ApiOperation({ summary: '[Admin] Lấy thông tin giảng viên theo ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID của giảng viên' })
  @ApiResponse({ status: 200, description: 'Thông tin giảng viên.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy giảng viên.' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.teacherService.findOne(id);
  }

  @ApiOperation({ summary: '[Admin] Cập nhật thông tin giảng viên' })
  @ApiParam({ name: 'id', type: Number, description: 'ID của giảng viên' })
  @ApiBody({ type: UpdateTeacherDto })
  @ApiResponse({ status: 200, description: 'Giảng viên đã được cập nhật.' })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTeacherDto: UpdateTeacherDto,
  ) {
    return this.teacherService.update(id, updateTeacherDto);
  }

  @ApiOperation({ summary: '[Admin] Xóa giảng viên' })
  @ApiParam({ name: 'id', type: Number, description: 'ID của giảng viên' })
  @ApiResponse({ status: 200, description: 'Giảng viên đã được xóa.' })
  @ApiResponse({ status: 400, description: 'Giảng viên còn lớp học phần.' })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.teacherService.remove(id);
  }
}
