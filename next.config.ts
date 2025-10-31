import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
    return [
      {
        source: "/api/:path*",
        destination: `${base}/:path*`,
      },
    ];
  },
};

export default nextConfig;
