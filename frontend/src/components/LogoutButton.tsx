"use client";

import { useState } from "react";
import { toast } from "sonner";
import api, { clearAccessToken } from "@/lib/api/authApi";

export default function LogoutButton() {
  const [isPending, setIsPending] = useState(false);

  const handleLogout = async () => {
    setIsPending(true);

    try {
      const response = await api.post("/api/logout");

      clearAccessToken();

      if (response.data?.success) {
        toast.success("Logged out successfully!");
      } else {
        toast.error("Session expired. Redirecting...");
      }

      // Redirect to auth service signin
      window.location.href = `${process.env.NEXT_PUBLIC_AUTH_SERVICE_URL}/signin`;
    } catch {
      clearAccessToken();
      toast.error("Unexpected error. Redirecting...");
      window.location.href = `${process.env.NEXT_PUBLIC_AUTH_SERVICE_URL}/signin`;
    } finally {
      setIsPending(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isPending}
      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
    >
      {isPending ? "Logging out..." : "Logout"}
    </button>
  );
}
