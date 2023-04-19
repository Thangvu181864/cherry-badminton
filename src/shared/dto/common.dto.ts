import { Transform } from 'class-transformer';
import { IsNotEmpty, IsInt, Min, IsString } from 'class-validator';

import { ApiProperty } from '@base/docs';

export class ParamIdDto {
  @ApiProperty()
  @IsNotEmpty()
  @Transform(({ value }) => value && +value)
  @IsInt()
  @Min(1)
  id!: number;
}

export class ParamIdStringDto {
  @ApiProperty()
  @IsNotEmpty()
  @Transform(({ value }) => value && value.trim())
  @IsString()
  id!: string;
}
