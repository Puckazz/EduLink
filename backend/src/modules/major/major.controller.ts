import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { MajorService } from './major.service';
import { CreateMajorDto } from './dto/create-major.dto';
import { UpdateMajorDto } from './dto/update-major.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Majors')
@ApiBearerAuth()
@Roles('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('major')
export class MajorController {
  constructor(private readonly majorService: MajorService) {}

  @ApiOperation({ summary: '[Admin] Tạo ngành học mới' })
  @ApiBody({ type: CreateMajorDto })
  @ApiResponse({ status: 201, description: 'Ngành học đã được tạo.' })
  @Post()
  create(@Body() createMajorDto: CreateMajorDto) {
    return this.majorService.create(createMajorDto);
  }

  @ApiOperation({ summary: '[Admin] Lấy danh sách ngành học' })
  @ApiResponse({ status: 200, description: 'Danh sách ngành học.' })
  @Get()
  findAll() {
    return this.majorService.findAll();
  }

  @ApiOperation({ summary: '[Admin] Lấy chi tiết ngành học theo ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID của ngành học' })
  @ApiResponse({ status: 200, description: 'Thông tin ngành học.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy ngành học.' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.majorService.findOne(id);
  }

  @ApiOperation({ summary: '[Admin] Cập nhật ngành học' })
  @ApiParam({ name: 'id', type: Number, description: 'ID của ngành học' })
  @ApiBody({ type: UpdateMajorDto })
  @ApiResponse({ status: 200, description: 'Ngành học đã được cập nhật.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy ngành học.' })
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMajorDto: UpdateMajorDto,
  ) {
    return this.majorService.update(id, updateMajorDto);
  }

  @ApiOperation({ summary: '[Admin] Xoá ngành học' })
  @ApiParam({ name: 'id', type: Number, description: 'ID của ngành học' })
  @ApiResponse({ status: 200, description: 'Ngành học đã được xoá.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy ngành học.' })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.majorService.remove(id);
  }
}
