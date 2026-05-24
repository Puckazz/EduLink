import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class ChatDto {
  @ApiProperty({ example: 'Con tôi học kỳ này điểm thế nào?' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  message: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  conversationId: number;
}
