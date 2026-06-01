import { IsIn, IsOptional } from 'class-validator';
import {
  EFFECTIVE_STATUS_VALUES,
  type EffectiveStatus,
} from '../../academic-term/academic-period-status.helper';

export class AcademicYearQueryDto {
  @IsOptional()
  @IsIn(EFFECTIVE_STATUS_VALUES)
  effectiveStatus?: EffectiveStatus;
}
