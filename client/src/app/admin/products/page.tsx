"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import styles from "../admin-crud.module.scss";
import { adminApi, getAssetUrl } from "@/lib/api";
import { Product, PaginatedResponse } from "@/types";

type ProductSortField =
  | "favorite"
  | "name"
  | "brand"
  | "price"
  | "platform"
  | "clicks"
  | "createdAt"
  | "isActive";

type SortOrder = "asc" | "desc";

const DEFAULT_SORT_ORDERS: Record<ProductSortField, SortOrder> = {
  favorite: "desc",
  name: "asc",
  brand: "asc",
  price: "asc",
  platform: "asc",
  clicks: "desc",
  createdAt: "desc",
  isActive: "desc",
};

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchDraft, setSearchDraft] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [platform, setPlatform] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<PaginatedResponse<Product>["meta"] | null>(null);
  const [sortBy, setSortBy] = useState<ProductSortField>("favorite");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const fetchProducts = useCallback(async (targetPage = page) => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;

    setLoading(true);
    try {
      const queryParams: Record<string, string> = {
        page: targetPage.toString(),
        limit: "10",
      };
      if (appliedSearch) queryParams.search = appliedSearch;
      if (platform) queryParams.platform = platform;
      queryParams.sortBy = sortBy;
      queryParams.sortOrder = sortOrder;

      const res = await adminApi.getProducts(token, queryParams);
      if (res) {
        const paginated = res as PaginatedResponse<Product>;
        setProducts(paginated.data);
        setMeta(paginated.meta);
        setSelectedIds([]);
      }
    } catch (error) {
      console.error("Failed to fetch admin products:", error);
    } finally {
      setLoading(false);
    }
  }, [appliedSearch, page, platform, sortBy, sortOrder]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchProducts();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchProducts]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedSearch(searchDraft.trim());
    setPage(1);
  };

  const handleSort = (field: ProductSortField) => {
    setPage(1);
    if (sortBy === field) {
      setSortOrder((current) => current === "asc" ? "desc" : "asc");
      return;
    }

    setSortBy(field);
    setSortOrder(DEFAULT_SORT_ORDERS[field]);
  };

  const getAriaSort = (field: ProductSortField): "ascending" | "descending" | undefined => {
    if (sortBy !== field) return undefined;
    return sortOrder === "asc" ? "ascending" : "descending";
  };

  const getSortIndicator = (field: ProductSortField) => {
    if (sortBy !== field) return "↕";
    return sortOrder === "asc" ? "▲" : "▼";
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?")) return;

    const token = localStorage.getItem("admin_token");
    if (!token) return;

    try {
      await adminApi.deleteProduct(token, id);
      alert("Đã xóa sản phẩm thành công!");
      fetchProducts();
    } catch (error: unknown) {
      alert(getErrorMessage(error, "Xóa sản phẩm thất bại"));
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
    } catch (error: unknown) {
      alert(getErrorMessage(error, "Cập nhật trạng thái thất bại"));
    }
  };

  const handleToggleFavorite = async (id: string, currentIsFavorite: boolean) => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;

    const nextIsFavorite = !currentIsFavorite;

    try {
      await adminApi.updateProduct(token, id, { isFavorite: nextIsFavorite });

      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isFavorite: nextIsFavorite } : p))
      );

      if (sortBy === "favorite" && nextIsFavorite && page !== 1) {
        setPage(1);
      } else {
        fetchProducts(page);
      }
    } catch (error: unknown) {
      alert(getErrorMessage(error, "Cập nhật sản phẩm yêu thích thất bại"));
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
    } catch (error: unknown) {
      alert(getErrorMessage(error, "Xóa hàng loạt thất bại"));
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
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
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
        {loading && products.length === 0 ? (
          <p>Đang tải danh sách sản phẩm...</p>
        ) : products.length === 0 ? (
          <p>Không tìm thấy sản phẩm nào.</p>
        ) : (
          <>
            <div className={styles.crud__tableWrap} aria-busy={loading}>
              <table className={styles.crud__table}>
              <thead>
                <tr>
                  <th scope="col" style={{ width: "40px", textAlign: "center" }}>
                    <input
                      type="checkbox"
                      checked={products.length > 0 && selectedIds.length === products.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      aria-label="Chọn tất cả sản phẩm trên trang này"
                      style={{ cursor: "pointer" }}
                    />
                  </th>
                  <th
                    scope="col"
                    style={{ width: "88px", textAlign: "center" }}
                    aria-sort={getAriaSort("favorite")}
                  >
                    <button
                      type="button"
                      className={`${styles.crud__sortButton} ${styles["crud__sortButton--centered"]}`}
                      onClick={() => handleSort("favorite")}
                      aria-label="Sắp xếp theo yêu thích"
                    >
                      Yêu thích
                      <span className={styles.crud__sortIndicator} aria-hidden="true">
                        {getSortIndicator("favorite")}
                      </span>
                    </button>
                  </th>
                  <th scope="col">Hình ảnh</th>
                  <th scope="col" aria-sort={getAriaSort("name")}>
                    <button
                      type="button"
                      className={styles.crud__sortButton}
                      onClick={() => handleSort("name")}
                      aria-label="Sắp xếp theo tên sản phẩm"
                    >
                      Tên sản phẩm
                      <span className={styles.crud__sortIndicator} aria-hidden="true">
                        {getSortIndicator("name")}
                      </span>
                    </button>
                  </th>
                  <th scope="col" aria-sort={getAriaSort("brand")}>
                    <button
                      type="button"
                      className={styles.crud__sortButton}
                      onClick={() => handleSort("brand")}
                      aria-label="Sắp xếp theo thương hiệu"
                    >
                      Thương hiệu
                      <span className={styles.crud__sortIndicator} aria-hidden="true">
                        {getSortIndicator("brand")}
                      </span>
                    </button>
                  </th>
                  <th scope="col" aria-sort={getAriaSort("price")}>
                    <button
                      type="button"
                      className={styles.crud__sortButton}
                      onClick={() => handleSort("price")}
                      aria-label="Sắp xếp theo giá tiền"
                    >
                      Giá tiền
                      <span className={styles.crud__sortIndicator} aria-hidden="true">
                        {getSortIndicator("price")}
                      </span>
                    </button>
                  </th>
                  <th scope="col" aria-sort={getAriaSort("platform")}>
                    <button
                      type="button"
                      className={styles.crud__sortButton}
                      onClick={() => handleSort("platform")}
                      aria-label="Sắp xếp theo sàn"
                    >
                      Sàn
                      <span className={styles.crud__sortIndicator} aria-hidden="true">
                        {getSortIndicator("platform")}
                      </span>
                    </button>
                  </th>
                  <th scope="col" aria-sort={getAriaSort("clicks")}>
                    <button
                      type="button"
                      className={styles.crud__sortButton}
                      onClick={() => handleSort("clicks")}
                      aria-label="Sắp xếp theo lượt click"
                    >
                      Lượt click
                      <span className={styles.crud__sortIndicator} aria-hidden="true">
                        {getSortIndicator("clicks")}
                      </span>
                    </button>
                  </th>
                  <th scope="col" aria-sort={getAriaSort("createdAt")}>
                    <button
                      type="button"
                      className={styles.crud__sortButton}
                      onClick={() => handleSort("createdAt")}
                      aria-label="Sắp xếp theo ngày tạo"
                    >
                      Ngày tạo
                      <span className={styles.crud__sortIndicator} aria-hidden="true">
                        {getSortIndicator("createdAt")}
                      </span>
                    </button>
                  </th>
                  <th scope="col" aria-sort={getAriaSort("isActive")}>
                    <button
                      type="button"
                      className={styles.crud__sortButton}
                      onClick={() => handleSort("isActive")}
                      aria-label="Sắp xếp theo trạng thái"
                    >
                      Trạng thái
                      <span className={styles.crud__sortIndicator} aria-hidden="true">
                        {getSortIndicator("isActive")}
                      </span>
                    </button>
                  </th>
                  <th scope="col">Hành động</th>
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
                          aria-label={`Chọn ${prod.name}`}
                          style={{ cursor: "pointer" }}
                        />
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          type="button"
                          onClick={() => handleToggleFavorite(prod.id, prod.isFavorite)}
                          aria-label={prod.isFavorite ? "Bo yeu thich" : "Danh dau yeu thich"}
                          title={prod.isFavorite ? "Bo yeu thich" : "Danh dau yeu thich"}
                          style={{
                            width: "32px",
                            height: "32px",
                            border: prod.isFavorite ? "1px solid #c4956a" : "1px solid #e2d6ca",
                            borderRadius: "6px",
                            backgroundColor: prod.isFavorite ? "#fff7e6" : "#fff",
                            color: prod.isFavorite ? "#c4956a" : "#9b9188",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "18px",
                            lineHeight: 1,
                          }}
                        >
                          {prod.isFavorite ? "★" : "☆"}
                        </button>
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
            </div>

            {loading && (
              <p className={styles.crud__tableStatus} role="status">
                Đang cập nhật thứ tự sản phẩm...
              </p>
            )}

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
