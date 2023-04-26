import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  ValidateIf,
} from 'class-validator';

import { ApiProperty, ApiPropertyOptional, IntersectionTypes } from '@base/docs';
import {
  PaginationSpecificationDto,
  QuerySpecificationDto,
  SearchSpecificationDto,
  SortSpecificationDto,
} from '@base/api/dto/query-specification.dto';

import { ERequestStatus } from '@modules/badminton-session/constants/request.enum';

export const SEARCH_REQUEST_BY_VALID = [
  'createdBy.displatName',
  'createdBy.email',
  'badmintonSession.name',
  'badmintonSession.description',
];

export enum ERequestQueryType {
  SENT = 'sent',
  RECEIVED = 'received',
}

export class CreateRequestDto {
  @ApiProperty({ example: 1 })
  @Transform(({ value }) => value && +value)
  @IsNotEmpty()
  @IsPositive()
  badmintonSessionId!: number;
}

export class ChangeStatusRequestDto {
  @ApiProperty({ example: ERequestStatus.ACCEPTED })
  @IsNotEmpty()
  @IsEnum(ERequestStatus)
  status!: ERequestStatus;
}

export class QueryRequestDto extends IntersectionTypes(
  PaginationSpecificationDto,
  SortSpecificationDto,
  SearchSpecificationDto,
  QuerySpecificationDto,
) {
  @ApiPropertyOptional({ required: false, name: 'searchFields[]' })
  @IsOptional()
  @IsArray()
  @IsIn(SEARCH_REQUEST_BY_VALID, { each: true })
  @IsString({ each: true })
  searchFields?: string[] = SEARCH_REQUEST_BY_VALID;

  @ApiPropertyOptional({ required: false, name: 'filter', type: 'string' })
  @IsOptional()
  filter?: Record<string, any>;

  @ApiProperty({ required: true, name: 'type', type: 'string', example: ERequestQueryType.SENT })
  @IsNotEmpty()
  @IsEnum(ERequestQueryType)
  type!: ERequestQueryType;

  @ApiPropertyOptional({ required: false, name: 'badmintonSessionId', type: 'number' })
  @ValidateIf((o) => o.type === ERequestQueryType.RECEIVED)
  @Transform((params: TransformFnParams) =>
    params.obj.type === ERequestQueryType.RECEIVED ? +params.value : null,
  )
  @IsNotEmpty()
  @IsPositive()
  badmintonSessionId?: number;
}
