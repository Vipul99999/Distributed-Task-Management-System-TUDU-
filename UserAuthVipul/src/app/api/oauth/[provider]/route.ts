import tryCatch from "@/lib/tryCatch";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse  } from "next/server";
import { z } from "zod";
import { fetchUser } from "@/lib/OAuthClient";
import { OAuthProvider } from "@/actions/auth/oauth";
import pool from "@/lib/db";
import { createSessionTokens } from "@/lib/authTokens";
import {env} from "@/lib/env-server";
const providerActionSchema = z.tuple([
  z.enum(["google", "github"]),
  z.enum(["signin", "signup"]),
]);

type Context = {
  params: Promise<{
    provider: string;
  }>;
};

export async function GET(
  request: NextRequest,
  context: Context
) {
  const { provider: rawProvider } = await context.params;

  const code = request.nextUrl.searchParams.get("code");
  const stateParam = request.nextUrl.searchParams.get("state");

  if (!stateParam) return redirect("/");

  const { action: rawAction } = JSON.parse(stateParam);

  const { success, data } = providerActionSchema.safeParse([
    rawProvider,
    rawAction,
  ]);

  if (!success) return redirect("/");

  const [provider, action] = data;
  const page = action === "signin" ? "/signin" : "/signup";

  if (typeof code !== "string") {
    return redirect(
      `${page}?oerror=Failed to connect to ${provider}. Please try again.`
    );
  }

  const [oAuthUser, oAuthUserError] = await tryCatch(() =>
    fetchUser(provider, code, stateParam)
  );

  if (oAuthUserError) {
    return redirect(
      `${page}?oerror=Failed to connect to ${provider}. Please try again.`
    );
  }

  try {
    const user = await createUserAccount(oAuthUser, provider);

    const ipAddressHeader =
      request.headers.get("x-forwarded-for") ?? undefined;
    const ipAddress = ipAddressHeader?.split(",")[0].trim();
    const userAgent = request.headers.get("user-agent") ?? undefined;

    const session = await createSessionTokens({
  userId: String(user.id),
  role: user.role,
  deviceName: userAgent ?? "Unknown device",
  ipAddress,
  userAgent,
  redirectTo: env.NEXT_PUBLIC_TUDU_APP_FRONTEND_URL,
});

const response = NextResponse.redirect(
  new URL(session.redirectTo, request.url)
);

// Set cookies
response.cookies.set("accessToken", session.accessToken, {
  httpOnly: true,
  secure: true,
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 5,
});

response.cookies.set("refreshToken", session.refreshToken, {
  httpOnly: true,
  secure: true,
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 12,
});

return response;
  } catch (error) {
    console.error(error);
    return redirect(
      `${page}?oerror=${encodeURIComponent(
        "An error occurred during authentication."
      )}`
    );
  }
}

type oAuthUser = { id: string; name: string; email: string };

interface UserRow {
  id: number;
  auth_providers: OAuthProvider[];
  name: string;
  role: "admin" | "user";
}

async function createUserAccount(
  oAuthUser: oAuthUser,
  provider: OAuthProvider
) {
  const { rows: users } = await pool.query<UserRow>(
    `SELECT id, auth_providers, name, role FROM users WHERE email = $1`,
    [oAuthUser.email]
  );

  if (users.length > 0 && users[0].auth_providers.includes(provider)) {
    const user = users[0];
    return { id: user.id, role: user.role };
  }

  if (users.length > 0) {
    const user = users[0];
    await pool.query(
      `UPDATE users SET ${provider}_id = $1, auth_providers = array_append(auth_providers, $2) WHERE id = $3`,
      [oAuthUser.id, provider, user.id]
    );
    return { id: user.id, role: user.role };
  }

  const { rows: newUser } = await pool.query(
    `INSERT INTO users (email, name, ${provider}_id, auth_providers)
     VALUES ($1, $2, $3, $4)
     RETURNING id, role`,
    [oAuthUser.email, oAuthUser.name, oAuthUser.id, [provider]]
  );

  return newUser[0];
}
