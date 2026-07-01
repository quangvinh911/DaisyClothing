"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../../admin-crud.module.scss";
import { api, adminApi } from "@/lib/api";
import { Category, Product, Post } from "@/types";

interface EditPostPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function AdminEditPostPage({ params }: EditPostPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Form fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [featuredImageUrl, setFeaturedImageUrl] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [categoryId, setCategoryId] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // Selection options
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const loadAllData = async () => {
      const token = localStorage.getItem("admin_token");
      if (!token) return;

      try {
        const [cats, prods, postRes] = await Promise.all([
          api.getCategories().catch(() => []),
          api.getProducts({ limit: "100" }).catch(() => null),
          adminApi.getPostById(token, id).catch(() => null),
        ]);

        if (cats) setCategories(cats as Category[]);
        if (prods) setProducts((prods as any).data || []);

        if (postRes) {
          const post = postRes as Post;
          setTitle(post.title);
          setSlug(post.slug);
          setContent(post.content);
          setExcerpt(post.excerpt || "");
          setFeaturedImageUrl(post.featuredImageUrl || "");
          setMetaTitle(post.metaTitle || "");
          setMetaDescription(post.metaDescription || "");
          setStatus(post.status);
          setCategoryId(post.categoryId || "");

          if (post.products) {
            setSelectedProductIds(post.products.map(({ product }) => product.id));
          }
        } else {
          alert("Không tìm thấy bài viết");
          router.push("/admin/posts");
        }
      } catch (error) {
        console.error("Failed to load edit post data:", error);
      } finally {
        setFetching(false);
      }
    };

    loadAllData();
  }, [id, router]);

  const handleProductSelect = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((pid) => pid !== productId)
        : [...prev, productId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("admin_token");
    if (!token) return;

    const payload = {
      title,
      slug,
      content,
      excerpt: excerpt || null,
      featuredImageUrl: featuredImageUrl || null,
      metaTitle: metaTitle || null,
      metaDescription: metaDescription || null,
      status,
      categoryId: categoryId || null,
      productIds: selectedProductIds,
    };

    try {
      await adminApi.updatePost(token, id, payload);
      alert("Đã cập nhật bài viết thành công!");
      router.push("/admin/posts");
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Cập nhật bài viết thất bại");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <p>Đang tải thông tin bài viết...</p>;
  }

  return (
    <div className={styles.crud}>
      <div className={styles.crud__header}>
        <h1 className={styles.crud__title}>Chỉnh sửa bài viết</h1>
        <Link href="/admin/posts" className="btn btn--outline btn--sm">
          Quay lại
        </Link>
      </div>

      <div className={styles.crud__card}>
        <form onSubmit={handleSubmit} className={styles.crud__form}>
          <div className={styles.crud__formGroup}>
            <label className={styles.crud__label}>Tiêu đề bài viết</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={styles.crud__input}
            />
          </div>

          <div className={styles.crud__formRow}>
            <div className={styles.crud__formGroup}>
              <label className={styles.crud__label}>Slug (Đường dẫn tĩnh)</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className={styles.crud__input}
              />
            </div>

            <div className={styles.crud__formGroup}>
              <label className={styles.crud__label}>Danh mục</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className={styles.crud__select}
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.crud__formRow}>
            <div className={styles.crud__formGroup}>
              <label className={styles.crud__label}>URL Ảnh nổi bật</label>
              <input
                type="text"
                value={featuredImageUrl}
                onChange={(e) => setFeaturedImageUrl(e.target.value)}
                className={styles.crud__input}
              />
            </div>

            <div className={styles.crud__formGroup}>
              <label className={styles.crud__label}>Trạng thái</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={styles.crud__select}
              >
                <option value="DRAFT">Bản nháp (Draft)</option>
                <option value="PUBLISHED">Công khai (Published)</option>
                <option value="ARCHIVED">Lưu trữ (Archived)</option>
              </select>
            </div>
          </div>

          <div className={styles.crud__formGroup}>
            <label className={styles.crud__label}>Mô tả ngắn (Excerpt)</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className={styles.crud__textarea}
            />
          </div>

          <div className={styles.crud__formGroup}>
            <label className={styles.crud__label}>Nội dung bài viết (Chấp nhận mã HTML)</label>
            <textarea
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={styles.crud__textarea}
              style={{ minHeight: "300px", fontFamily: "monospace" }}
            />
          </div>

          <div className={styles.crud__formRow}>
            <div className={styles.crud__formGroup}>
              <label className={styles.crud__label}>SEO Meta Title</label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                className={styles.crud__input}
              />
            </div>

            <div className={styles.crud__formGroup}>
              <label className={styles.crud__label}>SEO Meta Description</label>
              <input
                type="text"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                className={styles.crud__input}
              />
            </div>
          </div>

          {/* Product Attachments ("Shop My Look") */}
          <div className={styles.crud__formGroup} style={{ borderTop: "1px solid #f1ede3", paddingTop: "20px" }}>
            <label className={styles.crud__label} style={{ marginBottom: "10px" }}>
              Liên kết sản phẩm (Shop My Look)
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "10px",
                maxHeight: "200px",
                overflowY: "auto",
                border: "1px solid #e8d5c4",
                padding: "10px",
                borderRadius: "4px",
              }}
            >
              {products.map((prod) => (
                <label
                  key={prod.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedProductIds.includes(prod.id)}
                    onChange={() => handleProductSelect(prod.id)}
                  />
                  <span>{prod.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.crud__formActions}>
            <button
              type="submit"
              disabled={loading}
              className="btn btn--gold btn--lg"
            >
              {loading ? "Đang lưu..." : "Cập nhật bài viết"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
