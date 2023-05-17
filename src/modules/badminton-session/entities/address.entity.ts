import { Column, Entity, OneToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { BaseEntity } from '@base/model';

import { BadmintonSession } from '@modules/badminton-session/entities/badminton-session.entity';

@Entity({ name: 'addresses' })
export class Address extends BaseEntity {
  @ApiProperty()
  @OneToOne(() => BadmintonSession, (badmintonSession) => badmintonSession.address)
  badmintonSession: BadmintonSession;

  @ApiProperty()
  @Column({ nullable: false })
  name: string;

  @ApiProperty()
  @Column({ nullable: true })
  note: string;

  @ApiProperty()
  @Column({ type: 'double precision', nullable: false })
  lat: number;

  @ApiProperty()
  @Column({ type: 'double precision', nullable: false })
  lng: number;
}
