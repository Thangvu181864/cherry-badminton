import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { BadmintonSession } from '@modules/badminton-session/entities/badminton-session.entity';

@Injectable()
export class BadmintonSessionRepository extends Repository<BadmintonSession> {
  constructor(private dataSource: DataSource) {
    super(BadmintonSession, dataSource.createEntityManager());
  }
}
