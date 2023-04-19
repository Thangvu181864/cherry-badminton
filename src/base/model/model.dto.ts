import { IsOptional, IsString } from 'class-validator';

export class ModelSearchDto {
  @IsOptional()
  @IsString()
  search?: string;
}
