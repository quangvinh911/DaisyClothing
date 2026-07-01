import Link from "next/link";
import styles from "./shop.module.scss";
import { api, getAssetUrl, API_BASE } from "@/lib/api";
import { Product, Category, PaginatedResponse } from "@/types";
import ProductCard from "@/components/ProductCard";

interface ShopPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    category?: string;
    platform?: string;
  }>;
}

function formatPrice(price: number | null): string {
  if (price === null) return "Liên hệ";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const page = params.page || "1";
  const search = params.search || "";
  const category = params.category || "";
  const platform = params.platform || "";

  let productsData: PaginatedResponse<Product> = {
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
  let categories: Category[] = [];

  try {
    const queryParams: Record<string, string> = { page, limit: "12" };
    if (search) queryParams.search = search;
    if (category) queryParams.category = category;
    if (platform) queryParams.platform = platform;

    const [prodRes, catRes] = await Promise.all([
      api.getProducts(queryParams).catch(() => null),
      api.getCategories().catch(() => []),
    ]);

    if (prodRes) {
      productsData = prodRes as PaginatedResponse<Product>;
    }
    if (catRes) {
      categories = catRes as Category[];
    }
  } catch (error) {
    console.error("Failed to fetch shop page data:", error);
  }

  const products = productsData.data;
  const meta = productsData.meta;

  // Filter URL Helper
  const getFilterUrl = (newCategory?: string, newPlatform?: string, newSearch?: string) => {
    const query = new URLSearchParams();
    
    const catVal = newCategory !== undefined ? newCategory : category;
    const platVal = newPlatform !== undefined ? newPlatform : platform;
    const searchVal = newSearch !== undefined ? newSearch : search;
    
    if (catVal) query.set("category", catVal);
    if (platVal) query.set("platform", platVal);
    if (searchVal) query.set("search", searchVal);
    
    const qStr = query.toString();
    return `/shop${qStr ? `?${qStr}` : ""}`;
  };

  const getPageUrl = (pageNumber: number) => {
    const query = new URLSearchParams();
    if (pageNumber > 1) query.set("page", pageNumber.toString());
    if (search) query.set("search", search);
    if (category) query.set("category", category);
    if (platform) query.set("platform", platform);
    const queryString = query.toString();
    return `/shop${queryString ? `?${queryString}` : ""}`;
  };

  const getPlatformClass = (plat: string) => {
    switch (plat.toUpperCase()) {
      case "TIKTOK":
        return styles["productCard__platform--tiktok"];
      case "SHOPEE":
        return styles["productCard__platform--shopee"];
      case "LAZADA":
        return styles["productCard__platform--lazada"];
      case "AMAZON":
        return styles["productCard__platform--amazon"];
      default:
        return styles["productCard__platform--other"];
    }
  };

  // Pre-map icons for Instagram Highlights (Elegant SVG outlines)
  const getCategoryIcon = (slug: string) => {
    const strokeProps = {
      width: "24",
      height: "24",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.5",
      strokeLinecap: "round" as const,
      strokeLinejoin: "round" as const,
      className: styles.categoryHighlight__svgIcon
    };

    switch (slug.toLowerCase()) {
      case "outfits": 
        return (
          <svg {...strokeProps}>
            <path d="M12 2a3 3 0 0 0-3 3h6a3 3 0 0 0-3-3z"/>
            <path d="M12 5v3m0 0L3 17a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1L12 8z"/>
          </svg>
        );
      case "dresses": 
      case "dam-vay": 
        return (
          <svg {...strokeProps}>
            <path d="M6 3h12l-2 7 4 11H4l4-11-2-7z"/>
            <path d="M8 10h8"/>
          </svg>
        );
      case "shoes": 
      case "giay": 
        return (
          <svg {...strokeProps}>
            <path d="M3 18c6 0 9-4 12-8l5 1v3c0 2-2 4-4 4H3z"/>
            <path d="M20 11v7M15 10l-2 8"/>
          </svg>
        );
      case "bags": 
      case "tui-xach": 
        return (
          <svg {...strokeProps}>
            <rect x="4" y="8" width="16" height="12" rx="2"/>
            <path d="M9 8V5a3 3 0 0 1 6 0v3"/>
          </svg>
        );
      case "accessories": 
      case "phu-kien": 
        return (
          <svg {...strokeProps}>
            <path d="M3 12a3 3 0 0 1 6 0v1H3v-1zm12 0a3 3 0 0 1 6 0v1h-6v-1z"/>
            <path d="M9 13h6M6 9h12"/>
          </svg>
        );
      case "lifestyle": 
        return (
          <svg {...strokeProps}>
            <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
            <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
            <path d="M6 1v3M10 1v3M14 1v3"/>
          </svg>
        );
      case "pants":
      case "quan": 
        return (
          <svg {...strokeProps}>
            <path d="M5 3h14v18l-7-2-7 2V3z"/>
            <path d="M12 3v15"/>
          </svg>
        );
      case "tips-tricks": 
        return (
          <svg {...strokeProps}>
            <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .5 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>
            <path d="M9 18h6M10 21h4"/>
          </svg>
        );
      default: 
        return (
          <svg {...strokeProps}>
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v7M12 15v7M2 12h7M15 12h7M4.93 4.93l4.93 4.93M14.14 14.14l4.93 4.93M19.07 4.93l-4.93 4.93M9.86 14.14l-4.93 4.93"/>
          </svg>
        );
    }
  };

  // SEO JSON-LD Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "DaisyDaily Shop Items",
    "description": "Danh sách đồ thời trang được DaisyDaily recommend",
    "numberOfItems": products.length,
    "itemListElement": products.map((product, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "item": {
        "@type": "Product",
        "name": product.name,
        "image": product.imageUrl ? getAssetUrl(product.imageUrl) : "",
        "brand": {
          "@type": "Brand",
          "name": product.brand || "DaisyDaily"
        },
        "offers": {
          "@type": "Offer",
          "priceCurrency": "VND",
          "price": product.price || 0,
          "availability": "https://schema.org/InStock",
          "url": `${API_BASE}/products/redirect/${product.slug}`
        }
      }
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className={styles.shopPage}>
        <div className="container">
          <header className={styles.shopPage__header}>
            <h1 className={styles.shopPage__title}>Shop My Looks</h1>
            <p className={styles.shopPage__subtitle}>
              Gợi ý các outfits thanh lịch và sản phẩm thời trang yêu thích từ tủ đồ của DaisyDaily 🌸
            </p>
          </header>

          {/* Instagram-style Category Highlights */}
          <div className={styles.shopPage__categoryHighlights}>
            <Link
              href={getFilterUrl("", platform)}
              className={`${styles.categoryHighlight} ${!category ? styles["categoryHighlight--active"] : ""}`}
            >
              <div className={styles.categoryHighlight__icon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.categoryHighlight__svgIcon}>
                  <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707-.707M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/>
                </svg>
              </div>
              <span className={styles.categoryHighlight__name}>Tất cả</span>
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={getFilterUrl(cat.slug, platform)}
                className={`${styles.categoryHighlight} ${category === cat.slug ? styles["categoryHighlight--active"] : ""}`}
              >
                <div className={styles.categoryHighlight__icon}>
                  {getCategoryIcon(cat.slug)}
                </div>
                <span className={styles.categoryHighlight__name}>{cat.name}</span>
              </Link>
            ))}
          </div>

          {/* Quick Filters: Platform + Search Bar */}
          <div className={styles.shopPage__filtersContainer}>
            {/* Platform Pills */}
            <div className={styles.shopPage__platformFilter}>
              <span className={styles.shopPage__filterLabel}>Nền tảng:</span>
              <div className={styles.shopPage__pills}>
                <Link
                  href={getFilterUrl(category, "")}
                  className={`${styles.filterPill} ${!platform ? styles["filterPill--active"] : ""}`}
                >
                  Tất cả
                </Link>
                <Link
                  href={getFilterUrl(category, "SHOPEE")}
                  className={`${styles.filterPill} ${styles["filterPill--shopee"]} ${platform.toUpperCase() === "SHOPEE" ? styles["filterPill--active"] : ""}`}
                >
                  Shopee 🧡
                </Link>
                <Link
                  href={getFilterUrl(category, "TIKTOK")}
                  className={`${styles.filterPill} ${styles["filterPill--tiktok"]} ${platform.toUpperCase() === "TIKTOK" ? styles["filterPill--active"] : ""}`}
                >
                  TikTok Shop 🖤
                </Link>
                <Link
                  href={getFilterUrl(category, "LAZADA")}
                  className={`${styles.filterPill} ${styles["filterPill--lazada"]} ${platform.toUpperCase() === "LAZADA" ? styles["filterPill--active"] : ""}`}
                >
                  Lazada 💙
                </Link>
              </div>
            </div>

            {/* Elegant Search Input */}
            <form action="/shop" method="GET" className={styles.shopPage__searchBar}>
              {category && <input type="hidden" name="category" value={category} />}
              {platform && <input type="hidden" name="platform" value={platform} />}
              <div className={styles.shopPage__searchInputWrapper}>
                <input
                  type="text"
                  name="search"
                  placeholder="Tìm sản phẩm..."
                  defaultValue={search}
                  className={styles.shopPage__searchInput}
                />
                <button type="submit" className={styles.shopPage__searchBtn} aria-label="Tìm kiếm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
                  </svg>
                </button>
              </div>
              {search && (
                <Link
                  href={getFilterUrl(category, platform, "")}
                  className={styles.shopPage__clearSearch}
                >
                  Xóa tìm kiếm
                </Link>
              )}
            </form>
          </div>

          {/* ─── Products Grid ───────────────────────────────────── */}
          {products.length === 0 ? (
            <div className={styles.shopPage__emptyState}>
              <div className={styles.shopPage__emptyIcon}>🌸</div>
              <p className={styles.shopPage__emptyText}>
                Không tìm thấy sản phẩm nào phù hợp với bộ lọc hiện tại.
              </p>
              <Link href="/shop" className="btn btn--gold">
                Đặt lại tất cả bộ lọc
              </Link>
            </div>
          ) : (
            <>
              <div className={styles.shopPage__grid}>
                {products.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>

              {/* Pagination */}
              {meta.totalPages > 1 && (
                <div className={styles.shopPage__pagination}>
                  <Link
                    href={getPageUrl(meta.page - 1)}
                    className={`${styles.shopPage__pageBtn} ${!meta.hasPreviousPage ? styles["shopPage__pageBtn--disabled"] : ""}`}
                    style={{ pointerEvents: meta.hasPreviousPage ? "auto" : "none" }}
                  >
                    &laquo;
                  </Link>

                  {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
                    <Link
                      key={p}
                      href={getPageUrl(p)}
                      className={`${styles.shopPage__pageBtn} ${meta.page === p ? styles["shopPage__pageBtn--active"] : ""}`}
                    >
                      {p}
                    </Link>
                  ))}

                  <Link
                    href={getPageUrl(meta.page + 1)}
                    className={`${styles.shopPage__pageBtn} ${!meta.hasNextPage ? styles["shopPage__pageBtn--disabled"] : ""}`}
                    style={{ pointerEvents: meta.hasNextPage ? "auto" : "none" }}
                  >
                    &raquo;
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
