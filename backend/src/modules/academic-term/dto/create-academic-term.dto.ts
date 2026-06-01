import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AcademicTermCode } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateAcademicTermDto {
  @ApiProperty({ enum: AcademicTermCode, example: AcademicTermCode.HK1 })
  @IsEnum(AcademicTermCode)
  code: AcademicTermCode;

  @ApiProperty({ example: 1, description: 'ID năm học' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  academic_year_id: number;

  @ApiPropertyOptional({ example: 'Học kỳ I - 2025 - 2026' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiProperty({ example: '2025-09-01' })
  @IsDateString()
  start_date: string;

  @ApiProperty({ example: '2026-01-15' })
  @IsDateString()
  end_date: string;
}
