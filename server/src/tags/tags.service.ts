import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTagDto, UpdateTagDto } from './dto/tag.dto';
import { generateSlug } from '../common/utils/helpers';

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.tag.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { posts: true } },
      },
    });
  }

  async findById(id: string) {
    const tag = await this.prisma.tag.findUnique({ where: { id } });
    if (!tag) {
      throw new NotFoundException('Tag không tồn tại');
    }
    return tag;
  }

  async create(dto: CreateTagDto) {
    const slug = dto.slug || generateSlug(dto.name);

    const existing = await this.prisma.tag.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictException(`Tag "${slug}" đã tồn tại`);
    }

    return this.prisma.tag.create({
      data: { name: dto.name, slug },
    });
  }

  async update(id: string, dto: UpdateTagDto) {
    await this.findById(id);

    const slug = dto.slug
      ? dto.slug
      : dto.name
        ? generateSlug(dto.name)
        : undefined;

    return this.prisma.tag.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(slug && { slug }),
      },
    });
  }

  async remove(id: string) {
    await this.findById(id);
    return this.prisma.tag.delete({ where: { id } });
  }
}
