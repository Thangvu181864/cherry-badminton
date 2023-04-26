import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

import { ApiProperty } from '@base/docs';
import { BaseEntity } from '@base/model';

import { Match } from '@modules/badminton-session/entities/match.entity';
import { Team } from '@modules/badminton-session/entities/team.entity';

@Entity({ name: 'final_scores' })
export class FinalScore extends BaseEntity {
  @ApiProperty()
  @OneToOne(() => Match, (match) => match.finalScore)
  match: Match;

  @ApiProperty()
  @OneToOne(() => Team, (team) => team.id)
  @JoinColumn()
  winner: Team;

  @ApiProperty()
  @OneToOne(() => Team, (team) => team.id)
  @JoinColumn()
  loser: Team;

  @ApiProperty()
  @Column()
  score: string;

  @ApiProperty()
  @Column()
  numberOfShuttlesUsed: number;
}
