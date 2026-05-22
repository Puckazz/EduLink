import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class ScorebookQueryDto {
  @ApiPropertyOptional({ description: 'Lọc theo ngành học', example: 'Công nghệ thông tin' })
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

  @ApiPropertyOptional({ description: 'Học kỳ', example: 'HK1 2024-2025' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  semester?: string;

  @ApiPropertyOptional({ description: 'Năm học', example: 2024 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  year?: number;
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

  @IsString()
  @MaxLength(20)
  semester: string;

  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  year: number;

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
  @ApiPropertyOptional({ description: 'Danh sách ID điểm cụ thể cần publish/unpublish' })
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

  @ApiPropertyOptional({ description: 'Học kỳ' })
  @IsOptional()
  @IsString()
  semester?: string;

  @IsIn(['DRAFT', 'PUBLISHED'])
  status: 'DRAFT' | 'PUBLISHED';

  @IsOptional()
  @IsString()
  actor?: string;
}
