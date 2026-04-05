import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class AssignParentDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  parent_id: number;
}
