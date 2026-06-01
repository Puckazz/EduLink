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
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AcademicTermService } from './academic-term.service';
import { AcademicTermQueryDto } from './dto/academic-term-query.dto';
import { CreateAcademicTermDto } from './dto/create-academic-term.dto';
import { UpdateAcademicTermDto } from './dto/update-academic-term.dto';

@ApiTags('Academic Terms')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('academic-terms')
export class AcademicTermController {
  constructor(private readonly academicTermService: AcademicTermService) {}

  @ApiOperation({ summary: '[All] Lấy danh sách học kỳ' })
  @ApiQuery({ name: 'academic_year_id', required: false, type: Number })
  @ApiQuery({
    name: 'effectiveStatus',
    required: false,
    enum: ['UPCOMING', 'ONGOING', 'FINISHED'],
  })
  @ApiResponse({ status: 200, description: 'Danh sách học kỳ.' })
  @Roles('admin', 'teacher', 'parent')
  @Get()
  findAll(@Query() query: AcademicTermQueryDto) {
    return this.academicTermService.findAll(
      query.academic_year_id,
      query.effectiveStatus,
    );
  }

  @ApiOperation({ summary: '[All] Lấy học kỳ đang hoạt động' })
  @ApiResponse({ status: 200, description: 'Học kỳ đang hoạt động.' })
  @Roles('admin', 'teacher', 'parent')
  @Get('active')
  findActive() {
    return this.academicTermService.findActive();
  }

  @ApiOperation({ summary: '[Admin] Tạo học kỳ' })
  @ApiBody({ type: CreateAcademicTermDto })
  @Roles('admin')
  @Post()
  create(@Body() dto: CreateAcademicTermDto) {
    return this.academicTermService.create(dto);
  }

  @ApiOperation({ summary: '[Admin] Cập nhật học kỳ' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateAcademicTermDto })
  @Roles('admin')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAcademicTermDto,
  ) {
    return this.academicTermService.update(id, dto);
  }

  @ApiOperation({ summary: '[Admin] Xóa học kỳ chưa có dữ liệu' })
  @ApiParam({ name: 'id', type: Number })
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.academicTermService.remove(id);
  }
}
