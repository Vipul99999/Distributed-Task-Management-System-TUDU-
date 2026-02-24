"use client";
//frontend\src\components\shared\reusablecomponents\Buttons\GetCurrentUser.tsx
import { useEffect, useState } from "react";
import {jwtDecode} from "jwt-decode";
import { useAuthStore } from "@/stores/useAuthStore";
import { useUserStore } from "@/stores/useUserStore";

type AccessTokenPayload = {
  userId: string;
  role: string;
  iat: number;
  exp: number;
};

export default function GetCurrentUser() {
  const { accessToken, authReady, fetchAccessToken } = useAuthStore();
  const { user, fetchUser } = useUserStore();

  const [decoded, setDecoded] = useState<AccessTokenPayload | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Decode JWT whenever accessToken changes
  useEffect(() => {
    if (!accessToken) {
      setDecoded(null);
      return;
    }

    try {
      const decodedToken: AccessTokenPayload = jwtDecode(accessToken);
      setDecoded(decodedToken);
    } catch (err) {
      console.error("[GetCurrentUser] Failed to decode token:", err);
      setDecoded(null);
    }
  }, [accessToken]);

  // Fetch access token if missing/expired and then fetch user
  useEffect(() => {
    if (!authReady) return;

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
      window.location.href = `${process.env.NEXT_PUBLIC_AUTH_SERVICE_URL}/signin`;
          return;
        }

        const storedUser = sessionStorage.getItem("user");
        if (storedUser) useUserStore.getState().setUser(JSON.parse(storedUser));

        await fetchUser();
      } catch (err) {
        console.error("[GetCurrentUser] Failed to fetch user:", err);
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
    <div style={{ padding: 20 }}>
      <h1>Current User</h1>

      <button
        onClick={() => setShowDetails((prev) => !prev)}
        disabled={!user}
        style={{
          padding: "10px 20px",
          backgroundColor: "#0070f3",
          color: "#fff",
          border: "none",
          borderRadius: 5,
          cursor: user ? "pointer" : "not-allowed",
          marginBottom: 10,
        }}
      >
        {showDetails ? "Hide Details" : "Show User Details"}
      </button>

      {fetchError && <p style={{ color: "red", marginTop: 10 }}>{fetchError}</p>}

      {showDetails && user && (
        <div style={{ marginTop: 20, border: "1px solid #ddd", padding: 10, borderRadius: 5 }}>
          <h2>User Info</h2>
          <p><strong>ID:</strong> {user.public_id}</p>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
          <p><strong>Email Verified:</strong> {user.email_verified ? "Yes" : "No"}</p>
        </div>
      )}

      {decoded && (
        <div style={{ marginTop: 20 }}>
          <h2>Decoded Token</h2>
          <p><strong>User ID:</strong> {decoded.userId}</p>
          <p><strong>Role:</strong> {decoded.role}</p>
          <p><strong>Issued At:</strong> {new Date(decoded.iat * 1000).toLocaleString()}</p>
          <p><strong>Expires At:</strong> {new Date(decoded.exp * 1000).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}
