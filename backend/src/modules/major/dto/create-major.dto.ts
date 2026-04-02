import { IsString, MaxLength } from 'class-validator';

export class CreateMajorDto {
  @IsString()
  @MaxLength(20)
  major_code: string;

  @IsString()
  @MaxLength(100)
  major_name: string;
}
