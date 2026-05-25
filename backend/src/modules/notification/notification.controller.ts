import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @ApiOperation({
    summary: '[Admin] Lấy danh sách thông báo đã gửi (broadcast)',
  })
  @ApiResponse({ status: 200, description: 'Danh sách thông báo.' })
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  findAll() {
    return this.notificationService.findAll();
  }

  @ApiOperation({ summary: '[Admin] Lấy thông báo phản hồi nhận được' })
  @ApiResponse({ status: 200, description: 'Danh sách thông báo nhận được.' })
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('inbox')
  async findInbox(@Request() req: { user: { userId: number } }) {
    const result = await this.notificationService.findForAdmin(req.user.userId);
    console.log('findInbox result length:', result.length);
    return result;
  }

  @ApiOperation({ summary: '[Admin] Tạo thông báo gửi đến phụ huynh' })
  @ApiBody({ type: CreateNotificationDto })
  @ApiResponse({ status: 201, description: 'Thông báo đã được tạo.' })
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  create(
    @Body() createNotificationDto: CreateNotificationDto,
    @Request() req: { user: { userId: number } },
  ) {
    return this.notificationService.create(
      req.user.userId,
      createNotificationDto,
    );
  }

  @ApiOperation({ summary: '[Admin] Cập nhật nội dung thông báo' })
  @ApiParam({ name: 'id', type: Number, description: 'ID thông báo' })
  @ApiBody({ type: UpdateNotificationDto })
  @ApiResponse({ status: 200, description: 'Thông báo đã được cập nhật.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy thông báo.' })
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateNotificationDto: UpdateNotificationDto,
  ) {
    return this.notificationService.update(id, updateNotificationDto);
  }

  @ApiOperation({ summary: '[Admin] Xóa thông báo' })
  @ApiParam({ name: 'id', type: Number, description: 'ID thông báo' })
  @ApiResponse({ status: 200, description: 'Thông báo đã được xóa.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy thông báo.' })
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.notificationService.remove(id);
  }
}
