"use client";

import ForgotPasswordForm from "@/components/forms/ForgotPasswordForm";
import Link from "next/link";

export default function ForgotPassword() {
  return (
    <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100 px-4 py-8">
      <div className="w-full max-w-lg space-y-8 rounded-xl bg-white/80 p-8 text-center shadow-lg backdrop-blur">
        {/* Page Title */}
        <h1 className="text-2xl font-bold text-gray-900">Forgot Password</h1>

        {/* Subtitle */}
        <p className="text-gray-600">
          Enter your email address below, and we’ll send you instructions to reset your password.
        </p>

        {/* Forgot Password Form */}
        <ForgotPasswordForm />

        {/* Back to Sign In */}
        <div className="text-center">
          <Link
            href="/signin"
            className="text-sm text-gray-600 transition-colors duration-200 hover:text-gray-500"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}
