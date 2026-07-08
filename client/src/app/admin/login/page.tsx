"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./login.module.scss";
import { adminApi } from "@/lib/api";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = (await adminApi.login(email, password)) as {
        accessToken: string;
        user: { displayName: string };
      };

      if (response && response.accessToken) {
        localStorage.setItem("admin_token", response.accessToken);
        localStorage.setItem("admin_user", JSON.stringify(response.user));
        window.location.replace("/admin/dashboard");
      } else {
        setError("Không nhận được token từ server");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Email hoặc mật khẩu không đúng");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginPage__card}>
        <header className={styles.loginPage__header}>
          <h1 className={styles.loginPage__title}>DaisyDaily Admin</h1>
          <p className={styles.loginPage__subtitle}>
            Đăng nhập để quản trị hệ thống
          </p>
        </header>

        {error && <div className={styles.loginPage__error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.loginPage__form}>
          <div className={styles.loginPage__field}>
            <label htmlFor="email" className={styles.loginPage__label}>
              Email đăng nhập
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={styles.loginPage__input}
              placeholder="admin@daisydaily.com"
            />
          </div>

          <div className={styles.loginPage__field}>
            <label htmlFor="password" className={styles.loginPage__label}>
              Mật khẩu
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={styles.loginPage__input}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={styles.loginPage__submitBtn}
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>
      </div>
    </div>
  );
}
