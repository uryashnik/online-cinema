import {
	BadRequestException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from 'nestjs-typegoose';
import { ModelType } from '@typegoose/typegoose/lib/types';
import { hash, genSalt, compare } from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

import { UserModel } from 'src/user/user.model';
import { AuthDto } from './dto/auth.dto';
import { RefreshTokenDto } from './dto/refreshToken.dto';
import { log } from 'console';
import { ConfigService } from '@nestjs/config';
import { jwtConstants } from 'src/config/constant';

@Injectable()
export class AuthService {
	constructor(
		@InjectModel(UserModel)
		private readonly UserModel: ModelType<UserModel>,
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService
	) {}

	async login(dto: AuthDto) {
		const user = await this.validateUser(dto);

		const tokens = await this.issueTokenPair(String(user._id));

		return {
			user: this.returnUserFields(user),
			...tokens,
		};
	}

	async getNewTokens({ refreshToken }: RefreshTokenDto) {
		if (!refreshToken) throw new UnauthorizedException('Please sign in!');

		const result = await this.jwtService.verifyAsync(refreshToken);
		if (!result)
			throw new UnauthorizedException('Invalide token or expired!');

		const user = await this.UserModel.findById(result._id);

		const tokens = await this.issueTokenPair(String(user._id));

		return {
			user: this.returnUserFields(user),
			...tokens,
		};
	}

	async register(dto: AuthDto) {
		const oldUser = await this.UserModel.findOne({ email: dto.email });
		if (oldUser) {
			throw new BadRequestException(
				'User with same email is already in the system'
			);
		}

		const solt = await genSalt(10);

		const newUser = await new this.UserModel({
			email: dto.email,
			password: await hash(dto.password, solt),
		});

		const tokens = await this.issueTokenPair(String(newUser._id));

		return {
			user: this.returnUserFields(newUser),
			...tokens,
		};
	}

	async validateUser(dto: AuthDto): Promise<UserModel> {
		const user = await this.UserModel.findOne({ email: dto.email });
		if (!user) {
			throw new UnauthorizedException('User not found');
		}

		const isValidPassword = await compare(dto.password, user.password);
		if (!isValidPassword) {
			throw new UnauthorizedException('Invalid password');
		}
		return user;
	}

	async issueTokenPair(userId: string) {
		const data = { _id: userId };

		const refreshToken = await this.jwtService.signAsync(data, {
			expiresIn: '60000s',
		});

		const accessToken = await this.jwtService.signAsync(data, {
			expiresIn: '15000s',
		});

		return { accessToken, refreshToken };
	}

	returnUserFields(user: UserModel) {
		return { _id: user.id, email: user.email, isAdmin: user.isAdmin };
	}
}
