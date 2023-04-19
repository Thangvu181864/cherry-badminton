import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '@modules/user';
import { SeederService } from '@migrations/seed/seeder.service';
import { UserSeed } from '@migrations/seed/user.seed';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [],
  providers: [SeederService, UserSeed],
  exports: [],
})
export class SeederModule {
  constructor(readonly seeder: SeederService) {
    seeder
      .seed()
      .then((result) => result)
      .catch((e) => {
        throw e;
      });
  }
}
