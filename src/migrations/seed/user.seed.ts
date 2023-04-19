import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { EUserGender, EUserState, User } from '@modules/user';
import { EUserStages } from '@modules/user/constants/stages.enum';

const data = [
  {
    id: null,
    firstName: 'Super',
    lastName: 'admin',
    displayName: 'Super admin',
    email: 'superadmin@superadmin.com',
    phoneNumber: null,
    password: '$2b$10$2c7IAvHGkFrUn2.HHDcfY.ZhInGIO8tv9g.hwTQor1as7vOJaqUDy',
    dateOfBirth: null,
    address: null,
    avatar: null,
    club: null,
    gender: EUserGender.OTHER,
    state: EUserState.ACTIVE,
    stages: EUserStages.COMPLETION,
    authVersion: 1,
  },
];

@Injectable()
export class UserSeed {
  constructor(
    @InjectRepository(User)
    protected readonly repository: Repository<User>,
  ) {}

  async seed() {
    const count = await this.repository.count();
    if (count) return;
    const result = await Promise.all(
      data.map(async (item, index) => {
        item.id = index + 1;
        return item;
      }),
    );
    await this.repository.save(result);
    return;
  }
}
