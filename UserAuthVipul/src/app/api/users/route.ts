"use server";

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyAccessToken } from "@/lib/authTokens";
import { z } from "zod";
import { env } from "@/lib/env-server";
// -------------------- Allowed Frontend Origins --------------------


function getCorsHeaders(origin: string) {
 const allowedOrigin =
    origin === env.NEXT_PUBLIC_TUDU_APP_FRONTEND_URL
      ? origin
      : "";
  return {
    ...(allowedOrigin && { "Access-Control-Allow-Origin": allowedOrigin }),
    "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400", // 1 day cache for preflight
  };
}

// -------------------- Zod schema for PUT update --------------------
const updateUserSchema = z.object({
  name: z.string().min(1, "Name cannot be empty"),
});

// -------------------- Helper: Verify token --------------------
async function getVerifiedUser(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.split(" ")[1];
  const decoded = await verifyAccessToken(token);
  return decoded;
}

// -------------------- OPTIONS handler --------------------
export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin") ?? "";
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(origin) });
}

// -------------------- GET user --------------------
export async function GET(req: NextRequest) {
  const origin = req.headers.get("origin") ?? "";
  const headers = getCorsHeaders(origin);

  try {
    const decoded = await getVerifiedUser(req);

    if (!decoded || decoded === "expired") {
      const message = decoded === "expired" ? "Access token expired" : "Unauthorized";
      return NextResponse.json({ success: false, error: message }, { status: 401, headers });
    }

    // TypeScript now knows decoded is AccessTokenPayload
    const { rows } = await pool.query(
      "SELECT public_id, email, name, role, email_verified FROM users WHERE public_id=$1",
      [decoded.userId]
    );

    const user = rows[0];
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404, headers });
    }

    return NextResponse.json({ success: true, user }, { headers });
  } catch (err) {
    console.error("[Auth Service] GET user error:", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500, headers });
  }
}

// -------------------- PUT user update --------------------
export async function PUT(req: NextRequest) {
  const origin = req.headers.get("origin") ?? "";
  const headers = getCorsHeaders(origin);

  try {
    const decoded = await getVerifiedUser(req);

    if (!decoded || decoded === "expired") {
      const message = decoded === "expired" ? "Access token expired" : "Unauthorized";
      return NextResponse.json({ success: false, error: message }, { status: 401, headers });
    }

    // TypeScript now knows decoded is AccessTokenPayload
    const body = await req.json().catch(() => ({}));
    const parseResult = updateUserSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: parseResult.error.errors.map(e => e.message).join(", ") },
        { status: 400, headers }
      );
    }

    const { name } = parseResult.data;

    const { rows } = await pool.query(
      "UPDATE users SET name=$1 WHERE public_id=$2 RETURNING public_id, email, name, role, email_verified",
      [name, decoded.userId]
    );

    return NextResponse.json({ success: true, user: rows[0] }, { headers });
  } catch (err) {
    console.error("[Auth Service] PUT user error:", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500, headers });
  }
}
