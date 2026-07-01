import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IsString, IsOptional, IsBoolean, IsInt, Min } from 'class-validator';

export class CreateSocialLinkDto {
  @IsString()
  platform!: string;

  @IsString()
  url!: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateSocialLinkDto {
  @IsOptional()
  @IsString()
  platform?: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

@Injectable()
export class SocialLinksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.socialLink.findMany({
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findActive() {
    return this.prisma.socialLink.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async create(dto: CreateSocialLinkDto) {
    return this.prisma.socialLink.create({
      data: {
        platform: dto.platform,
        url: dto.url,
        icon: dto.icon,
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async update(id: string, dto: UpdateSocialLinkDto) {
    const existing = await this.prisma.socialLink.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Social link không tồn tại');
    }

    return this.prisma.socialLink.update({
      where: { id },
      data: {
        ...(dto.platform && { platform: dto.platform }),
        ...(dto.url && { url: dto.url }),
        ...(dto.icon !== undefined && { icon: dto.icon }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.socialLink.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Social link không tồn tại');
    }
    return this.prisma.socialLink.delete({ where: { id } });
  }
}
