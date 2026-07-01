import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { TagsModule } from './tags/tags.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { UploadModule } from './upload/upload.module';
import { SettingsModule } from './settings/settings.module';
import { SocialLinksModule } from './social-links/social-links.module';

@Module({
  imports: [
    // Serve uploaded files statically
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),

    // Core modules
    PrismaModule,
    AuthModule,

    // Feature modules
    PostsModule,
    ProductsModule,
    CategoriesModule,
    TagsModule,
    AnalyticsModule,
    UploadModule,
    SettingsModule,
    SocialLinksModule,
  ],
})
export class AppModule {}
