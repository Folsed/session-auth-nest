import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { UserEntity } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
    constructor(private readonly usersService: UsersService) {}

    async register(dto: RegisterDto) {
        if (!dto.email || !dto.password) {
            throw new ConflictException('Потрібно ввести і логін і пароль');
        }
        const existing = await this.usersService.findByEmail(dto.email);
        if (existing) {
            throw new ConflictException('Користувач із таким email вже існує');
        }

        return await this.usersService.create(dto);
    }

    async validateUser(receivedEmail: string, receivedPassword: string): Promise<Omit<UserEntity, 'password'>> {
        const user = await this.usersService.findByEmail(receivedEmail);
        if (!user) throw new UnauthorizedException('Невірні облікові дані');

        const isMatch = await bcrypt.compare(receivedPassword, user.password);
        if (!isMatch) throw new UnauthorizedException('Невірні облікові дані');

        const { password, ...rest } = user;
        return rest;
    }

    async getUserById(id: string): Promise<Omit<UserEntity, 'password'>> {
        const user = await this.usersService.findById(id);
        const { password, ...rest } = user;
        return rest;
    }
}
