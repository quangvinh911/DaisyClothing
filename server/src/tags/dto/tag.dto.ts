import { IsString, IsOptional } from 'class-validator';

export class CreateTagDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  slug?: string;
}

export class UpdateTagDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  slug?: string;
}
