import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { FcmToken } from '@modules/user/entities/fcm-token.entity';

@Injectable()
export class FcmTokenRepository extends Repository<FcmToken> {
  constructor(private dataSource: DataSource) {
    super(FcmToken, dataSource.createEntityManager());
  }
}
