"use server";

import { randomBytes, createHash } from "crypto";
import { cookies } from "next/headers";
import { env } from "./env-server";
import { STATE_COOKIE_KEY, CODE_VERIFIER_COOKIE_KEY } from "./constants";
import { OAuthUserSchemas, tokenSchema } from "./zodSchemas";
import type { Action, OAuthProvider } from "@/actions/auth/oauth";
import { z } from "zod";
import { createSessionTokens } from "./authTokens"; // JWT helper

const OAUTH_CONFIGS = {
  github: {
    authUrl: "https://github.com/login/oauth/authorize",
    tokenUrl: "https://github.com/login/oauth/access_token",
    userUrl: "https://api.github.com/user",
    clientId: env.GITHUB_CLIENT_ID,
    clientSecret: env.GITHUB_CLIENT_SECRET,
    scope: "read:user user:email",
  },
  google: {
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    userUrl: "https://www.googleapis.com/oauth2/v2/userinfo",
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    scope: "openid profile email",
  },
} as const;

// ---------------- Helper: Set cookie ----------------
async function setCookie(name: string, value: string, maxAgeSec: number) {
  console.log(`Setting cookie: ${name}=${value}, maxAge=${maxAgeSec}`);
  const cookieStore = await cookies();
  cookieStore.set(name, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSec,
    sameSite: "lax",
  });
}

// ---------------- PKCE: code verifier & challenge ----------------
async function createCodeVerifier() {
  const codeVerifier = randomBytes(64).toString("hex");
 
  await setCookie(CODE_VERIFIER_COOKIE_KEY, codeVerifier, env.OAUTH_COOKIE_EXPIRATION_SECONDS);
  return codeVerifier;
}

function createCodeChallenge(verifier: string) {
  const challenge = createHash("sha256").update(verifier).digest("base64url");
 
  return challenge;
}

// ---------------- Create OAuth URL ----------------
export async function createUrl<T extends OAuthProvider>(provider: T, action: Action): Promise<string> {
  
  const config = OAUTH_CONFIGS[provider];

  const codeVerifier = await createCodeVerifier();
  const codeChallenge = createCodeChallenge(codeVerifier);

  const stateObj = { csrf: randomBytes(16).toString("hex"), action };
  const state = JSON.stringify(stateObj);
 
  await setCookie(STATE_COOKIE_KEY, state, env.OAUTH_COOKIE_EXPIRATION_SECONDS);

  const redirectUri = `${env.BASE_URL}/api/auth/${provider}/callback`;
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: config.scope,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    prompt: "consent",
  });

  const authUrl = `${config.authUrl}?${params.toString()}`;
 
  return authUrl;
}

// ---------------- Fetch access token ----------------
async function fetchToken(provider: OAuthProvider, code: string) {
  
  const config = OAUTH_CONFIGS[provider];

  const cookieStore = await cookies();
  const codeVerifier = cookieStore.get(CODE_VERIFIER_COOKIE_KEY)?.value;
  if (!codeVerifier) throw new Error("Missing PKCE code_verifier");

  const redirectUri = `${env.BASE_URL}/api/auth/${provider}/callback`;
  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
    code_verifier: codeVerifier,
  });

  const resp = await fetch(config.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body,
  });

  const rawData = await resp.json();
  
  const parsed = tokenSchema.parse(rawData);
 
  return { access_token: parsed.access_token, token_type: parsed.token_type };
}

// ---------------- Fetch OAuth user info & create JWT ----------------
export async function fetchUser(provider: OAuthProvider, code: string, state: string) {
 
  const cookieStore = await cookies();
  const stateFromCookie = cookieStore.get(STATE_COOKIE_KEY)?.value;
  if (!stateFromCookie) throw new Error("Missing state cookie");
  if (stateFromCookie !== state) throw new Error("Invalid state");
  
  const { access_token, token_type } = await fetchToken(provider, code);
  
  const config = OAUTH_CONFIGS[provider];
  let rawUser: unknown = await fetch(config.userUrl, {
    headers: { Authorization: `${token_type} ${access_token}` },
  }).then((r) => r.json());
 
  // GitHub: fetch email if missing
  if (provider === "github") {
    const user = rawUser as { email?: string };
    if (!user.email) {
     
      const emails: Array<{ email: string; primary: boolean }> = await fetch(
        "https://api.github.com/user/emails",
        { headers: { Authorization: `${token_type} ${access_token}` } }
      ).then((r) => r.json());
      const primary = emails.find((e) => e.primary);
      user.email = primary?.email;
      rawUser = user;
      
    }
  }

  // Validate user schema
  const schema = OAuthUserSchemas[provider];
  const { data } = schema.parse(rawUser);
  
  // Cleanup cookies
  cookieStore.delete(STATE_COOKIE_KEY);
  cookieStore.delete(CODE_VERIFIER_COOKIE_KEY);
  
  // ---------------- Create JWT session ----------------
  const jwtResponse = await createSessionTokens({
    userId: String(data.id),
    role: "user", // adapt as needed based on DB or user info
    deviceName: "OAuth Login",
    ipAddress: undefined,
    userAgent: "OAuth Browser",
    redirectTo: "/dashboard",
  });
  console.log("JWT session created for OAuth user");

  return { id: String(data.id), email: data.email, name: getNormalizedName(data, provider), jwtResponse };
}

// ---------------- Normalize user name ----------------
function getNormalizedName<T extends OAuthProvider>(user: z.infer<(typeof OAuthUserSchemas)[T]>, provider: T): string {
  switch (provider) {
    case "github":
      const githubUser = user as z.infer<typeof OAuthUserSchemas.github>;
      return githubUser.name ?? githubUser.login;
    case "google":
      const googleUser = user as z.infer<typeof OAuthUserSchemas.google>;
      return googleUser.name ?? googleUser.email;
    default:
      throw new Error("Unsupported provider");
  }
}
