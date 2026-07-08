import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TrackPageViewDto } from './dto/analytics.dto';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Track a page view */
  async trackPageView(
    dto: TrackPageViewDto,
    ipAddress: string | null,
    userAgent: string | null,
  ) {
    return this.prisma.pageView.create({
      data: {
        pageUrl: dto.pageUrl,
        pageType: dto.pageType,
        referenceId: dto.referenceId,
        ipAddress,
        userAgent,
        referrerUrl: dto.referrerUrl,
      },
    });
  }

  /** Dashboard: overview stats */
  async getDashboardStats() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(todayStart);
    monthStart.setDate(monthStart.getDate() - 30);

    const [
      totalPageViews,
      todayPageViews,
      weekPageViews,
      monthPageViews,
      totalClicks,
      todayClicks,
      weekClicks,
      monthClicks,
      totalPosts,
      totalProducts,
    ] = await Promise.all([
      this.prisma.pageView.count(),
      this.prisma.pageView.count({ where: { viewedAt: { gte: todayStart } } }),
      this.prisma.pageView.count({ where: { viewedAt: { gte: weekStart } } }),
      this.prisma.pageView.count({ where: { viewedAt: { gte: monthStart } } }),
      this.prisma.affiliateClick.count(),
      this.prisma.affiliateClick.count({ where: { clickedAt: { gte: todayStart } } }),
      this.prisma.affiliateClick.count({ where: { clickedAt: { gte: weekStart } } }),
      this.prisma.affiliateClick.count({ where: { clickedAt: { gte: monthStart } } }),
      this.prisma.post.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.product.count({ where: { isActive: true } }),
    ]);

    return {
      pageViews: { total: totalPageViews, today: todayPageViews, week: weekPageViews, month: monthPageViews },
      affiliateClicks: { total: totalClicks, today: todayClicks, week: weekClicks, month: monthClicks },
      content: { publishedPosts: totalPosts, activeProducts: totalProducts },
    };
  }

  /** Top products by clicks */
  async getTopProducts(limit: any = 10, days: any = 30) {
    const parsedLimit = isNaN(Number(limit)) || Number(limit) <= 0 ? 10 : Number(limit);
    const parsedDays = isNaN(Number(days)) || Number(days) <= 0 ? 30 : Number(days);

    const since = new Date();
    since.setDate(since.getDate() - parsedDays);

    const topProducts = await this.prisma.affiliateClick.groupBy({
      by: ['productId'],
      where: { clickedAt: { gte: since } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: parsedLimit,
    });

    const productIds = topProducts.map((p) => p.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, slug: true, imageUrl: true, platform: true },
    });

    return topProducts.map((tp) => ({
      ...products.find((p) => p.id === tp.productId),
      clicks: tp._count.id,
    }));
  }

  /** Daily click stats for charts */
  async getClicksByDay(days: number = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const clicks = await this.prisma.affiliateClick.findMany({
      where: { clickedAt: { gte: since } },
      select: { clickedAt: true },
      orderBy: { clickedAt: 'asc' },
    });

    // Group by date
    const grouped = new Map<string, number>();
    for (const click of clicks) {
      const dateKey = click.clickedAt.toISOString().split('T')[0];
      grouped.set(dateKey, (grouped.get(dateKey) || 0) + 1);
    }

    return Array.from(grouped.entries()).map(([date, count]) => ({
      date,
      clicks: count,
    }));
  }

  /** Daily page view stats for charts */
  async getPageViewsByDay(days: number = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const views = await this.prisma.pageView.findMany({
      where: { viewedAt: { gte: since } },
      select: { viewedAt: true },
      orderBy: { viewedAt: 'asc' },
    });

    const grouped = new Map<string, number>();
    for (const view of views) {
      const dateKey = view.viewedAt.toISOString().split('T')[0];
      grouped.set(dateKey, (grouped.get(dateKey) || 0) + 1);
    }

    return Array.from(grouped.entries()).map(([date, count]) => ({
      date,
      views: count,
    }));
  }

  /** Clicks by platform */
  async getClicksByPlatform(days: number = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const clicks = await this.prisma.affiliateClick.findMany({
      where: { clickedAt: { gte: since } },
      include: {
        product: { select: { platform: true } },
      },
    });

    const grouped = new Map<string, number>();
    for (const click of clicks) {
      const platform = click.product.platform;
      grouped.set(platform, (grouped.get(platform) || 0) + 1);
    }

    return Array.from(grouped.entries()).map(([platform, count]) => ({
      platform,
      clicks: count,
    }));
  }

  /** Recent affiliate click details grouped with Cloudflare country data */
  async getAffiliateClickDetails(limit: any = 50, days: any = 30) {
    const parsedLimit = isNaN(Number(limit)) || Number(limit) <= 0 ? 50 : Math.min(Number(limit), 200);
    const parsedDays = isNaN(Number(days)) || Number(days) <= 0 ? 30 : Number(days);

    const since = new Date();
    since.setDate(since.getDate() - parsedDays);

    const clicks = await this.prisma.affiliateClick.findMany({
      where: { clickedAt: { gte: since } },
      orderBy: { clickedAt: 'desc' },
      take: parsedLimit,
      select: {
        id: true,
        ipAddress: true,
        country: true,
        referrerUrl: true,
        utmSource: true,
        clickedAt: true,
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            platform: true,
          },
        },
      },
    });

    const countryMap = new Map<string, number>();
    for (const click of clicks) {
      const country = click.country || 'Unknown';
      countryMap.set(country, (countryMap.get(country) || 0) + 1);
    }

    const countries = Array.from(countryMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([country, clicks]) => ({ country, clicks }));

    return {
      clicks,
      countries,
    };
  }

  /** Top referrer sources */
  async getTopReferrers(limit: number = 10, days: number = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const views = await this.prisma.pageView.findMany({
      where: {
        viewedAt: { gte: since },
        referrerUrl: { not: null },
      },
      select: { referrerUrl: true },
    });

    const grouped = new Map<string, number>();
    for (const view of views) {
      if (view.referrerUrl) {
        try {
          const hostname = new URL(view.referrerUrl).hostname;
          grouped.set(hostname, (grouped.get(hostname) || 0) + 1);
        } catch {
          grouped.set(view.referrerUrl, (grouped.get(view.referrerUrl) || 0) + 1);
        }
      }
    }

    return Array.from(grouped.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([source, count]) => ({ source, views: count }));
  }
}
