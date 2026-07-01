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
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={styles.header__logoIcon}
              style={{ display: "inline-block", verticalAlign: "middle", marginRight: "8px" }}
            >
              <g transform="translate(12,12)">
                {/* 8 soft white petals rotated at 45 degree intervals */}
                <path d="M0,-2 C1.2,-2 1.8,-9 0,-10 C-1.8,-9 -1.2,-2 0,-2Z" fill="#FFFFFF" stroke="#8E6C4A" strokeWidth="0.75" />
                <path d="M0,-2 C1.2,-2 1.8,-9 0,-10 C-1.8,-9 -1.2,-2 0,-2Z" fill="#FFFFFF" stroke="#8E6C4A" strokeWidth="0.75" transform="rotate(45)" />
                <path d="M0,-2 C1.2,-2 1.8,-9 0,-10 C-1.8,-9 -1.2,-2 0,-2Z" fill="#FFFFFF" stroke="#8E6C4A" strokeWidth="0.75" transform="rotate(90)" />
                <path d="M0,-2 C1.2,-2 1.8,-9 0,-10 C-1.8,-9 -1.2,-2 0,-2Z" fill="#FFFFFF" stroke="#8E6C4A" strokeWidth="0.75" transform="rotate(135)" />
                <path d="M0,-2 C1.2,-2 1.8,-9 0,-10 C-1.8,-9 -1.2,-2 0,-2Z" fill="#FFFFFF" stroke="#8E6C4A" strokeWidth="0.75" transform="rotate(180)" />
                <path d="M0,-2 C1.2,-2 1.8,-9 0,-10 C-1.8,-9 -1.2,-2 0,-2Z" fill="#FFFFFF" stroke="#8E6C4A" strokeWidth="0.75" transform="rotate(225)" />
                <path d="M0,-2 C1.2,-2 1.8,-9 0,-10 C-1.8,-9 -1.2,-2 0,-2Z" fill="#FFFFFF" stroke="#8E6C4A" strokeWidth="0.75" transform="rotate(270)" />
                <path d="M0,-2 C1.2,-2 1.8,-9 0,-10 C-1.8,-9 -1.2,-2 0,-2Z" fill="#FFFFFF" stroke="#8E6C4A" strokeWidth="0.75" transform="rotate(315)" />
                
                {/* Large golden yellow center disc */}
                <circle cx="0" cy="0" r="3.2" fill="#E5A93B" stroke="#B87E1F" strokeWidth="0.5"/>
                <circle cx="0.5" cy="-0.5" r="2.8" fill="#F0C353" />
                <circle cx="-0.8" cy="0.6" r="0.6" fill="#FCEEBC" opacity="0.6"/>
              </g>
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
