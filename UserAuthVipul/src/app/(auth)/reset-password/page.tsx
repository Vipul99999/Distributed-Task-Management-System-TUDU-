import ResetPasswordForm from "@/components/forms/ResetePasswordForm";
import pool from "@/lib/db";
import Link from "next/link";
import { z } from "zod";

async function verifyResetToken(token: string) {
  try {
    z.string().trim().min(1).parse(token);

    const { rows } = await pool.query<{ token_exists: boolean }>(
      `SELECT EXISTS (
        SELECT 1 FROM password_resets WHERE token = $1 AND expires_at > NOW()
      ) AS token_exists`,
      [token]
    );

    return rows[0].token_exists;
  } catch {
    return false;
  }
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  const token = Array.isArray(params?.token)
    ? params?.token[0]
    : params?.token;

  const isValidToken = token ? await verifyResetToken(token) : false;

  return (
    <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100 px-4">
      <div className="w-full max-w-lg space-y-8 rounded-xl bg-white p-8 text-center shadow-lg">
        {!token || !isValidToken ? (
          <>
            <h1 className="text-2xl font-bold text-gray-900">Invalid Reset Link</h1>
            <p className="text-gray-600 mt-2">
              The password reset link is invalid or has expired.
            </p>
            <Link
              href="/forgot-password"
              className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
            >
              Request New Reset Link
            </Link>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
            <p className="text-gray-600 mt-2">Enter your new password below.</p>
            <ResetPasswordForm token={token} />
          </>
        )}
      </div>
    </main>
  );
}

