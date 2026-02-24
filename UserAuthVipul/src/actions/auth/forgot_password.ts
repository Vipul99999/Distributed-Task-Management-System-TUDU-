"use server";
import z from "zod";
import pool from "@/lib/db";
import { randomBytes } from "crypto";
import { env } from "@/lib/env-server";
import { passwordReset } from "@/lib/emailTemplates";
import {getTransporter} from "@/lib/emailTransporter"
const transporter = getTransporter();
export default async function sendPasswordResetEmailServerAction(
  rawData: string
) {
  const { success, data: email } = z.string().email().safeParse(rawData);

  if (!success) {
    return { success: false, message: "Invalid email address" };
  }

  try {
    // 1. Check if user exists
    const { rows: users } = await pool.query<{ id: number }>(
      `SELECT id FROM users WHERE email = $1 AND 'local' = ANY(auth_providers);`,
      [email]
    );

    if (users.length === 0) {
      return {
        success: true, // don't reveal whether the email exists
        message: "Password reset email sent! Please check your inbox.",
      };
    }

    const userId = users[0].id;

    // 2. Generate a reset token
    const token = randomBytes(64).toString("hex");

    // 3. Insert or update token in password_resets table
    await pool.query(
      `INSERT INTO password_resets (user_id, token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '10 minutes')
       ON CONFLICT (user_id)
       DO UPDATE SET token = EXCLUDED.token, expires_at = EXCLUDED.expires_at`,
      [userId, token]
    );
    
    // 
    
        // 6. Build verification link
        const resetLink = `${env.BASE_URL}/reset-password?token=${token}`;

        
        // 4. Send the email here (use nodemailer or your email library)
        // Example: await sendEmail(email, token);
     await transporter.sendMail({
          from: env.SMTP_USER,
          to: email,
          subject: passwordReset.subject,
          text: passwordReset.text({ resetLink }),
          html: passwordReset.html({ resetLink }),
        });

    return {
      success: true,
      message: "Password reset instructions sent successfully!",
    };
  } catch (error) {
    console.error("Error in password reset:", error);
    return {
      success: false,
      message: "Something went wrong. Please try again later.",
    };
  }
}
