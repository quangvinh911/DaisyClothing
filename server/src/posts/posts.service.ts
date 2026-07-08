import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PostStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto, UpdatePostDto, PostQueryDto } from './dto/post.dto';
import { generateSlug, buildPaginationMeta } from '../common/utils/helpers';
import { PaginatedResponse } from '../common/dto/pagination.dto';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settingsService: SettingsService,
  ) {}

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

  /** Scrape text content and image URLs from a URL */
  private async scrapeUrl(url: string): Promise<{ text: string; images: string[] }> {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });
      if (!res.ok) return { text: '', images: [] };
      const html = await res.text();
      
      // 1. Extract image URLs
      const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
      const images: string[] = [];
      let match;
      while ((match = imgRegex.exec(html)) !== null) {
        let imgUrl = match[1];
        if (imgUrl.startsWith('//')) {
          imgUrl = 'https:' + imgUrl;
        } else if (imgUrl.startsWith('/') && !imgUrl.startsWith('//')) {
          try {
            const parsedUrl = new URL(url);
            imgUrl = `${parsedUrl.protocol}//${parsedUrl.host}${imgUrl}`;
          } catch (e) {}
        }
        
        if (
          imgUrl &&
          !imgUrl.startsWith('data:') &&
          !imgUrl.includes('tracker') &&
          !imgUrl.includes('pixel') &&
          (imgUrl.includes('.jpg') || imgUrl.includes('.jpeg') || imgUrl.includes('.png') || imgUrl.includes('.webp') || imgUrl.includes('hstatic.net') || imgUrl.includes('unsplash'))
        ) {
          images.push(imgUrl);
        }
      }
      
      const uniqueImages = Array.from(new Set(images)).slice(0, 15);

      // 2. Extract text content
      let bodyText = html;
      bodyText = bodyText.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      bodyText = bodyText.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
      bodyText = bodyText.replace(/<[^>]+>/g, ' ');
      bodyText = bodyText.replace(/\s+/g, ' ').trim();
      
      return {
        text: bodyText.slice(0, 10000),
        images: uniqueImages,
      };
    } catch (error) {
      console.error('Scraping error:', error);
      return { text: '', images: [] };
    }
  }

  /** Admin: generate post content using AI */
  async generateAiPost(prompt?: string, url?: string) {
    const apiKey = await this.settingsService.getValueByKey('gemini_api_key', '');
    if (!apiKey) {
      throw new ConflictException('Vui lòng cấu hình Gemini API Key trước trong phần Cấu hình.');
    }

    let scrapedData = { text: '', images: [] as string[] };
    if (url) {
      scrapedData = await this.scrapeUrl(url);
    }

    const promptText = `
Bạn là một chuyên gia viết blog thời trang và làm đẹp chuyên nghiệp.
Hãy tạo một bài viết blog thời trang/lifestyle chất lượng cao dựa trên yêu cầu sau đây:
Yêu cầu/Chủ đề: "${prompt || 'Thời trang xu hướng mới'}"
${scrapedData.text ? `Tham khảo thêm nội dung văn bản cào được từ liên kết: "${scrapedData.text}"` : ''}

YÊU CẦU QUAN TRỌNG VỀ HÌNH ẢNH:
${scrapedData.images.length > 0 ? `
Chúng tôi đã cào được danh sách hình ảnh thực tế từ trang nguồn tham khảo:
${scrapedData.images.map((imgUrl, i) => `[Ảnh ${i + 1}]: ${imgUrl}`).join('\n')}

Hãy sử dụng các hình ảnh trên để phân bổ vào bài viết:
1. Chọn 1 hình ảnh phù hợp nhất từ danh sách trên để gán vào trường "featuredImageUrl" làm ảnh đại diện bài viết.
2. Chèn các hình ảnh khác từ danh sách này vào trong phần "content" dưới dạng thẻ HTML <img src="URL" alt="mô tả ảnh" style="display: block; margin: 20px auto; max-width: 100%; border-radius: 8px;" /> tại các vị trí ngắt đoạn hoặc dưới tiêu đề <h2> tương ứng để bài viết sinh động, trực quan.
` : `
Vì không có nguồn ảnh tham khảo, hãy sử dụng các hình ảnh thời trang chất lượng cao từ kho ảnh Unsplash để chèn vào bài viết.
Cách tạo URL ảnh Unsplash: Sử dụng định dạng: https://images.unsplash.com/photo-[static_id]?w=800
Dưới đây là một số ID ảnh thời trang/lifestyle thực tế trên Unsplash bạn hãy chọn để chèn:
- photo-1490481651871-ab68de25d43d (phối đồ nữ sang trọng)
- photo-1483985988355-763728e1935b (cửa hàng mua sắm)
- photo-1539109136881-3be0616acf4b (street style)
- photo-1515886657613-9f3515b0c78f (trang phục vàng trẻ trung)
- photo-1496747611176-843222e1e57c (váy đầm dạo phố)
- photo-1509631179647-0177331693ae (style tối giản thanh lịch)
- photo-1545048702-79362596cdc9 (chất liệu vải)
- photo-1558769132-cb1aea458c5e (quần áo treo móc)
- photo-1508214751196-bcfd4ca60f91 (phụ kiện thời trang)
- photo-1529139574466-a303027c1d8b (người mẫu chụp ảnh)

Hãy chọn 1 ảnh làm "featuredImageUrl" (ảnh bìa) và chèn ít nhất 2 ảnh khác vào trong phần "content" dưới dạng thẻ HTML <img src="URL_UNSPLASH" alt="mô tả ảnh" style="display: block; margin: 20px auto; max-width: 100%; border-radius: 8px;" /> tại các đoạn ngắt dòng thích hợp. Hãy đảm bảo mỗi vị trí sử dụng một ID ảnh khác nhau để không bị lặp hình.
`}

Yêu cầu định dạng và nội dung bài viết:
1. "title": Tiêu đề bài viết hấp dẫn, chuẩn SEO.
2. "excerpt": Mô tả ngắn gọn (150-200 ký tự) tóm tắt bài viết.
3. "content": Nội dung đầy đủ viết bằng tiếng Việt. Sử dụng các thẻ HTML như <h2>, <p>, <strong>, <ul>, <li> và các thẻ <img> để định dạng nội dung thật chuyên nghiệp, dễ đọc và đẹp mắt. Không cần bao bọc trong thẻ <html> hoặc <body>.
4. "metaTitle": Tiêu đề SEO (dưới 60 ký tự).
5. "metaDescription": Mô tả SEO (dưới 160 ký tự).
6. "featuredImageUrl": Đường dẫn ảnh đại diện được chọn.

Trả về một đối tượng JSON khớp chính xác với cấu trúc sau:
{
  "title": "string",
  "excerpt": "string",
  "content": "string",
  "metaTitle": "string",
  "metaDescription": "string",
  "featuredImageUrl": "string"
}
`.trim();

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: {
              responseMimeType: 'application/json',
            },
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API Error: ${errorText}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error('Không nhận được nội dung từ Gemini API.');
      }

      return JSON.parse(text);
    } catch (error: any) {
      console.error('Gemini content generation failed:', error);
      throw new ConflictException(error.message || 'Lỗi khi gọi API của Gemini.');
    }
  }
}
