import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { Member } from '@modules/badminton-session/entities/member.entity';

@Injectable()
export class MemberRepository extends Repository<Member> {
  constructor(private dataSource: DataSource) {
    super(Member, dataSource.createEntityManager());
  }
}
