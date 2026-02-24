"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  id: string;
  role: "admin" | "user";
  iat: number;
  exp: number;
}

export default function DashboardClient() {
  console.log("this is Dashboard page started");

  const searchParams = useSearchParams();
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      localStorage.setItem("authToken", token);

      try {
        const decoded = jwtDecode<JwtPayload>(token);
        setUserRole(decoded.role);
      } catch (err) {
        console.error("Failed to decode JWT", err);
      }

      // Clean URL
      const url = new URL(window.location.href);
      url.searchParams.delete("token");
      window.history.replaceState(null, "", url.toString());
    }
  }, [searchParams]);

  return (
    <div>
      <h1>Dashboard</h1>
      <p>User Role: {userRole}</p>
    </div>
  );
}
