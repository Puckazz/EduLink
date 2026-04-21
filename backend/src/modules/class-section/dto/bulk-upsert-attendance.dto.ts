import { ApiProperty } from '@nestjs/swagger';
import { AttendanceRecordStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class RecordItemDto {
  @ApiProperty({ example: 1, description: 'enrollment_id' })
  @IsInt()
  enrollmentId: number;

  @ApiProperty({ enum: AttendanceRecordStatus })
  @IsEnum(AttendanceRecordStatus)
  status: AttendanceRecordStatus;

  @ApiProperty({ example: 'Đến muộn 15 phút', required: false })
  @IsString()
  @IsOptional()
  note?: string;
}

export class BulkUpsertAttendanceDto {
  @ApiProperty({ type: [RecordItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecordItemDto)
  records: RecordItemDto[];
}
