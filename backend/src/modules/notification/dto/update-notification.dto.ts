import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateNotificationDto {
  @ApiPropertyOptional({ description: 'Tiêu đề thông báo', example: 'Thông báo cập nhật' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Nội dung thông báo', example: 'Nội dung đã được cập nhật...' })
  @IsString()
  @IsOptional()
  content?: string;
  @ApiPropertyOptional({ description: 'Đối tượng nhận (null = tất cả, parent = phụ huynh, teacher = giáo viên)', example: 'parent' })
  @IsString()
  @IsOptional()
  target_role?: string | null;
}
