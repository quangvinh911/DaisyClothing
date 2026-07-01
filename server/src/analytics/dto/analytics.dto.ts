import { IsString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PageType } from '@prisma/client';

export class TrackPageViewDto {
  @IsString()
  pageUrl!: string;

  @IsEnum(PageType)
  pageType!: PageType;

  @IsOptional()
  @IsUUID()
  referenceId?: string;

  @IsOptional()
  @IsString()
  referrerUrl?: string;
}

export class AnalyticsQueryDto {
  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsString()
  period?: 'day' | 'week' | 'month';
}
