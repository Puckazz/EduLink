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
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AiService } from './ai.service';
import { GenerateNotificationDto } from './dto/generate-notification.dto';
import { FeedbackSummaryQueryDto } from './dto/feedback-summary-query.dto';
import { ChatDto } from './dto/chat.dto';
import { ChatHistoryQueryDto } from './dto/chat-history-query.dto';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { ConversationResponseDto } from './dto/conversation-response.dto';
import {
  ChatResponseDto,
  ChatHistoryResponseDto,
} from './dto/chat-response.dto';
import {
  FeedbackSummaryResponseDto,
  GenerateNotificationResponseDto,
  SuggestFeedbackReplyResponseDto,
} from './dto/ai-responses.dto';

@ApiTags('AI')
@ApiBearerAuth()
@Controller('ai')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @ApiOperation({ summary: '[Admin] Tạo nháp thông báo bằng AI' })
  @ApiResponse({ status: 201, type: GenerateNotificationResponseDto })
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Roles('admin')
  @Post('notification/generate')
  generateNotification(@Body() dto: GenerateNotificationDto) {
    return this.aiService.generateNotificationDraft(dto);
  }

  @ApiOperation({ summary: '[Admin] Tóm tắt phản hồi đang cần xử lý bằng AI' })
  @ApiResponse({ status: 200, type: FeedbackSummaryResponseDto })
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Roles('admin')
  @Get('feedback/summary')
  summarizeFeedback(@Query() query: FeedbackSummaryQueryDto) {
    return this.aiService.summarizeFeedback(query);
  }

  @ApiOperation({ summary: '[Admin] Gợi ý nội dung trả lời feedback bằng AI' })
  @ApiResponse({ status: 201, type: SuggestFeedbackReplyResponseDto })
  @Throttle({ default: { limit: 15, ttl: 60_000 } })
  @Roles('admin')
  @Post('feedback/:id/suggest-reply')
  suggestFeedbackReply(@Param('id', ParseIntPipe) id: number) {
    return this.aiService.suggestFeedbackReply(id);
  }

  @ApiOperation({ summary: '[Parent] Gửi tin nhắn chat với AI' })
  @ApiResponse({ status: 201, type: ChatResponseDto })
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Roles('parent')
  @Post('chat')
  chat(@Request() req: { user: { userId: number } }, @Body() dto: ChatDto) {
    return this.aiService.chat(req.user.userId, dto);
  }

  @ApiOperation({ summary: '[Parent] Tạo cuộc trò chuyện mới' })
  @ApiResponse({ status: 201, type: ConversationResponseDto })
  @Roles('parent')
  @Post('chat/conversations')
  createConversation(
    @Request() req: { user: { userId: number } },
    @Body() dto: CreateConversationDto,
  ) {
    return this.aiService.createConversation(req.user.userId, dto);
  }

  @ApiOperation({ summary: '[Parent] Lấy danh sách các cuộc trò chuyện' })
  @ApiResponse({ status: 200, type: [ConversationResponseDto] })
  @Roles('parent')
  @Get('chat/conversations')
  getConversations(
    @Request() req: { user: { userId: number } },
    @Query('studentId') studentId?: string,
  ) {
    const sId = studentId ? Number(studentId) : undefined;
    return this.aiService.getConversations(req.user.userId, sId);
  }

  @ApiOperation({ summary: '[Parent] Đổi tên tiêu đề cuộc trò chuyện' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: ConversationResponseDto })
  @Roles('parent')
  @Patch('chat/conversations/:id')
  updateConversation(
    @Request() req: { user: { userId: number } },
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateConversationDto,
  ) {
    return this.aiService.updateConversation(req.user.userId, id, dto);
  }

  @ApiOperation({ summary: '[Parent] Xóa một cuộc trò chuyện' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200 })
  @Roles('parent')
  @Delete('chat/conversations/:id')
  deleteConversation(
    @Request() req: { user: { userId: number } },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.aiService.deleteConversation(req.user.userId, id);
  }

  @ApiOperation({
    summary: '[Parent] Lấy lịch sử chat của một cuộc trò chuyện',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: ChatHistoryResponseDto })
  @Roles('parent')
  @Get('chat/conversations/:id/history')
  getChatHistory(
    @Request() req: { user: { userId: number } },
    @Param('id', ParseIntPipe) id: number,
    @Query() query: ChatHistoryQueryDto,
  ) {
    return this.aiService.getChatHistory(req.user.userId, id, query);
  }

  @ApiOperation({ summary: '[Parent] Xóa toàn bộ các cuộc trò chuyện' })
  @ApiResponse({ status: 200 })
  @Roles('parent')
  @Delete('chat/history')
  clearChatHistory(@Request() req: { user: { userId: number } }) {
    return this.aiService.clearChatHistory(req.user.userId);
  }

  @ApiOperation({
    summary: '[Parent] Xóa toàn bộ cuộc trò chuyện của sinh viên',
  })
  @ApiParam({ name: 'studentId', type: Number })
  @ApiResponse({ status: 200 })
  @Roles('parent')
  @Delete('chat/history/student/:studentId')
  clearChatHistoryByStudent(
    @Request() req: { user: { userId: number } },
    @Param('studentId', ParseIntPipe) studentId: number,
  ) {
    return this.aiService.clearChatHistoryByStudent(req.user.userId, studentId);
  }
}
