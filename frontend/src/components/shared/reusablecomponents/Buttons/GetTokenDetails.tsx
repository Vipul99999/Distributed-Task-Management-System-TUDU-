"use client";

import { useState } from "react";
import {jwtDecode} from "jwt-decode";

type AccessTokenPayload = {
  userId: string;
  role: string;
  iat: number;
  exp: number;
};

export default function TokenDetail() {
   const [decoded, setDecoded] = useState<AccessTokenPayload | null>(null);
    const [showDetails, setShowDetails] = useState(false);
  
    // Utility: get token from URL or sessionStorage
    const getToken = (): string | null => {
      if (typeof window === "undefined") return null;
  
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get("token");
  
      if (urlToken) {
        sessionStorage.setItem("accessToken", urlToken);
        // Optionally remove token from URL
        window.history.replaceState({}, document.title, window.location.pathname);
        return urlToken;
      }
  
      return sessionStorage.getItem("accessToken");
    };
  
    const handleToggle = () => {
      const token = getToken();
      if (!token) {
        alert("No token found!");
        return;
      }
  
      if (!showDetails) {
        try {
          const decodedToken: AccessTokenPayload = jwtDecode(token);
          setDecoded(decodedToken);
        } catch (err) {
          console.error("Failed to decode token:", err);
          alert("Failed to decode token. Check console for details.");
          return;
        }
      }
  
      setShowDetails((prev) => !prev);
    };
  
    return (
      <div style={{ padding: 20 }}>
        <h1>Current User</h1>
        <button
          onClick={handleToggle}
          style={{
            padding: "10px 20px",
            backgroundColor: "#0070f3",
            color: "#fff",
            border: "none",
            borderRadius: 5,
            cursor: "pointer",
          }}
        >
          {showDetails ? "Hide Details" : "Show Details"}
        </button>
  
        {showDetails && decoded && (
          <div style={{ marginTop: 20 }}>
            <h2>Decoded Token:</h2>
            <p><strong>User ID:</strong> {decoded.userId}</p>
            <p><strong>Role:</strong> {decoded.role}</p>
            <p><strong>Issued At:</strong> {new Date(decoded.iat * 1000).toLocaleString()}</p>
            <p><strong>Expires At:</strong> {new Date(decoded.exp * 1000).toLocaleString()}</p>
          </div>
        )}
      </div>
    );
  }
  