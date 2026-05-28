import { IsIn, IsOptional, IsString } from 'class-validator';

export type TeacherSortOption =
  | 'created_desc'
  | 'created_asc'
  | 'name_asc'
  | 'name_desc';

export class TeacherListQueryDto {
  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(['created_desc', 'created_asc', 'name_asc', 'name_desc'])
  sort?: TeacherSortOption;
}
