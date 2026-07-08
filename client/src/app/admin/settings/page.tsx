"use client";

import { useEffect, useState } from "react";
import styles from "../admin-crud.module.scss";
import { api, adminApi } from "@/lib/api";
import { SiteSetting } from "@/types";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Password change states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Form states
  const [siteName, setSiteName] = useState("");
  const [siteTagline, setSiteTagline] = useState("");
  const [siteDescription, setSiteDescription] = useState("");
  const [aboutIntro, setAboutIntro] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [geminiModel, setGeminiModel] = useState("gemini-2.5-flash");

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await api.getSettings();
      if (res) {
        const list = res as SiteSetting[];
        setSettings(list);

        const getVal = (key: string) => list.find((s) => s.key === key)?.value || "";
        setSiteName(getVal("site_name"));
        setSiteTagline(getVal("site_tagline"));
        setSiteDescription(getVal("site_description"));
        setAboutIntro(getVal("about_intro"));
        setContactEmail(getVal("contact_email"));
        setGeminiApiKey(getVal("gemini_api_key"));
        setGeminiModel(getVal("gemini_model") || "gemini-2.5-flash");
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (settings.length === 0) {
      alert("Không thể lưu cấu hình vì dữ liệu chưa được tải thành công từ máy chủ. Vui lòng tải lại trang.");
      return;
    }
    setSaving(true);

    const token = localStorage.getItem("admin_token");
    if (!token) return;

    try {
      // Save all updated key-values
      await Promise.all([
        adminApi.updateSetting(token, "site_name", siteName),
        adminApi.updateSetting(token, "site_tagline", siteTagline),
        adminApi.updateSetting(token, "site_description", siteDescription),
        adminApi.updateSetting(token, "about_intro", aboutIntro),
        adminApi.updateSetting(token, "contact_email", contactEmail),
        adminApi.updateSetting(token, "gemini_api_key", geminiApiKey),
        adminApi.updateSetting(token, "gemini_model", geminiModel),
      ]);

      alert("Cập nhật cấu hình website thành công!");
      loadSettings();
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Lỗi khi cập nhật cấu hình");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Xác nhận mật khẩu mới không khớp!");
      return;
    }

    const token = localStorage.getItem("admin_token");
    if (!token) return;

    setPasswordSaving(true);
    try {
      await adminApi.changePassword(token, {
        currentPassword,
        newPassword,
      });
      alert("Đổi mật khẩu thành công!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      alert(error.message || "Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu hiện tại!");
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) {
    return <p>Đang tải thông tin cấu hình...</p>;
  }

  return (
    <div className={styles.crud}>
      <div className={styles.crud__header}>
        <h1 className={styles.crud__title}>Cấu hình Website</h1>
      </div>

      <div className={styles.crud__card}>
        <form onSubmit={handleSubmit} className={styles.crud__form}>
          <div className={styles.crud__formGroup}>
            <label className={styles.crud__label}>Tên Website (site_name)</label>
            <input
              type="text"
              required
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className={styles.crud__input}
            />
          </div>

          <div className={styles.crud__formGroup}>
            <label className={styles.crud__label}>Tagline (site_tagline)</label>
            <input
              type="text"
              required
              value={siteTagline}
              onChange={(e) => setSiteTagline(e.target.value)}
              className={styles.crud__input}
            />
          </div>

          <div className={styles.crud__formGroup}>
            <label className={styles.crud__label}>Email liên hệ (contact_email)</label>
            <input
              type="email"
              required
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className={styles.crud__input}
            />
          </div>
          
          <div className={styles.crud__formGroup}>
            <label className={styles.crud__label}>Gemini API Key (gemini_api_key)</label>
            <input
              type="password"
              value={geminiApiKey}
              onChange={(e) => setGeminiApiKey(e.target.value)}
              className={styles.crud__input}
              placeholder="Nhập Gemini API Key từ Google AI Studio..."
            />
            <small style={{ color: "#8a7a6b", marginTop: "4px", display: "block" }}>
              Dùng để tự động tạo nội dung bài viết bằng AI. Lấy API key miễn phí tại{" "}
              <a
                href="https://aistudio.google.com/"
                target="_blank"
                rel="noreferrer"
                style={{ color: "#c5a880", textDecoration: "underline" }}
              >
                Google AI Studio
              </a>
            </small>
          </div>

          <div className={styles.crud__formGroup}>
            <label className={styles.crud__label}>Gemini Model (gemini_model)</label>
            <input
              type="text"
              value={geminiModel}
              onChange={(e) => setGeminiModel(e.target.value)}
              className={styles.crud__input}
              placeholder="VD: gemini-2.5-flash, gemini-2.0-flash, hoặc gemini-3.5-flash..."
            />
            <small style={{ color: "#8a7a6b", marginTop: "4px", display: "block" }}>
              Tên model AI muốn sử dụng để sinh nội dung. Mặc định là <code>gemini-2.5-flash</code>.
            </small>
          </div>

          <div className={styles.crud__formGroup}>
            <label className={styles.crud__label}>Mô tả Website (site_description)</label>
            <textarea
              required
              value={siteDescription}
              onChange={(e) => setSiteDescription(e.target.value)}
              className={styles.crud__textarea}
              placeholder="Sử dụng cho SEO meta description của trang chủ..."
            />
          </div>

          <div className={styles.crud__formGroup}>
            <label className={styles.crud__label}>Giới thiệu ngắn (about_intro)</label>
            <textarea
              required
              value={aboutIntro}
              onChange={(e) => setAboutIntro(e.target.value)}
              className={styles.crud__textarea}
              style={{ minHeight: "120px" }}
              placeholder="Hiển thị tại trang Giới thiệu..."
            />
          </div>

          <div className={styles.crud__formActions}>
            <button
              type="submit"
              disabled={saving}
              className="btn btn--gold btn--lg"
            >
              {saving ? "Đang lưu cấu hình..." : "Lưu cấu hình"}
            </button>
          </div>
        </form>
      </div>

      <div className={styles.crud__card} style={{ marginTop: "2rem" }}>
        <h2 className={styles.crud__title} style={{ fontSize: "20px", marginBottom: "1.5rem" }}>
          Đổi mật khẩu tài khoản Admin
        </h2>
        <form onSubmit={handlePasswordChange} className={styles.crud__form}>
          <div className={styles.crud__formGroup}>
            <label className={styles.crud__label}>Mật khẩu hiện tại</label>
            <input
              type="password"
              required
              minLength={6}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={styles.crud__input}
              placeholder="Nhập mật khẩu hiện tại..."
            />
          </div>

          <div className={styles.crud__formGroup}>
            <label className={styles.crud__label}>Mật khẩu mới</label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={styles.crud__input}
              placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)..."
            />
          </div>

          <div className={styles.crud__formGroup}>
            <label className={styles.crud__label}>Xác nhận mật khẩu mới</label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={styles.crud__input}
              placeholder="Nhập lại mật khẩu mới..."
            />
          </div>

          <div className={styles.crud__formActions}>
            <button
              type="submit"
              disabled={passwordSaving}
              className="btn btn--gold btn--lg"
            >
              {passwordSaving ? "Đang cập nhật..." : "Đổi mật khẩu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
