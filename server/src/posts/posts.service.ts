import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PostStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto, UpdatePostDto, PostQueryDto } from './dto/post.dto';
import { generateSlug, buildPaginationMeta } from '../common/utils/helpers';
import { PaginatedResponse } from '../common/dto/pagination.dto';

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly defaultInclude = {
    category: true,
    author: {
      select: { id: true, displayName: true, avatarUrl: true },
    },
    tags: {
      include: { tag: true },
    },
    products: {
      include: { product: true },
      orderBy: { displayOrder: 'asc' as const },
    },
  };

  /** Public: list published posts with pagination */
  async findPublished(query: PostQueryDto): Promise<PaginatedResponse<unknown>> {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 12;
    const skip = (page - 1) * limit;

    const where: Prisma.PostWhereInput = {
      status: PostStatus.PUBLISHED,
    };

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { excerpt: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.category) {
      where.category = { slug: query.category };
    }

    if (query.tag) {
      where.tags = { some: { tag: { slug: query.tag } } };
    }

    const [data, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        include: this.defaultInclude,
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.post.count({ where }),
    ]);

    return {
      data,
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  /** Public: get single post by slug */
  async findBySlug(slug: string) {
    const post = await this.prisma.post.findUnique({
      where: { slug },
      include: this.defaultInclude,
    });

    if (!post || post.status !== PostStatus.PUBLISHED) {
      throw new NotFoundException(`Bài viết không tồn tại`);
    }

    return post;
  }

  /** Public: get all published slugs (for SSG) */
  async findAllSlugs(): Promise<string[]> {
    const posts = await this.prisma.post.findMany({
      where: { status: PostStatus.PUBLISHED },
      select: { slug: true },
    });
    return posts.map((p) => p.slug);
  }

  /** Public: get latest N posts */
  async findLatest(count: number = 6) {
    return this.prisma.post.findMany({
      where: { status: PostStatus.PUBLISHED },
      include: this.defaultInclude,
      orderBy: { publishedAt: 'desc' },
      take: count,
    });
  }

  /** Admin: list all posts (any status) */
  async findAll(query: PostQueryDto): Promise<PaginatedResponse<unknown>> {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 12;
    const skip = (page - 1) * limit;

    const where: Prisma.PostWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.category) {
      where.category = { slug: query.category };
    }

    const [data, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        include: this.defaultInclude,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.post.count({ where }),
    ]);

    return {
      data,
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  /** Admin: get post by ID */
  async findById(id: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: this.defaultInclude,
    });

    if (!post) {
      throw new NotFoundException('Bài viết không tồn tại');
    }

    return post;
  }

  /** Admin: create post */
  async create(authorId: string, dto: CreatePostDto) {
    const slug = dto.slug || generateSlug(dto.title);

    const existing = await this.prisma.post.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictException(`Bài viết với slug "${slug}" đã tồn tại`);
    }

    const isPublished = dto.status === PostStatus.PUBLISHED;

    return this.prisma.post.create({
      data: {
        title: dto.title,
        slug,
        content: dto.content,
        excerpt: dto.excerpt,
        featuredImageUrl: dto.featuredImageUrl,
        metaTitle: dto.metaTitle || dto.title,
        metaDescription: dto.metaDescription || dto.excerpt,
        status: dto.status || PostStatus.DRAFT,
        publishedAt: isPublished ? new Date() : null,
        categoryId: dto.categoryId,
        authorId,
        tags: dto.tagIds
          ? {
              create: dto.tagIds.map((tagId) => ({ tagId })),
            }
          : undefined,
        products: dto.productIds
          ? {
              create: dto.productIds.map((productId, index) => ({
                productId,
                displayOrder: index,
              })),
            }
          : undefined,
      },
      include: this.defaultInclude,
    });
  }

  /** Admin: update post */
  async update(id: string, dto: UpdatePostDto) {
    const existingPost = await this.findById(id);

    let slug = dto.slug;
    if (!slug && dto.title) {
      slug = generateSlug(dto.title);
    }

    if (slug && slug !== existingPost.slug) {
      const duplicate = await this.prisma.post.findUnique({ where: { slug } });
      if (duplicate) {
        throw new ConflictException(`Slug "${slug}" đã tồn tại`);
      }
    }

    // Determine publishedAt
    let publishedAt = existingPost.publishedAt;
    if (dto.status === PostStatus.PUBLISHED && !existingPost.publishedAt) {
      publishedAt = new Date();
    }

    // Update tags if provided
    if (dto.tagIds !== undefined) {
      await this.prisma.postTag.deleteMany({ where: { postId: id } });
    }

    // Update products if provided
    if (dto.productIds !== undefined) {
      await this.prisma.postProduct.deleteMany({ where: { postId: id } });
    }

    return this.prisma.post.update({
      where: { id },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(slug && { slug }),
        ...(dto.content !== undefined && { content: dto.content }),
        ...(dto.excerpt !== undefined && { excerpt: dto.excerpt }),
        ...(dto.featuredImageUrl !== undefined && {
          featuredImageUrl: dto.featuredImageUrl,
        }),
        ...(dto.metaTitle !== undefined && { metaTitle: dto.metaTitle }),
        ...(dto.metaDescription !== undefined && {
          metaDescription: dto.metaDescription,
        }),
        ...(dto.status && { status: dto.status }),
        publishedAt,
        ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
        ...(dto.tagIds !== undefined && {
          tags: {
            create: dto.tagIds.map((tagId) => ({ tagId })),
          },
        }),
        ...(dto.productIds !== undefined && {
          products: {
            create: dto.productIds.map((productId, index) => ({
              productId,
              displayOrder: index,
            })),
          },
        }),
      },
      include: this.defaultInclude,
    });
  }

  /** Admin: delete post */
  async remove(id: string) {
    await this.findById(id);
    return this.prisma.post.delete({ where: { id } });
  }
}
