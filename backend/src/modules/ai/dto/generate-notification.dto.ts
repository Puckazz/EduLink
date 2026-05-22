import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class GenerateNotificationDto {
  @ApiProperty({ example: 'Thông báo lịch thi cuối kỳ HK1 bắt đầu từ 15/6.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  brief: string;

  @ApiPropertyOptional({ enum: ['all', 'parents', 'teachers'], default: 'all' })
  @IsOptional()
  @IsIn(['all', 'parents', 'teachers'])
  recipient?: 'all' | 'parents' | 'teachers';

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isUrgent?: boolean;
}
