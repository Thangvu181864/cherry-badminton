import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { ConfigModule, ConfigService } from '@config';

import { JwtAuthStrategy } from '@modules/auth/strategies/jwt.strategy';
import { JwtAuthService } from '@modules/auth/services/jwt.service';
import { JwtAuthGuard } from '@modules/auth/guards/jwt.guard';

import { UserModule } from '@modules/user';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.ACCESS_SECRET,
        signOptions: { expiresIn: config.ACCESS_TOKEN_EXP },
      }),
    }),
    ConfigModule,
    UserModule,
  ],
  providers: [JwtAuthService, JwtAuthStrategy, JwtAuthGuard],
  exports: [JwtAuthService],
})
export class JwtAuthModule {}
