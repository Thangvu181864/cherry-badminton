import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { Request } from '@modules/badminton-session/entities/request.entity';

@Injectable()
export class RequestRepository extends Repository<Request> {
  constructor(private dataSource: DataSource) {
    super(Request, dataSource.createEntityManager());
  }
}
