import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEmail,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { PickType } from '@nestjs/swagger';
import { ApiProperty, ApiPropertyOptional, IntersectionTypes } from '@base/docs';
import {
  PaginationSpecificationDto,
  QuerySpecificationDto,
  SearchSpecificationDto,
  SortSpecificationDto,
} from '@base/api/dto/query-specification.dto';
import { EUserGender } from '@modules/user/constants/gender.enum';

export const SEARCH_BY_VALID = [
  'firstName',
  'lastName',
  'displayName',
  'email',
  'phoneNumber',
  'address',
];

export class RegisterAuthDto {
  @ApiProperty({ example: 'superadmin@superadmin.com' })
  @Transform(({ value }) => value && value.trim())
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(257)
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '123123' })
  @Transform(({ value }) => value && value.trim())
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @MaxLength(30)
  password!: string;
}

export class UpdateInfoDto {
  @ApiPropertyOptional({ example: 'Super' })
  @Transform(({ value }) => value && value.trim())
  @IsOptional()
  @IsString()
  @MinLength(0)
  @MaxLength(30)
  firstName?: string;

  @ApiPropertyOptional({ example: 'Admin' })
  @Transform(({ value }) => value && value.trim())
  @IsOptional()
  @IsString()
  @MinLength(0)
  @MaxLength(30)
  lastName?: string;

  @ApiPropertyOptional({ example: 'Super Admin' })
  @Transform(({ value }) => value && value.trim())
  @IsOptional()
  @IsString()
  @MinLength(0)
  @MaxLength(30)
  displayName?: string;

  @ApiPropertyOptional({ example: '0123456789' })
  @Transform(({ value }) => value && value.trim())
  @IsOptional()
  @IsString()
  @MinLength(0)
  @MaxLength(30)
  phoneNumber?: string;

  @ApiPropertyOptional({ example: '2020-01-01' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateOfBirth?: Date;

  @ApiPropertyOptional({ example: 'Ha Noi' })
  @Transform(({ value }) => value && value.trim())
  @IsOptional()
  @IsString()
  @MinLength(0)
  @MaxLength(30)
  address?: string;

  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  avatar?: Express.Multer.File;

  @ApiPropertyOptional({ example: 'Club Badminton' })
  @Transform(({ value }) => value && value.trim())
  @IsOptional()
  @IsString()
  @MinLength(0)
  @MaxLength(30)
  club?: string;

  @ApiPropertyOptional({ example: EUserGender.OTHER })
  @IsOptional()
  @IsEnum(EUserGender)
  gender?: EUserGender;
}

export class LoginAuthDto extends RegisterAuthDto {}

export class ChangePasswordDto {
  @ApiProperty({ example: '123456' })
  @Transform(({ value }) => value && value.trim())
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @MaxLength(30)
  oldPassword!: string;

  @ApiProperty({ example: '123456' })
  @Transform(({ value }) => value && value.trim())
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @MaxLength(30)
  newPassword!: string;
}

export class ForgotPasswordDto extends PickType(LoginAuthDto, ['email']) {}

export class ResendEmailDto extends PickType(LoginAuthDto, ['email']) {}

export class ResetPasswordDto extends LoginAuthDto {
  @ApiProperty({ example: '123456' })
  @Transform(({ value }) => value && value.trim())
  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  @MaxLength(6)
  otp!: string;
}

export class VerifyEmailDto extends PickType(ResetPasswordDto, ['email', 'otp']) {}

export class QueryUserDto extends IntersectionTypes(
  PaginationSpecificationDto,
  SortSpecificationDto,
  SearchSpecificationDto,
  QuerySpecificationDto,
) {
  @ApiPropertyOptional({ required: false, name: 'searchFields[]' })
  @IsOptional()
  @IsArray()
  @IsIn(SEARCH_BY_VALID, { each: true })
  @IsString({ each: true })
  searchFields?: string[] = SEARCH_BY_VALID;

  @ApiPropertyOptional({ required: false, name: 'filter', type: 'string' })
  @IsOptional()
  filter?: Record<string, any>;
}
