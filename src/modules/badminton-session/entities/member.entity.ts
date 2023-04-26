import { Column, Entity, ManyToOne } from 'typeorm';

import { ApiProperty, enumProperty } from '@base/docs';
import { BaseEntity } from '@base/model';

import { BadmintonSession } from '@modules/badminton-session/entities/badminton-session.entity';
import { EMemeberPaymentStatus } from '@modules/badminton-session/constants/member.enum';

import { User } from '@modules/user';

export const paymentStatusMemberProperty = enumProperty({
  enum: EMemeberPaymentStatus,
  description: 'Member payment status',
  example: EMemeberPaymentStatus.UNPAID,
});

@Entity({ name: 'members' })
export class Member extends BaseEntity {
  @ApiProperty()
  @ManyToOne(() => User, (user) => user.id)
  user: User;

  @ApiProperty()
  @ManyToOne(() => BadmintonSession, (badmintonSession) => badmintonSession.id)
  badmintonSession: BadmintonSession;

  @ApiProperty()
  @Column({ nullable: true })
  winningAmount: number;

  @ApiProperty()
  @Column({ nullable: true })
  surcharge: number;

  @ApiProperty()
  @Column({ nullable: true })
  totalFee: number;

  @ApiProperty()
  @Column({ nullable: true })
  shuttlesUsed: number;

  @ApiProperty(paymentStatusMemberProperty)
  @Column({
    type: 'enum',
    enum: EMemeberPaymentStatus,
    default: EMemeberPaymentStatus.UNPAID,
    nullable: true,
  })
  paymentType: EMemeberPaymentStatus;
}
