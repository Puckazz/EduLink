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
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Admin')
@ApiBearerAuth()
@Roles('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @ApiOperation({ summary: 'Tạo tài khoản admin mới' })
  @ApiBody({ type: CreateAdminDto })
  @ApiResponse({ status: 201, description: 'Admin đã được tạo.' })
  @Post()
  create(@Body() createAdminDto: CreateAdminDto) {
    return this.adminService.create(createAdminDto);
  }

  @ApiOperation({ summary: 'Lấy danh sách tất cả admin' })
  @ApiResponse({ status: 200, description: 'Danh sách admin.' })
  @Get()
  findAll() {
    return this.adminService.findAll();
  }

  @ApiOperation({ summary: 'Lấy thông tin admin theo ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID của admin' })
  @ApiResponse({ status: 200, description: 'Thông tin admin.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy admin.' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.findOne(id);
  }

  @ApiOperation({ summary: 'Cập nhật thông tin admin' })
  @ApiParam({ name: 'id', type: Number, description: 'ID của admin' })
  @ApiBody({ type: UpdateAdminDto })
  @ApiResponse({ status: 200, description: 'Admin đã được cập nhật.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy admin.' })
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAdminDto: UpdateAdminDto,
  ) {
    return this.adminService.update(id, updateAdminDto);
  }

  @ApiOperation({ summary: 'Xoá admin theo ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID của admin' })
  @ApiResponse({ status: 200, description: 'Admin đã được xoá.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy admin.' })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.remove(id);
  }
}
