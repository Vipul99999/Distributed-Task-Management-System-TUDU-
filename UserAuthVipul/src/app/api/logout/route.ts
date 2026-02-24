import { NextRequest, NextResponse } from "next/server";
import { destroyUserSession } from "@/lib/authTokens";
import { env } from "@/lib/env-server";

function getCorsHeaders(origin: string) {
  const allowedOrigin =
    origin === env.NEXT_PUBLIC_TUDU_APP_FRONTEND_URL
      ? origin
      : "";
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Credentials": "true",
  };
}

// Preflight handler
export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin") ?? "";
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(origin) });
}

// Logout handler
export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin") ?? "";
  const headers = getCorsHeaders(origin);

  try {
    // 1️⃣ Get refresh token from cookie
    const refreshToken = req.cookies.get("refresh_token")?.value;

    if (!refreshToken) {
      console.warn("[API Logout] ❌ No refresh token cookie found");
      const res = NextResponse.json(
        { success: false, message: "Missing refresh token. Please log in." },
        { status: 401, headers }
      );
      // Always clear cookie
      res.cookies.set("refresh_token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        path: "/",
        maxAge: 0,
      });
      return res;
    }

    console.log("[API Logout] Refresh token:", refreshToken);

    // 2️⃣ Destroy session in DB
    const destroyed = await destroyUserSession(refreshToken);

    // Optional: log suspicious activity
    if (!destroyed) {
      console.warn("[API Logout] Attempt to logout with invalid/missing token");
    }

    // 3️⃣ Always clear refresh token cookie
    const res = NextResponse.json(
      {
        success: destroyed,
        message: destroyed
          ? "Session destroyed successfully."
          : "Session not found or expired. Please log in again.",
      },
      { status: destroyed ? 200 : 401, headers }
    );

    res.cookies.set("refresh_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      path: "/",
      maxAge: 0,
    });

    console.log(
      destroyed
        ? "[API Logout] ✅ Session destroyed and cookie cleared"
        : "[API Logout] Missing token → user must login again"
    );

    return res;
  } catch (err) {
    console.error("[API Logout] Unexpected error:", err);
   return NextResponse.redirect(new URL("/signin", req.url));
  }
}
