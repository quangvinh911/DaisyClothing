"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "../admin-crud.module.scss";
import { adminApi } from "@/lib/api";
import { Post, PaginatedResponse } from "@/types";

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);

  const fetchPosts = async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;

    setLoading(true);
    try {
      const queryParams: Record<string, string> = {
        page: page.toString(),
        limit: "10",
      };
      if (search) queryParams.search = search;
      if (status) queryParams.status = status;

      const res = await adminApi.getPosts(token, queryParams);
      if (res) {
        const paginated = res as PaginatedResponse<Post>;
        setPosts(paginated.data);
        setMeta(paginated.meta);
      }
    } catch (error) {
      console.error("Failed to fetch admin posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [page, status]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPosts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) return;

    const token = localStorage.getItem("admin_token");
    if (!token) return;

    try {
      await adminApi.deletePost(token, id);
      alert("Đã xóa bài viết thành công!");
      fetchPosts();
    } catch (error: any) {
      alert(error.message || "Xóa bài viết thất bại");
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateStr));
  };

  const getStatusBadgeClass = (s: string) => {
    switch (s) {
      case "PUBLISHED":
        return styles["crud__statusBadge--published"];
      case "DRAFT":
        return styles["crud__statusBadge--draft"];
      case "ARCHIVED":
        return styles["crud__statusBadge--archived"];
      default:
        return "";
    }
  };

  return (
    <div className={styles.crud}>
      <div className={styles.crud__header}>
        <h1 className={styles.crud__title}>Danh sách bài viết</h1>
        <Link href="/admin/posts/new" className="btn btn--gold btn--sm">
          ➕ Viết bài mới
        </Link>
      </div>

      <div className={styles.crud__card}>
        {/* Filters */}
        <div className={styles.crud__filters}>
          <form onSubmit={handleSearchSubmit} className={styles.crud__filters}>
            <input
              type="text"
              placeholder="Tìm theo tiêu đề..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.crud__searchInput}
            />
            <button type="submit" className="btn btn--gold btn--sm">
              Tìm
            </button>
          </form>

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className={styles.crud__select}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PUBLISHED">Đã xuất bản</option>
            <option value="DRAFT">Bản nháp</option>
            <option value="ARCHIVED">Lưu trữ</option>
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <p>Đang tải danh sách bài viết...</p>
        ) : posts.length === 0 ? (
          <p>Không tìm thấy bài viết nào.</p>
        ) : (
          <>
            <table className={styles.crud__table}>
              <thead>
                <tr>
                  <th>Tiêu đề</th>
                  <th>Chuyên mục</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo/Xuất bản</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id}>
                    <td style={{ fontWeight: 500, maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {post.title}
                    </td>
                    <td>{post.category?.name || "Chưa phân loại"}</td>
                    <td>
                      <span className={`${styles.crud__statusBadge} ${getStatusBadgeClass(post.status)}`}>
                        {post.status === "PUBLISHED"
                          ? "Đã xuất bản"
                          : post.status === "DRAFT"
                            ? "Bản nháp"
                            : "Lưu trữ"}
                      </span>
                    </td>
                    <td>
                      {post.status === "PUBLISHED"
                        ? formatDate(post.publishedAt)
                        : formatDate(post.createdAt)}
                    </td>
                    <td>
                      <Link href={`/admin/posts/${post.id}`}>
                        <button className={styles.crud__btnEdit}>Sửa</button>
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className={styles.crud__btnDelete}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
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
