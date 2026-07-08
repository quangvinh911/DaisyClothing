"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../../admin-crud.module.scss";
import { api, adminApi } from "@/lib/api";
import { Category, Product } from "@/types";

export default function AdminNewPostPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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

  // AI Assistant fields
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiUrl, setAiUrl] = useState("");
  const [generating, setGenerating] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);

  // Selection list data
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cats, prods] = await Promise.all([
          api.getCategories().catch(() => []),
          api.getProducts({ limit: "100" }).catch(() => null),
        ]);

        if (cats) setCategories(cats as Category[]);
        if (prods) setProducts((prods as any).data || []);
      } catch (error) {
        console.error("Failed to load options data:", error);
      }
    };

    fetchData();
  }, []);

  // Sync title with slug
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    // Basic slug generation
    setSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
    );
  };

  const handleProductSelect = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
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
      slug: slug || undefined,
      content,
      excerpt: excerpt || undefined,
      featuredImageUrl: featuredImageUrl || undefined,
      metaTitle: metaTitle || undefined,
      metaDescription: metaDescription || undefined,
      status,
      categoryId: categoryId || undefined,
      productIds: selectedProductIds,
    };

    try {
      await adminApi.createPost(token, payload);
      alert("Đã tạo bài viết thành công!");
      router.push("/admin/posts");
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Tạo bài viết thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAi = async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      alert("Bạn cần đăng nhập lại với tư cách Admin!");
      return;
    }

    setGenerating(true);
    try {
      const result = await adminApi.generateAiPost(token, {
        prompt: aiPrompt || undefined,
        url: aiUrl || undefined,
      });

      if (result) {
        setTitle(result.title || "");
        if (result.title) {
          setSlug(
            result.title
              .toLowerCase()
              .replace(/[^a-z0-9\s-]/g, "")
              .replace(/\s+/g, "-")
          );
        }
        setContent(result.content || "");
        setExcerpt(result.excerpt || "");
        setMetaTitle(result.metaTitle || "");
        setMetaDescription(result.metaDescription || "");
        setFeaturedImageUrl(result.featuredImageUrl || "");
        
        alert("Đã tự động điền nội dung bài viết do AI tạo!");
        setShowAiPanel(false);
      }
    } catch (error: any) {
      console.error("AI Generation failed:", error);
      alert(error.message || "Không thể tạo bài viết bằng AI. Vui lòng kiểm tra lại cấu hình API key.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className={styles.crud}>
      <div className={styles.crud__header}>
        <h1 className={styles.crud__title}>Tạo bài viết mới</h1>
        <Link href="/admin/posts" className="btn btn--outline btn--sm">
          Quay lại
        </Link>
      </div>

      {/* AI Assistant Panel */}
      <div className={styles.crud__card} style={{ marginBottom: "1.5rem", border: "1px dashed #c5a880", background: "#fcfaf7" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }} onClick={() => setShowAiPanel(!showAiPanel)}>
          <h2 style={{ fontSize: "16px", color: "#8a6d48", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            ✨ Trợ lý AI viết bài tự động
          </h2>
          <button type="button" className="btn btn--text" style={{ fontSize: "13px", padding: 0 }}>
            {showAiPanel ? "Thu gọn ▲" : "Mở rộng ▼"}
          </button>
        </div>

        {showAiPanel && (
          <div style={{ marginTop: "1rem", borderTop: "1px solid #f1ede3", paddingTop: "1rem" }}>
            <p style={{ fontSize: "13px", color: "#6b6b6b", margin: "0 0 1rem 0" }}>
              Nhập chủ đề bạn muốn viết hoặc dán một đường dẫn bài viết thời trang tham khảo. AI sẽ tự động tạo Tiêu đề, Nội dung HTML, Mô tả ngắn và các trường SEO cho bạn.
            </p>
            <div className={styles.crud__formGroup}>
              <label className={styles.crud__label}>Ý tưởng / Chủ đề bài viết</label>
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className={styles.crud__input}
                placeholder="VD: 5 cách phối đồ nữ cá tính năng động cho mùa hè 2025"
              />
            </div>
            <div className={styles.crud__formGroup}>
              <label className={styles.crud__label}>Đường dẫn tham khảo (Scrape URL - Tuỳ chọn)</label>
              <input
                type="url"
                value={aiUrl}
                onChange={(e) => setAiUrl(e.target.value)}
                className={styles.crud__input}
                placeholder="https://example.com/blogs/cam-nang/bai-viet-thoi-trang"
              />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
              <button
                type="button"
                disabled={generating || (!aiPrompt && !aiUrl)}
                onClick={handleGenerateAi}
                className="btn btn--gold"
                style={{ padding: "8px 16px", fontSize: "14px" }}
              >
                {generating ? "✨ AI đang viết..." : "✨ Tạo nội dung bài viết"}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className={styles.crud__card}>
        <form onSubmit={handleSubmit} className={styles.crud__form}>
          <div className={styles.crud__formGroup}>
            <label className={styles.crud__label}>Tiêu đề bài viết</label>
            <input
              type="text"
              required
              value={title}
              onChange={handleTitleChange}
              className={styles.crud__input}
              placeholder="VD: 5 Cách phối đồ thu đông 2025"
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
                placeholder="vd-duong-dan-tinh"
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
                placeholder="/uploads/sample.jpg hoặc link online"
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
              placeholder="Tóm tắt ngắn hiển thị trên danh sách bài viết..."
            />
          </div>

          {/* HTML editor body */}
          <div className={styles.crud__formGroup}>
            <label className={styles.crud__label}>Nội dung bài viết (Chấp nhận mã HTML)</label>
            <textarea
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={styles.crud__textarea}
              style={{ minHeight: "300px", fontFamily: "monospace" }}
              placeholder="Nhập nội dung bài viết. Bạn có thể sử dụng các thẻ HTML như <h2>, <p>, <strong>, <img> để định dạng..."
            />
          </div>

          {/* SEO Meta Fields */}
          <div className={styles.crud__formRow}>
            <div className={styles.crud__formGroup}>
              <label className={styles.crud__label}>SEO Meta Title</label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                className={styles.crud__input}
                placeholder="Mặc định sử dụng tiêu đề bài viết"
              />
            </div>

            <div className={styles.crud__formGroup}>
              <label className={styles.crud__label}>SEO Meta Description</label>
              <input
                type="text"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                className={styles.crud__input}
                placeholder="Mặc định sử dụng mô tả ngắn"
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
              {loading ? "Đang lưu..." : "Tạo bài viết"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
