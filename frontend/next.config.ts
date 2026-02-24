import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true, // helps detect unsafe lifecycles
  // swcMinify: true,       // faster minification
  compiler: {
    styledComponents: true, // if using styled-components
  },

  // ---------------- CORS / Proxy Rewrites ----------------
  // async rewrites() {
  //   return [
  //     {
  //       source: "/api/auth/:path*",              
  //       destination: "http://localhost:3000/api/:path*", // auth microservice
  //     },
  //     {
  //       source: "/api/tasks/:path*",          
  //       destination: "http://localhost:3002/api/:path*", // tasks microservice
  //     },
  //   ];
  // },

  // ---------------- Security Headers ----------------
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "no-referrer-when-downgrade" },
          {
  key: "Content-Security-Policy",
  value: [
    "default-src 'self';",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline';", // allow eval + inline scripts in dev
    "connect-src 'self' http://localhost:3000 http://localhost:3001 http://localhost:3002 ws://localhost:3001 ws://localhost:3002;", // APIs + WebSockets
    "style-src 'self' 'unsafe-inline';", // inline styles (Tailwind)
    "font-src 'self' data: blob:;", // Geist fonts
    "img-src 'self' data: blob:;",
    "object-src 'none';",
  ].join(" "),
}
,
        ],
      },
    ];
  },

  // // ---------------- Image Optimization ----------------
  images: {
    domains: ["localhost", "your-cdn.com"], // add backend / CDN domains
  },

  // // ---------------- Runtime Config (Optional) ----------------
  // publicRuntimeConfig: {
  //   apiBaseUrl: process.env.NEXT_PUBLIC_APP_API_URL,
  //   authUrl: process.env.NEXT_PUBLIC_AUTH_SERVICE_URL,
  // },

  // // ---------------- Experimental Features (Optional) ----------------
  // experimental: {
  //   scrollRestoration: true,
  //   runtime: "nodejs", // ensures SSR runs on Node.js environment
  // },
};

export default nextConfig;
