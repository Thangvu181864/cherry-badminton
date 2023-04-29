import { AfterLoad, Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';

import { ApiProperty, enumProperty } from '@base/docs';
import { BaseEntity } from '@base/model';
import { config } from '@config';

import {
  EBadmintonSessionLevel,
  EBadmintonSessionPaymentType,
  EBadmintonSessionStatus,
} from '@modules/badminton-session/constants/badminton-session.enum';
import { Address } from '@modules/badminton-session/entities/address.entity';
import { Member } from '@modules/badminton-session/entities/member.entity';
import { Match } from '@modules/badminton-session/entities/match.entity';

import { User } from '@modules/user';

export const levelBadmintonSessionProperty = enumProperty({
  enum: EBadmintonSessionLevel,
  description: 'Badminton session level',
  example: EBadmintonSessionLevel.HIGH,
});

export const paymentTypeBadmintonSessionProperty = enumProperty({
  enum: EBadmintonSessionPaymentType,
  description: 'Badminton session payment type',
  example: EBadmintonSessionPaymentType.FIXED_COST,
});

export const statusBadmintonSessionProperty = enumProperty({
  enum: EBadmintonSessionStatus,
  description: 'Badminton session payment type',
  example: EBadmintonSessionStatus.PENDING,
});

@Entity({ name: 'badminton_sessions' })
export class BadmintonSession extends BaseEntity {
  @ApiProperty()
  @Column({ nullable: false })
  name: string;

  @ApiProperty()
  @Column({ nullable: true })
  description: string;

  @ApiProperty()
  @OneToOne(() => Address, (address) => address.id, { cascade: true })
  @JoinColumn()
  address: Address;

  @ApiProperty()
  @Column({ type: 'timestamptz', nullable: false })
  startTime: Date;

  @ApiProperty()
  @Column({ type: 'timestamptz', nullable: true })
  endTime: Date;

  @ApiProperty(levelBadmintonSessionProperty)
  @Column({
    type: 'enum',
    enum: EBadmintonSessionLevel,
    nullable: true,
  })
  level: EBadmintonSessionLevel;

  @ApiProperty()
  @Column({ nullable: false })
  numberOfPeople: number;

  @ApiProperty()
  @Column({ nullable: true })
  videoUrl: string;

  @ApiProperty()
  @Column({ nullable: true })
  coverImage: string;

  @ApiProperty()
  @ManyToOne(() => User, (user) => user.id)
  createdBy: User;

  @ApiProperty(paymentTypeBadmintonSessionProperty)
  @Column({
    type: 'enum',
    enum: EBadmintonSessionPaymentType,
    nullable: false,
  })
  paymentType: EBadmintonSessionPaymentType;

  @ApiProperty()
  @Column({ nullable: true })
  fixedCost: number;

  @ApiProperty()
  @Column({ nullable: true })
  totalBill: number;

  @ApiProperty()
  @Column({ nullable: true })
  pricePreShuttle: number;

  @ApiProperty()
  @Column({ nullable: true })
  totalCourtFee: number;

  @ApiProperty(statusBadmintonSessionProperty)
  @Column({
    type: 'enum',
    enum: EBadmintonSessionStatus,
    default: EBadmintonSessionStatus.PENDING,
  })
  status: EBadmintonSessionStatus;

  @ApiProperty()
  @OneToMany(() => Member, (member) => member.badmintonSession)
  members: Member[];

  @ApiProperty()
  @OneToMany(() => Match, (match) => match.badmintonSession)
  matches: Match[];

  @AfterLoad()
  async afterLoad() {
    this.coverImage = this.coverImage
      ? [config.DOMAIN, this.coverImage.replace(/\\/g, '/')].join('/')
      : null;
  }
}
