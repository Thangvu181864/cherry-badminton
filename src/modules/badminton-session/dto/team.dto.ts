import { Transform } from 'class-transformer';
import { ArrayMinSize, IsArray, IsNotEmpty, IsPositive } from 'class-validator';

import { ApiProperty } from '@base/docs';

export class CreateTeamDto {
  @ApiProperty()
  @Transform(({ value }) => value && value.map((item) => +item))
  @IsNotEmpty()
  @IsPositive({ each: true })
  @IsArray()
  @ArrayMinSize(1)
  participates!: number[];
}
