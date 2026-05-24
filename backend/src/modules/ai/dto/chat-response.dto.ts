import { ApiProperty } from '@nestjs/swagger';

export class ChatResponseDto {
  @ApiProperty()
  reply: string;

  @ApiProperty({ type: [String] })
  sources: string[];
}

export class ChatHistoryItemDto {
  @ApiProperty()
  chat_id: number;

  @ApiProperty()
  conversation_id: number;

  @ApiProperty()
  role: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  created_at: Date;
}

export class ChatHistoryResponseDto {
  @ApiProperty({ type: [ChatHistoryItemDto] })
  data: ChatHistoryItemDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}
