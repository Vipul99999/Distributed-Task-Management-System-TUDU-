"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import  resendVerificationEmailServerAction from "@/actions/auth/resendVerificationEmail"
import {  LoaderCircle } from "lucide-react";

interface VerificationButtonProps {
  email: string;
}

export default function VerificationButton({ email }: VerificationButtonProps) {
  const [isSending, setIsSending] = useState(false);
  const router = useRouter();

  async function handleResend() {
    setIsSending(true);

    try {
      const response = await resendVerificationEmailServerAction(email);

      if (response.success) {
        toast.success(response.message);
        router.push("/signin");
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Resend failed:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <button
      onClick={handleResend}
      disabled={isSending}
      className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isSending ? <> <LoaderCircle className="mr-2 size-5 animate-spin"/> Sending...</> : "Resend Verification Email"}
    </button>
  );
}
