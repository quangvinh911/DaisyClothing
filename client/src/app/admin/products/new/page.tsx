"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../../admin-crud.module.scss";
import { api, adminApi } from "@/lib/api";
import { Category } from "@/types";

export default function AdminNewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [brand, setBrand] = useState("");
  const [price, setPrice] = useState("");
  const [platform, setPlatform] = useState("SHOPEE");
  const [affiliateUrl, setAffiliateUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [tiktokVideoUrl, setTiktokVideoUrl] = useState("");

  // Categories list
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.getCategories();
        if (res) setCategories(res as Category[]);
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    };
    fetchCats();
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    setSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("admin_token");
    if (!token) return;

    const payload = {
      name,
      slug: slug || undefined,
      brand: brand || undefined,
      price: price ? parseFloat(price) : undefined,
      platform,
      affiliateUrl,
      imageUrl: imageUrl || undefined,
      tiktokVideoUrl: tiktokVideoUrl || undefined,
      description: description || undefined,
      categoryId: categoryId || undefined,
      isActive,
    };

    try {
      await adminApi.createProduct(token, payload);
      alert("Đã tạo sản phẩm thành công!");
      router.push("/admin/products");
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Tạo sản phẩm thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.crud}>
      <div className={styles.crud__header}>
        <h1 className={styles.crud__title}>Thêm sản phẩm mới</h1>
        <Link href="/admin/products" className="btn btn--outline btn--sm">
          Quay lại
        </Link>
      </div>

      <div className={styles.crud__card}>
        <form onSubmit={handleSubmit} className={styles.crud__form}>
          <div className={styles.crud__formGroup}>
            <label className={styles.crud__label}>Tên sản phẩm</label>
            <input
              type="text"
              required
              value={name}
              onChange={handleNameChange}
              className={styles.crud__input}
              placeholder="VD: Đầm midi hoa nhí tay bồng"
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
              <label className={styles.crud__label}>Thương hiệu (Brand)</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className={styles.crud__input}
                placeholder="VD: Zara, Uniqlo, Local Brand..."
              />
            </div>

            <div className={styles.crud__formGroup}>
              <label className={styles.crud__label}>Giá bán (VND)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={styles.crud__input}
                placeholder="VD: 350000"
              />
            </div>
          </div>

          <div className={styles.crud__formRow}>
            <div className={styles.crud__formGroup}>
              <label className={styles.crud__label}>Sàn liên kết (Platform)</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className={styles.crud__select}
              >
                <option value="SHOPEE">Shopee</option>
                <option value="TIKTOK">TikTok Shop</option>
                <option value="LAZADA">Lazada</option>
                <option value="AMAZON">Amazon</option>
                <option value="OTHER">Khác</option>
              </select>
            </div>

            <div className={styles.crud__formGroup}>
              <label className={styles.crud__label}>Trạng thái hoạt động</label>
              <select
                value={isActive ? "true" : "false"}
                onChange={(e) => setIsActive(e.target.value === "true")}
                className={styles.crud__select}
              >
                <option value="true">Hiển thị (Hoạt động)</option>
                <option value="false">Ẩn (Tạm ngưng)</option>
              </select>
            </div>
          </div>

          <div className={styles.crud__formGroup}>
            <label className={styles.crud__label}>Link Affiliate (Mua hàng)</label>
            <input
              type="url"
              required
              value={affiliateUrl}
              onChange={(e) => setAffiliateUrl(e.target.value)}
              className={styles.crud__input}
              placeholder="https://shopee.vn/... hoặc https://tiktok.com/..."
            />
          </div>

          <div className={styles.crud__formGroup}>
            <label className={styles.crud__label}>URL Hình ảnh sản phẩm</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className={styles.crud__input}
              placeholder="/uploads/sample-product.jpg hoặc link online"
            />
          </div>

          <div className={styles.crud__formGroup}>
            <label className={styles.crud__label}>Link TikTok Video (tùy chọn)</label>
            <input
              type="url"
              value={tiktokVideoUrl}
              onChange={(e) => setTiktokVideoUrl(e.target.value)}
              className={styles.crud__input}
              placeholder="VD: https://www.tiktok.com/@username/video/1234567890 hoặc link rút gọn"
            />
          </div>

          <div className={styles.crud__formGroup}>
            <label className={styles.crud__label}>Mô tả sản phẩm</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={styles.crud__textarea}
              placeholder="Giới thiệu đôi nét về chất liệu, form dáng hoặc lý do bạn khuyên mua..."
            />
          </div>

          <div className={styles.crud__formActions}>
            <button
              type="submit"
              disabled={loading}
              className="btn btn--gold btn--lg"
            >
              {loading ? "Đang lưu..." : "Thêm sản phẩm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
