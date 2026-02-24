import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "@/lib/db";
import { env } from "@/lib/env-server";
const allowedOrigin = env.NEXT_PUBLIC_TUDU_APP_FRONTEND_URL;

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

// ✅ Handle preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

export async function POST(req: NextRequest) {
  let client;

  try {
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters" },
        { status: 400, headers: corsHeaders() }
      );
    }

    const accessToken = req.cookies.get("accessToken")?.value;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401, headers: corsHeaders() }
      );
    }

    const decoded = jwt.verify(
      accessToken,
      process.env.JWT_ACCESS_SECRET!
    ) as { public_id: string };

    client = await pool.connect();

    const userResult = await client.query(
      `SELECT public_id, password_hash
       FROM users
       WHERE public_id = $1`,
      [decoded.public_id]
    );

    if (userResult.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404, headers: corsHeaders() }
      );
    }

    const user = userResult.rows[0];

    if (!user.password_hash) {
      return NextResponse.json(
        { success: false, message: "Local password not set" },
        { status: 400, headers: corsHeaders() }
      );
    }

    const isMatch = await bcrypt.compare(
      currentPassword,
      user.password_hash
    );

    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Current password is incorrect" },
        { status: 400, headers: corsHeaders() }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await client.query(
      `UPDATE users
       SET password_hash = $1
       WHERE public_id = $2`,
      [hashedPassword, decoded.public_id]
    );

    await client.query(
      `UPDATE refresh_tokens
       SET revoked = TRUE
       WHERE user_id = $1`,
      [decoded.public_id]
    );

    return NextResponse.json(
      { success: true, message: "Password updated successfully" },
      { headers: corsHeaders() }
    );

  } catch (error) {
    console.error("Change password error:", error);

    return NextResponse.json(
      { success: false, message: "Invalid or expired token" },
      { status: 401, headers: corsHeaders() }
    );
  } finally {
    if (client) client.release();
  }
}