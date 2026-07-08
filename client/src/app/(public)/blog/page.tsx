import { Metadata } from "next";
import Link from "next/link";
import styles from "./blog.module.scss";
import { api, getAssetUrl } from "@/lib/api";
import { Post, PaginatedResponse } from "@/types";

export const metadata: Metadata = {
  title: "Blog thời trang & Phối đồ",
  description:
    "Tổng hợp các bài viết chia sẻ phong cách thời trang, tips phối đồ, và review sản phẩm mới nhất từ DaisyDaily.",
  alternates: {
    canonical: "/blog",
  },
};

interface BlogPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    category?: string;
    tag?: string;
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

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const page = params.page || "1";
  const search = params.search || "";
  const category = params.category || "";
  const tag = params.tag || "";

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

  try {
    const queryParams: Record<string, string> = { page, limit: "9" };
    if (search) queryParams.search = search;
    if (category) queryParams.category = category;
    if (tag) queryParams.tag = tag;

    const res = await api.getPosts(queryParams);
    if (res) {
      postsData = res as PaginatedResponse<Post>;
    }
  } catch (error) {
    console.error("Failed to fetch posts from backend:", error);
  }

  const posts = postsData.data;
  const meta = postsData.meta;

  // Build pagination links helper
  const getPageUrl = (pageNumber: number) => {
    const query = new URLSearchParams();
    if (pageNumber > 1) query.set("page", pageNumber.toString());
    if (search) query.set("search", search);
    if (category) query.set("category", category);
    if (tag) query.set("tag", tag);
    const queryString = query.toString();
    return `/blog${queryString ? `?${queryString}` : ""}`;
  };

  return (
    <div className={styles.blogPage}>
      <div className="container">
        <header className={styles.blogPage__header}>
          <h1 className={styles.blogPage__title}>
            {category
              ? `Chuyên mục: ${category}`
              : tag
                ? `Tag: #${tag}`
                : "Blog Thời Trang & Lifestyle"}
          </h1>
          <p className={styles.blogPage__subtitle}>
            {search
              ? `Kết quả tìm kiếm cho: "${search}"`
              : "Khám phá phong cách cá nhân, mẹo phối đồ và xu hướng thời trang mới nhất cùng DaisyDaily"}
          </p>
        </header>

        {posts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 0" }}>
            <p style={{ color: "#6b6b6b", marginBottom: "1.5rem" }}>
              Không tìm thấy bài viết nào phù hợp.
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
                        {post.category?.name || "Outfits"}
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Blog thời trang & Phối đồ",
            "description": "Tổng hợp các bài viết chia sẻ phong cách thời trang, tips phối đồ, và review sản phẩm mới nhất từ DaisyDaily.",
            "url": "https://daisydaily.shop/blog",
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
                "name": "Blog",
                "item": "https://daisydaily.shop/blog",
              },
            ],
          }),
        }}
      />
    </div>
  );
}
