import { Column, Entity } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { BaseEntity } from '@base/model';

@Entity({ name: 'addresses' })
export class Address extends BaseEntity {
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
