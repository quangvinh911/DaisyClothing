import {
  Controller, Get, Post, Put, Delete,
  Body, Param, UseGuards,
} from '@nestjs/common';
import { SocialLinksService, CreateSocialLinkDto, UpdateSocialLinkDto } from './social-links.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('social-links')
export class SocialLinksController {
  constructor(private readonly socialLinksService: SocialLinksService) {}

  /** Public: get active social links */
  @Get()
  findActive() {
    return this.socialLinksService.findActive();
  }

  /** Admin: get all social links (including inactive) */
  @UseGuards(JwtAuthGuard)
  @Get('admin/list')
  findAll() {
    return this.socialLinksService.findAll();
  }

  /** Admin: create social link */
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateSocialLinkDto) {
    return this.socialLinksService.create(dto);
  }

  /** Admin: update social link */
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSocialLinkDto) {
    return this.socialLinksService.update(id, dto);
  }

  /** Admin: delete social link */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.socialLinksService.remove(id);
  }
}
