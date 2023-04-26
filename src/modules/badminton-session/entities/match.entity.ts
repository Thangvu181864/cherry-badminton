import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';

import { ApiProperty, enumProperty } from '@base/docs';
import { BaseEntity } from '@base/model';

import { BadmintonSession } from '@modules/badminton-session/entities/badminton-session.entity';
import { Team } from '@modules/badminton-session/entities/team.entity';
import { EMatchStatus, EMatchType } from '@modules/badminton-session/constants/match.enum';
import { FinalScore } from '@modules/badminton-session/entities/final-score.entity';

export const statusMatchProperty = enumProperty({
  enum: EMatchStatus,
  description: 'Match status',
  example: EMatchStatus.READY,
});

export const typeMatchProperty = enumProperty({
  enum: EMatchType,
  description: 'Match type',
  example: EMatchType.SINGLES,
});

@Entity({ name: 'matches' })
export class Match extends BaseEntity {
  @ApiProperty()
  @ManyToOne(() => BadmintonSession, (badmintonSession) => badmintonSession.id)
  badmintonSession: BadmintonSession;

  @ApiProperty(typeMatchProperty)
  @Column({
    type: 'enum',
    enum: EMatchType,
    nullable: false,
  })
  type: EMatchType;

  @ApiProperty(statusMatchProperty)
  @Column({
    type: 'enum',
    enum: EMatchStatus,
    default: EMatchStatus.READY,
    nullable: true,
  })
  status: EMatchStatus;

  @ApiProperty()
  @Column({ nullable: true })
  moneyBet01: number;

  @ApiProperty()
  @Column({ nullable: true })
  moneyBet02: number;

  @ApiProperty()
  @Column({ nullable: true })
  moneyBet03: number;

  @ApiProperty()
  @OneToMany(() => Team, (team) => team.match, { cascade: true })
  teams: Team[];

  @ApiProperty()
  @OneToOne(() => FinalScore, (finalScore) => finalScore.match, { cascade: true })
  @JoinColumn()
  finalScore: FinalScore;
}
