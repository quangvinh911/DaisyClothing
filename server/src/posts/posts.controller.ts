import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards, Request,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto, UpdatePostDto, PostQueryDto } from './dto/post.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // ─── Public Endpoints ────────────────────────────────────

  /** Public: list published posts */
  @Get()
  findPublished(@Query() query: PostQueryDto) {
    return this.postsService.findPublished(query);
  }

  /** Public: get all slugs for SSG */
  @Get('slugs')
  findAllSlugs() {
    return this.postsService.findAllSlugs();
  }

  /** Public: get latest posts */
  @Get('latest')
  findLatest(@Query('count') count?: number) {
    return this.postsService.findLatest(count);
  }

  /** Public: get post by slug */
  @Get('by-slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.postsService.findBySlug(slug);
  }

  // ─── Admin Endpoints ─────────────────────────────────────

  /** Admin: list all posts (any status) */
  @UseGuards(JwtAuthGuard)
  @Get('admin/list')
  findAll(@Query() query: PostQueryDto) {
    return this.postsService.findAll(query);
  }

  /** Admin: get post by ID */
  @UseGuards(JwtAuthGuard)
  @Get('admin/:id')
  findById(@Param('id') id: string) {
    return this.postsService.findById(id);
  }

  /** Admin: generate post content using AI */
  @UseGuards(JwtAuthGuard)
  @Post('generate-ai')
  generateAi(
    @Body() body: { prompt?: string; url?: string },
  ) {
    return this.postsService.generateAiPost(body.prompt, body.url);
  }

  /** Admin: create post */
  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Request() req: { user: { id: string } },
    @Body() dto: CreatePostDto,
  ) {
    return this.postsService.create(req.user.id, dto);
  }

  /** Admin: update post */
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePostDto) {
    return this.postsService.update(id, dto);
  }

  /** Admin: delete post */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postsService.remove(id);
  }
}
