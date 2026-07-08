import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import styles from "./lookbook-detail.module.scss";
import { api, getAssetUrl } from "@/lib/api";
import { Post } from "@/types";
import ProductCard from "@/components/ProductCard";

interface LookbookDetailPageProps {
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

export async function generateStaticParams() {
  try {
    const slugs = await api.getPostSlugs();
    if (Array.isArray(slugs)) {
      return slugs.map((slug) => ({ slug }));
    }
  } catch (error) {
    console.error("Failed to generate static params for lookbooks:", error);
  }
  return [];
}

export async function generateMetadata({
  params,
}: LookbookDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = (await api.getPostBySlug(slug)) as Post;
    if (post) {
      const metaTitle = post.metaTitle || `${post.title} | Lookbook DaisyDaily`;
      const metaDescription =
        post.metaDescription ||
        post.excerpt ||
        post.content.replace(/<[^>]*>/g, "").slice(0, 160);
      const imageUrl = getAssetUrl(post.featuredImageUrl);

      return {
        title: metaTitle,
        description: metaDescription,
        alternates: {
          canonical: `/lookbook/${slug}`,
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
    // Ignore
  }

  return {
    title: "Lookbook không tìm thấy",
  };
}

export default async function LookbookDetailPage({ params }: LookbookDetailPageProps) {
  const { slug } = await params;

  let post: Post | null = null;
  try {
    const res = await api.getPostBySlug(slug);
    if (res) {
      post = res as Post;
    }
  } catch (error) {
    console.error(`Failed to fetch lookbook for slug "${slug}":`, error);
  }

  if (!post) {
    notFound();
  }

  const coverImg = getAssetUrl(post.featuredImageUrl);

  return (
    <div className={styles.lookbookDetail}>
      <div className="container container--narrow">
        <Link href="/lookbook" className={styles.lookbookDetail__back}>
          &larr; Quay lại danh sách Lookbook
        </Link>

        <header className={styles.lookbookDetail__header}>
          <span className={styles.lookbookDetail__tagline}>DaisyDaily Outfit Idea</span>
          <h1 className={styles.lookbookDetail__title}>{post.title}</h1>
          <div className={styles.lookbookDetail__meta}>
            <span className={styles.lookbookDetail__author}>
              Bởi {post.author?.displayName || "DaisyDaily"}
            </span>
            <time>{formatDate(post.publishedAt)}</time>
          </div>
        </header>

        {coverImg && (
          <div className={styles.lookbookDetail__cover}>
            <img src={coverImg} alt={post.title} />
          </div>
        )}

        <article
          className={styles.lookbookDetail__body}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* ─── Shop the Look Products ────────────────────────── */}
        {post.products && post.products.length > 0 && (
          <div className={styles.lookbookDetail__productsSection}>
            <h2 className={styles.lookbookDetail__productsTitle}>Danh sách sản phẩm trong Outfit 🛍️</h2>
            <p className={styles.lookbookDetail__productsSubtitle}>
              Bấm vào từng sản phẩm dưới đây để xem video review chi tiết mặc thử sản phẩm và đặt mua!
            </p>
            <div className={styles.lookbookDetail__productsGrid}>
              {post.products.map(({ product }, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          </div>
        )}

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              "headline": post.title,
              "image": coverImg ? [coverImg] : [],
              "datePublished": post.publishedAt || post.createdAt,
              "dateModified": post.updatedAt,
              "author": [
                {
                  "@type": "Person",
                  "name": post.author?.displayName || "DaisyDaily",
                },
              ],
              "description": post.excerpt || post.title,
            }),
          }}
        />
      </div>
    </div>
  );
}
