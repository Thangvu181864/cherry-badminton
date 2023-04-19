import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { User } from '@modules/user';
import { BaseEntity } from '@base/model/model.entity';

export class BaseEntityCRUD extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ referencedColumnName: 'email' })
  createdBy: User;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ referencedColumnName: 'email' })
  updatedBy: User;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ referencedColumnName: 'email' })
  deletedBy: User;
}
