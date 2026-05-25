import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class ScorebookQueryDto {
  @ApiPropertyOptional({
    description: 'Lọc theo ngành học',
    example: 'Công nghệ thông tin',
  })
  @IsOptional()
  @IsString()
  major?: string;

  @ApiPropertyOptional({ description: 'Lọc theo lớp', example: 'CNTT01' })
  @IsOptional()
  @IsString()
  class?: string;

  @ApiPropertyOptional({ description: 'Tìm theo tên hoặc MSSV' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'ID môn học', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  subject_id?: number;

  @ApiPropertyOptional({ description: 'ID học kỳ', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  term_id?: number;

  @ApiPropertyOptional({ description: 'ID năm học', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  academic_year_id?: number;
}

export class BulkUpdateScoreRowDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  student_id: number;

  @IsOptional()
  @Type(() => Number)
  assignment?: number;

  @IsOptional()
  @Type(() => Number)
  midterm?: number;

  @IsOptional()
  @Type(() => Number)
  final?: number;

  @IsOptional()
  @IsString()
  note?: string;
}

export class BulkUpdateScoreDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  subject_id: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  term_id: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkUpdateScoreRowDto)
  rows: BulkUpdateScoreRowDto[];

  @IsOptional()
  @IsString()
  actor?: string;

  @IsOptional()
  @IsString()
  log_action?: string;

  @IsOptional()
  @IsString()
  log_description?: string;
}

export class BulkPublishDto {
  @ApiPropertyOptional({
    description: 'Danh sách ID điểm cụ thể cần publish/unpublish',
  })
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  score_ids?: number[];

  @ApiPropertyOptional({ description: 'Ngành học cần publish/unpublish' })
  @IsOptional()
  @IsString()
  major?: string;

  @ApiPropertyOptional({ description: 'Lớp cần publish/unpublish' })
  @IsOptional()
  @IsString()
  class?: string;

  @ApiPropertyOptional({ description: 'ID môn học' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  subject_id?: number;

  @ApiPropertyOptional({ description: 'ID học kỳ' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  term_id?: number;

  @ApiPropertyOptional({ description: 'ID năm học' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  academic_year_id?: number;

  @IsIn(['DRAFT', 'PUBLISHED'])
  status: 'DRAFT' | 'PUBLISHED';

  @IsOptional()
  @IsString()
  actor?: string;
}
