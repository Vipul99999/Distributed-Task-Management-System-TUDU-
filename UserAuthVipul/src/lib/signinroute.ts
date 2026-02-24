"use server";

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { createSessionTokens } from "@/lib/authTokens";
import { signinSchema } from "@/lib/zodSchemas";

type FieldError = {
  _errors: string[];
};

type SigninErrors = {
  email?: FieldError;
  password?: FieldError;
  _errors?: string[];
};

type SigninResponse = {
  success: boolean;
  accessToken?: string;
  redirectTo?: string;
  errors?: SigninErrors;
};

export async function POST(req: NextRequest) {
  try {
    // 1️⃣ Parse request body
    const rawData = await req.json();
    
    // 2️⃣ Validate input
    const parsed = signinSchema.safeParse(rawData);
    if (!parsed.success) {
     
      const response: SigninResponse = {
        success: false,
        errors: parsed.error.format() as SigninErrors,
      };
      return NextResponse.json(response, { status: 400 });
    }
    const { email, password } = parsed.data;
   
    // 3️⃣ Fetch user from DB
    const { rows } = await pool.query(
      "SELECT id, public_id, role, password_hash, email_verified FROM users WHERE email=$1",
      [email]
    );
    const user = rows[0];
    if (!user) {
    
      const response: SigninResponse = {
        success: false,
        errors: { email: { _errors: ["Invalid credentials"] } },
      };
      return NextResponse.json(response, { status: 401 });
    }

    // 4️⃣ Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
     
      const response: SigninResponse = {
        success: false,
        errors: { password: { _errors: ["Invalid credentials"] } },
      };
      return NextResponse.json(response, { status: 401 });
    }

    // 5️⃣ Check email verification
    if (!user.email_verified) {
     
      const response: SigninResponse = {
        success: false,
        errors: { _errors: ["Email not verified"] },
      };
      return NextResponse.json(response, { status: 403 });
    }

    // 6️⃣ Create session tokens
    const session = await createSessionTokens({
      userId: user.public_id,
      role: user.role,
    });
   
    // 7️⃣ Set HttpOnly refresh token cookie for multi-domain access
    const response = NextResponse.json<SigninResponse>({
      success: true,
      accessToken: session.accessToken,
      redirectTo: session.redirectTo,
    });

    // Cookie settings
    const isProd = process.env.NODE_ENV === "production";
    response.cookies.set("refresh_token", session.refreshToken, {
      httpOnly: true,               // inaccessible to JS
      secure: isProd,               // only HTTPS in prod
      sameSite: "lax",             // allow cross-site cookie
    //   domain: isProd ? ".yourdomain.com" : "localhost", // adjust domain for microservices
      path: "/",                    // root path so all services see it
      maxAge: 60 * 60 * 24,         // 24 hours
    });
   // 🔎 Fetch cookie back from response to confirm
    const checkCookie = response.cookies.get("refresh_token");
    if (checkCookie) {
      console.log(
        "[API Signin] 🔍 Refresh token stored in response cookies:"
      );
    } else {
      console.warn("[API Signin] ⚠️ Refresh token NOT found in response cookies!");
    }

    console.log("[API Signin] ✅ Refresh token cookie set for multi-service access");

    return response;
  } catch (err) {
    console.error("[API Signin] Unexpected error:", err);
    return NextResponse.json(
      { success: false, errors: { _errors: ["Internal server error"] } },
      { status: 500 }
    );
  }
}
