import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateScoreDto {
  @ApiProperty({ description: 'ID môn học', example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  subject_id: number;

  @ApiProperty({ description: 'Học kỳ', example: 'HK1 2024-2025' })
  @IsString()
  @MaxLength(20)
  semester: string;

  @ApiProperty({ description: 'Năm học', example: 2024 })
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  year: number;

  @ApiPropertyOptional({ description: 'Điểm bài tập (0-10)', example: 8.5 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(10)
  assignment?: number;

  @ApiPropertyOptional({ description: 'Điểm giữa kỳ (0-10)', example: 7.5 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(10)
  midterm?: number;

  @ApiPropertyOptional({ description: 'Điểm cuối kỳ (0-10)', example: 9.0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(10)
  final?: number;

  @ApiPropertyOptional({ description: 'Ghi chú', example: 'Học sinh nỗ lực' })
  @IsOptional()
  @IsString()
  note?: string;
}
