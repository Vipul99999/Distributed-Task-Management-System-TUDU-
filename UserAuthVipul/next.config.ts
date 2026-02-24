import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    middlewarePrefetch: "flexible", // ensures middleware headers aren’t stripped
  },
  async headers() {
    return [
      // Inject headers only for protected routes
      {
        source: "/dashboard/:path*", // match dashboard and nested paths
        headers: [
          { key: "user-id-from-middleware", value: "" },
          { key: "user-role-from-middleware", value: "" },
        ],
      },
    ];
  },
};

export default nextConfig;
