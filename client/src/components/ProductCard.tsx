"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./ProductCard.module.scss";
import { Product } from "@/types";
import { getAssetUrl, API_BASE } from "@/lib/api";

interface ProductCardProps {
  product: Product;
  index: number;
}

function getTikTokVideoId(url: string | null | undefined): string | null {
  if (!url) return null;
  const match = url.match(/\/(?:video|photo)\/(\d+)/);
  if (match) return match[1];
  
  const directIdMatch = url.match(/^\d+$/);
  if (directIdMatch) return url;
  
  return null;
}

export default function ProductCard({ product, index }: ProductCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const imageUrl = getAssetUrl(product.imageUrl);
  const redirectUrl = `${API_BASE}/products/redirect/${product.slug}`;
  const tiktokVideoId = getTikTokVideoId(product.tiktokVideoUrl);
  const isPhotoPost = product.tiktokVideoUrl?.includes('/photo/');

  const formatPrice = (price: number | null | undefined): string => {
    if (price === null || price === undefined || price === 0) return "";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
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

  const handleMediaClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  return (
    <>
      <div className={styles.productCard} style={{ animationDelay: `${index * 0.08}s` }}>
        <div className={styles.productCard__imageContainer} onClick={handleMediaClick}>
          {imageUrl ? (
            <img src={imageUrl} alt={product.name} className={styles.productCard__image} loading="lazy" />
          ) : (
            <div
              className={styles.productCard__imageFallback}
              style={{
                background: `linear-gradient(135deg, hsl(${30 + (index % 10) * 20}, 35%, 82%) 0%, hsl(${40 + (index % 10) * 20}, 45%, 75%) 100%)`,
              }}
            />
          )}
          <span className={`${styles.productCard__platform} ${getPlatformClass(product.platform)}`}>
            {product.platform}
          </span>

          {/* TikTok Play Icon Indicator */}
          {product.tiktokVideoUrl && (
            <div className={styles.productCard__playBadge} title="Xem Video Review">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
              <span>Xem Video</span>
            </div>
          )}

          {/* Price overlay in the bottom-right corner of the image container */}
          {product.price !== null && product.price !== undefined && product.price !== 0 && (
            <span className={styles.productCard__priceBadge}>
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        <div className={styles.productCard__body}>
          {product.brand && (
            <span className={styles.productCard__brand}>
              {product.brand}
            </span>
          )}
          <Link href={redirectUrl} target="_blank" rel="noopener noreferrer" className={styles.productCard__nameLink}>
            <h3 className={styles.productCard__name}>
              {product.name}
            </h3>
          </Link>
        </div>
      </div>

      {/* ─── Media Lightbox & Video Player Modal ──────────────── */}
      {isOpen && (
        <div className={styles.modal} onClick={closeModal}>
          <div className={styles.modal__backdrop} />
          
          <div className={styles.modal__content} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modal__closeBtn} onClick={closeModal} aria-label="Đóng">
              &times;
            </button>

            <div className={styles.modal__container}>
              {/* Left Column: Video or Image */}
              <div className={styles.modal__mediaColumn}>
                {tiktokVideoId ? (
                  <div className={styles.modal__videoWrapper}>
                    <iframe
                      src={
                        isPhotoPost
                          ? `https://www.tiktok.com/embed/v2/${tiktokVideoId}`
                          : `https://www.tiktok.com/player/v1/${tiktokVideoId}?controls=1&music_info=1&description=1`
                      }
                      className={styles.modal__iframe}
                      allowFullScreen
                      allow="autoplay; encrypted-media; picture-in-picture"
                      title={`TikTok review of ${product.name}`}
                    />
                  </div>
                ) : imageUrl ? (
                  <div className={styles.modal__imageWrapper}>
                    <img src={imageUrl} alt={product.name} className={styles.modal__largeImage} />
                  </div>
                ) : (
                  <div className={styles.modal__noMedia}>
                    <span>Không có dữ liệu hình ảnh/video</span>
                  </div>
                )}
              </div>

              {/* Right Column: Product Info */}
              <div className={styles.modal__infoColumn}>
                <div>
                  <span className={`${styles.productCard__platform} ${getPlatformClass(product.platform)}`} style={{ position: "static", display: "inline-block", marginBottom: "1rem" }}>
                    {product.platform}
                  </span>
                  
                  {product.brand && (
                    <span className={styles.modal__brand}>{product.brand}</span>
                  )}
                  <h2 className={styles.modal__title}>{product.name}</h2>
                  {product.price !== null && product.price !== undefined && product.price !== 0 && (
                    <div className={styles.modal__price}>{formatPrice(product.price)}</div>
                  )}
                  
                  {product.description && (
                    <div className={styles.modal__description}>
                      <h4>Mô tả sản phẩm:</h4>
                      <p>{product.description}</p>
                    </div>
                  )}
                </div>

                <div className={styles.modal__actions}>
                  {product.tiktokVideoUrl && !tiktokVideoId && (
                    <a
                      href={product.tiktokVideoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.modal__secondaryBtn}
                      style={{ marginBottom: "0.5rem" }}
                    >
                       Xem trên TikTok 📱
                    </a>
                  )}
                  <a
                    href={redirectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn--gold btn--lg"
                    style={{ width: "100%", textAlign: "center", textTransform: "uppercase" }}
                  >
                    Mua Ngay 🛍️
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
