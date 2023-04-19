import { Injectable } from '@nestjs/common';
import { UserSeed } from '@migrations/seed/user.seed';

@Injectable()
export class SeederService {
  constructor(readonly userSeed: UserSeed) {}

  public async seed() {
    await this.userSeed.seed();
  }
}
