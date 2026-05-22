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
  Query,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { MessageSenderRole } from '@prisma/client';

@ApiTags('Feedback')
@ApiBearerAuth()
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @ApiOperation({ summary: '[Parent] Tạo feedback ticket mới' })
  @ApiResponse({ status: 201, description: 'Feedback đã được tạo.' })
  @ApiResponse({ status: 429, description: 'Quá nhiều yêu cầu. Thử lại sau.' })
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Roles('parent')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  create(@Request() req, @Body() dto: CreateFeedbackDto) {
    const parentId: number = req.user.userId;
    return this.feedbackService.create(parentId, dto);
  }

  @ApiOperation({ summary: '[Parent] Lấy danh sách feedback của parent hiện tại' })
  @ApiResponse({ status: 200, description: 'Danh sách feedback.' })
  @SkipThrottle()
  @Roles('parent')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('mine')
  findMine(@Request() req) {
    const parentId: number = req.user.userId;
    return this.feedbackService.findByParent(parentId);
  }

  @ApiOperation({ summary: '[Admin] Lấy danh sách phản hồi có phân trang' })
  @ApiQuery({ name: 'status', required: false, example: 'OPEN' })
  @ApiQuery({ name: 'category', required: false, example: 'HOC_TAP' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'sortBy', required: false, example: 'updated_at' })
  @ApiQuery({ name: 'sortOrder', required: false, example: 'desc' })
  @ApiResponse({ status: 200, description: 'Danh sách phản hồi có phân trang.' })
  @SkipThrottle()
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    return this.feedbackService.findAll({
      status, category, search, page, limit,
      sortBy: sortBy as 'updated_at' | 'created_at',
      sortOrder: sortOrder as 'asc' | 'desc',
    });
  }

  @ApiOperation({ summary: '[Admin] Lấy số lượng feedback theo trạng thái' })
  @ApiResponse({ status: 200, description: 'Thống kê feedback.' })
  @SkipThrottle()
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('stats')
  getStats() {
    return this.feedbackService.getStats();
  }

  @ApiOperation({ summary: '[Admin] Lấy analytics phản hồi 6 tháng gần nhất' })
  @ApiResponse({ status: 200, description: 'Analytics feedback.' })
  @SkipThrottle()
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('analytics')
  getAnalytics() {
    return this.feedbackService.getAnalytics();
  }

  @ApiOperation({ summary: '[Admin] Lấy toàn bộ feedback để export' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiResponse({ status: 200, description: 'Danh sách đầy đủ để export.' })
  @SkipThrottle()
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('export')
  getExportData(
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.feedbackService.getExportData({ status, category, search });
  }

  @ApiOperation({ summary: '[Admin/Parent] Lấy chi tiết feedback theo ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Chi tiết feedback.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy.' })
  @SkipThrottle()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.feedbackService.findOne(id);
  }

  @ApiOperation({ summary: '[Admin/Parent] Lấy danh sách messages trong thread' })
  @ApiParam({ name: 'id', type: Number })
  @SkipThrottle()
  @UseGuards(JwtAuthGuard)
  @Get(':id/messages')
  getMessages(@Param('id', ParseIntPipe) id: number) {
    return this.feedbackService.getMessages(id);
  }

  @ApiOperation({ summary: '[Parent] Gửi tin nhắn thêm vào thread' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 429, description: 'Gửi quá nhiều tin nhắn. Thử lại sau.' })
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Roles('parent')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':id/messages')
  addMessageAsParent(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateMessageDto,
  ) {
    const parentId: number = req.user.userId;
    return this.feedbackService.addMessage(id, parentId, MessageSenderRole.PARENT, dto);
  }

  @ApiOperation({ summary: '[Admin] Admin reply vào thread' })
  @ApiParam({ name: 'id', type: Number })
  @SkipThrottle()
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':id/reply')
  addMessageAsAdmin(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateMessageDto,
  ) {
    const adminId: number = req.user.userId;
    return this.feedbackService.addMessage(id, adminId, MessageSenderRole.ADMIN, dto);
  }

  @ApiOperation({ summary: '[Admin] Cập nhật status feedback' })
  @ApiParam({ name: 'id', type: Number })
  @SkipThrottle()
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFeedbackDto,
  ) {
    return this.feedbackService.updateStatus(id, dto);
  }

  @ApiOperation({ summary: '[Admin] Xoá phản hồi' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Đã xoá.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy.' })
  @SkipThrottle()
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.feedbackService.remove(id);
  }
}
