import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { generateSlug } from '../common/utils/helpers';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { posts: true, products: true },
        },
      },
    });
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { posts: true, products: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category với slug "${slug}" không tồn tại`);
    }

    return category;
  }

  async findById(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Category không tồn tại`);
    }

    return category;
  }

  async create(dto: CreateCategoryDto) {
    const slug = dto.slug || generateSlug(dto.name);

    const existing = await this.prisma.category.findUnique({
      where: { slug },
    });

    if (existing) {
      throw new ConflictException(`Category với slug "${slug}" đã tồn tại`);
    }

    return this.prisma.category.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        imageUrl: dto.imageUrl,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.findById(id);

    const slug = dto.slug
      ? dto.slug
      : dto.name
        ? generateSlug(dto.name)
        : undefined;

    if (slug) {
      const existing = await this.prisma.category.findFirst({
        where: { slug, NOT: { id } },
      });

      if (existing) {
        throw new ConflictException(`Category với slug "${slug}" đã tồn tại`);
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(slug && { slug }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
      },
    });
  }

  async remove(id: string) {
    await this.findById(id);
    return this.prisma.category.delete({ where: { id } });
  }
}
