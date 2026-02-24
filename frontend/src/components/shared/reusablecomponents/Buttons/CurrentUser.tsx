"use client";
//frontend\src\components\shared\reusablecomponents\Buttons\CurrentUser.tsx
import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useUserStore } from "@/stores/useUserStore";

export default function CurrentUser() {
  const { accessToken, authReady, fetchAccessToken } = useAuthStore();
  const { user, fetchUser } = useUserStore();

  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!authReady) return; // Wait until auth is initialized

    async function init() {
      setLoading(true);
      setFetchError(null);

      try {
        let token = accessToken;

        if (!token) {
          await fetchAccessToken();
          token = useAuthStore.getState().accessToken;
        }

        if (!token) {
          setFetchError("No access token found. Please login.");
          // --- Redirect to Auth microservice signin page ---
      window.location.href = `${process.env.NEXT_PUBLIC_AUTH_SERVICE_URL}/signin`
          return;
        }

        const storedUser = sessionStorage.getItem("user");
        if (storedUser) {
          useUserStore.getState().setUser(JSON.parse(storedUser));
        }

        await fetchUser();
      } catch (err) {
        console.error("[CurrentUser] Failed to fetch user:", err);
        setFetchError("Failed to fetch user. Please login again.");
        // --- Redirect to Auth microservice signin page ---
      window.location.href = `${process.env.NEXT_PUBLIC_AUTH_SERVICE_URL}/signin`;
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [authReady]);

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: 10 }}>
      <button
        onClick={() => setShowDetails((prev) => !prev)}
        style={{
          padding: "8px 16px",
          backgroundColor: "#0070f3",
          color: "#fff",
          border: "none",
          borderRadius: 5,
          cursor: "pointer",
          marginBottom: 10,
        }}
      >
        {showDetails ? "Hide Details" : "Show User Details"}
      </button>

      {fetchError && <p style={{ color: "red" }}>{fetchError}</p>}

      {showDetails && user && (
        <div
          style={{
            marginTop: 15,
            padding: 10,
            border: "1px solid #ddd",
            borderRadius: 5,
          }}
        >
          <h3>User Details</h3>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
          <p><strong>Email Verified:</strong> {user.email_verified ? "Yes" : "No"}</p>
          <p><strong>ID:</strong> {user.public_id}</p>
        </div>
      )}

      {showDetails && !user && !fetchError && (
        <p style={{ color: "red" }}>No user data available. Please check your login.</p>
      )}
    </div>
  );
}
