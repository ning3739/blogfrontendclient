import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
    // 在开发环境中禁用图片优化，避免私有 IP 限制
    // ...(process.env.NODE_ENV === "development" && {
    //   unoptimized: true,
    // }),
  },
};

export default withNextIntl(nextConfig);
