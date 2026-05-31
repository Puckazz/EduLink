import { IsBoolean } from 'class-validator';

export class SetParentLockDto {
  @IsBoolean()
  is_locked: boolean;
}
