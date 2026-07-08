"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import styles from "./SortSelect.module.scss";

export default function SortSelect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const sortBy = searchParams.get("sortBy") || "latest";

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", e.target.value);
    params.delete("page"); // Reset page when sorting changes
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className={styles.sortSelectWrapper}>
      <span className={styles.sortSelectLabel}>Sắp xếp:</span>
      <select
        value={sortBy}
        onChange={handleChange}
        className={styles.sortSelect}
      >
        <option value="latest">Mới nhất</option>
        <option value="best_seller">Bán chạy nhất</option>
        <option value="price_asc">Giá: Thấp đến Cao</option>
        <option value="price_desc">Giá: Cao đến Thấp</option>
      </select>
    </div>
  );
}
