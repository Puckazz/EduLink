import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateClassSectionDto {
  @ApiPropertyOptional({ example: 'L01' })
  @IsString()
  @IsOptional()
  class_code?: string;

  @ApiPropertyOptional({ example: 'PGS.TS. Nguyễn Văn A' })
  @IsString()
  @IsOptional()
  teacher_name?: string;

  @ApiPropertyOptional({ example: 1, description: 'ID giảng viên' })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  teacher_id?: number;

  @ApiPropertyOptional({ example: 'Thứ 3' })
  @IsString()
  @IsOptional()
  day_of_week?: string;

  @ApiPropertyOptional({ example: '8:00' })
  @IsString()
  @IsOptional()
  start_time?: string;

  @ApiPropertyOptional({ example: '10:00' })
  @IsString()
  @IsOptional()
  end_time?: string;

  @ApiPropertyOptional({ example: 'B2.101' })
  @IsString()
  @IsOptional()
  room?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  term_id?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  subject_id?: number;
}
