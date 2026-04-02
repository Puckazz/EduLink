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

export class StudentListQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @IsOptional()
  @IsIn(['DANG_HOC', 'BAO_LUU', 'DINH_CHI'])
  status?: 'DANG_HOC' | 'BAO_LUU' | 'DINH_CHI';

  @IsOptional()
  @IsString()
  @MaxLength(50)
  class?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  parent_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  major_id?: number;

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
  @IsIn(['student_id', 'full_name', 'created_at'])
  sort_by: 'student_id' | 'full_name' | 'created_at' = 'student_id';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sort_order: 'asc' | 'desc' = 'asc';
}
