import {
  Controller, Get, Post, Body, Query, Req, UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AnalyticsService } from './analytics.service';
import { TrackPageViewDto, AnalyticsQueryDto } from './dto/analytics.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /** Public: track page view */
  @Post('track')
  async trackPageView(@Body() dto: TrackPageViewDto, @Req() req: Request) {
    const ipAddress = req.ip || req.socket.remoteAddress || null;
    const userAgent = req.headers['user-agent'] || null;
    return this.analyticsService.trackPageView(dto, ipAddress, userAgent);
  }

  // ─── Admin Endpoints ─────────────────────────────────────

  /** Admin: dashboard overview */
  @UseGuards(JwtAuthGuard)
  @Get('dashboard')
  getDashboardStats() {
    return this.analyticsService.getDashboardStats();
  }

  /** Admin: top products by clicks */
  @UseGuards(JwtAuthGuard)
  @Get('top-products')
  getTopProducts(
    @Query('limit') limit?: number,
    @Query('days') days?: number,
  ) {
    return this.analyticsService.getTopProducts(limit, days);
  }

  /** Admin: daily click chart data */
  @UseGuards(JwtAuthGuard)
  @Get('clicks-by-day')
  getClicksByDay(@Query('days') days?: number) {
    return this.analyticsService.getClicksByDay(days);
  }

  /** Admin: daily page views chart data */
  @UseGuards(JwtAuthGuard)
  @Get('views-by-day')
  getPageViewsByDay(@Query('days') days?: number) {
    return this.analyticsService.getPageViewsByDay(days);
  }

  /** Admin: clicks grouped by platform */
  @UseGuards(JwtAuthGuard)
  @Get('clicks-by-platform')
  getClicksByPlatform(@Query('days') days?: number) {
    return this.analyticsService.getClicksByPlatform(days);
  }

  /** Admin: recent affiliate click details by IP/country */
  @UseGuards(JwtAuthGuard)
  @Get('affiliate-click-details')
  getAffiliateClickDetails(
    @Query('limit') limit?: number,
    @Query('days') days?: number,
  ) {
    return this.analyticsService.getAffiliateClickDetails(limit, days);
  }

  /** Admin: top referrer sources */
  @UseGuards(JwtAuthGuard)
  @Get('top-referrers')
  getTopReferrers(
    @Query('limit') limit?: number,
    @Query('days') days?: number,
  ) {
    return this.analyticsService.getTopReferrers(limit, days);
  }
}
