import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateSessionDto {
  @ApiProperty({
    example: '2024-09-02',
    description: 'Ngày buổi học (YYYY-MM-DD)',
  })
  @IsDateString()
  session_date: string;

  @ApiProperty({ example: 1, description: 'Buổi số mấy trong học kỳ' })
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  session_no: number;

  @ApiProperty({ required: false, example: 'Học tại phòng lab' })
  @IsString()
  @IsOptional()
  note?: string;
}
