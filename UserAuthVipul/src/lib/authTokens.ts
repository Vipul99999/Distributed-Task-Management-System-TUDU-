
"use server";

import { randomUUID, createHash } from "crypto";
import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
import pool from "@/lib/db";
import { env } from "@/lib/env-server";

/** Options for creating a session */
export interface SessionOptions {
  userId: string;
  role: "admin" | "user";
  deviceName?: string;
  ipAddress?: string;
  userAgent?: string;
  redirectTo?: string;
  accessTokenExpiresIn?: number; // seconds
  refreshTokenExpiresIn?: number; // seconds
}

/** JWT payload */
interface AccessTokenPayload extends JwtPayload {
  userId: string;
  role: string,//"admin" | "user";
}

/** Session result */
export interface SessionResult {
  accessToken: string;
  refreshToken: string; // returned once, must be stored in cookie by route.ts
  redirectTo: string;
}

const BCRYPT_SALT_ROUNDS = 12;

/** --- Helper: SHA256 for DB lookup --- */
function sha256(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

/** --- Create JWT access token + refresh token --- */
export async function createSessionTokens(options: SessionOptions): Promise<SessionResult> {
  console.log("\n=== [createSessionTokens] START ===");

  const {
    userId,
    role,
    deviceName = "Unknown device",
    ipAddress,
    userAgent,
    redirectTo = env.NEXT_PUBLIC_TUDU_APP_FRONTEND_URL,
    accessTokenExpiresIn = 60 * 5,
    refreshTokenExpiresIn = 60 * 60 * 12,//12 hours
  } = options;

  // 1️⃣ Access token
  const accessPayload: AccessTokenPayload = { userId, role };
  const accessToken = jwt.sign(accessPayload, env.PRIVATE_KEY.replace(/\\n/g, "\n"), {
    algorithm: "RS256",
    expiresIn: accessTokenExpiresIn,
  });
 
  // 2️⃣ Refresh token
  const refreshTokenPlain = randomUUID();
  const refreshTokenHashed = await bcrypt.hash(refreshTokenPlain, BCRYPT_SALT_ROUNDS);
  const refreshTokenSha = sha256(refreshTokenPlain);
  const expiresAt = new Date(Date.now() + refreshTokenExpiresIn * 1000);
 
  // 3️⃣ Store refresh token in DB
  await pool.query(
    `INSERT INTO refresh_tokens 
     (user_id, token, sha256_token, device_name, ip_address, user_agent, expires_at) 
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [userId, refreshTokenHashed, refreshTokenSha, deviceName, ipAddress ?? null, userAgent ?? null, expiresAt]
  );
 
 
  return { accessToken, refreshToken: refreshTokenPlain, redirectTo };
}

/** --- Verify JWT access token --- */
export async function verifyAccessToken(token: string): Promise<AccessTokenPayload | "expired" | null> {
 
  try {
    const decoded = jwt.verify(token, env.PUBLIC_KEY.replace(/\\n/g, "\n"), { algorithms: ["RS256"] }) as AccessTokenPayload & JwtPayload;
    const now = Math.floor(Date.now() / 1000);

    if (decoded.exp && decoded.exp < now) {
      
      return "expired";
    }

    if (!decoded.userId || !decoded.role) {
     
      return null;
    }

  
    return decoded;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
     
      return "expired";
    }
  
    return null;
  } 
}

/** --- Refresh access token (with rotation) --- */
interface RefreshTokenResult {
  accessToken?: string;
  refreshToken?: string; // rotated token
  redirectTo?: string;
  expiresAt?: Date ;
}




export async function refreshAccessToken(
  refreshTokenPlain: string
): Promise<RefreshTokenResult> {
  
  const refreshSha = sha256(refreshTokenPlain);

  try {
    // 1️⃣ Lookup refresh token in DB
    const { rows } = await pool.query(
      `SELECT r.id, r.user_id, r.token, r.expires_at, r.revoked, u.role
       FROM refresh_tokens r
       JOIN users u ON u.public_id = r.user_id
       WHERE r.sha256_token = $1`,
      [refreshSha]
    );

    const tokenRow = rows[0];
    if (!tokenRow) {
     
      return { redirectTo: "/signin" };
    }

    // 2️⃣ Verify bcrypt hash
    const valid = await bcrypt.compare(refreshTokenPlain, tokenRow.token);
    if (!valid) {
   
      return { redirectTo: "/signin" };
    }

    // 3️⃣ Check expiry and revocation
    const now = new Date();
    if (tokenRow.revoked || now > tokenRow.expires_at) {
     
      await pool.query("DELETE FROM refresh_tokens WHERE id=$1", [tokenRow.id]);
      return { redirectTo: "/signin" };
    }

    // 4️⃣ Issue new access token (short-lived)
    const payload: AccessTokenPayload = { userId: tokenRow.user_id, role: tokenRow.role };
    const accessToken = jwt.sign(payload, env.PRIVATE_KEY.replace(/\\n/g, "\n"), { algorithm: "RS256", expiresIn: 60 * 5 });
 
    // 5️⃣ Rotate refresh token if it's older than 4 hours (but keep expiry fixed at 12h)
    const tokenAge = now.getTime() - (tokenRow.expires_at.getTime() - 12 * 60 * 60 * 1000);
    const fourHours = 4 * 60 * 60 * 1000;

    let rotatedRefreshToken: string | undefined = undefined;
    const newExpiry = tokenRow.expires_at; // keep original expiry

    if (tokenAge > fourHours) {
      rotatedRefreshToken = randomUUID();
      const newRefreshHashed = await bcrypt.hash(rotatedRefreshToken, BCRYPT_SALT_ROUNDS);
      const newRefreshSha = sha256(rotatedRefreshToken);

      // Keep expiry the same as original 12h from creation
      await pool.query(
        "UPDATE refresh_tokens SET token=$1, sha256_token=$2 WHERE id=$3",
        [newRefreshHashed, newRefreshSha, tokenRow.id]
      );

      console.log("[refreshAccessToken] 🔄 Refresh token rotated (security)");
    } else {
      console.log("[refreshAccessToken] ⏳ Refresh token still fresh, rotation not needed");
    }

    return { accessToken, refreshToken: rotatedRefreshToken, expiresAt: newExpiry };
  } catch (err) {
    console.error("[refreshAccessToken] ❌ Error during refresh:", err);
    return { redirectTo: "/signin" };
  } finally {
    console.log("=== [refreshAccessToken] END ===\n");
  }
}



/** --- Destroy session --- */
export async function destroyUserSession(refreshTokenPlain: string): Promise<boolean> {
  console.log("\n=== [destroyUserSession] START ===");
  const refreshSha = sha256(refreshTokenPlain);

  try {
    const { rows } = await pool.query("SELECT id, token FROM refresh_tokens WHERE sha256_token=$1", [refreshSha]);
    const tokenRow = rows[0];
    if (!tokenRow) {
      console.warn("[destroyUserSession] ❌ Token not found");
      return false;
    }

    const valid = await bcrypt.compare(refreshTokenPlain, tokenRow.token);
    if (!valid) {
      console.warn("[destroyUserSession] ❌ Bcrypt mismatch");
      return false;
    }

    await pool.query("DELETE FROM refresh_tokens WHERE id=$1", [tokenRow.id]);
    console.log("[destroyUserSession] ✅ Token deleted");
    return true;
  } catch (err) {
    console.error("[destroyUserSession] ❌ Error:", err);
    return false;
  } finally {
    console.log("=== [destroyUserSession] END ===\n");
  }
}

/** --- Validate session (try access → refresh fallback) --- */
export async function validateSession(accessToken: string, refreshToken?: string) {
  console.log("\n=== [validateSession] START ===");

  // 1️⃣ Try access token
  const decoded = await verifyAccessToken(accessToken);
  if (decoded && decoded !== "expired") {
    console.log("[validateSession] ✅ Access token valid");
    console.log("=== [validateSession] END ===\n");
    return { valid: true, decoded };
  }

  // 2️⃣ If expired or invalid, try refresh
  if (refreshToken) {
    console.log("[validateSession] ⚠️ Access invalid, trying refresh...");
    const refreshed = await refreshAccessToken(refreshToken);
    if (refreshed.accessToken) {
      console.log("[validateSession] ✅ Refreshed access token issued");
      console.log("=== [validateSession] END ===\n");
      return { valid: true, newAccessToken: refreshed };
    }
  }

  // 3️⃣ Failed both
  console.warn("[validateSession] ❌ Both tokens invalid");
  console.log("=== [validateSession] END ===\n");
  return { valid: false };
}
