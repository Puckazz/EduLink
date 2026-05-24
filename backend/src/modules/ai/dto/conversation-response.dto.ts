import { ApiProperty } from '@nestjs/swagger';

export class ConversationResponseDto {
  @ApiProperty()
  conversation_id: number;

  @ApiProperty()
  title: string;

  @ApiProperty()
  student_id: number | null;

  @ApiProperty()
  created_at: Date;
}
