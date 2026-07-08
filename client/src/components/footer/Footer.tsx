import Link from "next/link";
import styles from "./Footer.module.scss";

const QUICK_LINKS = [
  { href: "/blog", label: "Blog" },
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "Về tôi" },
  { href: "/category/outfits", label: "Outfits" },
  { href: "/category/tips-tricks", label: "Tips & Tricks" },
];

const CATEGORIES = [
  { href: "/category/dam-vay", label: "Đầm & Váy" },
  { href: "/category/ao", label: "Áo" },
  { href: "/category/quan", label: "Quần" },
  { href: "/category/phu-kien", label: "Phụ kiện" },
  { href: "/category/lifestyle", label: "Lifestyle" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer} id="site-footer">
      <div className={styles.footer__container}>
        <div className={styles.footer__grid}>
          {/* Brand */}
          <div className={styles.footer__section}>
            <div className={styles.footer__brandName}>DaisyDaily</div>
            <p className={styles.footer__brandDesc}>
              Everyday Style, Everyday Beautiful. Blog thời trang & lifestyle cá
              nhân — chia sẻ phong cách, tips phối đồ và gợi ý mua sắm.
            </p>
            <div className={styles.footer__social}>
              <a
                href="https://www.tiktok.com/@em.xinh0905"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.footer__socialLink}
                aria-label="TikTok"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.87a8.16 8.16 0 0 0 4.76 1.52v-3.4a4.85 4.85 0 0 1-1-.3z" />
                </svg>
              </a>
              <a
                href="https://shopee.vn/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.footer__socialLink}
                aria-label="Shopee"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </a>
              <a
                href="https://instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.footer__socialLink}
                aria-label="Instagram"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className={styles.footer__section}>
            <h3 className={styles.footer__sectionTitle}>Liên kết</h3>
            <nav aria-label="Liên kết nhanh" className={styles.footer__links}>
              {QUICK_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={styles.footer__link}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Categories */}
          <div className={styles.footer__section}>
            <h3 className={styles.footer__sectionTitle}>Danh mục</h3>
            <nav aria-label="Danh mục sản phẩm" className={styles.footer__links}>
              {CATEGORIES.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={styles.footer__link}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Newsletter */}
          <div className={styles.footer__section}>
            <h3 className={styles.footer__sectionTitle}>Đăng ký nhận tin</h3>
            <p className={styles.footer__newsletterText}>
              Nhận tips thời trang và gợi ý outfit mới nhất mỗi tuần!
            </p>
            <form className={styles.footer__newsletterForm}>
              <input
                type="email"
                placeholder="Email của bạn"
                className={styles.footer__newsletterInput}
                aria-label="Email đăng ký"
              />
              <button type="submit" className={styles.footer__newsletterBtn}>
                Gửi
              </button>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div className={styles.footer__bottom}>
          <p className={styles.footer__copyright}>
            © {currentYear} DaisyDaily. Tất cả quyền được bảo lưu.
          </p>
          <div className={styles.footer__bottomLinks}>
            <Link href="/privacy" className={styles.footer__bottomLink}>
              Chính sách bảo mật
            </Link>
            <Link href="/terms" className={styles.footer__bottomLink}>
              Điều khoản
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
