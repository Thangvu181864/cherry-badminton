import { Transform } from 'class-transformer';
import { IsNotEmpty, IsPositive, IsString } from 'class-validator';

import { ApiProperty } from '@base/docs';

export class CreateFinalScoreDto {
  @ApiProperty()
  @Transform(({ value }) => value && value.trim())
  @IsNotEmpty()
  @IsString()
  score: string;

  @ApiProperty()
  @Transform(({ value }) => value && +value)
  @IsNotEmpty()
  @IsPositive()
  numberOfShuttlesUsed: number;

  @ApiProperty()
  @Transform(({ value }) => value && +value)
  @IsNotEmpty()
  @IsPositive()
  winnerId: number;

  @ApiProperty()
  @Transform(({ value }) => value && +value)
  @IsNotEmpty()
  @IsPositive()
  loserId: number;
}
