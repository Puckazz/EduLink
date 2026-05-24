import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateConversationDto {
  @ApiProperty({ example: 1, description: 'ID của sinh viên liên kết' })
  @IsInt()
  @IsNotEmpty()
  studentId: number;

  @ApiPropertyOptional({ example: 'Hỏi về điểm số kì 1', description: 'Tiêu đề cuộc trò chuyện' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  title?: string;
}
