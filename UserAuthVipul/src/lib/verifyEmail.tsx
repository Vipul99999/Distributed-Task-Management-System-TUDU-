import "server-only";

import pool from "@/lib/db";
import { PoolClient } from "pg";
import tryCatch from "./tryCatch";

interface VerifyResult {
  success: boolean;
  message: string;
}

export default async function verifyEmailFromToken(
  validatedToken: string
): Promise<VerifyResult> {
  
  let client: PoolClient | null = null;

  try {
    client = await pool.connect();
    console.log("✅ Database client connected");

    // Start transaction immediately
    await client.query("BEGIN");
    console.log("🔹 Transaction started");

    // 1. Check for a valid token (lock the row to avoid race conditions)
    console.log("🔹 Checking for valid token in email_verifications table...");
    const { rows: verifications } = await client.query<{ user_id: number }>(
      `
      SELECT user_id 
      FROM email_verifications
      WHERE token = $1 
      AND expires_at > NOW()
      FOR UPDATE
      `,
      [validatedToken]
    );
   
    if (verifications.length === 0) {
      console.log("⚠️ Token is invalid or expired, rolling back transaction");
      await client.query("ROLLBACK");
      return {
        success: false,
        message: "Invalid or expired verification link.",
      };
    }

    const { user_id } = verifications[0];
    
    // 2. Update user's email_verified
    console.log("🔹 Updating user's email_verified to true...");
    const updateResult = await client.query(
      `
      UPDATE users
      SET email_verified = true
      WHERE id = $1 AND 'local' = ANY(auth_providers)
      `,
      [user_id]
    );
    console.log("🔹 Update result:", updateResult.rowCount, "rows affected");

    // 3. Delete the token (safer: check user_id + token)
    console.log("🔹 Deleting verification token...");
    const deleteResult = await client.query(
      `
      DELETE FROM email_verifications 
      WHERE user_id = $1 AND token = $2
      `,
      [user_id, validatedToken]
    );
    console.log("🔹 Delete result:", deleteResult.rowCount, "rows deleted");

    // Commit transaction
    await client.query("COMMIT");
    console.log("✅ Transaction committed successfully");

    return {
      success: true,
      message: "Your email has been verified successfully!",
    };
  } catch (error) {
    if (client) {
      console.log("⚠️ Rolling back transaction due to error");
      await tryCatch(() => client!.query("ROLLBACK"));
    }
    console.error("❌ Error verifying email:", error);
    return {
      success: false,
      message: "Something went wrong. Please try again later.",
    };
  } finally {
    console.log("🔹 Releasing database client");
    client?.release();
  }
}
