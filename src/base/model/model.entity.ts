import {
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BaseEntity as OrmBaseEntity } from 'typeorm/repository/BaseEntity';

import { ApiProperty } from '@base/docs';

export class BaseEntity extends OrmBaseEntity {
  constructor(partial: Record<string, any>) {
    super();
    Object.assign(this, partial);
    return this;
  }
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @ApiProperty()
  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt: Date;
}
