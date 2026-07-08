import type { Metadata } from "next";
import { Montserrat, Poppins } from "next/font/google";
import Script from "next/script";
import "./globals.scss";

const montserrat = Montserrat({
  subsets: ["vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-heading",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-body",
  display: "swap",
});

import { api } from "@/lib/api";
import { SiteSetting } from "@/types";

export async function generateMetadata(): Promise<Metadata> {
  let googleVerification = "";
  try {
    const settings = (await api.getSettings().catch(() => [])) as SiteSetting[];
    googleVerification = settings.find((s) => s.key === "google_site_verification")?.value || "";
  } catch (e) {
    // Ignore
  }

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://daisydaily.shop"),
    alternates: {
      canonical: "/",
    },
    title: {
      default: "DaisyDaily | Blog Thời Trang, Tips Phối Đồ & Lifestyle",
      template: "%s | DaisyDaily",
    },
    description:
      "Blog thời trang & lifestyle cá nhân chia sẻ phong cách thời trang hàng ngày, tips phối đồ nữ đẹp, review quần áo xu hướng và gợi ý mua sắm cực chất từ DaisyDaily.",
    keywords: [
      "thời trang nữ",
      "blog thời trang",
      "phối đồ nữ",
      "tips phối đồ",
      "xu hướng thời trang",
      "phối đồ đẹp",
      "review quần áo",
      "ootd",
      "style thời trang",
      "DaisyDaily",
      "mua sắm",
      "affiliate",
      "TikTok",
      "Shopee",
    ],
    authors: [{ name: "DaisyDaily" }],
    openGraph: {
      type: "website",
      locale: "vi_VN",
      siteName: "DaisyDaily",
      title: "DaisyDaily | Blog Thời Trang, Tips Phối Đồ & Lifestyle",
      description:
        "Blog thời trang & lifestyle cá nhân chia sẻ phong cách thời trang hàng ngày, tips phối đồ nữ đẹp, review quần áo xu hướng và gợi ý mua sắm cực chất.",
      images: [
        {
          url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&h=630&fit=crop",
          width: 1200,
          height: 630,
          alt: "DaisyDaily | Blog Thời Trang, Tips Phối Đồ & Lifestyle",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "DaisyDaily | Blog Thời Trang, Tips Phối Đồ & Lifestyle",
      description:
        "Blog thời trang & lifestyle cá nhân chia sẻ phong cách thời trang hàng ngày, tips phối đồ nữ đẹp, review quần áo xu hướng và gợi ý mua sắm cực chất.",
      images: ["https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&h=630&fit=crop"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    icons: {
      icon: "/icon.svg?v=2",
      shortcut: "/icon.svg?v=2",
      apple: "/icon.svg?v=2",
    },
    verification: {
      google: googleVerification,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let gaId = "";
  try {
    const settings = (await api.getSettings().catch(() => [])) as SiteSetting[];
    gaId = settings.find((s) => s.key === "ga_tracking_id")?.value || "";
  } catch (e) {
    // Ignore
  }

  return (
    <html lang="vi" className={`${montserrat.variable} ${poppins.variable}`}>
      <body>
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
        {children}
        {/* Organization JSON-LD — site-wide structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "DaisyDaily",
              "url": "https://daisydaily.shop",
              "logo": "https://daisydaily.shop/icon.svg",
              "description": "Blog th\u1eddi trang & lifestyle c\u00e1 nh\u00e2n — chia s\u1ebb phong c\u00e1ch, tips ph\u1ed1i \u0111\u1ed3 v\u00e0 g\u1ee3i \u00fd mua s\u1eafm m\u1ed7i ng\u00e0y",
              "sameAs": [
                "https://www.tiktok.com/@em.xinh0905"
              ],
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service",
                "url": "https://daisydaily.shop/about"
              }
            }),
          }}
        />
      </body>
    </html>
  );
}
