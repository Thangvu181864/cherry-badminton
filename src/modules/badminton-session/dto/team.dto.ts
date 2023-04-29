import { Transform, plainToInstance } from 'class-transformer';
import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';

import { ApiProperty } from '@base/docs';

import { CreateParticipantDto } from '@modules/badminton-session/dto/participant.dto';

export class CreateTeamDto {
  @ApiProperty()
  @Transform(({ value }) =>
    plainToInstance(CreateParticipantDto, typeof value === 'string' ? JSON.parse(value) : value),
  )
  @ValidateNested({ each: true })
  @IsNotEmpty()
  @IsArray()
  participantes!: CreateParticipantDto[];
}
