import { ApiPropertyOptional } from '@nestjs/swagger';
import { FeedbackCategory, FeedbackStatus } from '@prisma/client';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

const FEEDBACK_SUMMARY_STATUSES = [
  'ALL',
  FeedbackStatus.OPEN,
  FeedbackStatus.IN_PROGRESS,
] as const;

const FEEDBACK_SUMMARY_CATEGORIES = [
  'ALL',
  ...Object.values(FeedbackCategory),
] as const;

export class FeedbackSummaryQueryDto {
  @ApiPropertyOptional({ enum: FEEDBACK_SUMMARY_STATUSES })
  @IsOptional()
  @IsIn(FEEDBACK_SUMMARY_STATUSES)
  status?: string;

  @ApiPropertyOptional({
    enum: FEEDBACK_SUMMARY_CATEGORIES,
  })
  @IsOptional()
  @IsIn(FEEDBACK_SUMMARY_CATEGORIES)
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  search?: string;
}
