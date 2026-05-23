import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsBoolean,
  IsNumber,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PreUploadedAttachmentDto {
  @ApiProperty()
  @IsUrl()
  url: string;

  @ApiProperty()
  @IsString()
  public_id: string;

  @ApiProperty()
  @IsString()
  file_name: string;

  @ApiProperty()
  @IsString()
  file_type: string;

  @ApiProperty()
  @IsNumber()
  file_size: number;

  @ApiProperty()
  @IsBoolean()
  is_image: boolean;
}

export class CreateMessageDto {
  @ApiProperty({ example: 'Nhà trường sẽ hỗ trợ cháu sớm nhất có thể.' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ type: [PreUploadedAttachmentDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PreUploadedAttachmentDto)
  attachments?: PreUploadedAttachmentDto[];
}
