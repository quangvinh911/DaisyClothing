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

interface ScanRequest {
  mode: 1 | 2 | 3;
  tiktokUrl?: string;
  count?: number;
  videoUrls?: string[];
}

const TIKTOK_URL_PATTERN =
  /https?:\/\/(?:[a-z0-9-]+\.)*tiktok\.com\/[^\s<>"'[\](){}]+/gi;

function extractTikTokUrls(value: string) {
  const matches = value.match(TIKTOK_URL_PATTERN) ?? [];
  return Array.from(
    new Set(matches.map((url) => url.replace(/[.,;:!?]+$/, ""))),
  );
}

export default function AdminScanPage() {
  const [mode, setMode] = useState<1 | 2 | 3>(1);
  const [tiktokUrl, setTiktokUrl] = useState("");
  const [count, setCount] = useState("10");
  const [videoUrlList, setVideoUrlList] = useState("");
  const [bulkUrls, setBulkUrls] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ScanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const detectedVideoUrls = extractTikTokUrls(videoUrlList);
  const detectedBulkUrls = extractTikTokUrls(bulkUrls);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("admin_token");
    if (!token) {
      setError("Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn. Đang chuyển hướng...");
      setTimeout(() => {
        window.location.href = "/admin/login";
      }, 1500);
      return;
    }

    setError(null);
    setResults(null);
    setLoading(true);

    try {
      const payload: ScanRequest = { mode };

      if (mode === 1) {
        if (!tiktokUrl.trim()) {
          throw new Error("Vui lòng nhập đường dẫn kênh/shop TikTok");
        }
        payload.tiktokUrl = tiktokUrl.trim();
        payload.count = Number(count);
      } else if (mode === 2) {
        if (detectedVideoUrls.length === 0) {
          throw new Error("Không tìm thấy đường dẫn TikTok hợp lệ trong danh sách");
        }
        payload.videoUrls = detectedVideoUrls;
      } else {
        if (detectedBulkUrls.length === 0) {
          throw new Error("Không tìm thấy đường dẫn TikTok hợp lệ trong danh sách");
        }
        payload.videoUrls = detectedBulkUrls;
      }

      const response = await adminApi.scanProducts(token, payload) as ScanResponse;
      if (response && response.success) {
        setResults(response);
      } else {
        throw new Error("Không thể thực hiện scan");
      }
    } catch (err: unknown) {
      const message = err instanceof Error && err.message
        ? err.message
        : "Đã xảy ra lỗi trong quá trình quét";

      if (message.includes("401") || message.includes("Unauthorized")) {
        setError("Mã xác thực Admin không hợp lệ hoặc đã hết hạn (401 Unauthorized). Vui lòng đăng nhập lại!");
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");
        setTimeout(() => {
          window.location.href = "/admin/login";
        }, 2000);
      } else {
        setError(message);
      }
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
              <label htmlFor="mode-2-video-urls" className={styles.crud__label}>
                Danh sách đường dẫn video/photo TikTok
              </label>
              <textarea
                id="mode-2-video-urls"
                placeholder={"Dán nhiều đường dẫn vào đây, mỗi dòng một link.\nHỗ trợ cả dạng: [https://www.tiktok.com/@username/video/123](https://www.tiktok.com/@username/video/123)"}
                value={videoUrlList}
                onChange={(e) => setVideoUrlList(e.target.value)}
                className={`${styles.crud__textarea} ${localStyles.urlListTextarea}`}
                disabled={loading}
                spellCheck={false}
              />
              <p className={localStyles.urlListHint} aria-live="polite">
                {detectedVideoUrls.length > 0
                  ? `Đã nhận diện ${detectedVideoUrls.length} đường dẫn duy nhất.`
                  : "Có thể dán link thường hoặc danh sách link Markdown."}
              </p>
            </div>
          ) : (
            /* Mode 3 inputs */
            <div className={styles.crud__formGroup}>
              <label htmlFor="mode-3-video-urls" className={styles.crud__label}>
                Nhập danh sách đường dẫn video/photo (mỗi dòng một đường dẫn)
              </label>
              <textarea
                id="mode-3-video-urls"
                placeholder={"Ví dụ:\nhttps://www.tiktok.com/@username/video/7342674918731517190\n[https://www.tiktok.com/@username/photo/7655493253176823048](https://www.tiktok.com/@username/photo/7655493253176823048)"}
                value={bulkUrls}
                onChange={(e) => setBulkUrls(e.target.value)}
                className={`${styles.crud__textarea} ${localStyles.urlListTextarea}`}
                disabled={loading}
                spellCheck={false}
              />
              <p className={localStyles.urlListHint} aria-live="polite">
                {detectedBulkUrls.length > 0
                  ? `Đã nhận diện ${detectedBulkUrls.length} đường dẫn duy nhất; link trùng sẽ tự động được bỏ qua.`
                  : "Có thể dán link thường hoặc danh sách link Markdown."}
              </p>
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
