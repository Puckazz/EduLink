import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export enum ParentRelationshipValue {
  CHA = 'CHA',
  ME = 'ME',
  NGUOI_GIAM_HO = 'NGUOI_GIAM_HO',
}

export class CreateParentDto {
  @IsString()
  @MaxLength(100)
  full_name: string;

  @IsString()
  @MaxLength(15)
  phone: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  username?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password?: string;

  @IsOptional()
  @IsEnum(ParentRelationshipValue)
  relationship?: ParentRelationshipValue;
}
