"use client";

import { useState, useEffect } from "react";
import styles from "./StickyTikTokButton.module.scss";
import { api } from "@/lib/api";
import { SocialLink } from "@/types";

export default function StickyTikTokButton() {
  const [isVisible, setIsVisible] = useState(false);
  const [tiktokUrl, setTiktokUrl] = useState("https://www.tiktok.com/@em.xinh0905");

  useEffect(() => {
    // Fetch social links to find TikTok URL dynamically
    api.getSocialLinks()
      .then((res) => {
        if (Array.isArray(res)) {
          const tiktok = res.find((link: SocialLink) => link.platform.toLowerCase() === "tiktok");
          if (tiktok?.url) {
            setTiktokUrl(tiktok.url);
          }
        }
      })
      .catch((err) => console.error("Failed to fetch TikTok link for sticky button:", err));
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Show after scrolling down 300px
      const passedHero = scrollY > 300;

      // Hide when near footer (e.g., 200px from the bottom)
      const nearFooter = windowHeight + scrollY >= documentHeight - 200;

      setIsVisible(passedHero && !nearFooter);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = () => {
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "tiktok_channel_click", {
        channel_url: tiktokUrl,
      });
    }
  };

  return (
    <a
      href={tiktokUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={`${styles.stickyBtn} ${isVisible ? styles["stickyBtn--visible"] : ""}`}
      aria-label="Xem shop trên TikTok"
    >
      <svg className={styles.stickyBtn__icon} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.23.95.84 2.15 1.41 3.43 1.58.01 1.34 0 2.68.01 4.02-.02.02-.04.04-.07.05-1.28.02-2.52-.37-3.56-1.11-.64-.52-1.16-1.18-1.53-1.93h-.06c.01 1.62-.01 3.25.01 4.88-.06 2.04-.64 4.08-1.74 5.76-1.26 1.76-3.23 2.98-5.38 3.32-2.22.42-4.57.06-6.55-1.07A9.45 9.45 0 0 1 .525 12.98c-.46-2.22-.05-4.58 1.13-6.53 1.29-1.84 3.32-3.07 5.56-3.35 1.05-.16 2.13-.07 3.16.24v4.18c-.89-.35-1.88-.39-2.79-.08-1.04.31-1.92 1.06-2.38 2.05-.62 1.25-.56 2.8.18 3.99.76 1.12 2.1 1.83 3.47 1.76 1.45.02 2.79-.87 3.32-2.22.25-.72.29-1.5.28-2.26c-.02-3.41-.01-6.82-.02-10.23-.01-.06.01-.13 0-.19z"/>
      </svg>
      <span className={styles.stickyBtn__text}>Xem shop trên TikTok →</span>
    </a>
  );
}
