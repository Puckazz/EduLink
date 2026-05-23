import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class UpdateAttendanceDto {
  @ApiPropertyOptional({ description: 'ID học kỳ', example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  term_id?: number;

  @ApiPropertyOptional({ description: 'Tổng số buổi học', example: 30 })
  @IsInt()
  @Min(0)
  @IsOptional()
  total_sessions?: number;

  @ApiPropertyOptional({ description: 'Số buổi vắng', example: 3 })
  @IsInt()
  @Min(0)
  @IsOptional()
  absent_sessions?: number;
}
