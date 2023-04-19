import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { NotificationHistory } from '@modules/notification/entities/notification-history.entity';

@Injectable()
export class NotificationHistoryRepository extends Repository<NotificationHistory> {
  constructor(private dataSource: DataSource) {
    super(NotificationHistory, dataSource.createEntityManager());
  }
}
