import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  IsBoolean,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FeedbackCategory } from '@prisma/client';

export class CreateFaqDto {
  @ApiProperty({ example: 'Làm sao để xem điểm của con tôi?' })
  @IsString()
  @IsNotEmpty()
  @MinLength(5, { message: 'Câu hỏi phải có ít nhất 5 ký tự' })
  question: string;

  @ApiProperty({ example: 'Quý phụ huynh đăng nhập vào hệ thống, vào mục Điểm danh → Điểm số để xem kết quả học tập của con.' })
  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'Câu trả lời phải có ít nhất 10 ký tự' })
  answer: string;

  @ApiProperty({ enum: FeedbackCategory, default: FeedbackCategory.KHAC })
  @IsEnum(FeedbackCategory)
  category: FeedbackCategory;

  @ApiPropertyOptional({ example: 0, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sort_order?: number;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
