import { Column, Entity } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { BaseEntity } from '@base/model';

import { RelatedDataType } from '@modules/notification/constants/notifications.constant';

@Entity({ name: 'notification-details' })
export class NotificationDetail extends BaseEntity {
  @ApiProperty()
  @Column()
  title: string;

  @ApiProperty()
  @Column()
  body: string;

  @ApiProperty()
  @Column()
  bodyWithTag: string;

  @ApiProperty()
  @Column({ nullable: true })
  relatedDataId: string;

  @Column({ type: 'enum', enum: RelatedDataType, nullable: true })
  relatedDataType!: RelatedDataType;
}
