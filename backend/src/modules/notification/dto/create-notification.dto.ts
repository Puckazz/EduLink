import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty({
    description: 'Tiêu đề thông báo',
    example: 'Thông báo nghỉ lễ 30/4',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Nội dung thông báo',
    example: 'Nhà trường thông báo...',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({
    description:
      'Đối tượng nhận (null = tất cả, parent = phụ huynh, teacher = giáo viên)',
    example: 'parent',
  })
  @IsString()
  @IsOptional()
  target_role?: string;
}
