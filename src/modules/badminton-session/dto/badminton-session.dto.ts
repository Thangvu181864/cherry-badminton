import { Transform, TransformFnParams, Type, plainToInstance } from 'class-transformer';
import {
  IsArray,
  IsDate,
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

import { CreateAddressDto } from '@modules/badminton-session/dto/address.dto';
import {
  EBadmintonSessionPaymentType,
  EBadmintonSessionStatus,
} from '@modules/badminton-session/constants/badminton-session.enum';

export const SEARCH_BADMINTON_SESSION_BY_VALID = [
  'name',
  'description',
  'address.name',
  'address.note',
  'createdBy.displayName',
  'createdBy.email',
];

export enum EBadmintonSessionQueryType {
  JOINED = 'joined',
  ORGANIZED = 'organized',
}

export class CreateBadmintonSessionDto {
  @ApiProperty({ example: 'badminton session name' })
  @Transform(({ value }) => value && value.trim())
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: 'badminton session note' })
  @Transform(({ value }) => value && value.trim())
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @Transform(({ value }) =>
    plainToInstance(CreateAddressDto, typeof value === 'string' ? JSON.parse(value) : value),
  )
  @ValidateNested()
  @IsNotEmpty()
  address!: CreateAddressDto;

  @ApiProperty({ example: '2020-01-01 09:00:00' })
  @Type(() => Date)
  @IsNotEmpty()
  @IsDate()
  startTime!: Date;

  @ApiProperty({ example: '2020-01-01 10:00:00' })
  @Type(() => Date)
  @IsOptional()
  @IsDate()
  endTime?: Date;

  @ApiPropertyOptional({ example: 'high' })
  @Transform(({ value }) => value && value.trim())
  @IsOptional()
  @IsString()
  level?: string;

  @ApiProperty({ example: 10 })
  @Transform(({ value }) => value && +value)
  @IsNotEmpty()
  @IsPositive()
  numberOfPeople!: number;

  @ApiPropertyOptional({ example: 'https://example.com' })
  @Transform(({ value }) => value && value.trim())
  @IsOptional()
  @IsString()
  videoUrl?: string;

  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  coverImage?: Express.Multer.File;

  @ApiPropertyOptional({ example: [1, 2, 3] })
  @IsOptional()
  @IsArray()
  @IsPositive({ each: true })
  memberIds?: number[];

  @ApiProperty({ example: EBadmintonSessionPaymentType.FIXED_COST })
  @IsNotEmpty()
  @IsEnum(EBadmintonSessionPaymentType)
  paymentType!: EBadmintonSessionPaymentType;

  @ApiPropertyOptional({ example: 10000 })
  @ValidateIf((o) => o.paymentType === EBadmintonSessionPaymentType.FIXED_COST)
  @Transform((params: TransformFnParams) =>
    params.obj.paymentType === EBadmintonSessionPaymentType.FIXED_COST ? +params.value : null,
  )
  @IsNotEmpty()
  @IsPositive()
  fixedCost?: number;
}

export class UpdateBadmintonSessionDto extends PartialType(
  OmitType(CreateBadmintonSessionDto, ['memberIds']),
) {
  @ApiProperty({ example: EBadmintonSessionStatus.STARTED })
  @IsOptional()
  @IsEnum(EBadmintonSessionStatus)
  status?: EBadmintonSessionStatus;

  @ApiPropertyOptional({ example: 10000 })
  @Transform(({ value }) => value && +value)
  @IsOptional()
  @IsPositive()
  totalBill?: number;

  @ApiPropertyOptional({ example: 10000 })
  @Transform(({ value }) => value && +value)
  @IsOptional()
  @IsPositive()
  pricePerShuttle?: number;

  @ApiPropertyOptional({ example: 10000 })
  @Transform(({ value }) => value && +value)
  @IsOptional()
  @IsPositive()
  totalCourtFee?: number;
}

export class QueryBadmintonSessionDto extends IntersectionTypes(
  PaginationSpecificationDto,
  SortSpecificationDto,
  SearchSpecificationDto,
  QuerySpecificationDto,
) {
  @ApiPropertyOptional({ required: false, name: 'searchFields[]' })
  @IsOptional()
  @IsArray()
  @IsIn(SEARCH_BADMINTON_SESSION_BY_VALID, { each: true })
  @IsString({ each: true })
  searchFields?: string[] = SEARCH_BADMINTON_SESSION_BY_VALID;

  @ApiPropertyOptional({ required: false, name: 'filter', type: 'string' })
  @IsOptional()
  filter?: Record<string, any>;

  @ApiPropertyOptional({ required: false, name: 'type', type: 'string' })
  @IsOptional()
  @IsEnum(EBadmintonSessionQueryType)
  type?: EBadmintonSessionQueryType;

  @ApiPropertyOptional({ required: false, name: 'radius', type: 'number' })
  @Transform(({ value }) => value && +value)
  @IsOptional()
  @IsPositive()
  radius?: number;

  @ApiPropertyOptional({ required: false, name: 'lat', type: 'number' })
  @Transform(({ value }) => value && +value)
  @IsOptional()
  @IsPositive()
  lat?: number;

  @ApiPropertyOptional({ required: false, name: 'lng', type: 'number' })
  @Transform(({ value }) => value && +value)
  @IsOptional()
  @IsPositive()
  lng?: number;
}
