import { Brackets, DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

import { User } from '@modules/user/entities/user.entity';
import { IUserGetByUniqueKey } from '@modules/user/interfaces/user.interface';
import { RegisterAuthDto } from '@modules/user/dto/user.dto';
import { EUserState } from '@modules/user/constants/state.enum';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  getUserByUniqueKey(option: IUserGetByUniqueKey & { state?: EUserState }): Promise<User> {
    return this.createQueryBuilder('user')
      .where(
        new Brackets((qb) => {
          qb.where('user.email = :email', { email: option.emailOrphoneNumber }).orWhere(
            'user.phoneNumber = :phoneNumber',
            { phoneNumber: option.emailOrphoneNumber },
          );
        }),
      )
      .andWhere({
        state: option.state || EUserState.ACTIVE,
      })
      .getOne();
  }

  getUserByPhoneNumber(phoneNumber: string): Promise<User> {
    return this.getUserByUniqueKey({ emailOrphoneNumber: phoneNumber });
  }

  getUserByEmail(email: string): Promise<User> {
    return this.getUserByUniqueKey({ emailOrphoneNumber: email });
  }

  createUser(registerAuthDto: RegisterAuthDto): Promise<User> {
    const user = this.create(registerAuthDto);
    user.setPassword(registerAuthDto.password);
    return this.save(user);
  }
}
