// src/app/api/_cors.ts
import { NextResponse } from "next/server";
import { env } from "@/lib/env-server";

// Returns proper CORS headers for a given origin
function getCorsHeaders(origin: string | null) {
  const allowedOrigin =
    origin === env.NEXT_PUBLIC_TUDU_APP_FRONTEND_URL
      ? origin
      : "";;
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
     "Access-Control-Max-Age": "86400", // cache preflight for 1 day
  };
}

// Middleware function to handle CORS
export function handleCors(req: Request) {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  // OPTIONS preflight request
  if (req.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // For other requests, return NextResponse with CORS headers
  const res = NextResponse.next();
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.headers.set(key, value);
  });
  return res;
}
