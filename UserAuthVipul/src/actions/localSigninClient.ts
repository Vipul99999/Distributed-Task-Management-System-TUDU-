
import { SigninResult } from "@/types/signin";


export default async function localSigninClient(
  data: { email: string; password: string }
): Promise<SigninResult> {
 
  try {
    const res = await fetch("/api/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include", // Important to include cookies
    });

    const result: SigninResult = await res.json();
    
    if (!res.ok) {
      console.warn("[localSigninClient] Server returned an error:", result);
    } 

    return result;
  } catch (err) {
    console.error("[localSigninClient] Fetch request failed:", err);
    return {
      success: false,
      errors: { _errors: ["Network or server error"] },
      data,
    };
  }
}
