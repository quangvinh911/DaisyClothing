"use client";

import { useState, useEffect } from "react";
import styles from "./ExitIntentPopup.module.scss";
import { api, getAssetUrl, getProductRedirectUrl } from "@/lib/api";
import { Product } from "@/types";

export default function ExitIntentPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    // Check session storage first
    if (typeof window !== "undefined") {
      const shown = sessionStorage.getItem("exit_intent_shown");
      if (shown) return;
    }

    // Fetch one featured product to display in the exit intent popup
    api.getFeaturedProducts(1)
      .then((res) => {
        if (Array.isArray(res) && res.length > 0) {
          setProduct(res[0] as Product);
        }
      })
      .catch((err) => console.error("Failed to fetch product for exit popup:", err));
  }, []);

  useEffect(() => {
    if (!product) return;

    const handleMouseLeave = (e: MouseEvent) => {
      // Trigger when mouse moves out of top viewport boundary
      if (e.clientY < 20) {
        const shown = sessionStorage.getItem("exit_intent_shown");
        if (!shown) {
          setIsOpen(true);
          sessionStorage.setItem("exit_intent_shown", "true");
        }
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [product]);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleCtaClick = () => {
    if (product) {
      if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("event", "exit_intent_product_click", {
          product_id: product.id,
          product_name: product.name,
        });
      }
    }
    setIsOpen(false);
  };

  if (!isOpen || !product) return null;

  const imageUrl = getAssetUrl(product.imageUrl);
  const redirectUrl = getProductRedirectUrl(product.slug);

  const formatPrice = (price: number | null | undefined): string => {
    if (price === null || price === undefined || price === 0) return "Liên hệ";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={handleClose} aria-label="Đóng">
          &times;
        </button>
        <div className={styles.content}>
          <span className={styles.tagline}>🔥 Ưu Đãi Đặc Biệt Tuần Này</span>
          <h3 className={styles.title}>Đừng bỏ lỡ outfit hot nhất tuần này!</h3>
          
          <div className={styles.product}>
            <div className={styles.product__imageContainer}>
              {imageUrl ? (
                <img src={imageUrl} alt={product.name} className={styles.product__image} />
              ) : (
                <div className={styles.product__fallback} />
              )}
            </div>
            <div className={styles.product__info}>
              <h4 className={styles.product__name}>{product.name}</h4>
              <p className={styles.product__price}>{formatPrice(product.price)}</p>
            </div>
          </div>

          <a
            href={redirectUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleCtaClick}
            className="btn btn--gold btn--lg"
            style={{ width: "100%", textAlign: "center", textTransform: "uppercase" }}
          >
            Xem Video & Mua ngay 🛍️
          </a>
        </div>
      </div>
    </div>
  );
}
