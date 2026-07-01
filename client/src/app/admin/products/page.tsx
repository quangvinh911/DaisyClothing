"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "../admin-crud.module.scss";
import { adminApi, api, getAssetUrl } from "@/lib/api";
import { Product, PaginatedResponse } from "@/types";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);

  const fetchProducts = async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;

    setLoading(true);
    try {
      const queryParams: Record<string, string> = {
        page: page.toString(),
        limit: "10",
      };
      if (search) queryParams.search = search;
      if (platform) queryParams.platform = platform;

      const res = await adminApi.getProducts(token, queryParams);
      if (res) {
        const paginated = res as PaginatedResponse<Product>;
        setProducts(paginated.data);
        setMeta(paginated.meta);
      }
    } catch (error) {
      console.error("Failed to fetch admin products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, platform]);

  useEffect(() => {
    setSelectedIds([]);
  }, [products]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?")) return;

    const token = localStorage.getItem("admin_token");
    if (!token) return;

    try {
      await adminApi.deleteProduct(token, id);
      alert("Đã xóa sản phẩm thành công!");
      fetchProducts();
    } catch (error: any) {
      alert(error.message || "Xóa sản phẩm thất bại");
    }
  };

  const handleToggleActive = async (id: string, currentIsActive: boolean) => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;

    try {
      await adminApi.updateProduct(token, id, { isActive: !currentIsActive });
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isActive: !currentIsActive } : p))
      );
    } catch (error: any) {
      alert(error.message || "Cập nhật trạng thái thất bại");
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(products.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} sản phẩm đã chọn không?`)) return;

    const token = localStorage.getItem("admin_token");
    if (!token) return;

    try {
      await adminApi.bulkDeleteProducts(token, selectedIds);
      alert("Đã xóa các sản phẩm thành công!");
      setSelectedIds([]);
      fetchProducts();
    } catch (error: any) {
      alert(error.message || "Xóa hàng loạt thất bại");
    }
  };

  const formatPrice = (price: number | null) => {
    if (price === null) return "Liên hệ";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div className={styles.crud}>
      <div className={styles.crud__header}>
        <h1 className={styles.crud__title}>Danh sách sản phẩm</h1>
        <div style={{ display: "flex", gap: "10px" }}>
          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className={styles.crud__btnBulkDelete}
            >
              🗑️ Xóa hàng loạt ({selectedIds.length})
            </button>
          )}
          <Link href="/admin/products/new" className="btn btn--gold btn--sm">
            ➕ Thêm sản phẩm mới
          </Link>
        </div>
      </div>

      <div className={styles.crud__card}>
        {/* Filters */}
        <div className={styles.crud__filters}>
          <form onSubmit={handleSearchSubmit} className={styles.crud__filters}>
            <input
              type="text"
              placeholder="Tìm theo tên sản phẩm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.crud__searchInput}
            />
            <button type="submit" className="btn btn--gold btn--sm">
              Tìm
            </button>
          </form>

          <select
            value={platform}
            onChange={(e) => {
              setPlatform(e.target.value);
              setPage(1);
            }}
            className={styles.crud__select}
          >
            <option value="">Tất cả sàn</option>
            <option value="TIKTOK">TikTok Shop</option>
            <option value="SHOPEE">Shopee</option>
            <option value="LAZADA">Lazada</option>
            <option value="AMAZON">Amazon</option>
            <option value="OTHER">Khác</option>
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <p>Đang tải danh sách sản phẩm...</p>
        ) : products.length === 0 ? (
          <p>Không tìm thấy sản phẩm nào.</p>
        ) : (
          <>
            <table className={styles.crud__table}>
              <thead>
                <tr>
                  <th style={{ width: "40px", textAlign: "center" }}>
                    <input
                      type="checkbox"
                      checked={products.length > 0 && selectedIds.length === products.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      style={{ cursor: "pointer" }}
                    />
                  </th>
                  <th>Hình ảnh</th>
                  <th>Tên sản phẩm</th>
                  <th>Thương hiệu</th>
                  <th>Giá tiền</th>
                  <th>Sàn</th>
                  <th>Lượt click</th>
                  <th>Ngày tạo</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {products.map((prod) => {
                  const imgUrl = getAssetUrl(prod.imageUrl);

                  return (
                    <tr key={prod.id}>
                      <td style={{ textAlign: "center" }}>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(prod.id)}
                          onChange={(e) => handleSelectOne(prod.id, e.target.checked)}
                          style={{ cursor: "pointer" }}
                        />
                      </td>
                      <td>
                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt={prod.name}
                            style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "4px" }}
                          />
                        ) : (
                          <div style={{ width: "40px", height: "40px", backgroundColor: "#f5ede3", borderRadius: "4px" }} />
                        )}
                      </td>
                      <td style={{ fontWeight: 500, maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {prod.name}
                      </td>
                      <td>{prod.brand || "-"}</td>
                      <td style={{ color: "#c4956a", fontWeight: "bold" }}>
                        {formatPrice(prod.price)}
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: "bold",
                            padding: "2px 6px",
                            borderRadius: "3px",
                            color: "#fff",
                            backgroundColor:
                              prod.platform === "SHOPEE"
                                ? "#ff5722"
                                : prod.platform === "TIKTOK"
                                  ? "#000"
                                  : prod.platform === "LAZADA"
                                    ? "#101464"
                                    : "#6b6b6b",
                          }}
                        >
                          {prod.platform}
                        </span>
                      </td>
                      <td style={{ fontWeight: "bold" }}>
                        {prod._count?.clicks || 0}
                      </td>
                      <td style={{ whiteSpace: "nowrap", fontSize: "12px", color: "#666" }}>
                        {(() => {
                          const d = new Date(prod.createdAt);
                          const day = String(d.getDate()).padStart(2, "0");
                          const month = String(d.getMonth() + 1).padStart(2, "0");
                          const year = d.getFullYear();
                          const hours = String(d.getHours()).padStart(2, "0");
                          const minutes = String(d.getMinutes()).padStart(2, "0");
                          return `${day}/${month}/${year} ${hours}:${minutes}`;
                        })()}
                      </td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        <label className={styles.crud__switch} style={{ verticalAlign: "middle" }}>
                          <input
                            type="checkbox"
                            checked={prod.isActive}
                            onChange={() => handleToggleActive(prod.id, prod.isActive)}
                          />
                          <span className={styles.crud__slider}></span>
                        </label>
                        <span style={{ fontSize: "12px", marginLeft: "8px", display: "inline-block", verticalAlign: "middle", color: prod.isActive ? "#4CAF50" : "#6B6B6B", fontWeight: 500 }}>
                          {prod.isActive ? "Hiển thị" : "Ẩn"}
                        </span>
                      </td>
                      <td>
                        <Link href={`/admin/products/${prod.id}`}>
                          <button className={styles.crud__btnEdit}>Sửa</button>
                        </Link>
                        <button
                          onClick={() => handleDelete(prod.id)}
                          className={styles.crud__btnDelete}
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className={styles.crud__pagination} style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "20px" }}>
                <button
                  disabled={!meta.hasPreviousPage}
                  onClick={() => setPage(meta.page - 1)}
                  className="btn btn--outline btn--sm"
                >
                  &laquo; Trước
                </button>
                <span style={{ display: "flex", alignItems: "center", fontSize: "14px" }}>
                  Trang {meta.page} / {meta.totalPages}
                </span>
                <button
                  disabled={!meta.hasNextPage}
                  onClick={() => setPage(meta.page + 1)}
                  className="btn btn--outline btn--sm"
                >
                  Sau &raquo;
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
