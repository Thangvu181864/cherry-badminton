import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

import { ApiProperty, enumProperty } from '@base/docs';
import { BaseEntity } from '@base/model';

import { Match } from '@modules/badminton-session/entities/match.entity';
import { Participant } from '@modules/badminton-session/entities/participant.entity';
import { ETeamResult } from '@modules/badminton-session/constants/team.enum';

export const teamResultProperty = enumProperty({
  enum: ETeamResult,
  description: 'Team result',
  example: ETeamResult.WINNER,
});

@Entity({ name: 'teams' })
export class Team extends BaseEntity {
  @ApiProperty()
  @ManyToOne(() => Match, (match) => match.id)
  match: Match;

  @ApiProperty()
  @OneToMany(() => Participant, (participant) => participant.team, { cascade: true })
  participantes: Participant[];

  @ApiProperty(teamResultProperty)
  @Column({
    type: 'enum',
    enum: ETeamResult,
    nullable: true,
  })
  result: ETeamResult;
}
