import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/admin",
  trailingSlash: true,
  async rewrites() {
    const origin = "http://103.236.194.68:3003";
    return [
      {
        source: "/upload/:path*",
        destination: `${origin}/upload/:path*`,
      },
      {
        source: "/api-proxy/:path*",
        destination: `${origin}/:path*`,
      },
    ];
  },
};

export default nextConfig;
