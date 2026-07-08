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

export const metadata: Metadata = {
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.GA_TRACKING_ID;

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
      </body>
    </html>
  );
}
