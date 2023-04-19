import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';

import { ConfigModule } from '@config';
import { RedisModule } from '@base/db/redis';
import { OtpModule } from '@base/otp/otp.module';
import { MailModule } from '@base/mail/mail.module';
import { QUEUE_NAME } from '@shared/constants';

import { AuthService } from '@modules/auth/services/auth.service';
import { AuthController } from '@modules/auth/controllers/auth.controller';
import { JwtAuthModule } from '@modules/auth/jwt.module';
import { SendMailConsumer } from '@modules/auth/consumers/send-email.consumer';

import { UserModule } from '@modules/user';

@Module({
  imports: [
    MailModule,
    JwtAuthModule,
    ConfigModule,
    UserModule,
    RedisModule,
    OtpModule,
    BullModule.registerQueue({
      name: QUEUE_NAME.SEND_MAIL,
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, SendMailConsumer],
})
export class AuthModule {}
