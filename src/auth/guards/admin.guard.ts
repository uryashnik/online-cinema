import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { log } from 'console';
import { UserModel } from 'src/user/user.model';

@Injectable()
export class OnlyAdminGuard implements CanActivate {
	constructor(private reflector: Reflector) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		log('canActivate');
		const request = context
			.switchToHttp()
			.getRequest<{ user: UserModel }>();

		const user = request.user;
		if (!user) throw new ForbiddenException('You don`t have rights!');

		return true;
	}
}
