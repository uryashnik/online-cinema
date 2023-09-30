import { Injectable } from '@nestjs/common';
import { InjectModel } from 'nestjs-typegoose';
import { ModelType } from '@typegoose/typegoose/lib/types';
import { UserModel } from 'src/user/user.model';
import { log } from 'console';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(UserModel) private readonly UserModel: ModelType<UserModel>
    ) {}
    async register(dto: any) {
        log('dto: ', dto);
        const newUser = new this.UserModel(dto);
        return newUser.save();
    }
}
