import { IsBoolean } from 'class-validator';

export class SetTeacherLockDto {
  @IsBoolean()
  is_locked: boolean;
}
