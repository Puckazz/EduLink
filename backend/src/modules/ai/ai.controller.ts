import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
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
import {
  FeedbackSummaryResponseDto,
  GenerateNotificationResponseDto,
  SuggestFeedbackReplyResponseDto,
} from './dto/ai-responses.dto';

@ApiTags('AI')
@ApiBearerAuth()
@Controller('ai')
@Roles('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @ApiOperation({ summary: '[Admin] Tạo nháp thông báo bằng AI' })
  @ApiResponse({ status: 201, type: GenerateNotificationResponseDto })
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('notification/generate')
  generateNotification(@Body() dto: GenerateNotificationDto) {
    return this.aiService.generateNotificationDraft(dto);
  }

  @ApiOperation({ summary: '[Admin] Tóm tắt phản hồi đang cần xử lý bằng AI' })
  @ApiResponse({ status: 200, type: FeedbackSummaryResponseDto })
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Get('feedback/summary')
  summarizeFeedback(@Query() query: FeedbackSummaryQueryDto) {
    return this.aiService.summarizeFeedback(query);
  }

  @ApiOperation({ summary: '[Admin] Gợi ý nội dung trả lời feedback bằng AI' })
  @ApiResponse({ status: 201, type: SuggestFeedbackReplyResponseDto })
  @Throttle({ default: { limit: 15, ttl: 60_000 } })
  @Post('feedback/:id/suggest-reply')
  suggestFeedbackReply(@Param('id', ParseIntPipe) id: number) {
    return this.aiService.suggestFeedbackReply(id);
  }
}
