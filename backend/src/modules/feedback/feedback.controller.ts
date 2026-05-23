import {
  Controller,
  BadRequestException,
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
  UploadedFiles,
  UseInterceptors,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
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
import { UPLOAD_CONSTANTS } from '../../common/upload/upload.constants';

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

  @ApiOperation({
    summary: '[Parent] Lấy danh sách feedback của parent hiện tại',
  })
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
  @ApiResponse({
    status: 200,
    description: 'Danh sách phản hồi có phân trang.',
  })
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
      status,
      category,
      search,
      page,
      limit,
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

  @ApiOperation({
    summary: '[Admin/Parent] Lấy danh sách messages trong thread',
  })
  @ApiParam({ name: 'id', type: Number })
  @SkipThrottle()
  @UseGuards(JwtAuthGuard)
  @Get(':id/messages')
  getMessages(@Param('id', ParseIntPipe) id: number) {
    return this.feedbackService.getMessages(id);
  }

  @ApiOperation({
    summary:
      '[Parent] Gửi tin nhắn thêm vào thread (JSON, attachments đã pre-upload)',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 429,
    description: 'Gửi quá nhiều tin nhắn. Thử lại sau.',
  })
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Roles('parent')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':id/messages')
  async addMessageAsParent(
    @Request() req: { user: { userId: number } },
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateMessageDto,
  ) {
    return this.feedbackService.addMessage(
      id,
      req.user.userId,
      MessageSenderRole.PARENT,
      dto,
    );
  }

  @ApiOperation({
    summary: '[Admin] Admin reply vào thread (JSON, attachments đã pre-upload)',
  })
  @ApiParam({ name: 'id', type: Number })
  @SkipThrottle()
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':id/reply')
  async addMessageAsAdmin(
    @Request() req: { user: { userId: number } },
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateMessageDto,
  ) {
    return this.feedbackService.addMessage(
      id,
      req.user.userId,
      MessageSenderRole.ADMIN,
      dto,
    );
  }

  @ApiOperation({
    summary: '[Admin/Parent] Pre-upload file đính kèm lên Cloudinary',
  })
  @ApiResponse({
    status: 201,
    description: 'Trả về metadata của file đã upload.',
  })
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Roles('admin', 'parent')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('attachments/pre-upload')
  @UseInterceptors(
    FilesInterceptor('file', 1, {
      storage: memoryStorage(),
      limits: { fileSize: UPLOAD_CONSTANTS.ATTACHMENT.MAX_SIZE_BYTES },
    }),
  )
  async preUploadAttachment(@UploadedFiles() files: Express.Multer.File[]) {
    const file = files?.[0];
    if (!file) {
      return { error: 'Vui lòng chọn file để upload.' };
    }
    const result = await this.feedbackService.preUploadAttachment(file);
    return {
      url: result.url,
      public_id: result.publicId,
      file_name: result.originalName,
      file_type: result.mimeType,
      file_size: result.bytes,
      is_image: result.isImage,
    };
  }

  @ApiOperation({
    summary: '[Admin/Parent] Xóa file đã pre-upload nhưng chưa gửi',
  })
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Roles('admin', 'parent')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('attachments/pre-upload')
  async deletePreUploadedAttachment(
    @Body() dto: { public_id: string; is_image?: boolean },
  ) {
    if (!dto.public_id) {
      throw new BadRequestException('Thiếu public_id của file cần xóa.');
    }
    return this.feedbackService.deletePreUploadedAttachment(
      dto.public_id,
      Boolean(dto.is_image),
    );
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

  @ApiOperation({ summary: '[Admin/Parent] Tải xuống file đính kèm qua proxy' })
  @ApiParam({ name: 'attachmentId', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Stream file với Content-Disposition.',
  })
  @ApiResponse({ status: 403, description: 'Không có quyền.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy file.' })
  @SkipThrottle()
  @Roles('admin', 'parent')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('attachments/:attachmentId/download')
  async downloadAttachment(
    @Param('attachmentId', ParseIntPipe) attachmentId: number,
    @Request() req: { user: { userId: number; role: string } },
    @Res() res: Response,
  ) {
    const { stream, fileName, mimeType } =
      await this.feedbackService.downloadAttachment(
        attachmentId,
        req.user.userId,
        req.user.role,
      );

    // Encode tên file theo RFC 5987 để hỗ trợ tiếng Việt và ký tự đặc biệt
    const encodedName = encodeURIComponent(fileName);
    res.setHeader('Content-Type', mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodedName}"; filename*=UTF-8''${encodedName}`,
    );
    (stream as NodeJS.ReadableStream).pipe(res);
  }
}
