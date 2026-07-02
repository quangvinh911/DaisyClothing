import type { Metadata } from "next";
import { Montserrat, Poppins } from "next/font/google";
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
  title: {
    default: "DaisyDaily | Fashion & Lifestyle Blog",
    template: "%s | DaisyDaily",
  },
  description:
    "Blog thời trang & lifestyle cá nhân. Tips phối đồ, review sản phẩm, và gợi ý mua sắm từ DaisyDaily.",
  keywords: [
    "thời trang",
    "fashion blog",
    "phối đồ",
    "outfit",
    "style",
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
    title: "DaisyDaily | Fashion & Lifestyle Blog",
    description:
      "Blog thời trang & lifestyle cá nhân. Tips phối đồ, review sản phẩm, và gợi ý mua sắm.",
  },
  twitter: {
    card: "summary_large_image",
    title: "DaisyDaily",
    description:
      "Blog thời trang & lifestyle cá nhân. Tips phối đồ, review sản phẩm, và gợi ý mua sắm.",
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
  return (
    <html lang="vi" className={`${montserrat.variable} ${poppins.variable}`}>
      <body>{children}</body>
    </html>
  );
}
