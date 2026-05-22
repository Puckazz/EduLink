import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { SubjectService } from './subject.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { SubjectListQueryDto } from './dto/subject-list-query.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Subjects')
@ApiBearerAuth()
@Roles('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('subjects')
export class SubjectController {
  constructor(private readonly subjectService: SubjectService) {}

  @ApiOperation({ summary: '[Admin] Tạo môn học mới' })
  @ApiBody({ type: CreateSubjectDto })
  @ApiResponse({ status: 201, description: 'Môn học đã được tạo.' })
  @Post()
  create(@Body() createSubjectDto: CreateSubjectDto) {
    return this.subjectService.create(createSubjectDto);
  }

  @ApiOperation({ summary: '[Admin] Lấy danh sách môn học' })
  @ApiResponse({ status: 200, description: 'Danh sách môn học.' })
  @Get()
  findAll(@Query() query: SubjectListQueryDto) {
    return this.subjectService.findAll(query);
  }

  @ApiOperation({ summary: '[Admin] Lấy chi tiết môn học theo ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID của môn học' })
  @ApiResponse({ status: 200, description: 'Thông tin môn học.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy môn học.' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.subjectService.findOne(id);
  }

  @ApiOperation({ summary: '[Admin] Cập nhật môn học' })
  @ApiParam({ name: 'id', type: Number, description: 'ID của môn học' })
  @ApiBody({ type: UpdateSubjectDto })
  @ApiResponse({ status: 200, description: 'Môn học đã được cập nhật.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy môn học.' })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSubjectDto: UpdateSubjectDto,
  ) {
    return this.subjectService.update(id, updateSubjectDto);
  }

  @ApiOperation({ summary: '[Admin] Xoá môn học' })
  @ApiParam({ name: 'id', type: Number, description: 'ID của môn học' })
  @ApiResponse({ status: 200, description: 'Môn học đã được xoá.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy môn học.' })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.subjectService.remove(id);
  }
}
