import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({ description: 'Họ và tên', example: 'Nguyễn Văn A' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  full_name?: string;

  @ApiPropertyOptional({ description: 'Email', example: 'example@email.com' })
  @IsOptional()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @MaxLength(100)
  email?: string;

  @ApiPropertyOptional({ description: 'Số điện thoại (chỉ Teacher)', example: '0901234567' })
  @IsOptional()
  @IsString()
  @MinLength(9)
  @MaxLength(15)
  phone?: string;
}
