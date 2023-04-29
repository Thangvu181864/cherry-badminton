import { Column, Entity, ManyToOne } from 'typeorm';

import { ApiProperty } from '@base/docs';
import { BaseEntity } from '@base/model';

import { Team } from '@modules/badminton-session/entities/team.entity';

import { User } from '@modules/user';

@Entity({ name: 'participantes' })
export class Participant extends BaseEntity {
  @ApiProperty()
  @ManyToOne(() => Team, (team) => team.id, { onDelete: 'CASCADE' })
  team: Team;

  @ApiProperty()
  @Column({ nullable: false })
  order: number;

  @ApiProperty()
  @ManyToOne(() => User, (user) => user.id)
  user: User;
}
