// src/components/LogoutButton.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import axios from "axios";
import { env } from "@/lib/env-server";
export function clearAccessToken() {
 
  if (typeof window !== "undefined") sessionStorage.removeItem("accessToken");
}

export default function LogoutButton() {
  const [isPending, setIsPending] = useState(false);

  const handleLogout = async () => {
    setIsPending(true);
    console.log("[LogoutButton] Logout clicked");
   
    try {
      // 1️⃣ Call Auth Microservice logout endpoint
     
      const response = await axios.post(
        `${env.BASE_URL}/api/logout`,
        {}, // body not needed; cookie sent automatically
        { withCredentials: true }
      );

      console.log("[LogoutButton] Logout response:", response.data);

      // 2️⃣ Clear frontend access token (memory + sessionStorage)
      clearAccessToken();

      // 3️⃣ Handle response
      if (response.status === 200 && response.data.success) {
        toast.success("Logged out successfully!");
        console.log("[LogoutButton] Session destroyed successfully");
      } else {
        toast.error(
          "Session may have already expired. Redirecting to login..."
        );
        console.warn(
          "[LogoutButton] Logout failed or token missing:",
          response.data
        );
      }

      // 4️⃣ Always redirect to login page
      console.log("[LogoutButton] Redirecting to /signin...");
      if (typeof window !== "undefined") {
        window.location.href = `${env.BASE_URL}/signin`;
      }
    } catch (err: unknown) {
      console.error("[LogoutButton] Logout error:", err);
      clearAccessToken();
      toast.error("Unexpected error during logout. Redirecting to login...");
      if (typeof window !== "undefined") {
        window.location.href = `${env.BASE_URL}/signin`;
      }
    } finally {
      setIsPending(false);
      console.log("[LogoutButton] Logout process finished");
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
