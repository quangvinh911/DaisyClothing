"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../../admin-crud.module.scss";
import { api, adminApi } from "@/lib/api";
import { Category, Product } from "@/types";

interface EditProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function AdminEditProductPage({ params }: EditProductPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

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
    const loadAllData = async () => {
      const token = localStorage.getItem("admin_token");
      if (!token) return;

      try {
        const [cats, prodRes] = await Promise.all([
          api.getCategories().catch(() => []),
          adminApi.getProducts(token, { id }).catch(() => null), // Hack to find specific, or we can use generic details if we have it
        ]);

        if (cats) setCategories(cats as Category[]);

        // Wait! The adminApi returns a list, let's find the product details.
        // Let's call the single endpoint if it exists, or retrieve from search list.
        // Wait, did we define getProductById? Let's check api.ts: we only have general list.
        // Wait, list endpoint with search params of id or we can fetch the active product by slug.
        // Wait, let's find if the getProducts endpoint can filter by id, or if we can fetch all and find,
        // or we can call `/products/${id}` on the server.
        // Let's check `client/src/lib/api.ts` to see what is defined for products:
        // Wait, we have: `deleteProduct`, `updateProduct`, `createProduct`, `getProducts`.
        // Let's call general `getProducts` and find by id!
        const prodsList = await adminApi.getProducts(token, { limit: "100" });
        const product = (prodsList as any).data?.find((p: any) => p.id === id);

        if (product) {
          setName(product.name);
          setSlug(product.slug);
          setBrand(product.brand || "");
          setPrice(product.price ? product.price.toString() : "");
          setPlatform(product.platform);
          setAffiliateUrl(product.affiliateUrl);
          setImageUrl(product.imageUrl || "");
          setTiktokVideoUrl(product.tiktokVideoUrl || "");
          setDescription(product.description || "");
          setCategoryId(product.categoryId || "");
          setIsActive(product.isActive);
        } else {
          alert("Không tìm thấy sản phẩm");
          router.push("/admin/products");
        }
      } catch (error) {
        console.error("Failed to load product details:", error);
      } finally {
        setFetching(false);
      }
    };

    loadAllData();
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("admin_token");
    if (!token) return;

    const payload = {
      name,
      slug,
      brand: brand || null,
      price: price ? parseFloat(price) : null,
      platform,
      affiliateUrl,
      imageUrl: imageUrl || null,
      tiktokVideoUrl: tiktokVideoUrl || null,
      description: description || null,
      categoryId: categoryId || null,
      isActive,
    };

    try {
      await adminApi.updateProduct(token, id, payload);
      alert("Đã cập nhật sản phẩm thành công!");
      router.push("/admin/products");
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Cập nhật sản phẩm thất bại");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <p>Đang tải thông tin sản phẩm...</p>;
  }

  return (
    <div className={styles.crud}>
      <div className={styles.crud__header}>
        <h1 className={styles.crud__title}>Chỉnh sửa sản phẩm</h1>
        <Link href="/admin/products" className="btn btn--outline btn--sm">
          Quay lại
        </Link>
      </div>

      <div className={styles.crud__card}>
        <form onSubmit={handleSubmit} className={styles.crud__form}>
          <div className={styles.crud__formGroup}>
            <label className={styles.crud__label}>ID sản phẩm (Database ID)</label>
            <input
              type="text"
              readOnly
              value={id}
              className={styles.crud__input}
              style={{ backgroundColor: "#f5f5f5", cursor: "not-allowed", color: "#666" }}
            />
          </div>

          <div className={styles.crud__formGroup}>
            <label className={styles.crud__label}>Tên sản phẩm</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
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
              <label className={styles.crud__label}>Thương hiệu (Brand)</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className={styles.crud__input}
              />
            </div>

            <div className={styles.crud__formGroup}>
              <label className={styles.crud__label}>Giá bán (VND)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={styles.crud__input}
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
            />
          </div>

          <div className={styles.crud__formGroup}>
            <label className={styles.crud__label}>URL Hình ảnh sản phẩm</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className={styles.crud__input}
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
            />
          </div>

          <div className={styles.crud__formActions}>
            <button
              type="submit"
              disabled={loading}
              className="btn btn--gold btn--lg"
            >
              {loading ? "Đang lưu..." : "Cập nhật sản phẩm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
