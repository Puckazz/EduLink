import { Type } from 'class-transformer';
import {
  IsEmail,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateStudentDto {
  @IsString()
  @MaxLength(50)
  student_code: string;

  @IsString()
  @MaxLength(100)
  full_name: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  email?: string;

  @IsOptional()
  @IsIn(['DANG_HOC', 'BAO_LUU', 'DINH_CHI'])
  status?: 'DANG_HOC' | 'BAO_LUU' | 'DINH_CHI';

  @IsOptional()
  @IsDateString()
  date_of_birth?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  class?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  study_year?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  cohort?: string;

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
}
