import { UseGuards, applyDecorators } from '@nestjs/common';
import { TypeRole } from '../auth.interface';
import { JwtAuthGuard } from '../guards/jwt.guards';
import { OnlyAdminGuard } from '../guards/admin.guard';

export const Auth = (role: TypeRole = 'user') =>
	applyDecorators(
		role === 'admin' ? UseGuards(OnlyAdminGuard) : UseGuards(JwtAuthGuard)
	);
