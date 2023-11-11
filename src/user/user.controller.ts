import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt.guards';
import { User } from './decorators/user.decorator';
import { log } from 'console';

@Controller('users')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get('profile')
	@Auth()
	async getProfile(@User('_id') _id: string) {
		return this.userService.byId(_id);
	}
}
