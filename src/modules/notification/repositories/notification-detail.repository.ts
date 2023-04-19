import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { NotificationDetail } from '@modules/notification/entities/notification-detail.entity';

@Injectable()
export class NotificationDetailRepository extends Repository<NotificationDetail> {
  constructor(private dataSource: DataSource) {
    super(NotificationDetail, dataSource.createEntityManager());
  }
}
