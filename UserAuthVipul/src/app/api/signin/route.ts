// /app/api/signin/route.ts
import { NextRequest, NextResponse } from "next/server";
import localSigninServerAction from "@/actions/auth/local_signin";

export async function POST(req: NextRequest) {
  console.log("[API /signin] POST request received");

  const rawData = await req.json();
  console.log("[API /signin] Request body:", rawData);

  const result = await localSigninServerAction(rawData);
  console.log("[API /signin] Result:", result);

  const response = NextResponse.json({
    success: result.success,
    accessToken: result.accessToken,
    redirectTo: result.redirectTo,
  });

  if (result.success && result.refreshToken) {
    console.log("[API /signin] Setting refresh_token cookie:", result.refreshToken);

    // 🧹 Remove any existing cookie first
    response.cookies.delete("refresh_token");

    // 🆕 Set new refresh token cookie
    response.cookies.set("refresh_token", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",   // required for cross-origin
      path: "/",          // must match previous cookie
      maxAge: 60 * 60 * 12, // 12h
      //  domain: process.env.COOKIE_DOMAIN || "localhost", in prod microservices
    });
  }
  // 🔎 Fetch cookie back from response to confirm
    const checkCookie = response.cookies.get("refresh_token");
    if (checkCookie) {
      console.log(
        "[API Signin] 🔍 Refresh token stored in response cookies:",
        checkCookie
      );
    } else {
      console.warn("[API Signin] ⚠️ Refresh token NOT found in response cookies!");
    }

    console.log("[API Signin] ✅ Refresh token cookie set for multi-service access");


  return response;
}
