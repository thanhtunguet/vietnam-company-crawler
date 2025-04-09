import { SetMetadata } from '@nestjs/common';
import type { UserRole } from 'src/_entities/Role';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
