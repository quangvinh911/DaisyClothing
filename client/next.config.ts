import type { NextConfig } from "next";
import { resolve } from "path";

const nextConfig: NextConfig = {
  sassOptions: {
    includePaths: [resolve(__dirname, "src/scss")],
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },

  // API proxy to NestJS backend
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:3000/api/:path*",
      },
      {
        source: "/uploads/:path*",
        destination: "http://localhost:3000/uploads/:path*",
      },
    ];
  },
};

export default nextConfig;
