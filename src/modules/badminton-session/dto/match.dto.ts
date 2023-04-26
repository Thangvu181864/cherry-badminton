import { Transform, plainToInstance } from 'class-transformer';
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
  IsCorrectNumberOfParticipates,
  IsEqualParticipatesInTeams,
  IsUniqueParticipatesInTeams,
} from '@modules/badminton-session/validators/validator.decorator';
import { CreateFinalScoreDto } from '@modules/badminton-session/dto/final-score.dto';

export const SEARCH_MATCH_BY_VALID = ['participant'];

export class CreateMatchDto {
  @ApiProperty()
  @Transform(({ value }) => value && +value)
  @IsNotEmpty()
  @IsPositive()
  badmintonSessionId!: number;

  @ApiProperty({ example: EMatchType.SINGLES })
  @IsNotEmpty()
  @IsEnum(EMatchType)
  type!: EMatchType;

  @ApiProperty()
  @Transform(({ value }) =>
    plainToInstance(CreateTeamDto, typeof value === 'string' ? JSON.parse(value) : value),
  )
  @ValidateNested({ each: true })
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsUniqueParticipatesInTeams()
  @IsEqualParticipatesInTeams()
  @IsCorrectNumberOfParticipates()
  teams!: CreateTeamDto[];

  @ApiPropertyOptional()
  @Transform(({ value }) => value && +value)
  @IsOptional()
  @IsPositive()
  moneyBet01?: number;

  @ApiPropertyOptional()
  @Transform(({ value }) => value && +value)
  @IsOptional()
  @IsPositive()
  moneyBet02?: number;

  @ApiPropertyOptional()
  @Transform(({ value }) => value && +value)
  @IsOptional()
  @IsPositive()
  moneyBet03?: number;
}

export class UpdateMatchDto extends PartialType(OmitType(CreateMatchDto, ['badmintonSessionId'])) {
  @ApiPropertyOptional({ example: EMatchStatus.STARTED })
  @IsOptional()
  @IsEnum(EMatchStatus)
  status?: EMatchStatus;

  @ApiPropertyOptional()
  @Transform(({ value }) =>
    plainToInstance(CreateFinalScoreDto, typeof value === 'string' ? JSON.parse(value) : value),
  )
  @ValidateNested()
  @IsOptional()
  finalScore?: CreateFinalScoreDto;
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
