import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt.guards';

@Controller('users')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get('profile')
	// @Auth()
	@UseGuards(JwtAuthGuard)
	async getProfile() {
		return this.userService.byId();
	}
}
