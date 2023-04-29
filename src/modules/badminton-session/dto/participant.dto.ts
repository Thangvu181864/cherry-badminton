import { Transform } from 'class-transformer';
import { IsNotEmpty, IsPositive } from 'class-validator';

import { ApiProperty } from '@base/docs';

export class CreateParticipantDto {
  @ApiProperty()
  @Transform(({ value }) => value && +value)
  @IsNotEmpty()
  @IsPositive()
  order!: number;

  @ApiProperty()
  @Transform(({ value }) => value && +value)
  @IsNotEmpty()
  @IsPositive()
  memberId!: number;
}
