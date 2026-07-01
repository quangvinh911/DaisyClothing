import styles from "./about.module.scss";
import { api } from "@/lib/api";
import { SiteSetting, SocialLink } from "@/types";

export default async function AboutPage() {
  let settings: SiteSetting[] = [];
  let socialLinks: SocialLink[] = [];

  try {
    const [settingsRes, socialLinksRes] = await Promise.all([
      api.getSettings().catch(() => []),
      api.getSocialLinks().catch(() => []),
    ]);

    settings = (settingsRes as SiteSetting[]) || [];
    socialLinks = (socialLinksRes as SocialLink[]) || [];
  } catch (error) {
    console.error("Failed to fetch about page settings:", error);
  }

  // Helper to get site settings values
  const getSettingValue = (key: string, fallback: string) => {
    const item = settings.find((s) => s.key === key);
    return item ? item.value : fallback;
  };

  const siteName = getSettingValue("site_name", "DaisyDaily");
  const siteTagline = getSettingValue("site_tagline", "Everyday Style, Everyday Beautiful");
  const aboutIntro = getSettingValue(
    "about_intro",
    "Xin chào! Mình là DaisyDaily 🌸 Mình là một người yêu thời trang và muốn chia sẻ phong cách hàng ngày của mình với mọi người."
  );
  const contactEmail = getSettingValue("contact_email", "hello@daisydaily.com");

  return (
    <div className={styles.aboutPage}>
      <div className="container">
        <div className={styles.aboutPage__grid}>
          {/* Avatar / Image */}
          <div className={styles.aboutPage__imageContainer}>
            <div className={styles.aboutPage__avatarPlaceholder}>
              DaisyDaily
            </div>
          </div>

          {/* Description */}
          <div className={styles.aboutPage__content}>
            <span className={styles.aboutPage__tagline}>{siteTagline}</span>
            <h1 className={styles.aboutPage__title}>Về {siteName}</h1>
            <div className={styles.aboutPage__text}>
              <p>{aboutIntro}</p>
              <p>
                Trang web này được lập ra để lưu giữ và chia sẻ những outfits hàng ngày, các mẹo phối đồ hữu ích
                cũng như những sản phẩm chất lượng tốt mà mình tin dùng. Mong rằng các chia sẻ của mình sẽ giúp ích
                cho bạn trong việc định hình phong cách cá nhân và trở nên tự tin hơn mỗi ngày.
              </p>
              <p>
                Nếu bạn muốn liên hệ hợp tác hoặc có bất kỳ câu hỏi nào, vui lòng gửi email về địa chỉ:{" "}
                <strong>{contactEmail}</strong>.
              </p>
            </div>

            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div className={styles.aboutPage__socials}>
                {socialLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.aboutPage__socialBtn}
                  >
                    {link.platform}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
