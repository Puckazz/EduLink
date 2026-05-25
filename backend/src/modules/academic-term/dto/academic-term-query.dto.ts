import { AcademicPeriodStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';

export class AcademicTermQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  academic_year_id?: number;

  @IsOptional()
  @IsEnum(AcademicPeriodStatus)
  status?: AcademicPeriodStatus;
}
