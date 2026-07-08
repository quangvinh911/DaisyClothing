import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import styles from "./post.module.scss";
import { api, getAssetUrl, API_BASE } from "@/lib/api";
import { Post } from "@/types";
import ProductCard from "@/components/ProductCard";

interface PostDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(dateStr));
}

function formatPrice(price: number | null): string {
  if (price === null) return "Liên hệ";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

// ─── SSG static generation of paths ──────────────────────────
export async function generateStaticParams() {
  try {
    const slugs = await api.getPostSlugs();
    if (Array.isArray(slugs)) {
      return slugs.map((slug) => ({ slug }));
    }
  } catch (error) {
    console.error("Failed to generate static params for posts:", error);
  }
  return [];
}

// ─── Dynamic SEO Metadata ────────────────────────────────────
export async function generateMetadata({
  params,
}: PostDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = (await api.getPostBySlug(slug)) as Post;
    if (post) {
      const metaTitle = post.metaTitle || `${post.title} | DaisyDaily`;
      const metaDescription =
        post.metaDescription ||
        post.excerpt ||
        post.content.replace(/<[^>]*>/g, "").slice(0, 160);
      const imageUrl = getAssetUrl(post.featuredImageUrl);

      return {
        title: metaTitle,
        description: metaDescription,
        alternates: {
          canonical: post.category?.slug === "outfits" ? `/lookbook/${slug}` : `/blog/${slug}`,
        },
        openGraph: {
          title: metaTitle,
          description: metaDescription,
          images: imageUrl ? [{ url: imageUrl }] : undefined,
          type: "article",
          publishedTime: post.publishedAt || undefined,
        },
      };
    }
  } catch (e) {
    // Ignore, fallback to default metadata
  }

  return {
    title: "Bài viết không tìm thấy",
  };
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { slug } = await params;

  let post: Post | null = null;
  try {
    const res = await api.getPostBySlug(slug);
    if (res) {
      post = res as Post;
    }
  } catch (error) {
    console.error(`Failed to fetch post slug "${slug}":`, error);
  }

  if (!post) {
    notFound();
  }

  const featuredImgUrl = getAssetUrl(post.featuredImageUrl);

  return (
    <div className={styles.postDetail}>
      <div className="container container--narrow">
        <Link href="/blog" className={styles.postDetail__back}>
          &larr; Quay lại Blog
        </Link>

        <header className={styles.postDetail__header}>
          {post.category && (
            <span className={styles.postDetail__category}>
              {post.category.name}
            </span>
          )}
          <h1 className={styles.postDetail__title}>{post.title}</h1>
          <div className={styles.postDetail__meta}>
            <span className={styles.postDetail__author}>
              Bởi {post.author?.displayName || "DaisyDaily"}
            </span>
            <time>{formatDate(post.publishedAt)}</time>
          </div>
        </header>

        {featuredImgUrl && (
          <div className={styles.postDetail__featuredImage}>
            <img src={featuredImgUrl} alt={post.title} />
          </div>
        )}

        {/* Content (HTML rendered safely from DB) */}
        <article
          className={styles.postDetail__body}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {post.tags && post.tags.length > 0 && (
          <div className={styles.postDetail__tags}>
            {post.tags.map(({ tag }) => (
              <Link
                key={tag.id}
                href={`/blog?tag=${tag.slug}`}
                className={styles.postDetail__tag}
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        )}

        {/* ─── Shop My Look / Featured Products in Post ───────── */}
        {post.products && post.products.length > 0 && (
          <div className={styles.postDetail__products}>
            <h2 className={styles.postDetail__productsTitle}>Shop My Look 🌸</h2>
            <div className={styles.postDetail__productsGrid}>
              {post.products.map(({ product }, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          </div>
        )}

        {/* JSON-LD Structured Data — BlogPosting */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              "headline": post.title,
              "image": featuredImgUrl ? [featuredImgUrl] : [],
              "datePublished": post.publishedAt || post.createdAt,
              "dateModified": post.updatedAt,
              "author": [
                {
                  "@type": "Person",
                  "name": post.author?.displayName || "DaisyDaily",
                },
              ],
              "publisher": {
                "@type": "Organization",
                "name": "DaisyDaily",
                "url": "https://daisydaily.shop",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://daisydaily.shop/icon.svg",
                },
              },
              "description": post.excerpt || post.title,
              "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": `https://daisydaily.shop/blog/${post.slug}`,
              },
              "articleSection": post.category?.name || "Blog",
              "wordCount": post.content.replace(/<[^>]*>/g, "").split(/\s+/).length,
            }),
          }}
        />
        {/* JSON-LD — BreadcrumbList */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Trang chủ",
                  "item": "https://daisydaily.shop",
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Blog",
                  "item": "https://daisydaily.shop/blog",
                },
                {
                  "@type": "ListItem",
                  "position": 3,
                  "name": post.title,
                  "item": `https://daisydaily.shop/blog/${post.slug}`,
                },
              ],
            }),
          }}
        />
      </div>
    </div>
  );
}
