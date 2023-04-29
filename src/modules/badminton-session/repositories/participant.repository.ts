import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { Participant } from '@modules/badminton-session/entities/participant.entity';

@Injectable()
export class ParticipantRepository extends Repository<Participant> {
  constructor(private dataSource: DataSource) {
    super(Participant, dataSource.createEntityManager());
  }
}
