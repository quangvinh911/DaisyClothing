import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from './dto/product.dto';
import { generateSlug, buildPaginationMeta } from '../common/utils/helpers';
import { PaginatedResponse } from '../common/dto/pagination.dto';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { join, resolve } from 'path';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  private getTikTokHeaders(): Record<string, string> {
    return {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
    };
  }

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

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    if (query.sortBy === 'best_seller') {
      orderBy = { views: 'desc' };
    } else if (query.sortBy === 'price_asc') {
      orderBy = { price: 'asc' };
    } else if (query.sortBy === 'price_desc') {
      orderBy = { price: 'desc' };
    } else if (query.sortBy === 'latest') {
      orderBy = { createdAt: 'desc' };
    }

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          category: true,
          _count: { select: { clicks: true } },
        },
        orderBy,
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

    const sortOrder: Prisma.SortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';
    let orderBy: Prisma.ProductOrderByWithRelationInput[];

    switch (query.sortBy) {
      case 'favorite':
        orderBy = [
          { isFavorite: sortOrder },
          { createdAt: 'desc' },
          { id: 'asc' },
        ];
        break;
      case 'name':
        orderBy = [{ name: sortOrder }, { id: 'asc' }];
        break;
      case 'brand':
        orderBy = [
          { brand: { sort: sortOrder, nulls: 'last' } },
          { id: 'asc' },
        ];
        break;
      case 'price':
        orderBy = [
          { price: { sort: sortOrder, nulls: 'last' } },
          { id: 'asc' },
        ];
        break;
      case 'platform':
        orderBy = [{ platform: sortOrder }, { id: 'asc' }];
        break;
      case 'clicks':
        orderBy = [
          { clicks: { _count: sortOrder } },
          { id: 'asc' },
        ];
        break;
      case 'createdAt':
        orderBy = [{ createdAt: sortOrder }, { id: 'asc' }];
        break;
      case 'isActive':
        orderBy = [{ isActive: sortOrder }, { id: 'asc' }];
        break;
      default:
        orderBy = [
          { isFavorite: 'desc' },
          { createdAt: 'desc' },
          { id: 'asc' },
        ];
    }

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          category: true,
          _count: { select: { clicks: true } },
        },
        orderBy,
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

  private extractTikTokUrls(value: string): string[] {
    if (!value) return [];

    const matches = value.match(
      /https?:\/\/(?:[a-z0-9-]+\.)*tiktok\.com\/[^\s<>"'[\](){}]+/gi,
    ) || [];

    return Array.from(new Set(
      matches.map(url => url.replace(/[.,;:!?]+$/, '')),
    ));
  }

  private getTikTokVideoId(value: string): string | null {
    return value.match(/\/(?:video|photo)\/(\d+)/)?.[1] || null;
  }

  private normalizeTikTokVideoUrl(value: string): string {
    const extractedUrl = this.extractTikTokUrls(value)[0] || value.trim();

    try {
      const parsedUrl = new URL(extractedUrl);
      parsedUrl.search = '';
      parsedUrl.hash = '';
      return parsedUrl.toString().replace(/\/$/, '');
    } catch {
      return extractedUrl;
    }
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
        headers: this.getTikTokHeaders(),
      });
      return response.url;
    } catch (error) {
      console.error('Failed to resolve TikTok URL:', error);
      return url;
    }
  }

  private normalizeTikTokOEmbedUrl(videoUrl: string): string {
    return videoUrl.includes('/photo/')
      ? videoUrl.replace('/photo/', '/video/')
      : videoUrl;
  }

  private async fetchTikTokOEmbed(videoUrl: string): Promise<{
    title?: string;
    author_name?: string;
    thumbnail_url?: string;
  } | null> {
    if (!videoUrl) return null;
    try {
      const targetUrl = this.normalizeTikTokOEmbedUrl(videoUrl);
      const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(targetUrl)}`;
      const res = await fetch(oembedUrl, {
        headers: this.getTikTokHeaders(),
        signal: AbortSignal.timeout(15000),
      });
      if (res.ok) {
        return (await res.json()) as {
          title?: string;
          author_name?: string;
          thumbnail_url?: string;
        };
      }
    } catch (error) {
      console.error('Failed to fetch TikTok oEmbed data:', error);
    }
    return null;
  }

  private async fetchTikTokThumbnail(videoUrl: string): Promise<string | null> {
    const oembed = await this.fetchTikTokMetadata(videoUrl);
    return oembed?.thumbnail_url || null;
  }

  private async fetchTikTokMetadata(videoUrl: string) {
    const primary = await this.fetchTikTokOEmbed(videoUrl);
    if (primary?.title?.trim() && primary.thumbnail_url) return primary;
    try {
      const response = await fetch(
        `https://www.tikwm.com/api/?url=${encodeURIComponent(videoUrl)}`,
        { headers: this.getTikTokHeaders(), signal: AbortSignal.timeout(15000) },
      );
      if (response.ok) {
        const payload = await response.json() as {
          code?: number;
          data?: { title?: string; cover?: string; origin_cover?: string; images?: string[] };
        };
        if (payload.code === 0 && payload.data) {
          return {
            ...primary,
            title: primary?.title?.trim() || payload.data.title?.trim(),
            thumbnail_url: primary?.thumbnail_url || payload.data.cover ||
              payload.data.origin_cover || payload.data.images?.[0],
          };
        }
      }
    } catch {
      // Let the scan report missing metadata instead of inventing product details.
    }
    return primary;
  }

  private getTikTokProductName(caption: string): string {
    const name = caption.replace(/#[^\s#]+/gu, '').replace(/\s+/g, ' ').trim() || caption.trim();
    return name.length > 80 ? `${name.slice(0, 80)}...` : name;
  }

  private shouldRefreshTikTokThumbnail(imageUrl?: string | null): boolean {
    if (!imageUrl) return true;

    if (!imageUrl.includes('tiktokcdn.com')) {
      return false;
    }

    const refreshWindowSeconds = 24 * 60 * 60;
    const nowSeconds = Math.floor(Date.now() / 1000);

    try {
      const parsed = new URL(imageUrl);
      const expires = Number(parsed.searchParams.get('x-expires'));
      return Number.isFinite(expires) && expires <= nowSeconds + refreshWindowSeconds;
    } catch {
      const expiresMatch = imageUrl.match(/[?&]x-expires=(\d+)/);
      const expires = expiresMatch ? Number(expiresMatch[1]) : NaN;
      return Number.isFinite(expires) && expires <= nowSeconds + refreshWindowSeconds;
    }
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
        isFavorite: dto.isFavorite ?? false,
        isBestSeller: dto.isBestSeller ?? false,
        isNew: dto.isNew ?? false,
        views: dto.views ?? 0,
        likes: dto.likes ?? 0,
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
        ...(dto.isFavorite !== undefined && { isFavorite: dto.isFavorite }),
        ...(dto.isBestSeller !== undefined && { isBestSeller: dto.isBestSeller }),
        ...(dto.isNew !== undefined && { isNew: dto.isNew }),
        ...(dto.views !== undefined && { views: dto.views }),
        ...(dto.likes !== undefined && { likes: dto.likes }),
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
            ...this.getTikTokHeaders(),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
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
          throw new BadRequestException('Không lấy được video từ kênh TikTok. Vui lòng nhập trực tiếp link video/photo.');
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
      urls = Array.from(new Set(
        dto.videoUrls.flatMap(value =>
          typeof value === 'string' ? this.extractTikTokUrls(value) : [],
        ),
      ));
    }

    if (urls.length === 0) {
      throw new BadRequestException('Không tìm thấy video nào để scan.');
    }

    const createdProducts = [];
    const errors = [];
    const processedVideoIds = new Set<string>();

    // Get default category to assign
    let defaultCategory = await this.prisma.category.findFirst();
    if (!defaultCategory) {
      defaultCategory = await this.prisma.category.create({
        data: { name: 'Thực tế', slug: 'thuc-te' }
      });
    }

    for (const videoUrl of urls) {
      try {
        const resolvedUrl = await this.resolveTikTokUrl(videoUrl);
        const fullUrl = this.normalizeTikTokVideoUrl(resolvedUrl);
        const videoId = this.getTikTokVideoId(fullUrl);
        if (!videoId) {
          errors.push({ url: videoUrl, error: 'Không thể phân tách Video ID' });
          continue;
        }

        if (processedVideoIds.has(videoId)) {
          continue;
        }
        processedVideoIds.add(videoId);

        const slug = `tiktok-${videoId}`;

        // A legacy scan could store several pasted URLs in one field. Only treat a
        // candidate as the same product when that field represents one video.
        const candidates = await this.prisma.product.findMany({
          where: { tiktokVideoUrl: { contains: videoId } },
          include: { category: true },
        });
        let existing = candidates.find(product => {
          const storedUrls = this.extractTikTokUrls(product.tiktokVideoUrl || '');
          return storedUrls.length === 1 && this.getTikTokVideoId(storedUrls[0]) === videoId;
        });

        if (!existing) {
          const slugProduct = await this.prisma.product.findUnique({
            where: { slug },
            include: { category: true },
          });
          const slugProductUrls = this.extractTikTokUrls(slugProduct?.tiktokVideoUrl || '');
          if (slugProductUrls.some(url => this.getTikTokVideoId(url) === videoId)) {
            existing = slugProduct || undefined;
          }
        }

        if (existing) {
          const storedUrls = this.extractTikTokUrls(existing.tiktokVideoUrl || '');
          const shouldRepairStoredUrl = existing.slug === slug && (
            storedUrls.length !== 1 || existing.tiktokVideoUrl?.trim() !== storedUrls[0]
          );

          if (shouldRepairStoredUrl) {
            const affiliateUrls = this.extractTikTokUrls(existing.affiliateUrl);
            const shouldRepairAffiliateUrl = affiliateUrls.length > 1 || (
              affiliateUrls.length === 1 && existing.affiliateUrl.trim() !== affiliateUrls[0]
            );
            existing = await this.prisma.product.update({
              where: { id: existing.id },
              data: {
                tiktokVideoUrl: fullUrl,
                ...(shouldRepairAffiliateUrl && { affiliateUrl: fullUrl }),
              },
              include: { category: true },
            });
          }

          const shouldRepairName = /^Sản phẩm review #\d+$/.test(existing.name);
          const shouldRefreshImage = this.shouldRefreshTikTokThumbnail(existing.imageUrl);
          if (shouldRepairName || shouldRefreshImage) {
            const metadata = await this.fetchTikTokMetadata(fullUrl);
            const caption = metadata?.title?.trim();
            const thumbnail = metadata?.thumbnail_url;
            if ((shouldRepairName && caption) || (shouldRefreshImage && thumbnail)) {
              existing = await this.prisma.product.update({
                where: { id: existing.id },
                data: {
                  ...(shouldRepairName && caption && {
                    name: this.getTikTokProductName(caption), description: caption,
                  }),
                  ...(shouldRefreshImage && thumbnail && { imageUrl: thumbnail }),
                },
                include: { category: true },
              });
            }
            if ((shouldRepairName && !caption) || (shouldRefreshImage && !thumbnail)) {
              errors.push({ url: videoUrl, error: 'TikTok chưa trả đủ caption/thumbnail để sửa sản phẩm. Vui lòng thử lại hoặc chỉnh sửa thủ công.' });
            }
          }
          createdProducts.push(existing);
          continue;
        }

        const metadata = await this.fetchTikTokMetadata(fullUrl);
        const title = metadata?.title?.trim();
        const imageUrl = metadata?.thumbnail_url;
        if (!title || !imageUrl) {
          errors.push({ url: videoUrl, error: 'Không lấy được caption hoặc thumbnail TikTok. Chưa tạo sản phẩm; vui lòng thử lại hoặc thêm thủ công.' });
          continue;
        }
        const cleanedName = this.getTikTokProductName(title);

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

    const uniqueProducts = Array.from(
      new Map(createdProducts.map(product => [product.id, product])).values(),
    );

    return {
      success: true,
      scannedCount: processedVideoIds.size,
      createdCount: uniqueProducts.length,
      products: uniqueProducts,
      errors: errors
    };
  }

  private coverCache = new Map<string, { url: string; expiresAt: number }>();
  private coverRequests = new Map<string, Promise<{ buffer: Buffer; contentType: string } | null>>();
  private videoCache = new Map<string, { url: string; expiresAt: number }>();

  async getTikTokCoverImage(tiktokUrl: string): Promise<{ buffer: Buffer; contentType: string } | null> {
    const videoId = this.getTikTokVideoId(tiktokUrl);
    if (!videoId) return null;
    const pending = this.coverRequests.get(videoId);
    if (pending) return pending;
    const request = this.loadTikTokCoverImage(tiktokUrl, videoId);
    this.coverRequests.set(videoId, request);
    try {
      return await request;
    } finally {
      this.coverRequests.delete(videoId);
    }
  }

  private async loadTikTokCoverImage(tiktokUrl: string, videoId: string) {
    // A post's cover is stable; retain the bytes instead of an expiring CDN URL.
    const directory = resolve(process.env.UPLOAD_DIR || 'uploads', 'tiktok-covers');
    const cachePath = join(directory, `${videoId}.json`);
    try {
      const cached = JSON.parse(await readFile(cachePath, 'utf8')) as {
        contentType: string; data: string;
      };
      if (cached.contentType?.startsWith('image/') && cached.data) {
        return { buffer: Buffer.from(cached.data, 'base64'), contentType: cached.contentType };
      }
    } catch {
      // First request, or an incomplete cache file: fetch a usable cover below.
    }

    const product = await this.prisma.product.findFirst({
      where: { tiktokVideoUrl: tiktokUrl }, select: { imageUrl: true },
    });
    const download = async (url?: string | null) => {
      if (!url || !/^https?:\/\//i.test(url)) return null;
      try {
        const response = await fetch(url, {
          headers: { ...this.getTikTokHeaders(), Accept: 'image/*' },
          signal: AbortSignal.timeout(10000),
        });
        const contentType = response.headers.get('content-type')?.split(';')[0];
        if (!response.ok || !contentType?.startsWith('image/')) return null;
        const buffer = Buffer.from(await response.arrayBuffer());
        return buffer.length ? { buffer, contentType } : null;
      } catch {
        return null;
      }
    };
    let image = await download(product?.imageUrl);
    if (!image) image = await download(await this.getFreshTikTokCover(tiktokUrl));
    if (!image) return null;
    try {
      await mkdir(directory, { recursive: true });
      await writeFile(cachePath, JSON.stringify({
        contentType: image.contentType, data: image.buffer.toString('base64'),
      }));
    } catch {
      // Serve the fetched image even if the disk cache cannot be written.
    }
    return image;
  }

  async getTikTokVideoStreamUrl(tiktokUrl: string): Promise<string | null> {
    if (!tiktokUrl) return null;

    const cached = this.videoCache.get(tiktokUrl);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.url;
    }

    try {
      const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(tiktokUrl)}`;
      const response = await fetch(apiUrl, {
        headers: this.getTikTokHeaders(),
      });
      if (!response.ok) return null;

      const payload = await response.json() as {
        code?: number;
        data?: { play?: string };
      };
      const playUrl = payload.code === 0 ? payload.data?.play : null;
      if (!playUrl) return null;

      this.videoCache.set(tiktokUrl, {
        url: playUrl,
        expiresAt: Date.now() + 20 * 60 * 1000,
      });
      return playUrl;
    } catch {
      return null;
    }
  }

  async getFreshTikTokCover(tiktokUrl: string): Promise<string | null> {
    if (!tiktokUrl) return null;

    const cached = this.coverCache.get(tiktokUrl);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.url;
    }

    try {
      const data = await this.fetchTikTokMetadata(tiktokUrl);
      if (data && data.thumbnail_url) {
        this.coverCache.set(tiktokUrl, {
          url: data.thumbnail_url,
          expiresAt: Date.now() + 6 * 3600 * 1000,
        });

        // Async update DB with fresh image URL
        this.prisma.product.updateMany({
          where: { tiktokVideoUrl: tiktokUrl },
          data: { imageUrl: data.thumbnail_url },
        }).catch(() => null);

        return data.thumbnail_url;
      }
    } catch (e) {
      // Ignore
    }
    return null;
  }
}
