import { Injectable } from '@nestjs/common';

import { BaseCrudService } from '@base/api';
import { LoggingService } from '@base/logging';

import { FcmToken } from '@modules/user/entities/fcm-token.entity';
import { FcmTokenRepository } from '@modules/user/repositories/fcm-token.repository';
import { CreateFcmTokenDto } from '@modules/user/dto/fcm-token.dto';
import { User } from '@modules/user/entities/user.entity';

@Injectable()
export class FcmTokenService extends BaseCrudService<FcmToken> {
  constructor(
    protected readonly repository: FcmTokenRepository,
    private readonly loggingService: LoggingService,
  ) {
    super(FcmToken, repository, 'fcmToken', loggingService.getLogger(FcmTokenService.name));
  }

  async upsert(user: User, data: CreateFcmTokenDto): Promise<void> {
    const fcmToken = await this.repository.findOneBy({ user: { id: user.id } });
    if (fcmToken) {
      fcmToken.token = data.token;
      await fcmToken.save();
    }
    await this.repository.save({ ...data, user });
  }

  async remove(userId: number): Promise<void> {
    const fcmToken = await this.repository.findOneBy({ user: { id: userId } });
    if (fcmToken) {
      await this.repository.softDelete(fcmToken.id);
    }
  }

  async getToken(userId: number): Promise<FcmToken> {
    const fcmToken = await this.repository.findOne({
      where: {
        user: {
          id: userId,
        },
      },
    });
    return fcmToken;
  }
}
