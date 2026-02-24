"use server";

import { z } from "zod";
import { resetPasswordSchema } from "@/lib/zodSchemas";
import pool from "@/lib/db";
import { PoolClient } from "pg";
import bcrypt from "bcryptjs";
import tryCatch from "@/lib/tryCatch";

type ActionResult =
  | { success: true; message: string }
  | {
      success: false;
      errors?: {
        password?: string[];
        confirm_password?: string[];
        _errors: string[];
      };
      data?: z.infer<typeof resetPasswordSchema>;
    };

export default async function resetPasswordServerAction(
  rawData: z.infer<typeof resetPasswordSchema>
): Promise<ActionResult> {
  // 1️⃣ Validate
  const validatedData = resetPasswordSchema.safeParse(rawData);

  if (!validatedData.success) {
    const formatted = validatedData.error.format();

    return {
      success: false,
      data: rawData,
      errors: {
        password: formatted.password?._errors ?? undefined,
        confirm_password: formatted.confirm_password?._errors ?? undefined,
        _errors: formatted._errors ?? ["Validation failed"],
      },
    };
  }

  let client: PoolClient | null = null;

  try {
    const { token, password } = validatedData.data;
    client = await pool.connect();

    // 2️⃣ Check if token exists and is valid
    const { rows: resetRows } = await client.query<{ user_id: number }>(
      `SELECT user_id FROM password_resets WHERE token = $1 AND expires_at > NOW()`,
      [token]
    );

    if (resetRows.length === 0) {
      return {
        success: false,
        errors: { _errors: ["Invalid or expired reset link"] },
        data: validatedData.data,
      };
    }

    const userId = resetRows[0].user_id;
    const hashedPassword = await bcrypt.hash(password, 12);

    // 3️⃣ Transaction
    await client.query("BEGIN");

    await client.query(
      `UPDATE users SET password_hash = $1 WHERE id = $2 AND 'local' = ANY(auth_providers)`,
      [hashedPassword, userId]
    );

    await client.query(
      `DELETE FROM password_resets WHERE user_id = $1 AND token = $2`,
      [userId, token]
    );

    await client.query("COMMIT");

    return { success: true, message: "Password has been reset successfully" };
  } catch (error) {
    if (client) {
      await tryCatch(() => client!.query("ROLLBACK"));
    }
    console.error("Error resetting password:", error);

    return {
      success: false,
      errors: { _errors: ["Something went wrong. Please try again later."] },
      data: validatedData.data,
    };
  } finally {
    if (client) client.release();
  }
}
