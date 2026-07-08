import { Metadata } from "next";
import Link from "next/link";
import styles from "./lookbook.module.scss";
import { api, getAssetUrl } from "@/lib/api";
import { Post, PaginatedResponse } from "@/types";

export const metadata: Metadata = {
  title: "Lookbook & Gợi Ý Phối Đồ | DaisyDaily",
  description:
    "Bộ sưu tập ý tưởng outfit thời trang, lookbook phối đồ theo mùa và các phong cách thời trang ấn tượng từ DaisyDaily.",
  alternates: {
    canonical: "/lookbook",
  },
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(dateStr));
}

export default async function LookbookListPage() {
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
    // Fetch posts belonging to the 'outfits' category
    const res = await api.getPosts({ category: "outfits", limit: "20" });
    if (res) {
      postsData = res as PaginatedResponse<Post>;
    }
  } catch (error) {
    console.error("Failed to fetch lookbooks:", error);
  }

  const lookbooks = postsData.data;

  return (
    <div className={styles.lookbookPage}>
      <div className="container">
        <header className={styles.lookbookPage__header}>
          <h1 className={styles.lookbookPage__title}>Outfit Lookbooks 🌸</h1>
          <p className={styles.lookbookPage__subtitle}>
            Tìm kiếm cảm hứng mặc đẹp thông qua các bộ phối thời thượng được sắp xếp theo dịp và chủ đề.
          </p>
        </header>

        {lookbooks.length === 0 ? (
          <div className={styles.lookbookPage__empty}>
            <p>Chưa có lookbook nào được chia sẻ. Quay lại sau bạn nhé!</p>
            <Link href="/" className="btn btn--gold">
              Quay lại Trang chủ
            </Link>
          </div>
        ) : (
          <div className={styles.lookbookPage__grid}>
            {lookbooks.map((post, index) => {
              const coverImg = getAssetUrl(post.featuredImageUrl);
              const productCount = post.products?.length || 0;

              return (
                <article
                  key={post.id}
                  className={styles.lookbookCard}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={styles.lookbookCard__imageWrapper}>
                    {coverImg ? (
                      <img src={coverImg} alt={post.title} className={styles.lookbookCard__image} />
                    ) : (
                      <div className={styles.lookbookCard__fallback} />
                    )}
                    {productCount > 0 && (
                      <span className={styles.lookbookCard__countBadge}>
                        🛍️ {productCount} sản phẩm
                      </span>
                    )}
                  </div>
                  <div className={styles.lookbookCard__content}>
                    <time className={styles.lookbookCard__date}>{formatDate(post.publishedAt)}</time>
                    <h2 className={styles.lookbookCard__title}>
                      <Link href={`/lookbook/${post.slug}`} className={styles.lookbookCard__titleLink}>
                        {post.title}
                      </Link>
                    </h2>
                    <p className={styles.lookbookCard__excerpt}>
                      {post.excerpt || post.content.replace(/<[^>]*>/g, "").slice(0, 120) + "..."}
                    </p>
                    <Link href={`/lookbook/${post.slug}`} className={styles.lookbookCard__btn}>
                      Khám phá Outfit &rarr;
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
