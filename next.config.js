/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Necesario para Docker
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: process.env.NEXT_PUBLIC_API_BASE_URL
          ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/:path*`
          : "http://localhost:5000/:path*",
      },
    ];
  },
};

module.exports = nextConfig;


