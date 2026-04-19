import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateAttendanceDto {
  @ApiProperty({ description: 'Học kỳ (e.g. "HK1 2024-2025")', example: 'HK1 2024-2025' })
  @IsString()
  @IsNotEmpty()
  semester: string;

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
