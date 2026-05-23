import { ApiPropertyOptional } from '@nestjs/swagger';
import { ClassStatus } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
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

  @ApiPropertyOptional({ example: 'HK1-2025' })
  @IsString()
  @IsOptional()
  semester?: string;

  @ApiPropertyOptional({ enum: ClassStatus })
  @IsEnum(ClassStatus)
  @IsOptional()
  status?: ClassStatus;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  subject_id?: number;
}
