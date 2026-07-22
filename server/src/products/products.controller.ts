import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, Res, Req, UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from './dto/product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly prisma: PrismaService,
  ) {}

  private getHeaderValue(value: string | string[] | undefined): string | null {
    if (Array.isArray(value)) return value[0] || null;
    return value || null;
  }

  private getClientIp(req: Request): string | null {
    const cloudflareIp = this.getHeaderValue(req.headers['cf-connecting-ip']);
    const forwardedFor = this.getHeaderValue(req.headers['x-forwarded-for']);
    return cloudflareIp || forwardedFor?.split(',')[0]?.trim() || req.ip || req.socket.remoteAddress || null;
  }

  // ─── Public Endpoints ────────────────────────────────────

  /** Public: list active products */
  @Get()
  findActive(@Query() query: ProductQueryDto) {
    return this.productsService.findActive(query);
  }

  /** Public: get fresh TikTok cover image */
  @Get('tiktok-cover')
  async getTikTokCover(
    @Query('url') tiktokUrl: string,
    @Res() res: Response,
  ) {
    if (!tiktokUrl) {
      return res.status(400).send('Missing url parameter');
    }
    const freshUrl = await this.productsService.getFreshTikTokCover(tiktokUrl);
    if (freshUrl) {
      return res.redirect(freshUrl);
    }
    return res.status(404).send('Cover not found');
  }

  /** Public: featured products for homepage */
  @Get('featured')
  findFeatured(@Query('count') count?: number) {
    return this.productsService.findFeatured(count);
  }

  /** Public: get product by slug */
  @Get('by-slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  /**
   * Affiliate redirect endpoint.
   * Logs the click and redirects to the affiliate URL.
   */
  @Get('redirect/:slug')
  async redirect(
    @Param('slug') slug: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('utm_source') utmSource?: string,
    @Query('utm_medium') utmMedium?: string,
    @Query('utm_campaign') utmCampaign?: string,
  ) {
    const affiliateUrl = await this.productsService.getAffiliateUrl(slug);

    // Find product to get ID for click tracking
    const product = await this.prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    });

    const userAgent = req.headers['user-agent'] || '';
    const isBot = /bot|googlebot|crawler|spider|robot|crawling|ahrefs|semrush|bytespider|facebookexternalhit|tiktokbot|telegrambot|whatsapp/i.test(userAgent);

    if (product && !isBot) {
      // Log click asynchronously (don't block redirect)
      this.prisma.affiliateClick.create({
        data: {
          productId: product.id,
          ipAddress: this.getClientIp(req),
          country: this.getHeaderValue(req.headers['cf-ipcountry']),
          userAgent: userAgent || null,
          referrerUrl: req.headers['referer'] || null,
          utmSource: utmSource || null,
          utmMedium: utmMedium || null,
          utmCampaign: utmCampaign || null,
        },
      }).catch((error) => {
        console.error('Failed to log affiliate click:', error);
      });
    }

    return res.redirect(302, affiliateUrl);
  }

  // ─── Admin Endpoints ─────────────────────────────────────

  /** Admin: list all products */
  @UseGuards(JwtAuthGuard)
  @Get('admin/list')
  findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  /** Admin: get product by ID */
  @UseGuards(JwtAuthGuard)
  @Get('admin/:id')
  findById(@Param('id') id: string) {
    return this.productsService.findById(id);
  }

  /** Admin: create product */
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  /** Admin: scan TikTok videos to auto create products */
  @UseGuards(JwtAuthGuard)
  @Post('admin/scan')
  scan(@Body() dto: { mode: number; tiktokUrl?: string; count?: number; videoUrls?: string[] }) {
    return this.productsService.scanTikTok(dto);
  }

  /** Admin: bulk delete products */
  @UseGuards(JwtAuthGuard)
  @Post('admin/bulk-delete')
  bulkDelete(@Body() dto: { ids: string[] }) {
    return this.productsService.bulkDelete(dto.ids);
  }

  /** Admin: update product */
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  /** Admin: delete product */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
