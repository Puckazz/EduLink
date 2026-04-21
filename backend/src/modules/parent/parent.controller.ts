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
import { ParentService } from './parent.service';
import { CreateParentDto } from './dto/create-parent.dto';
import { UpdateParentDto } from './dto/update-parent.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Parents')
@ApiBearerAuth()
@Roles('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('parents')
export class ParentController {
  constructor(private readonly parentService: ParentService) {}

  @ApiOperation({ summary: '[Admin] Tạo tài khoản phụ huynh mới' })
  @ApiBody({ type: CreateParentDto })
  @ApiResponse({ status: 201, description: 'Phụ huynh đã được tạo.' })
  @Post()
  create(@Body() createParentDto: CreateParentDto) {
    return this.parentService.create(createParentDto);
  }

  @ApiOperation({ summary: '[Admin] Lấy danh sách phụ huynh' })
  @ApiResponse({ status: 200, description: 'Danh sách phụ huynh.' })
  @Get()
  findAll() {
    return this.parentService.findAll();
  }

  @ApiOperation({ summary: '[Admin] Lấy thông tin phụ huynh theo ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID của phụ huynh' })
  @ApiResponse({ status: 200, description: 'Thông tin phụ huynh.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy phụ huynh.' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.parentService.findOne(id);
  }

  @ApiOperation({ summary: '[Admin] Cập nhật thông tin phụ huynh' })
  @ApiParam({ name: 'id', type: Number, description: 'ID của phụ huynh' })
  @ApiBody({ type: UpdateParentDto })
  @ApiResponse({ status: 200, description: 'Phụ huynh đã được cập nhật.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy phụ huynh.' })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateParentDto: UpdateParentDto,
  ) {
    return this.parentService.update(id, updateParentDto);
  }

  @ApiOperation({ summary: '[Admin] Xoá phụ huynh' })
  @ApiParam({ name: 'id', type: Number, description: 'ID của phụ huynh' })
  @ApiResponse({ status: 200, description: 'Phụ huynh đã được xoá.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy phụ huynh.' })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.parentService.remove(id);
  }
}
