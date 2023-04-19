import { AfterLoad, Column, Entity } from 'typeorm';
import { Request } from 'express';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcrypt';

import { ApiHideProperty, ApiProperty, enumProperty } from '@base/docs';
import { BaseEntity } from '@base/model';
import { config } from '@config';

import { EUserState } from '@modules/user/constants/state.enum';
import { EUserGender } from '@modules/user/constants/gender.enum';
import { EUserStages } from '@modules/user/constants/stages.enum';

export const genderProperty = enumProperty({
  enum: EUserGender,
  description: 'User gender',
  example: EUserGender.OTHER,
});

export const stateProperty = enumProperty({
  enum: EUserState,
  description: 'User state',
  example: EUserState.ACTIVE,
});

export const stagesProperty = enumProperty({
  enum: EUserStages,
  description: 'User stages',
  example: EUserStages.REGISTRATION,
});

@Entity({ name: 'users' })
export class User extends BaseEntity {
  @ApiProperty()
  @Column({ nullable: true })
  firstName: string;

  @ApiProperty()
  @Column({ nullable: true })
  lastName: string;

  @ApiProperty()
  @Column({ nullable: true })
  displayName: string;

  @ApiProperty()
  @Column({ unique: true, nullable: true })
  email: string;

  @ApiProperty()
  @Column({ unique: true, nullable: true })
  phoneNumber: string;

  @Column({ nullable: false })
  @ApiHideProperty()
  @Exclude({ toPlainOnly: true })
  password: string;

  @ApiProperty()
  @Column({ type: 'timestamptz', nullable: true })
  dateOfBirth: Date;

  @ApiProperty()
  @Column({ nullable: true })
  address: string;

  @ApiProperty()
  @Column({ nullable: true })
  avatar: string;

  @ApiProperty()
  @Column({ nullable: true })
  club: string;

  @ApiProperty(genderProperty)
  @Column({
    type: 'enum',
    enum: EUserGender,
    nullable: true,
  })
  gender: EUserGender;

  @ApiProperty(stateProperty)
  @Column({
    type: 'enum',
    enum: EUserState,
    default: EUserState.INACTIVE,
  })
  @Exclude({ toPlainOnly: true })
  state: EUserState;

  @ApiProperty(stagesProperty)
  @Column({
    type: 'enum',
    enum: EUserStages,
    default: EUserStages.REGISTRATION,
  })
  stages: EUserStages;

  @ApiHideProperty()
  @Exclude()
  @Column({ type: 'bigint', nullable: true })
  authVersion: number;

  removePassword(): void {
    delete this.id;
    delete this.password;
  }

  refreshAuthVersion() {
    this.authVersion = new Date().getTime();
  }

  setPassword(password: string) {
    this.password = bcrypt.hashSync(password, config.PASSWORD_SALT);
    this.refreshAuthVersion();
  }

  comparePassword(rawPassword: string): boolean {
    const userPassword = this.password;
    return bcrypt.compareSync(rawPassword, userPassword);
  }

  @AfterLoad()
  async afterLoad() {
    this.avatar = this.avatar ? [config.DOMAIN, this.avatar.replace(/\\/g, '/')].join('/') : null;
  }
}

export type RequestUser = Request & { user: User };
