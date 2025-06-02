import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/response-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>
    ) {}

    async create(dto: CreateUserDto): Promise<UserResponseDto> {
        const saltRounds = 10;
        const hash = await bcrypt.hash(dto.password, saltRounds);

        const newUser = this.userRepository.create({
            email: dto.email,
            password: hash
        });

        const saved = await this.userRepository.save(newUser);
        return { id: saved.id, email: saved.email };
    }

    async findByEmail(email: string): Promise<UserEntity | null> {
        return this.userRepository.findOne({ where: { email } });
    }

    async findById(id: string): Promise<UserEntity> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) throw new NotFoundException('Користувача не знайдено');
        return user;
    }
}
