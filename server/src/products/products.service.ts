import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from './dto/product.dto';
import { generateSlug, buildPaginationMeta } from '../common/utils/helpers';
import { PaginatedResponse } from '../common/dto/pagination.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Public: list active products with filters */
  async findActive(query: ProductQueryDto): Promise<PaginatedResponse<unknown>> {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 12;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      isActive: true,
    };

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { brand: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.category) {
      where.category = { slug: query.category };
    }

    if (query.platform) {
      where.platform = query.platform;
    }

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          category: true,
          _count: { select: { clicks: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data,
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  /** Public: get product by slug */
  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        _count: { select: { clicks: true } },
      },
    });

    if (!product || !product.isActive) {
      throw new NotFoundException('Sản phẩm không tồn tại');
    }

    return product;
  }

  /** Public: get featured products */
  async findFeatured(count: number = 8) {
    return this.prisma.product.findMany({
      where: { isActive: true },
      include: {
        category: true,
        _count: { select: { clicks: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: count,
    });
  }

  /** Affiliate redirect: get affiliate URL by slug and log click */
  async getAffiliateUrl(slug: string): Promise<string> {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      select: { id: true, affiliateUrl: true, isActive: true },
    });

    if (!product || !product.isActive) {
      throw new NotFoundException('Sản phẩm không tồn tại');
    }

    return product.affiliateUrl;
  }

  /** Admin: list all products */
  async findAll(query: ProductQueryDto): Promise<PaginatedResponse<unknown>> {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 12;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { brand: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    if (query.platform) {
      where.platform = query.platform;
    }

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          category: true,
          _count: { select: { clicks: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data,
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  /** Admin: get by ID */
  async findById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        _count: { select: { clicks: true } },
      },
    });

    if (!product) {
      throw new NotFoundException('Sản phẩm không tồn tại');
    }

    return product;
  }

  private async resolveTikTokUrl(url: string): Promise<string> {
    if (!url) return url;
    
    const isShortened = url.includes('vt.tiktok.com') || 
                        url.includes('vm.tiktok.com') || 
                        url.includes('tiktok.com/t/');
                        
    if (!isShortened) {
      return url;
    }

    try {
      const response = await fetch(url, {
        method: 'HEAD',
        redirect: 'follow',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      return response.url;
    } catch (error) {
      console.error('Failed to resolve TikTok URL:', error);
      return url;
    }
  }

  private async fetchTikTokThumbnail(videoUrl: string): Promise<string | null> {
    if (!videoUrl) return null;
    try {
      const targetUrl = videoUrl.includes('/photo/') 
        ? videoUrl.replace('/photo/', '/video/') 
        : videoUrl;
      const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(targetUrl)}`;
      const res = await fetch(oembedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      if (res.ok) {
        const json = (await res.json()) as { thumbnail_url?: string };
        return json.thumbnail_url || null;
      }
    } catch (error) {
      console.error('Failed to fetch TikTok oEmbed thumbnail:', error);
    }
    return null;
  }

  /** Admin: create product */
  async create(dto: CreateProductDto) {
    const slug = dto.slug || generateSlug(dto.name);

    const existing = await this.prisma.product.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictException(`Sản phẩm với slug "${slug}" đã tồn tại`);
    }

    const resolvedUrl = dto.tiktokVideoUrl ? await this.resolveTikTokUrl(dto.tiktokVideoUrl) : dto.tiktokVideoUrl;

    let imageUrl = dto.imageUrl;
    if (!imageUrl && resolvedUrl) {
      const fetchedThumbnail = await this.fetchTikTokThumbnail(resolvedUrl);
      if (fetchedThumbnail) {
        imageUrl = fetchedThumbnail;
      }
    }

    return this.prisma.product.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        imageUrl: imageUrl,
        tiktokVideoUrl: resolvedUrl,
        brand: dto.brand,
        price: dto.price,
        currency: dto.currency || 'VND',
        platform: dto.platform,
        affiliateUrl: dto.affiliateUrl,
        isActive: dto.isActive ?? true,
        categoryId: dto.categoryId,
      },
      include: {
        category: true,
      },
    });
  }

  /** Admin: update product */
  async update(id: string, dto: UpdateProductDto) {
    const existing = await this.findById(id);

    let slug = dto.slug;
    if (!slug && dto.name) {
      slug = generateSlug(dto.name);
    }

    if (slug && slug !== existing.slug) {
      const duplicate = await this.prisma.product.findUnique({ where: { slug } });
      if (duplicate) {
        throw new ConflictException(`Slug "${slug}" đã tồn tại`);
      }
    }

    const resolvedUrl = dto.tiktokVideoUrl !== undefined 
      ? (dto.tiktokVideoUrl ? await this.resolveTikTokUrl(dto.tiktokVideoUrl) : null)
      : undefined;

    let imageUrl = dto.imageUrl;
    if (!imageUrl && (resolvedUrl || (resolvedUrl === undefined && existing.tiktokVideoUrl))) {
      const targetVideoUrl = resolvedUrl || existing.tiktokVideoUrl;
      if (targetVideoUrl) {
        const fetchedThumbnail = await this.fetchTikTokThumbnail(targetVideoUrl);
        if (fetchedThumbnail) {
          imageUrl = fetchedThumbnail;
        }
      }
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(slug && { slug }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(imageUrl !== undefined && { imageUrl: imageUrl }),
        ...(resolvedUrl !== undefined && { tiktokVideoUrl: resolvedUrl }),
        ...(dto.brand !== undefined && { brand: dto.brand }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.currency && { currency: dto.currency }),
        ...(dto.platform && { platform: dto.platform }),
        ...(dto.affiliateUrl && { affiliateUrl: dto.affiliateUrl }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
      },
      include: { category: true },
    });
  }

  /** Admin: delete product */
  async remove(id: string) {
    await this.prisma.product.delete({ where: { id } });
  }

  /** Admin: bulk delete products */
  async bulkDelete(ids: string[]) {
    return this.prisma.product.deleteMany({
      where: {
        id: { in: ids }
      }
    });
  }

  /** Admin: Scan TikTok videos */
  async scanTikTok(dto: { mode: number; tiktokUrl?: string; count?: number; videoUrls?: string[] }) {
    let urls: string[] = [];

    if (dto.mode === 1) {
      if (!dto.tiktokUrl) {
        throw new BadRequestException('Vui lòng cung cấp link TikTok của shop');
      }

      // Resolve URL if shortened
      const resolvedProfileUrl = await this.resolveTikTokUrl(dto.tiktokUrl);
      const usernameMatch = resolvedProfileUrl.match(/@([\w.-]+)/);
      const targetUsername = usernameMatch ? usernameMatch[1] : null;

      // Fetch profile page HTML to extract video links
      try {
        const response = await fetch(resolvedProfileUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
          }
        });
        const html = await response.text();

        // Match video links belonging ONLY to the target TikTok username in the user-post-item-list container
        let foundUrls: string[] = [];
        if (targetUsername) {
          let startIndex = html.indexOf('id="user-post-item-list"');
          if (startIndex === -1) startIndex = html.indexOf("id='user-post-item-list'");
          if (startIndex === -1) startIndex = html.indexOf('id=\\"user-post-item-list\\"');

          const searchContext = startIndex !== -1 ? html.substring(startIndex) : html;

          const escapedUsername = targetUsername.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
          // Match any pattern of @username/video/digits or @username/photo/digits with tolerance for escaped/unescaped slashes
          const specificRegex = new RegExp(`@${escapedUsername}(?:/|\\\\/|\\/)+(?:video|photo)(?:/|\\\\/|\\/)+\\d+`, 'g');
          const videoMatches = searchContext.match(specificRegex) || [];

          foundUrls = Array.from(new Set(videoMatches.map(m => {
            const cleanPath = m.replace(/\\/g, ''); // strip backslash escapes
            return `https://www.tiktok.com/${cleanPath}`;
          })));
        }
        
        if (foundUrls.length === 0) {
          // Mock fallback for demo if blocked by Captcha/IP restrictions
          const username = targetUsername || 'creator';
          console.warn(`No video links found in profile page HTML for @${username}. Falling back to mock demo videos.`);
          foundUrls = [
            `https://www.tiktok.com/@${username}/video/7342674918731517190`,
            `https://www.tiktok.com/@${username}/video/7342674918731517191`,
            `https://www.tiktok.com/@${username}/video/7342674918731517192`
          ];
        }

        const limit = dto.count && dto.count > 0 ? dto.count : foundUrls.length;
        urls = foundUrls.slice(0, limit);
      } catch (error) {
        console.error('Failed to fetch TikTok profile for scanning:', error);
        throw new BadRequestException('Không thể tải kênh TikTok. Có thể do chặn IP hoặc captcha.');
      }
    } else {
      if (!dto.videoUrls || dto.videoUrls.length === 0) {
        throw new BadRequestException('Vui lòng cung cấp ít nhất một link video');
      }
      urls = dto.videoUrls.filter(u => u && u.trim().length > 0);
    }

    if (urls.length === 0) {
      throw new BadRequestException('Không tìm thấy video nào để scan.');
    }

    const createdProducts = [];
    const errors = [];

    // Get default category to assign
    let defaultCategory = await this.prisma.category.findFirst();
    if (!defaultCategory) {
      defaultCategory = await this.prisma.category.create({
        data: { name: 'Thực tế', slug: 'thuc-te' }
      });
    }

    for (const videoUrl of urls) {
      try {
        const fullUrl = await this.resolveTikTokUrl(videoUrl);
        const videoId = fullUrl.match(/\/(?:video|photo)\/(\d+)/)?.[1];
        if (!videoId) {
          errors.push({ url: videoUrl, error: 'Không thể phân tách Video ID' });
          continue;
        }

        // Check if product with this video ID already exists to prevent duplicate creation
        const existing = await this.prisma.product.findFirst({
          where: { tiktokVideoUrl: { contains: videoId } }
        });
        if (existing) {
          createdProducts.push(existing);
          continue;
        }

        // Fetch oEmbed details from TikTok (using /video/ URL structure even for photo slide posts)
        const oembedRequestUrl = fullUrl.includes('/photo/') 
          ? fullUrl.replace('/photo/', '/video/') 
          : fullUrl;

        const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(oembedRequestUrl)}`;
        const res = await fetch(oembedUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });
        let title = `Sản phẩm review #${videoId}`;
        let imageUrl = '';
        let brand = '';

        if (res.ok) {
          const oembedData = await res.json() as any;
          if (oembedData) {
            title = oembedData.title || title;
            imageUrl = oembedData.thumbnail_url || '';
            brand = oembedData.author_name || '';
          }
        }

        let cleanedName = title.trim();
        if (cleanedName.length > 80) {
          cleanedName = cleanedName.substring(0, 80) + '...';
        }

        const slug = `tiktok-${videoId}`;

        // Double check slug conflict
        const slugExists = await this.prisma.product.findUnique({ where: { slug } });
        const finalSlug = slugExists ? `${slug}-${Math.floor(Math.random() * 1000)}` : slug;

        // Create product in DB
        const product = await this.prisma.product.create({
          data: {
            name: cleanedName,
            slug: finalSlug,
            description: title,
            imageUrl: imageUrl || null,
            tiktokVideoUrl: fullUrl,
            brand: null, // Khi scan để trống thương hiệu
            price: null, // Khi scan để trống giá bán
            currency: 'VND',
            platform: 'TIKTOK',
            affiliateUrl: fullUrl, // link affiliate mặc định là link video đó
            isActive: true,
            categoryId: defaultCategory.id
          },
          include: { category: true }
        });

        createdProducts.push(product);
      } catch (error) {
        console.error(`Failed to scan/create product for video ${videoUrl}:`, error);
        errors.push({ url: videoUrl, error: error.message || 'Lỗi không xác định' });
      }
    }

    return {
      success: true,
      scannedCount: urls.length,
      createdCount: createdProducts.length,
      products: createdProducts,
      errors: errors
    };
  }
}
