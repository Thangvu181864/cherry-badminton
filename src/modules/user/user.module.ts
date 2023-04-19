import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { Request } from 'express';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';

import { uniqueFileName } from '@base/util/file.utils';
import { ConfigModule, ConfigService } from '@config';

import { User } from '@modules/user/entities/user.entity';
import { UserService } from '@modules/user/services/user.service';
import { UserController } from '@modules/user/controllers/user.controller';
import { UserRepository } from '@modules/user/repositories/user.repository';
import { FcmTokenRepository } from '@modules/user/repositories/fcm-token.repository';
import { FcmToken } from '@modules/user/entities/fcm-token.entity';
import { FcmTokenService } from '@modules/user/services/fcm-token.service';
import { FcmTokenController } from '@modules/user/controllers/fcm-token.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserRepository, User, FcmTokenRepository, FcmToken]),
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        limits: {
          fileSize: config.UPLOAD_LIMIT_SIZE,
        },
        storage: diskStorage({
          destination: (req: Request, file: Express.Multer.File, cb: any) => {
            if (!existsSync(config.UPLOAD_PATH)) {
              mkdirSync(config.UPLOAD_PATH, { recursive: true });
            }
            cb(null, config.UPLOAD_PATH);
          },
          filename: (req: Request, file: Express.Multer.File, cb: any) => {
            cb(null, uniqueFileName(file.originalname));
          },
        }),
      }),
    }),
  ],
  controllers: [UserController, FcmTokenController],
  providers: [UserService, UserRepository, FcmTokenRepository, FcmTokenService],
  exports: [UserService, UserRepository, FcmTokenRepository, FcmTokenService],
})
export class UserModule {}
