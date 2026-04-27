import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDto {
  @ApiProperty({ example: 'Nhà trường sẽ hỗ trợ cháu sớm nhất có thể.' })
  @IsString()
  @IsNotEmpty()
  content: string;
}
