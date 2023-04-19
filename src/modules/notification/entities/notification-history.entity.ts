import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { BaseEntity } from '@base/model';

import { NotificationDetail } from '@modules/notification/entities/notification-detail.entity';

import { User } from '@modules/user';

@Entity({ name: 'notification-histories' })
export class NotificationHistory extends BaseEntity {
  @ApiProperty()
  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  receiver: User;

  @ApiProperty()
  @Column({ default: false })
  isRead: boolean;

  @ApiProperty()
  @Column({ default: false })
  isImportant: boolean;

  @ApiProperty()
  @OneToOne(() => NotificationDetail, (notificationDetail) => notificationDetail.id, {
    onDelete: 'CASCADE',
    cascade: true,
  })
  @JoinColumn()
  notificationDetail: NotificationDetail;
}
