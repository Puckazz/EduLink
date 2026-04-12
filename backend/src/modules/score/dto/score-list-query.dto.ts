import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class ScoreListQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  subject_id?: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  semester?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  year?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;

  @IsOptional()
  @IsIn(['score_id', 'semester', 'year', 'score_value', 'created_at'])
  sort_by: 'score_id' | 'semester' | 'year' | 'score_value' | 'created_at' =
    'score_id';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sort_order: 'asc' | 'desc' = 'asc';
}
