import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateConversationDto {
  @ApiProperty({
    example: 'Tìm hiểu điểm thi môn Lý',
    description: 'Tiêu đề cuộc trò chuyện mới',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title: string;
}
