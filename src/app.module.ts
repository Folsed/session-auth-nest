import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './modules/users/users.module';
import { DataSource } from 'typeorm';
import * as connectPgSimple from 'connect-pg-simple';
import * as session from 'express-session';
import { parseMaxAgeToMsUtil } from './common/utils/parseMaxAgeToMs.util';
import { isProd } from './common/utils/env.util';
import { AuthModule } from './modules/auth/auth.module';

@Module({
    imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule, UsersModule, AuthModule],
    controllers: [],
    providers: []
})
export class AppModule {
    constructor(
        private readonly dataSource: DataSource,
        private readonly configService: ConfigService
    ) {}

    configure(consumer: MiddlewareConsumer) {
        const PgSession = connectPgSimple(session);

        consumer
            .apply(
                session({
                    name: '_sess.id.connect',
                    store: new PgSession({
                        pool: this.dataSource.driver['master'],
                        tableName: 'user_sessions',
                        createTableIfMissing: true
                    }),
                    secret: this.configService.get<string>('SESSION_SECRET'),
                    resave: false,
                    saveUninitialized: false,
                    cookie: {
                        httpOnly: true,
                        maxAge: parseMaxAgeToMsUtil(this.configService.get<string>('SESSION_MAX_AGE')),
                        sameSite: 'lax',
                        secure: isProd(this.configService)
                    }
                })
            )
            .forRoutes('*');
    }
}
