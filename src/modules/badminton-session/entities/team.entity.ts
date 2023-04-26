import { Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';

import { ApiProperty } from '@base/docs';
import { BaseEntity } from '@base/model';

import { Match } from '@modules/badminton-session/entities/match.entity';

import { User } from '@modules/user';

@Entity({ name: 'teams' })
export class Team extends BaseEntity {
  @ApiProperty()
  @ManyToOne(() => Match, (match) => match.id)
  match: Match;

  @ApiProperty()
  @ManyToMany(() => User, (user) => user.id, { cascade: true })
  @JoinTable({
    name: 'participates',
  })
  participates: User[];
}
