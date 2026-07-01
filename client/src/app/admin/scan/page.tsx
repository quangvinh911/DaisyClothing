"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "../admin-crud.module.scss";
import localStyles from "./scan.module.scss";
import { adminApi, getAssetUrl } from "@/lib/api";

interface ScannedProduct {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  brand: string | null;
  tiktokVideoUrl: string | null;
  affiliateUrl: string | null;
}

interface ScanResponse {
  success: boolean;
  scannedCount: number;
  createdCount: number;
  products: ScannedProduct[];
  errors: { url: string; error: string }[];
}

export default function AdminScanPage() {
  const [mode, setMode] = useState<1 | 2 | 3>(1);
  const [tiktokUrl, setTiktokUrl] = useState("");
  const [count, setCount] = useState("10");
  const [videoUrls, setVideoUrls] = useState<string[]>([""]);
  const [bulkUrls, setBulkUrls] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ScanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAddInput = () => {
    setVideoUrls((prev) => [...prev, ""]);
  };

  const handleRemoveInput = (index: number) => {
    if (videoUrls.length <= 1) return;
    setVideoUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUrlChange = (index: number, value: string) => {
    setVideoUrls((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("admin_token");
    if (!token) return;

    setError(null);
    setResults(null);
    setLoading(true);

    try {
      let payload: any = { mode };

      if (mode === 1) {
        if (!tiktokUrl.trim()) {
          throw new Error("Vui lòng nhập đường dẫn kênh/shop TikTok");
        }
        payload.tiktokUrl = tiktokUrl.trim();
        payload.count = Number(count);
      } else if (mode === 2) {
        const filteredUrls = videoUrls.filter((url) => url.trim() !== "");
        if (filteredUrls.length === 0) {
          throw new Error("Vui lòng nhập ít nhất một đường dẫn video");
        }
        payload.videoUrls = filteredUrls;
      } else {
        const splitUrls = bulkUrls
          .split("\n")
          .map((url) => url.trim())
          .filter((url) => url !== "");
        if (splitUrls.length === 0) {
          throw new Error("Vui lòng nhập ít nhất một đường dẫn video/photo");
        }
        payload.videoUrls = splitUrls;
      }

      const response = await adminApi.scanProducts(token, payload) as ScanResponse;
      if (response && response.success) {
        setResults(response);
      } else {
        throw new Error("Không thể thực hiện scan");
      }
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi trong quá trình quét");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={localStyles.scanContainer}>
      <div className={styles.crud__header}>
        <h1 className={styles.crud__title}>Scan sản phẩm từ TikTok</h1>
      </div>

      <div className={styles.crud__card}>
        {/* Mode Tabs */}
        <div className={localStyles.tabs}>
          <button
            type="button"
            className={`${localStyles.tab} ${mode === 1 ? localStyles["tab--active"] : ""}`}
            onClick={() => {
              setMode(1);
              setError(null);
              setResults(null);
            }}
          >
            Mode 1: Quét Kênh/Shop TikTok
          </button>
          <button
            type="button"
            className={`${localStyles.tab} ${mode === 2 ? localStyles["tab--active"] : ""}`}
            onClick={() => {
              setMode(2);
              setError(null);
              setResults(null);
            }}
          >
            Mode 2: Nhập danh sách video
          </button>
          <button
            type="button"
            className={`${localStyles.tab} ${mode === 3 ? localStyles["tab--active"] : ""}`}
            onClick={() => {
              setMode(3);
              setError(null);
              setResults(null);
            }}
          >
            Mode 3: Nhập danh sách theo dòng
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleScan} className={styles.crud__form}>
          {mode === 1 ? (
            /* Mode 1 inputs */
            <div className={styles.crud__formRow}>
              <div className={styles.crud__formGroup}>
                <label className={styles.crud__label}>Đường dẫn Kênh / Shop TikTok</label>
                <input
                  type="url"
                  placeholder="Ví dụ: https://www.tiktok.com/@username"
                  value={tiktokUrl}
                  onChange={(e) => setTiktokUrl(e.target.value)}
                  className={styles.crud__input}
                  disabled={loading}
                />
              </div>

              <div className={styles.crud__formGroup}>
                <label className={styles.crud__label}>Số lượng video quét tối đa</label>
                <select
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  className={styles.crud__select}
                  disabled={loading}
                >
                  <option value="5">5 video mới nhất</option>
                  <option value="10">10 video mới nhất</option>
                  <option value="20">20 video mới nhất</option>
                  <option value="50">50 video mới nhất</option>
                  <option value="-1">Tất cả video</option>
                </select>
              </div>
            </div>
          ) : mode === 2 ? (
            /* Mode 2 inputs */
            <div className={styles.crud__formGroup}>
              <label className={styles.crud__label}>Danh sách đường dẫn video/photo TikTok</label>
              {videoUrls.map((url, idx) => (
                <div key={idx} className={localStyles.urlInputRow}>
                  <input
                    type="url"
                    placeholder={`Đường dẫn video/photo #${idx + 1}`}
                    value={url}
                    onChange={(e) => handleUrlChange(idx, e.target.value)}
                    className={styles.crud__input}
                    disabled={loading}
                  />
                  {videoUrls.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveInput(idx)}
                      className={localStyles.btnRemove}
                      title="Xóa dòng này"
                      disabled={loading}
                    >
                      ❌
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddInput}
                className={localStyles.btnAddMore}
                disabled={loading}
              >
                ➕ Thêm đường dẫn video/photo
              </button>
            </div>
          ) : (
            /* Mode 3 inputs */
            <div className={styles.crud__formGroup}>
              <label className={styles.crud__label}>Nhập danh sách đường dẫn video/photo (mỗi dòng một đường dẫn)</label>
              <textarea
                placeholder="Ví dụ:&#13;https://www.tiktok.com/@username/video/7342674918731517190&#13;https://www.tiktok.com/@username/photo/7655493253176823048"
                value={bulkUrls}
                onChange={(e) => setBulkUrls(e.target.value)}
                className={styles.crud__textarea}
                style={{ minHeight: "180px", fontFamily: "monospace", fontSize: "13px" }}
                disabled={loading}
              />
            </div>
          )}

          {error && <div className={styles.crud__errorMessage}>{error}</div>}

          <div className={styles.crud__formActions} style={{ marginTop: "1rem" }}>
            <button
              type="submit"
              className="btn btn--gold btn--md"
              disabled={loading}
            >
              {loading ? "Đang quét dữ liệu..." : "🚀 Tiến hành quét (Scan)"}
            </button>
          </div>
        </form>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className={styles.crud__card}>
          <div className={localStyles.loadingArea}>
            <div className={localStyles.spinner} />
            <p>Đang tiến hành cào dữ liệu và phân tách oEmbed từ TikTok...</p>
            <p style={{ fontSize: "12px" }}>Quá trình này có thể mất từ vài giây đến một phút tùy thuộc số lượng video.</p>
          </div>
        </div>
      )}

      {/* Scan Results */}
      {results && (
        <div className={localStyles.results}>
          <div className={styles.crud__card}>
            <h3 className={localStyles.resultTitle} style={{ color: "#2e7d32" }}>
              🎉 Quét thành công! Đã xử lý {results.scannedCount} video.
            </h3>
            <p style={{ marginBottom: "1rem", fontSize: "14px" }}>
              Đã đồng bộ/tạo mới <strong>{results.createdCount}</strong> sản phẩm vào hệ thống. Các sản phẩm này sẽ được hiển thị ngay lập tức trên trang Shop.
            </p>

            <div className={localStyles.resultList}>
              {results.products.map((prod) => (
                <div key={prod.id} className={localStyles.resultItem}>
                  {prod.imageUrl ? (
                    <img
                      src={getAssetUrl(prod.imageUrl)}
                      alt={prod.name}
                      className={localStyles.resultItem__img}
                    />
                  ) : (
                    <div
                      className={localStyles.resultItem__img}
                      style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", backgroundColor: "#f5ede3" }}
                    >
                      🎬
                    </div>
                  )}
                  <div className={localStyles.resultItem__details}>
                    <h4 className={localStyles.resultItem__name}>{prod.name}</h4>
                    <div className={localStyles.resultItem__meta}>
                      <span>Thương hiệu: <strong>{prod.brand || "TikTok"}</strong></span>
                      <span className={localStyles.resultItem__badge}>Đã đồng bộ</span>
                    </div>
                  </div>
                  <div>
                    <a
                      href={prod.tiktokVideoUrl || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={localStyles.resultItem__link}
                      style={{ fontSize: "13px" }}
                    >
                      Xem Video 🔗
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {results.errors.length > 0 && (
              <div className={localStyles.errorList}>
                <h4>⚠️ Một số video gặp lỗi khi cào dữ liệu:</h4>
                <ul>
                  {results.errors.map((err, i) => (
                    <li key={i}>
                      <strong>URL:</strong> {err.url} - {err.error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div style={{ marginTop: "1.5rem", display: "flex", gap: "10px" }}>
              <Link href="/admin/products" className="btn btn--outline btn--sm">
                Danh sách sản phẩm
              </Link>
              <Link href="/shop" target="_blank" className="btn btn--gold btn--sm">
                Xem trang Shop 🌐
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
