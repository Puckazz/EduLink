import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FeedbackCategory } from '@prisma/client';

export class CreateFeedbackDto {
  @ApiProperty({ example: 'Hỏi về lịch học phụ đạo Toán' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ enum: FeedbackCategory, default: FeedbackCategory.KHAC })
  @IsEnum(FeedbackCategory)
  category: FeedbackCategory;

  @ApiProperty({ example: 'Kính gửi Ban Giám hiệu, tôi muốn hỏi về...' })
  @IsString()
  @MinLength(10, { message: 'Nội dung phản hồi cần ít nhất 10 ký tự' })
  content: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  student_id?: number;
}
