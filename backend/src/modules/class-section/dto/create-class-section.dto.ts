import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ClassStatus } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateClassSectionDto {
  @ApiProperty({ example: 'L01', description: 'Mã lớp học phần (unique)' })
  @IsString()
  @IsNotEmpty()
  class_code: string;

  @ApiProperty({ example: 'PGS.TS. Nguyễn Văn A', description: 'Tên giảng viên' })
  @IsString()
  @IsNotEmpty()
  teacher_name: string;

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

  @ApiProperty({ example: 'HK1-2024', description: 'Học kỳ' })
  @IsString()
  @IsNotEmpty()
  semester: string;

  @ApiPropertyOptional({ enum: ClassStatus, default: ClassStatus.UPCOMING })
  @IsEnum(ClassStatus)
  @IsOptional()
  status?: ClassStatus;

  @ApiProperty({ example: 1, description: 'ID môn học (subject_id)' })
  @IsInt()
  subject_id: number;
}
