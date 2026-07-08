"use client";

import { useEffect, useState } from "react";
import styles from "./dashboard.module.scss";
import { adminApi } from "@/lib/api";
import { DashboardStats, TopProduct, ChartDataPoint, AffiliateClickDetailsResponse } from "@/types";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [clickDetails, setClickDetails] = useState<AffiliateClickDetailsResponse>({ clicks: [], countries: [] });
  const [showClickDetails, setShowClickDetails] = useState(false);
  const [clickSearch, setClickSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem("admin_token");
      if (!token) return;

      try {
        const [statsRes, prodRes, clicksRes, clickDetailsRes] = await Promise.all([
          adminApi.getDashboardStats(token).catch(() => null),
          adminApi.getTopProducts(token, 30).catch(() => []),
          adminApi.getClicksByDay(token, 7).catch(() => []),
          adminApi.getAffiliateClickDetails(token, 30, 50).catch(() => ({ clicks: [], countries: [] })),
        ]);

        if (statsRes) {
          setStats(statsRes as DashboardStats);
        }
        if (prodRes) {
          setTopProducts(prodRes as TopProduct[]);
        }
        if (clicksRes) {
          setChartData(clicksRes as ChartDataPoint[]);
        }
        if (clickDetailsRes) {
          setClickDetails(clickDetailsRes as AffiliateClickDetailsResponse);
        }
      } catch (error) {
        console.error("Failed to load admin dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <p>Đang tải dữ liệu báo cáo...</p>;
  }

  // Fallbacks if stats fail to fetch
  const displayStats = stats || {
    pageViews: { total: 0, today: 0, week: 0, month: 0 },
    affiliateClicks: { total: 0, today: 0, week: 0, month: 0 },
    content: { publishedPosts: 0, activeProducts: 0 },
  };

  const displayChartData = chartData.length > 0 ? chartData : [
    { date: "T2", clicks: 5 },
    { date: "T3", clicks: 12 },
    { date: "T4", clicks: 8 },
    { date: "T5", clicks: 19 },
    { date: "T6", clicks: 15 },
    { date: "T7", clicks: 24 },
    { date: "CN", clicks: 30 },
  ];

  // SVG Chart rendering calculations
  const maxClicks = Math.max(...displayChartData.map((d) => d.clicks || 0), 10);
  const chartHeight = 220;
  const chartWidth = 500;
  const points = displayChartData.map((d, index) => {
    const x = (index / (displayChartData.length - 1)) * chartWidth;
    const y = chartHeight - ((d.clicks || 0) / maxClicks) * (chartHeight - 40) - 20;
    return { x, y, label: d.date, value: d.clicks || 0 };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, "");

  const normalizedClickSearch = clickSearch.trim().toLowerCase();
  const filteredClickDetails = normalizedClickSearch
    ? clickDetails.clicks.filter((click) => {
        const searchableText = [
          click.ipAddress,
          click.country,
          click.product.name,
          click.product.platform,
          click.referrerUrl,
          click.utmSource,
          new Date(click.clickedAt).toLocaleString("vi-VN"),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(normalizedClickSearch);
      })
    : clickDetails.clicks;

  return (
    <div className={styles.dashboard}>
      {/* Cards stats grid */}
      <div className={styles.dashboard__statsGrid}>
        <div className={styles.dashboard__statCard}>
          <span className={styles.dashboard__statLabel}>Lượt xem trang</span>
          <span className={styles.dashboard__statValue}>
            {displayStats.pageViews.total}
          </span>
          <div className={`${styles.dashboard__statMeta} ${styles["dashboard__statMeta--up"]}`}>
            Hôm nay: <span>{displayStats.pageViews.today}</span>
          </div>
        </div>

        <button
          type="button"
          className={`${styles.dashboard__statCard} ${styles.dashboard__statCardButton}`}
          onClick={() => setShowClickDetails((current) => !current)}
        >
          <span className={styles.dashboard__statLabel}>Click Affiliate</span>
          <span className={styles.dashboard__statValue}>
            {displayStats.affiliateClicks.total}
          </span>
          <div className={`${styles.dashboard__statMeta} ${styles["dashboard__statMeta--up"]}`}>
            Hôm nay: <span>{displayStats.affiliateClicks.today}</span>
          </div>
        </button>

        <div className={styles.dashboard__statCard}>
          <span className={styles.dashboard__statLabel}>Nội dung</span>
          <span className={styles.dashboard__statValue}>
            {displayStats.content.publishedPosts}
          </span>
          <div className={styles.dashboard__statMeta}>
            Sản phẩm đang bán: <span>{displayStats.content.activeProducts}</span>
          </div>
        </div>
      </div>

      {showClickDetails && (
        <div className={styles.dashboard__card}>
          <div className={styles.dashboard__detailsHeader}>
            <h3 className={styles.dashboard__cardTitle}>Chi tiet IP / quoc gia click affiliate</h3>
            <button
              type="button"
              className={styles.dashboard__closeButton}
              onClick={() => setShowClickDetails(false)}
            >
              Dong
            </button>
          </div>

          <div className={styles.dashboard__countryList}>
            {clickDetails.countries.length === 0 ? (
              <span>Chua co du lieu quoc gia.</span>
            ) : (
              clickDetails.countries.map((item) => (
                <span key={item.country} className={styles.dashboard__countryPill}>
                  {item.country}: <strong>{item.clicks}</strong>
                </span>
              ))
            )}
          </div>

          <div className={styles.dashboard__searchRow}>
            <input
              type="search"
              value={clickSearch}
              onChange={(event) => setClickSearch(event.target.value)}
              placeholder="Tim theo IP, quoc gia, san pham, nguon..."
              className={styles.dashboard__searchInput}
            />
            <span className={styles.dashboard__searchCount}>
              {filteredClickDetails.length}/{clickDetails.clicks.length} clicks
            </span>
          </div>

          {clickDetails.clicks.length === 0 ? (
            <p style={{ color: "#6b6b6b", fontSize: "14px", marginTop: "16px" }}>
              Chua co luot click affiliate nao duoc ghi nhan.
            </p>
          ) : filteredClickDetails.length === 0 ? (
            <p style={{ color: "#6b6b6b", fontSize: "14px", marginTop: "16px" }}>
              Khong tim thay click phu hop.
            </p>
          ) : (
            <div className={styles.dashboard__tableWrap}>
              <table className={styles.dashboard__table}>
                <thead>
                  <tr>
                    <th>Thoi gian</th>
                    <th>IP</th>
                    <th>Quoc gia</th>
                    <th>San pham</th>
                    <th>Nguon</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClickDetails.map((click) => (
                    <tr key={click.id}>
                      <td style={{ whiteSpace: "nowrap" }}>
                        {new Date(click.clickedAt).toLocaleString("vi-VN")}
                      </td>
                      <td>{click.ipAddress || "-"}</td>
                      <td>{click.country || "Unknown"}</td>
                      <td title={click.product.name}>{click.product.name}</td>
                      <td>{click.utmSource || click.referrerUrl || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <div className={styles.dashboard__row}>
        {/* SVG Line Graph */}
        <div className={styles.dashboard__card}>
          <h3 className={styles.dashboard__cardTitle}>Lượt Click Click-Through (7 ngày qua)</h3>
          <div className={styles.dashboard__chartContainer}>
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className={styles.dashboard__chartSvg}
            >
              {/* Grid lines */}
              <line x1="0" y1="20" x2={chartWidth} y2="20" stroke="#f1ede3" strokeWidth="1" />
              <line x1="0" y1={chartHeight - 20} x2={chartWidth} y2={chartHeight - 20} stroke="#e8d5c4" strokeWidth="1" />

              {/* Gradient beneath the line */}
              {points.length > 1 && (
                <path
                  d={`${pathD} L ${points[points.length - 1].x} ${chartHeight - 20} L ${points[0].x} ${chartHeight - 20} Z`}
                  fill="url(#chartGrad)"
                  opacity="0.3"
                />
              )}

              {/* Main Line path */}
              <path
                d={pathD}
                fill="none"
                stroke="#c4956a"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points (circles) & Tooltip value text */}
              {points.map((p, i) => (
                <g key={i}>
                  <circle cx={p.x} cy={p.y} r="5" fill="#ffffff" stroke="#c4956a" strokeWidth="2" />
                  <text x={p.x} y={p.y - 10} fontSize="10" textAnchor="middle" fill="#2c2c2c" fontWeight="bold">
                    {p.value}
                  </text>
                  <text x={p.x} y={chartHeight - 2} fontSize="10" textAnchor="middle" fill="#6b6b6b">
                    {p.label}
                  </text>
                </g>
              ))}

              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c4956a" />
                  <stop offset="100%" stopColor="#ffffff" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Top Product Clicks Table */}
        <div className={styles.dashboard__card}>
          <h3 className={styles.dashboard__cardTitle}>Top Sản Phẩm Click Nhiều</h3>
          {topProducts.length === 0 ? (
            <p style={{ color: "#6b6b6b", fontSize: "14px" }}>Chưa có lượt click affiliate nào được ghi nhận.</p>
          ) : (
            <table className={styles.dashboard__table}>
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Sàn</th>
                  <th>Lượt click</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.slice(0, 5).map((prod) => (
                  <tr key={prod.id}>
                    <td>
                      <div className={styles.dashboard__productCell}>
                        <div className={styles.dashboard__productIcon}>🛍️</div>
                        <span className={styles.dashboard__productName} title={prod.name}>
                          {prod.name}
                        </span>
                      </div>
                    </td>
                    <td>{prod.platform}</td>
                    <td>
                      <span className={styles.dashboard__clicksBadge}>
                        <button type="button" onClick={() => setShowClickDetails(true)}>
                          {prod.clicks} clicks
                        </button>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
