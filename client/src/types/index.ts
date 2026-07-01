export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featuredImageUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  categoryId: string | null;
  category: Category | null;
  authorId: string;
  author: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
  };
  tags: Array<{ tag: Tag }>;
  products: Array<{ product: Product; displayOrder: number }>;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  brand: string | null;
  price: number | null;
  currency: string;
  platform: 'TIKTOK' | 'SHOPEE' | 'LAZADA' | 'AMAZON' | 'OTHER';
  affiliateUrl: string;
  tiktokVideoUrl?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  categoryId: string | null;
  category: Category | null;
  _count?: { clicks: number };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  _count?: { posts: number; products: number };
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  _count?: { posts: number };
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface SiteSetting {
  id: string;
  key: string;
  value: string;
  description: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface DashboardStats {
  pageViews: { total: number; today: number; week: number; month: number };
  affiliateClicks: { total: number; today: number; week: number; month: number };
  content: { publishedPosts: number; activeProducts: number };
}

export interface ChartDataPoint {
  date: string;
  clicks?: number;
  views?: number;
}

export interface TopProduct {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  platform: string;
  clicks: number;
}

export interface PlatformClicks {
  platform: string;
  clicks: number;
}

export interface ReferrerSource {
  source: string;
  views: number;
}
