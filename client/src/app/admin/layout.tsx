"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import styles from "./admin-layout.module.scss";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [authorized, setAuthorized] = useState(false);
  const [userName, setUserName] = useState("Admin");
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Exclude login page from authorization check
    if (pathname === "/admin/login") {
      setAuthorized(true);
      return;
    }

    const token = localStorage.getItem("admin_token");
    const userStr = localStorage.getItem("admin_user");

    if (!token) {
      router.push("/admin/login");
    } else {
      setAuthorized(true);
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setUserName(user.displayName || "Admin User");
        } catch (e) {
          // Keep default
        }
      }
    }
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    router.push("/admin/login");
  };

  if (!authorized) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#faf7f2" }}>
        <p style={{ color: "#6b6b6b" }}>Đang tải...</p>
      </div>
    );
  }

  // If on login page, just render children directly (no sidebar or header)
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const navLinks = [
    { href: "/admin/dashboard", label: "Tổng quan", icon: "📊" },
    { href: "/admin/posts", label: "Bài viết", icon: "📝" },
    { href: "/admin/products", label: "Sản phẩm", icon: "🛍️" },
    { href: "/admin/scan", label: "Scan TikTok", icon: "🔍" },
    { href: "/admin/settings", label: "Cấu hình", icon: "⚙️" },
    { href: "/", label: "Xem Website", icon: "🌐" },
  ];

  const getPageTitle = () => {
    if (pathname.startsWith("/admin/dashboard")) return "Bảng điều khiển";
    if (pathname.startsWith("/admin/posts")) return "Quản lý bài viết";
    if (pathname.startsWith("/admin/products")) return "Quản lý sản phẩm";
    if (pathname.startsWith("/admin/scan")) return "Quét Video TikTok";
    if (pathname.startsWith("/admin/settings")) return "Cấu hình Website";
    return "Quản trị";
  };

  return (
    <div className={styles.adminLayout}>
      {/* Sidebar */}
      <aside className={styles.adminLayout__sidebar}>
        <div className={styles.adminLayout__brand}>DaisyDaily</div>
        <nav className={styles.adminLayout__nav}>
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href) && (link.href !== "/" || pathname === "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.adminLayout__navLink} ${isActive ? styles["adminLayout__navLink--active"] : ""}`}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
        <button onClick={handleLogout} className={styles.adminLayout__logoutBtn}>
          🚪 Đăng xuất
        </button>
      </aside>

      {/* Main Area */}
      <div className={styles.adminLayout__main}>
        {/* Header */}
        <header className={styles.adminLayout__header}>
          <h2 className={styles.adminLayout__pageTitle}>{getPageTitle()}</h2>
          <div className={styles.adminLayout__profile}>
            <div className={styles.adminLayout__avatar}>
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className={styles.adminLayout__displayName}>{userName}</span>
          </div>
        </header>

        {/* Content */}
        <main className={styles.adminLayout__content}>{children}</main>
      </div>
    </div>
  );
}
