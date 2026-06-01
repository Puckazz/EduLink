import { Type } from 'class-transformer';
import {
  IsInt,
  IsIn,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  EFFECTIVE_STATUS_VALUES,
  type EffectiveStatus,
} from '../../academic-term/academic-period-status.helper';

export class ClassSectionListQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  term_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  academic_year_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  major_id?: number;

  @IsOptional()
  @IsIn(EFFECTIVE_STATUS_VALUES)
  effectiveStatus?: EffectiveStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  limit: number = 12;
}
