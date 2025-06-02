import { Body, Controller, Get, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { Request, Response } from 'express';
import { LoginDto } from './dto/login.dto';
import { SessionGuard } from '../../common/guards/session.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    @HttpCode(201)
    async register(
        @Body() createUserDto: CreateUserDto,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response
    ) {
        const newUser = await this.authService.register(createUserDto);

        req.session.userId = newUser.id;

        return newUser;
    }

    @Post('login')
    @HttpCode(200)
    async login(@Body() loginDto: LoginDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const user = await this.authService.validateUser(loginDto.email, loginDto.password);

        req.session.userId = user.id;

        return { id: user.id, email: user.email };
    }

    @Post('logout')
    @HttpCode(200)
    async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        return new Promise<void>((resolve, reject) =>
            req.session.destroy((err) => {
                if (err) {
                    reject(err);
                } else {
                    res.clearCookie('_sess.id.connect');
                    resolve();
                }
            })
        );
    }

    @UseGuards(SessionGuard)
    @Get('me')
    async getMe(@Req() req: Request) {
        const userId: string = req.session.userId;

        return await this.authService.getUserById(userId);
    }
}
