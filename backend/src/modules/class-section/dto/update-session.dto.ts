import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateSessionDto {
  @ApiPropertyOptional({
    example: '2024-09-09',
    description: 'Ngày buổi học mới (YYYY-MM-DD)',
  })
  @IsDateString()
  @IsOptional()
  session_date?: string;

  @ApiPropertyOptional({
    example: 'Học tại phòng lab',
    description: 'Ghi chú buổi học',
  })
  @IsString()
  @IsOptional()
  note?: string;
}
