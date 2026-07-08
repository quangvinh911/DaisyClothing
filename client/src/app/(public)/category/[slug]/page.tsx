import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "../../blog/blog.module.scss";
import { api, getAssetUrl } from "@/lib/api";
import { Post, Category, PaginatedResponse } from "@/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const category = (await api.getCategoryBySlug(slug)) as Category;
    if (category) {
      return {
        title: `Thời trang ${category.name}`,
        description: `Khám phá các bài viết, sản phẩm và chia sẻ về phong cách thuộc danh mục ${category.name} trên DaisyDaily.`,
        alternates: {
          canonical: `/category/${slug}`,
        },
      };
    }
  } catch (e) {
    // Ignore
  }
  return {
    title: "Danh mục không tìm thấy",
  };
}

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    page?: string;
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

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  const sparams = await searchParams;
  const page = sparams.page || "1";

  let postsData: PaginatedResponse<Post> = {
    data: [],
    meta: {
      total: 0,
      page: 1,
      limit: 12,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  };
  let category: Category | null = null;

  try {
    const [postsRes, categoryRes] = await Promise.all([
      api.getPosts({ page, limit: "9", category: slug }).catch(() => null),
      api.getCategoryBySlug(slug).catch(() => null),
    ]);

    if (postsRes) {
      postsData = postsRes as PaginatedResponse<Post>;
    }
    if (categoryRes) {
      category = categoryRes as Category;
    }
  } catch (error) {
    console.error(`Failed to fetch category page data for slug "${slug}":`, error);
  }

  if (!category) {
    notFound();
  }

  const posts = postsData.data;
  const meta = postsData.meta;

  const getPageUrl = (pageNumber: number) => {
    return `/category/${slug}${pageNumber > 1 ? `?page=${pageNumber}` : ""}`;
  };

  return (
    <div className={styles.blogPage}>
      <div className="container">
        <header className={styles.blogPage__header}>
          <h1 className={styles.blogPage__title}>Chuyên mục: {category.name}</h1>
          {category.description && (
            <p className={styles.blogPage__subtitle}>{category.description}</p>
          )}
        </header>

        {posts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 0" }}>
            <p style={{ color: "#6b6b6b", marginBottom: "1.5rem" }}>
              Chưa có bài viết nào trong chuyên mục này.
            </p>
            <Link href="/blog" className="btn btn--gold">
              Xem tất cả bài viết
            </Link>
          </div>
        ) : (
          <>
            <div className={styles.blogPage__grid}>
              {posts.map((post, index) => {
                const imageUrl = getAssetUrl(post.featuredImageUrl);

                return (
                  <article key={post.id} className={styles.postCard}>
                    <div className={styles.postCard__image}>
                      {imageUrl ? (
                        <img src={imageUrl} alt={post.title} />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            background: `linear-gradient(135deg, hsl(${25 + index * 15}, 40%, 85%) 0%, hsl(${35 + index * 15}, 50%, 78%) 100%)`,
                          }}
                        />
                      )}
                    </div>
                    <div className={styles.postCard__body}>
                      <span className={styles.postCard__category}>
                        {category?.name}
                      </span>
                      <Link href={`/blog/${post.slug}`}>
                        <h3 className={styles.postCard__title}>{post.title}</h3>
                      </Link>
                      <p className={styles.postCard__excerpt}>
                        {post.excerpt ||
                          post.content.replace(/<[^>]*>/g, "").slice(0, 150) +
                            "..."}
                      </p>
                      <div className={styles.postCard__meta}>
                        <time>{formatDate(post.publishedAt)}</time>
                        <Link
                          href={`/blog/${post.slug}`}
                          className={styles.postCard__readMore}
                        >
                          Đọc thêm →
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {meta.totalPages > 1 && (
              <div className={styles.blogPage__pagination}>
                <Link
                  href={getPageUrl(meta.page - 1)}
                  className={`${styles.blogPage__pageBtn} ${!meta.hasPreviousPage ? "disabled" : ""}`}
                  style={{ pointerEvents: meta.hasPreviousPage ? "auto" : "none", opacity: meta.hasPreviousPage ? 1 : 0.5 }}
                >
                  &laquo;
                </Link>

                {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
                  <Link
                    key={p}
                    href={getPageUrl(p)}
                    className={`${styles.blogPage__pageBtn} ${meta.page === p ? styles["blogPage__pageBtn--active"] : ""}`}
                  >
                    {p}
                  </Link>
                ))}

                <Link
                  href={getPageUrl(meta.page + 1)}
                  className={`${styles.blogPage__pageBtn} ${!meta.hasNextPage ? "disabled" : ""}`}
                  style={{ pointerEvents: meta.hasNextPage ? "auto" : "none", opacity: meta.hasNextPage ? 1 : 0.5 }}
                >
                  &raquo;
                </Link>
              </div>
            )}
          </>
        )}
      </div>

      {/* JSON-LD — CollectionPage */}
      {category && (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "CollectionPage",
                "name": `Thời trang ${category.name}`,
                "description": `Khám phá các bài viết, sản phẩm và chia sẻ về phong cách thuộc danh mục ${category.name} trên DaisyDaily.`,
                "url": `https://daisydaily.shop/category/${category.slug}`,
                "isPartOf": {
                  "@type": "WebSite",
                  "name": "DaisyDaily",
                  "url": "https://daisydaily.shop",
                },
              }),
            }}
          />
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
                    "name": "Danh mục",
                    "item": "https://daisydaily.shop/blog",
                  },
                  {
                    "@type": "ListItem",
                    "position": 3,
                    "name": category.name,
                    "item": `https://daisydaily.shop/category/${category.slug}`,
                  },
                ],
              }),
            }}
          />
        </>
      )}
    </div>
  );
}
