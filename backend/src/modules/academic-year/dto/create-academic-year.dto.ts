import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
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
}
