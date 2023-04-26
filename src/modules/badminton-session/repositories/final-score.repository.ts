import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { FinalScore } from '@modules/badminton-session/entities/final-score.entity';

@Injectable()
export class FinalScoreRepository extends Repository<FinalScore> {
  constructor(private dataSource: DataSource) {
    super(FinalScore, dataSource.createEntityManager());
  }
}
