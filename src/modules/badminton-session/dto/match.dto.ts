import { Transform, TransformFnParams, plainToInstance } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

import {
  ApiProperty,
  ApiPropertyOptional,
  IntersectionTypes,
  OmitType,
  PartialType,
} from '@base/docs';
import {
  PaginationSpecificationDto,
  QuerySpecificationDto,
  SearchSpecificationDto,
  SortSpecificationDto,
} from '@base/api/dto/query-specification.dto';

import { EMatchStatus, EMatchType } from '@modules/badminton-session/constants/match.enum';
import { CreateTeamDto } from '@modules/badminton-session/dto/team.dto';
import {
  IsCorrectNumberOfParticipantes,
  IsEqualParticipantesInTeams,
  IsUniqueParticipantesInTeams,
} from '@modules/badminton-session/validators/validator.decorator';

export const SEARCH_MATCH_BY_VALID = ['user.displayName', 'user.email'];

export class CreateMatchDto {
  @ApiProperty()
  @Transform(({ value }) => value && +value)
  @IsNotEmpty()
  @IsPositive()
  badmintonSessionId!: number;

  @ApiProperty({ example: EMatchType.SINGLES })
  @Transform((params: TransformFnParams) =>
    params.obj.status !== EMatchStatus.STARTED || params.obj.status !== EMatchStatus.FINISHED
      ? params.value
      : null,
  )
  @IsNotEmpty()
  @IsEnum(EMatchType)
  type!: EMatchType;

  @ApiPropertyOptional()
  @Transform((params: TransformFnParams) =>
    params.obj.type === EMatchType.SINGLES &&
    params.obj.status !== EMatchStatus.STARTED &&
    params.obj.status !== EMatchStatus.FINISHED
      ? +params.value
      : null,
  )
  @IsOptional()
  @IsPositive()
  moneyBet01?: number;

  @ApiPropertyOptional()
  @Transform((params: TransformFnParams) =>
    params.obj.type === EMatchType.DOUBLES &&
    params.obj.status !== EMatchStatus.STARTED &&
    params.obj.status !== EMatchStatus.FINISHED
      ? +params.value
      : null,
  )
  @IsOptional()
  @IsPositive()
  moneyBet02?: number;

  @ApiPropertyOptional()
  @Transform((params: TransformFnParams) =>
    params.obj.type === EMatchType.TRIPLES &&
    params.obj.status !== EMatchStatus.STARTED &&
    params.obj.status !== EMatchStatus.FINISHED
      ? +params.value
      : null,
  )
  @IsOptional()
  @IsPositive()
  moneyBet03?: number;

  @ApiProperty()
  @Transform(({ value }) =>
    plainToInstance(CreateTeamDto, typeof value === 'string' ? JSON.parse(value) : value),
  )
  @ValidateNested({ each: true })
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsUniqueParticipantesInTeams()
  @IsEqualParticipantesInTeams()
  @IsCorrectNumberOfParticipantes()
  teams!: CreateTeamDto[];
}

export class UpdateMatchDto extends PartialType(
  OmitType(CreateMatchDto, ['badmintonSessionId', 'teams']),
) {
  @ApiPropertyOptional({ example: EMatchStatus.STARTED })
  @IsOptional()
  @IsEnum(EMatchStatus)
  status?: EMatchStatus;

  @ApiPropertyOptional()
  @Transform((params: TransformFnParams) =>
    !params.obj.status &&
    (params.obj.status !== EMatchStatus.STARTED || params.obj.status !== EMatchStatus.FINISHED)
      ? plainToInstance(
          CreateTeamDto,
          typeof params.value === 'string' ? JSON.parse(params.value) : params.value,
        )
      : null,
  )
  @ValidateNested({ each: true })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsUniqueParticipantesInTeams()
  @IsEqualParticipantesInTeams()
  @IsCorrectNumberOfParticipantes()
  teams!: CreateTeamDto[];

  @ApiProperty()
  @ValidateIf((o) => o.status === EMatchStatus.FINISHED)
  @Transform((params: TransformFnParams) =>
    params.obj.status === EMatchStatus.FINISHED ? params.value.trim() : null,
  )
  @IsNotEmpty()
  @IsString()
  score!: string;

  @ApiProperty()
  @ValidateIf((o) => o.status === EMatchStatus.FINISHED)
  @Transform((params: TransformFnParams) =>
    params.obj.status === EMatchStatus.FINISHED ? +params.value : null,
  )
  @IsNotEmpty()
  @IsPositive()
  numberOfShuttlesUsed!: number;

  @ApiProperty()
  @ValidateIf((o) => o.status === EMatchStatus.FINISHED)
  @Transform((params: TransformFnParams) =>
    params.obj.status === EMatchStatus.FINISHED ? +params.value : null,
  )
  @IsNotEmpty()
  @IsPositive()
  winnerTeamId!: number;
}

export class QueryMatchDto extends IntersectionTypes(
  PaginationSpecificationDto,
  SortSpecificationDto,
  SearchSpecificationDto,
  QuerySpecificationDto,
) {
  @ApiPropertyOptional({ required: false, name: 'searchFields[]' })
  @IsOptional()
  @IsArray()
  @IsIn(SEARCH_MATCH_BY_VALID, { each: true })
  @IsString({ each: true })
  searchFields?: string[] = SEARCH_MATCH_BY_VALID;

  @ApiPropertyOptional({ required: false, name: 'filter', type: 'string' })
  @IsOptional()
  filter?: Record<string, any>;

  @ApiProperty({ required: false, name: 'badmintonSessionId', type: 'number' })
  @Transform(({ value }) => value && +value)
  @IsNotEmpty()
  @IsPositive()
  badmintonSessionId?: number;
}
