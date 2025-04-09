import { SetMetadata } from '@nestjs/common';
import type { UserRole } from 'src/_entities/UserRole.entity';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
