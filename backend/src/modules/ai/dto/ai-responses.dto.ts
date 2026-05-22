import { ApiProperty } from '@nestjs/swagger';

export class GenerateNotificationResponseDto {
  @ApiProperty()
  title: string;

  @ApiProperty()
  content: string;
}

export class FeedbackCategoryBreakdownDto {
  @ApiProperty()
  category: string;

  @ApiProperty()
  count: number;
}

export class FeedbackSummaryResponseDto {
  @ApiProperty()
  summary: string;

  @ApiProperty()
  urgentCount: number;

  @ApiProperty()
  stats: Record<string, number>;

  @ApiProperty()
  analytics: Record<string, unknown>;

  @ApiProperty({ type: [FeedbackCategoryBreakdownDto] })
  categoryBreakdown: FeedbackCategoryBreakdownDto[];

  @ApiProperty({ type: [String] })
  suggestedActions: string[];
}

export class SuggestFeedbackReplyResponseDto {
  @ApiProperty()
  content: string;
}
