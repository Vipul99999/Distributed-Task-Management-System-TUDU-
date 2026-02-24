"use server";
import { z } from "zod";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { createSessionTokens, SessionResult } from "@/lib/authTokens";
import { signinSchema } from "@/lib/zodSchemas";
import { SigninResult } from "@/types/signin";
interface UserRow {
  id: string;
  public_id: string;
  role: "admin" | "user";
  password_hash: string;
  email_verified: boolean;
  name?: string;
  email?: string;
}

export default async function localSigninServerAction(
  rawData: z.infer<typeof signinSchema>,
  options?: { deviceName?: string; ipAddress?: string; userAgent?: string }
): Promise<SigninResult> {
  
  const parsed = signinSchema.safeParse(rawData);
  if (!parsed.success) {
    console.warn("[localSignin] Validation failed:", parsed.error.format());
    return {
      success: false,
      errors: parsed.error.format(),
      data: rawData,
    };
  }

  const { email, password } = parsed.data;
  let user: UserRow;

  try {
   
    const { rows } = await pool.query<UserRow>(
      `SELECT id, public_id, role, password_hash, email_verified, name, email
       FROM users
       WHERE email = $1 AND $2 = ANY(auth_providers)`,
      [email, "local"]
    );
    user = rows[0];
    if (!user) {
    
      return {
        success: false,
        errors: { email: { _errors: ["Invalid email or password"] } },
        data: parsed.data,
      };
    }
    
  } catch  {
   
    return {
      success: false,
      errors: { _errors: ["Unexpected database error"] },
      data: parsed.data,
    };
  }

  try {
  
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      
      return {
        success: false,
        errors: { password: { _errors: ["Invalid password"] } },
        data: parsed.data,
      };
    }

   
    if (!user.email_verified) {
      
      return {
        success: false,
        errors: { _errors: ["Email not verified"] },
        data: parsed.data,
      };
    }
  } catch (verifyErr) {
    console.error("[localSignin] Password/email verification error:", verifyErr);
    return {
      success: false,
      errors: { _errors: ["Password/email verification failed"] },
      data: parsed.data,
    };
  }

  try {
    console.log("[localSignin] Step 5: Create session tokens (JWT + refresh token)");
    const session: SessionResult = await createSessionTokens({
      userId: user.public_id,
      role: user.role,
      deviceName: options?.deviceName ?? "Unknown device",
      ipAddress: options?.ipAddress,
      userAgent: options?.userAgent,
    });

   
    // 6️⃣ Return plain object (client or API route will handle cookies)
    return {
      success: true,
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      redirectTo: session.redirectTo,
    };
  } catch (err) {
    console.error("[localSignin] Failed to create session:", err);
    return {
      success: false,
      errors: { _errors: ["Failed to create session"] },
      data: parsed.data,
    };
  }
}
