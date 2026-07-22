"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./Header.module.scss";

const NAV_LINKS = [
  { href: "/", label: "Trang chủ" },
  { href: "/blog", label: "Blog" },
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "Về tôi" },
];

const SOCIAL_LINKS = [
  {
    href: "https://www.tiktok.com/@em.xinh0905",
    label: "TikTok",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.87a8.16 8.16 0 0 0 4.76 1.52v-3.4a4.85 4.85 0 0 1-1-.3z" />
      </svg>
    ),
  },
  {
    href: "https://shopee.vn/",
    label: "Shopee",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
];

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className={styles.header} id="site-header">
        <div className={styles.header__container}>
          {/* Logo */}
          <Link href="/" className={styles.header__logo}>
            <svg
              width="32"
              height="32"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={styles.header__logoIcon}
              style={{ display: "inline-block", verticalAlign: "middle", marginRight: "8px" }}
            >
              <defs>
                <radialGradient id="centerGrad" cx="35%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#FFECA8" />
                  <stop offset="60%" stopColor="#D4A97D" />
                  <stop offset="100%" stopColor="#A67B5B" />
                </radialGradient>
                <linearGradient id="petalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="100%" stopColor="#F5EDE3" />
                </linearGradient>
                <linearGradient id="petalGradBack" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FAF7F2" />
                  <stop offset="100%" stopColor="#E8D5C4" />
                </linearGradient>
              </defs>

              {/* Stem (Gentle curved green-gold line) */}
              <path
                d="M 50 48 Q 42 72, 48 92"
                stroke="#A67B5B"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
                opacity="0.8"
              />

              {/* Leaf (Artistic botanical leaf) */}
              <path
                d="M 45 68 C 36 68, 30 74, 40 82 C 45 82, 46 76, 45 68 Z"
                fill="#D4A97D"
                stroke="#A67B5B"
                strokeWidth="1.0"
                opacity="0.9"
              />

              {/* Group of petals rotated around (50, 48) */}
              <g>
                {/* Background Petals */}
                <g opacity="0.85">
                  <path d="M 50 48 C 48 48, 45 35, 48 20 C 49 13, 51 13, 52 20 C 55 35, 52 48, 50 48 Z" fill="url(#petalGradBack)" stroke="#C4956A" strokeWidth="0.8" transform="rotate(18, 50, 48)" />
                  <path d="M 50 48 C 48 48, 45 35, 48 20 C 49 13, 51 13, 52 20 C 55 35, 52 48, 50 48 Z" fill="url(#petalGradBack)" stroke="#C4956A" strokeWidth="0.8" transform="rotate(52, 50, 48)" />
                  <path d="M 50 48 C 48 48, 45 35, 48 20 C 49 13, 51 13, 52 20 C 55 35, 52 48, 50 48 Z" fill="url(#petalGradBack)" stroke="#C4956A" strokeWidth="0.8" transform="rotate(85, 50, 48)" />
                  <path d="M 50 48 C 48 48, 45 35, 48 20 C 49 13, 51 13, 52 20 C 55 35, 52 48, 50 48 Z" fill="url(#petalGradBack)" stroke="#C4956A" strokeWidth="0.8" transform="rotate(120, 50, 48)" />
                  <path d="M 50 48 C 48 48, 45 35, 48 20 C 49 13, 51 13, 52 20 C 55 35, 52 48, 50 48 Z" fill="url(#petalGradBack)" stroke="#C4956A" strokeWidth="0.8" transform="rotate(155, 50, 48)" />
                  <path d="M 50 48 C 48 48, 45 35, 48 20 C 49 13, 51 13, 52 20 C 55 35, 52 48, 50 48 Z" fill="url(#petalGradBack)" stroke="#C4956A" strokeWidth="0.8" transform="rotate(188, 50, 48)" />
                  <path d="M 50 48 C 48 48, 45 35, 48 20 C 49 13, 51 13, 52 20 C 55 35, 52 48, 50 48 Z" fill="url(#petalGradBack)" stroke="#C4956A" strokeWidth="0.8" transform="rotate(222, 50, 48)" />
                  <path d="M 50 48 C 48 48, 45 35, 48 20 C 49 13, 51 13, 52 20 C 55 35, 52 48, 50 48 Z" fill="url(#petalGradBack)" stroke="#C4956A" strokeWidth="0.8" transform="rotate(254, 50, 48)" />
                  <path d="M 50 48 C 48 48, 45 35, 48 20 C 49 13, 51 13, 52 20 C 55 35, 52 48, 50 48 Z" fill="url(#petalGradBack)" stroke="#C4956A" strokeWidth="0.8" transform="rotate(288, 50, 48)" />
                  <path d="M 50 48 C 48 48, 45 35, 48 20 C 49 13, 51 13, 52 20 C 55 35, 52 48, 50 48 Z" fill="url(#petalGradBack)" stroke="#C4956A" strokeWidth="0.8" transform="rotate(320, 50, 48)" />
                  <path d="M 50 48 C 48 48, 45 35, 48 20 C 49 13, 51 13, 52 20 C 55 35, 52 48, 50 48 Z" fill="url(#petalGradBack)" stroke="#C4956A" strokeWidth="0.8" transform="rotate(352, 50, 48)" />
                </g>

                {/* Foreground Petals */}
                <g>
                  <path d="M 50 48 C 47 48, 44 32, 47 15 C 49 8, 51 8, 53 15 C 56 32, 53 48, 50 48 Z" fill="url(#petalGrad)" stroke="#A67B5B" strokeWidth="0.8" transform="rotate(0, 50, 48)" />
                  <path d="M 50 48 C 47 48, 44 32, 47 15 C 49 8, 51 8, 53 15 C 56 32, 53 48, 50 48 Z" fill="url(#petalGrad)" stroke="#A67B5B" strokeWidth="0.8" transform="rotate(35, 50, 48)" />
                  <path d="M 50 48 C 47 48, 44 32, 47 15 C 49 8, 51 8, 53 15 C 56 32, 53 48, 50 48 Z" fill="url(#petalGrad)" stroke="#A67B5B" strokeWidth="0.8" transform="rotate(68, 50, 48)" />
                  <path d="M 50 48 C 47 48, 44 32, 47 15 C 49 8, 51 8, 53 15 C 56 32, 53 48, 50 48 Z" fill="url(#petalGrad)" stroke="#A67B5B" strokeWidth="0.8" transform="rotate(102, 50, 48)" />
                  <path d="M 50 48 C 47 48, 44 32, 47 15 C 49 8, 51 8, 53 15 C 56 32, 53 48, 50 48 Z" fill="url(#petalGrad)" stroke="#A67B5B" strokeWidth="0.8" transform="rotate(138, 50, 48)" />
                  <path d="M 50 48 C 47 48, 44 32, 47 15 C 49 8, 51 8, 53 15 C 56 32, 53 48, 50 48 Z" fill="url(#petalGrad)" stroke="#A67B5B" strokeWidth="0.8" transform="rotate(170, 50, 48)" />
                  <path d="M 50 48 C 47 48, 44 32, 47 15 C 49 8, 51 8, 53 15 C 56 32, 53 48, 50 48 Z" fill="url(#petalGrad)" stroke="#A67B5B" strokeWidth="0.8" transform="rotate(204, 50, 48)" />
                  <path d="M 50 48 C 47 48, 44 32, 47 15 C 49 8, 51 8, 53 15 C 56 32, 53 48, 50 48 Z" fill="url(#petalGrad)" stroke="#A67B5B" strokeWidth="0.8" transform="rotate(238, 50, 48)" />
                  <path d="M 50 48 C 47 48, 44 32, 47 15 C 49 8, 51 8, 53 15 C 56 32, 53 48, 50 48 Z" fill="url(#petalGrad)" stroke="#A67B5B" strokeWidth="0.8" transform="rotate(272, 50, 48)" />
                  <path d="M 50 48 C 47 48, 44 32, 47 15 C 49 8, 51 8, 53 15 C 56 32, 53 48, 50 48 Z" fill="url(#petalGrad)" stroke="#A67B5B" strokeWidth="0.8" transform="rotate(305, 50, 48)" />
                  <path d="M 50 48 C 47 48, 44 32, 47 15 C 49 8, 51 8, 53 15 C 56 32, 53 48, 50 48 Z" fill="url(#petalGrad)" stroke="#A67B5B" strokeWidth="0.8" transform="rotate(338, 50, 48)" />
                </g>
              </g>

              {/* Center Golden/Yellow Disc */}
              <circle cx="50" cy="48" r="9" fill="url(#centerGrad)" stroke="#A67B5B" strokeWidth="1.0" />
              
              {/* Detailed artistic dots for texture/pollen */}
              <circle cx="48" cy="45" r="1.2" fill="#FFFFFF" opacity="0.8" />
              <circle cx="51" cy="44" r="0.8" fill="#FFECA8" opacity="0.7" />
              <circle cx="46" cy="48" r="0.8" fill="#A67B5B" opacity="0.4" />
              <circle cx="52" cy="50" r="0.6" fill="#A67B5B" opacity="0.5" />
              <circle cx="49" cy="52" r="0.7" fill="#A67B5B" opacity="0.3" />
            </svg>
            <span style={{ verticalAlign: "middle" }}>DaisyDaily</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className={styles.header__nav} aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={styles.header__navLink}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className={styles.header__actions}>
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.header__socialLink}
                aria-label={link.label}
              >
                {link.icon}
              </a>
            ))}

            {/* Mobile menu toggle */}
            <button
              className={styles.header__menuToggle}
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Mở menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span className={styles.header__menuIcon} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className={styles.mobileMenu} role="dialog" aria-modal="true">
          <button
            className={styles.mobileMenu__close}
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Đóng menu"
          >
            ✕
          </button>

          <nav className={styles.mobileMenu__nav}>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={styles.mobileMenu__link}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className={styles.mobileMenu__social}>
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.label}
              >
                {link.icon}
              </a>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
