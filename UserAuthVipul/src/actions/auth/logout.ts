"use server";

import { destroyUserSession } from "@/lib/authTokens";
import tryCatch from "@/lib/tryCatch";
import { redirect } from "next/navigation";

export default async function logout(refreshToken: string) {
  if (!refreshToken) {
    redirect("/signin");
    return false;
  }

  const [removed, removeError] = await tryCatch(() =>
    destroyUserSession(refreshToken)
  );

  if (removeError || !removed) {
    console.error("[logout] Failed to remove session:", removeError);
    return false;
  }

  console.log("[logout] Session destroyed successfully");
  redirect("/signin");
}
