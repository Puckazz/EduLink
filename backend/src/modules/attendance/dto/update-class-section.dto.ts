import { ApiPropertyOptional } from '@nestjs/swagger';
import { ClassStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateClassSectionDto {
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

  @ApiPropertyOptional({ enum: ClassStatus })
  @IsEnum(ClassStatus)
  @IsOptional()
  status?: ClassStatus;
}
