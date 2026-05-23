import { ApiProperty } from '@nestjs/swagger';
import { AcademicPeriodStatus } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateAcademicYearDto {
  @ApiProperty({ example: '2025 - 2026' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @ApiProperty({ example: '2025-09-01' })
  @IsDateString()
  start_date: string;

  @ApiProperty({ example: '2026-08-31' })
  @IsDateString()
  end_date: string;

  @ApiProperty({
    enum: AcademicPeriodStatus,
    default: AcademicPeriodStatus.UPCOMING,
  })
  @IsOptional()
  @IsEnum(AcademicPeriodStatus)
  status?: AcademicPeriodStatus;
}
