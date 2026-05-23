import { AcademicPeriodStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class AcademicYearQueryDto {
  @IsOptional()
  @IsEnum(AcademicPeriodStatus)
  status?: AcademicPeriodStatus;
}
