import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Array<'admin' | 'parent' | 'teacher'>) =>
  SetMetadata(ROLES_KEY, roles);
