import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Min } from 'class-validator';
import {
  EFFECTIVE_STATUS_VALUES,
  type EffectiveStatus,
} from '../academic-period-status.helper';

export class AcademicTermQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  academic_year_id?: number;

  @IsOptional()
  @IsIn(EFFECTIVE_STATUS_VALUES)
  effectiveStatus?: EffectiveStatus;
}
