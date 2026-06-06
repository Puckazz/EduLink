import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateClassSectionDto {
  @ApiProperty({ example: 'L01', description: 'Mã lớp học phần (unique)' })
  @IsString()
  @IsNotEmpty()
  class_code: string;

  @ApiPropertyOptional({
    example: 'PGS.TS. Nguyễn Văn A',
    description: 'Tên giảng viên',
  })
  @IsString()
  @IsOptional()
  teacher_name?: string;

  @ApiPropertyOptional({ example: 1, description: 'ID giảng viên' })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  teacher_id?: number;

  @ApiProperty({ example: 'Thứ 2', description: 'Thứ trong tuần' })
  @IsString()
  @IsNotEmpty()
  day_of_week: string;

  @ApiProperty({ example: '7:30', description: 'Giờ bắt đầu' })
  @IsString()
  @IsNotEmpty()
  start_time: string;

  @ApiProperty({ example: '9:30', description: 'Giờ kết thúc' })
  @IsString()
  @IsNotEmpty()
  end_time: string;

  @ApiProperty({ example: 'A1.202', description: 'Phòng học' })
  @IsString()
  @IsNotEmpty()
  room: string;

  @ApiProperty({ example: 1, description: 'ID học kỳ' })
  @Type(() => Number)
  @IsInt()
  term_id: number;

  @ApiProperty({ example: 1, description: 'ID môn học (subject_id)' })
  @IsInt()
  subject_id: number;
}
