import { IsArray, IsNotEmpty, IsString, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UpsertPreferenceDto {
  @ApiProperty({ description: 'Preference key, e.g. notif_score', example: 'notif_score' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  key: string;

  @ApiProperty({ description: 'Preference value', example: 'true' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  value: string;
}

export class UpsertPreferencesDto {
  @ApiProperty({
    description: 'Array of preference key-value pairs to upsert',
    type: [UpsertPreferenceDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpsertPreferenceDto)
  preferences: UpsertPreferenceDto[];
}
