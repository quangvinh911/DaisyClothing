import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import styles from "./home.module.scss";
import { api, getAssetUrl, API_BASE } from "@/lib/api";
import { Post, Product, Category } from "@/types";
import ProductCard from "@/components/ProductCard";

export const metadata: Metadata = {
  title: "DaisyDaily | Blog Thời Trang Nữ, Tips Phối Đồ & Lifestyle",
  description:
    "Chào mừng bạn đến với DaisyDaily — Blog thời trang & lifestyle cá nhân. Nơi chia sẻ các phong cách phối đồ thời trang hàng ngày, review quần áo xu hướng mới nhất và gợi ý mua sắm thông minh.",
  alternates: {
    canonical: "/",
  },
};

// Fallbacks in case API fails or has no data
const FALLBACK_POSTS: Partial<Post>[] = [
  {
    id: "1",
    title: "5 Cách Phối Đồ Mùa Hè 2025 Cực Xinh",
    slug: "5-cach-phoi-do-mua-he-2025",
    excerpt:
      "5 gợi ý phối đồ mùa hè 2025 giúp bạn luôn xinh đẹp và trendy mỗi ngày. Từ áo sơ mi basic đến đầm hoa nhí.",
    category: { name: "Outfits", slug: "outfits" } as Category,
    publishedAt: "2025-06-15",
  },
  {
    id: "2",
    title: "Review Túi Xách Mini Dưới 500K Cực Đáng Mua",
    slug: "review-tui-xach-mini",
    excerpt:
      "Tổng hợp các mẫu túi xách mini giá bình dân nhưng chất lượng cao. Phù hợp đi chơi, đi làm.",
    category: { name: "Phụ kiện", slug: "phu-kien" } as Category,
    publishedAt: "2025-06-10",
  },
  {
    id: "3",
    title: "10 Item Công Sở Không Thể Thiếu Cho Nàng",
    slug: "10-item-cong-so",
    excerpt:
      "Những item cơ bản giúp bạn luôn thanh lịch và chuyên nghiệp tại công sở mỗi ngày.",
    category: { name: "Tips & Tricks", slug: "tips-tricks" } as Category,
    publishedAt: "2025-06-05",
  },
];

const FALLBACK_PRODUCTS: Partial<Product>[] = [
  {
    id: "1",
    name: "Áo sơ mi trắng basic",
    slug: "ao-so-mi-trang-basic",
    brand: "Uniqlo",
    price: 399000,
    platform: "SHOPEE",
  },
  {
    id: "2",
    name: "Quần jeans ống rộng",
    slug: "quan-jeans-ong-rong",
    brand: "Zara",
    price: 599000,
    platform: "TIKTOK",
  },
  {
    id: "3",
    name: "Túi xách mini da",
    slug: "tui-xach-mini-da",
    brand: "Charles & Keith",
    price: 1290000,
    platform: "SHOPEE",
  },
  {
    id: "4",
    name: "Sandal quai mảnh",
    slug: "sandal-quai-manh",
    brand: "Aldo",
    price: 890000,
    platform: "SHOPEE",
  },
];

const FALLBACK_CATEGORIES: Partial<Category>[] = [
  { name: "Outfits", slug: "outfits" },
  { name: "Đầm & Váy", slug: "dam-vay" },
  { name: "Phụ kiện", slug: "phu-kien" },
  { name: "Tips & Tricks", slug: "tips-tricks" },
];

function formatPrice(price: number | null | undefined): string {
  if (price === null || price === undefined) return "Liên hệ";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(dateStr));
}

export default async function HomePage() {
  let posts: Post[] = [];
  let products: Product[] = [];
  let categories: Category[] = [];

  try {
    const [postsRes, productsRes, categoriesRes] = await Promise.all([
      api.getLatestPosts(3).catch(() => null),
      api.getFeaturedProducts(4).catch(() => null),
      api.getCategories().catch(() => null),
    ]);

    posts = (postsRes as Post[]) || [];
    products = (productsRes as Product[]) || [];
    categories = (categoriesRes as Category[]) || [];
  } catch (error) {
    console.error("Failed to fetch homepage data from API:", error);
  }

  const displayPosts = posts.length > 0 ? posts : FALLBACK_POSTS;
  const displayProducts = products.length > 0 ? products : FALLBACK_PRODUCTS;
  const displayCategories = categories.length > 0 ? categories : FALLBACK_CATEGORIES;
  return (
    <>
      {/* ─── Hero Section ───────────────────────────────────── */}
      <section className={styles.hero} id="hero">
        <img
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600"
          alt="DaisyDaily Hero Cover"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 0,
          }}
        />
        <div className={styles.hero__overlay} />
        <div className={styles.hero__content}>
          <span className={styles.hero__tagline}>
            Everyday Style, Everyday Beautiful
          </span>
          <h1 className={`${styles.hero__title} type-2`}>DaisyDaily</h1>
          <p className={styles.hero__subtitle}>
            Blog thời trang & lifestyle cá nhân — chia sẻ phong cách, tips phối
            đồ và gợi ý mua sắm mỗi ngày 🌸
          </p>
          <div className={styles.hero__cta}>
            <Link
              href="/blog"
              className={`${styles.hero__btn} ${styles["hero__btn--primary"]}`}
            >
              Khám phá Blog
            </Link>
            <Link
              href="/shop"
              className={`${styles.hero__btn} ${styles["hero__btn--outline"]}`}
            >
              Shop Now
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Latest Posts ───────────────────────────────────── */}
      <section className={styles.latestPosts} id="latest-posts">
        <div className={styles.latestPosts__container}>
          <div className="section">
            <h2 className="section__title type-2">Bài Viết Mới Nhất</h2>
            <p className="section__subtitle">
              Tips thời trang, gợi ý phối đồ và review sản phẩm mới nhất
            </p>
          </div>

          <div className={styles.latestPosts__grid}>
            {displayPosts.map((post, index) => {
              const imageUrl = getAssetUrl(post.featuredImageUrl);

              return (
                <article
                  key={post.id}
                  className={styles.postCard}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={styles.postCard__image}>
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={post.title || ""}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
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
                    <p className={styles.postCard__excerpt}>{post.excerpt}</p>
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
        </div>
      </section>

      {/* ─── Featured Products ──────────────────────────────── */}
      <section className={styles.featuredProducts} id="featured-products">
        <div className={styles.featuredProducts__container}>
          <div className="section">
            <h2 className="section__title type-2">Shop My Style</h2>
            <p className="section__subtitle">
              Những sản phẩm mình yêu thích và đang sử dụng
            </p>
          </div>

          <div className={styles.featuredProducts__grid}>
            {displayProducts.map((product, index) => (
              <ProductCard key={product.id} product={product as Product} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── TikTok Section ─────────────────────────────────── */}
      <section className={styles.tiktokSection} id="tiktok-section">
        <div className={styles.tiktokSection__container}>
          <div className="section">
            <h2 className="section__title type-2">Follow Me on TikTok</h2>
            <p className="section__subtitle">
              Xem thêm video thời trang và tips phối đồ trên TikTok
            </p>
          </div>

          <div className={styles.tiktokSection__profile}>
            <div className={styles.tiktokSection__avatar}>
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
                alt="DaisyDaily Avatar"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>
            <span className={styles.tiktokSection__handle}>
              @em.xinh0905
            </span>
          </div>

          {/* TikTok Videos Grid */}
          <div className={styles.tiktokSection__videoGrid}>
            <a
              href="https://www.tiktok.com/@em.xinh0905"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.tiktokSection__videoCard}
            >
              <img
                src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400"
                alt="Outfit Review TikTok Video"
              />
              <div className={styles.tiktokSection__videoOverlay}>
                <span className={styles.tiktokSection__playIcon}>▶</span>
                <span className={styles.tiktokSection__videoViews}>15.2K views</span>
              </div>
            </a>
            <a
              href="https://www.tiktok.com/@em.xinh0905"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.tiktokSection__videoCard}
            >
              <img
                src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400"
                alt="Summer Lookbook TikTok Video"
              />
              <div className={styles.tiktokSection__videoOverlay}>
                <span className={styles.tiktokSection__playIcon}>▶</span>
                <span className={styles.tiktokSection__videoViews}>24.5K views</span>
              </div>
            </a>
            <a
              href="https://www.tiktok.com/@em.xinh0905"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.tiktokSection__videoCard}
            >
              <img
                src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400"
                alt="Zara Haul TikTok Video"
              />
              <div className={styles.tiktokSection__videoOverlay}>
                <span className={styles.tiktokSection__playIcon}>▶</span>
                <span className={styles.tiktokSection__videoViews}>18.9K views</span>
              </div>
            </a>
          </div>

          <a
            href="https://www.tiktok.com/@em.xinh0905"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.tiktokSection__followBtn}
          >
            Follow trên TikTok
          </a>
        </div>
      </section>

      {/* ─── Categories Section ─────────────────────────────── */}
      <section className={styles.categoriesSection} id="categories">
        <div className={styles.categoriesSection__container}>
          <div className="section">
            <h2 className="section__title type-2">Danh Mục</h2>
            <p className="section__subtitle">Khám phá theo phong cách</p>
          </div>

          <div className={styles.categoriesSection__grid}>
            {displayCategories.map((cat, index) => {
              const imageUrl = getAssetUrl(cat.imageUrl);

              return (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  className={styles.categoryCard}
                >
                  <div className={styles.categoryCard__image}>
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={cat.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          background: `linear-gradient(135deg, hsl(${25 + index * 25}, 40%, 75%) 0%, hsl(${35 + index * 25}, 50%, 65%) 100%)`,
                        }}
                      />
                    )}
                  </div>
                  <div className={styles.categoryCard__overlay}>
                    <span className={styles.categoryCard__name}>{cat.name}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* JSON-LD Structured Data for Homepage & Organization/Person */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "DaisyDaily",
            "url": "https://daisydaily.shop",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://daisydaily.shop/blog?search={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            "name": "DaisyDaily",
            "url": "https://daisydaily.shop",
            "sameAs": [
              "https://www.tiktok.com/@em.xinh0905"
            ],
            "jobTitle": "Fashion & Lifestyle Blogger",
            "description": "Blog thời trang & lifestyle cá nhân — chia sẻ phong cách, tips phối đồ và gợi ý mua sắm mỗi ngày 🌸"
          })
        }}
      />
    </>
  );
}
