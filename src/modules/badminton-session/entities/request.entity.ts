import { Column, Entity, ManyToOne } from 'typeorm';

import { ApiProperty, enumProperty } from '@base/docs';
import { BaseEntity } from '@base/model';

import { BadmintonSession } from '@modules/badminton-session/entities/badminton-session.entity';
import { ERequestStatus } from '@modules/badminton-session/constants/request.enum';

import { User } from '@modules/user';

export const statusRequestProperty = enumProperty({
  enum: ERequestStatus,
  description: 'Request status',
  example: ERequestStatus.PENDING,
});

@Entity({ name: 'requests' })
export class Request extends BaseEntity {
  @ApiProperty()
  @ManyToOne(() => User, (user) => user.id)
  createdBy: User;

  @ApiProperty()
  @ManyToOne(() => BadmintonSession, (badmintonSession) => badmintonSession.requests)
  badmintonSession: BadmintonSession;

  @ApiProperty(statusRequestProperty)
  @Column({
    type: 'enum',
    enum: ERequestStatus,
    default: ERequestStatus.PENDING,
    nullable: true,
  })
  status: ERequestStatus;
}
