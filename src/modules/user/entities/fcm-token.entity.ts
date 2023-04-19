import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { BaseEntity } from '@base/model';

import { User } from '@modules/user/entities/user.entity';

@Entity({ name: 'fcm-tokens' })
export class FcmToken extends BaseEntity {
  @ApiProperty()
  @Column()
  token: string;

  @ApiProperty()
  @OneToOne(() => User, (user) => user.id)
  @JoinColumn()
  user: User;
}
