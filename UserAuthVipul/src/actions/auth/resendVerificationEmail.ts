"use server";

import { randomBytes } from "crypto";
import pool from "@/lib/db"; // PostgreSQL pool
import {getTransporter} from "@/lib/emailTransporter"
import { env } from "@/lib/env-server"; // ✅ should be named import
import { resendVerification } from "@/lib/emailTemplates";
import { z } from "zod";

const transporter = getTransporter();
export default async function resendVerificationEmailServerAction(
  email: string
): Promise<{ success: boolean; message: string }> {
  // ✅ Validate email using Zod
  const parsed = z.string().email().safeParse(email);
  if (!parsed.success) {
    return { success: false, message: "Invalid email address" };
  }
  const validatedEmail = parsed.data;

  let client;
  try {
    client = await pool.connect();

    // 1. Check if user exists
    const { rows: users } = await client.query(
      `SELECT id, email_verified FROM users WHERE email = $1`,
      [validatedEmail]
    );

    if (users.length === 0) {
      return {
        success: false,
        message: "No account found with this email.",
      };
    }

    const user = users[0];

    // 2. Check if already verified
    if (user.email_verified) {
      return {
        success: false,
        message: "Email is already verified. Please sign in.",
      };
    }

    // 3. Generate a new verification token
    const token = randomBytes(64).toString("hex");

    // 4. Upsert into email_verifications table
    await client.query(
      `
      INSERT INTO email_verifications (user_id, email, token, expires_at)
      VALUES ($1, $2, $3, NOW() + INTERVAL '15 minutes')
      ON CONFLICT (user_id)
      DO UPDATE SET token = EXCLUDED.token, expires_at = EXCLUDED.expires_at
      `,
      [user.id, validatedEmail, token]
    );

    

    // 6. Build verification link
    const confirmLink = `${env.BASE_URL}/verify-email?token=${token}`;

    // 7. Send email
    await transporter.sendMail({
      from: env.SMTP_USER,
      to: validatedEmail,
      subject: resendVerification.subject,
      text: resendVerification.text({ confirmLink }),
      html: resendVerification.html({ confirmLink }),
    });

    return {
      success: true,
      message:
        "Verification email resent successfully. Please check your inbox.",
    };
  } catch (error) {
    console.error("❌ Error in resendVerificationEmailServerAction:", error);
    return {
      success: false,
      message: "Something went wrong. Please try again later.",
    };
  } finally {
    if (client) client.release();
  }
}
