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
import { AcademicYearService } from './academic-year.service';
import { AcademicYearQueryDto } from './dto/academic-year-query.dto';
import { CreateAcademicYearDto } from './dto/create-academic-year.dto';
import { UpdateAcademicYearDto } from './dto/update-academic-year.dto';

@ApiTags('Academic Years')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('academic-years')
export class AcademicYearController {
  constructor(private readonly academicYearService: AcademicYearService) {}

  @ApiOperation({ summary: '[All] Lấy danh sách năm học' })
  @ApiResponse({ status: 200, description: 'Danh sách năm học.' })
  @Roles('admin', 'teacher', 'parent')
  @Get()
  findAll(@Query() query: AcademicYearQueryDto) {
    return this.academicYearService.findAll(query.status);
  }

  @ApiOperation({ summary: '[All] Lấy chi tiết năm học' })
  @ApiParam({ name: 'id', type: Number })
  @Roles('admin', 'teacher', 'parent')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.academicYearService.findOne(id);
  }

  @ApiOperation({ summary: '[Admin] Tạo năm học' })
  @ApiBody({ type: CreateAcademicYearDto })
  @Roles('admin')
  @Post()
  create(@Body() dto: CreateAcademicYearDto) {
    return this.academicYearService.create(dto);
  }

  @ApiOperation({ summary: '[Admin] Cập nhật năm học' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateAcademicYearDto })
  @Roles('admin')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAcademicYearDto,
  ) {
    return this.academicYearService.update(id, dto);
  }

  @ApiOperation({ summary: '[Admin] Xóa năm học chưa có học kỳ' })
  @ApiParam({ name: 'id', type: Number })
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.academicYearService.remove(id);
  }
}
