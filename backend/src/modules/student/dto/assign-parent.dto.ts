import { Type } from 'class-transformer';
import { IsInt, Min, IsEnum, IsOptional } from 'class-validator';
import { ParentRelationship } from '@prisma/client';

export class AssignParentDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  parent_id: number;

  @IsOptional()
  @IsEnum(ParentRelationship)
  relationship?: ParentRelationship;
}
