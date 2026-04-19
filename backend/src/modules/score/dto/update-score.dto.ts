import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateScoreDto {
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
