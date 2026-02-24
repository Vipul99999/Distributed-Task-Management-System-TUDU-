"use server";

import { NextRequest, NextResponse } from "next/server";
import { refreshAccessToken } from "@/lib/authTokens";
import { env } from "@/lib/env-server";
// Utility to generate CORS headers

function getCorsHeaders(origin: string) {
  const allowedOrigin =
    origin === env.NEXT_PUBLIC_TUDU_APP_FRONTEND_URL
      ? origin
      : "";
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400", // cache preflight for 1 day
  };
}

// OPTIONS preflight handler
export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin") ?? "";
  console.log("[Refresh Token] OPTIONS preflight from origin:", origin);
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}

// POST handler to refresh access token
export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin") ?? "";
  const headers = getCorsHeaders(origin);

  try {
    // 1️⃣ Get refresh token from HttpOnly cookie (preferred)
    const refreshTokenFromCookie = req.cookies.get("refresh_token")?.value;

    // 2️⃣ Optional fallback from request body (server-to-server)
    const body: { refreshToken?: string } = await req.json().catch(() => ({}));
    const refreshToken = refreshTokenFromCookie || body.refreshToken;

    if (!refreshToken) {
      console.warn("[Refresh Token] ❌ No refresh token provided");
      return NextResponse.json(
        {
          success: false,
          code: "MISSING_REFRESH_TOKEN",
          message: "Missing refresh token",
        },
        { status: 401, headers },
      );
    }

    console.log(
      "[Refresh Token] Received refresh token (not logged for security)",
    );

    // 3️⃣ Call auth lib to refresh token
    const result = await refreshAccessToken(refreshToken);

    if (!result?.accessToken) {
      console.warn("[Refresh Token] ❌ Invalid or expired refresh token");
      return NextResponse.json(
        {
          success: false,
          code: "INVALID_REFRESH_TOKEN",
          message: "Invalid or expired refresh token",
        },
        { status: 401, headers },
      );
    }

    // 4️⃣ Build successful response with new access token
    const res = NextResponse.json(
      { success: true, accessToken: result.accessToken },
      { headers },
    );

    // 5️⃣ Set rotated refresh token in secure HttpOnly cookie (if rotated)
    if (result.refreshToken && result.expiresAt) {
      const isProd = process.env.NODE_ENV === "production";

      // Calculate remaining TTL from DB expiry
      const now = new Date().getTime();
      const dbTokenExpiry = result.expiresAt.getTime(); // you must return expires_at from your refreshAccessToken function
      let maxAge = Math.floor((dbTokenExpiry - now) / 1000); // in seconds
      // Ensure maxAge is not negative
      if (maxAge <= 0) maxAge = 1;

      res.cookies.set("refresh_token", result.refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: "none", // allow cross-origin requests if needed
        path: "/", // available for all routes
        maxAge, // matches DB expiry
      });
      console.log("[Refresh Token] 🔄 Rotated refresh token cookie set");
    }

    console.log("[Refresh Token] ✅ Access token refreshed successfully");
    return res;
  } catch (err) {
    console.error("[Refresh Token] ❌ Unexpected error:", err);
    return NextResponse.json(
      {
        success: false,
        code: "INTERNAL_ERROR",
        message: "Internal server error",
      },
      { status: 500, headers },
    );
  }
}
