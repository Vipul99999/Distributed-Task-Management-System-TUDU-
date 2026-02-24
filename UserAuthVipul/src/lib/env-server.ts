import { z } from "zod";

// Define schema for environment variables
// ✅ Define and validate environment variables using Zod
const envSchema = z.object({
  // The base URL of your app (used in emails, redirects, API calls, etc.)
  // Default → local development URL
  BASE_URL: z.string().url(),

  // Database connection string (required, must be a valid URL)
  DATABASE_URL: z.string().url(),
  NEXT_PUBLIC_TUDU_APP_FRONTEND_URL : z.string().url(),
  RUN_MIGRATIONS: z.enum(["true", "false"]).default("false"),
  // SMTP (email server) settings
  // These are optional so you can run the app without email in dev
  SMTP_HOST: z.string().min(1).optional().or(z.literal("")),
  SMTP_USER: z.string().email().optional(),
  SMTP_PASSWORD: z.string().min(1).optional(),

  
  // session
  SESSION_EXPIRATION_SECONDS: z.coerce.number().positive(),
  // Google OAuth credentials – must be non-empty strings
  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),
  GOOGLE_CLIENT_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET is required"),

  // GitHub OAuth credentials – must be non-empty strings
  GITHUB_CLIENT_ID: z.string().min(1, "GITHUB_CLIENT_ID is required"),
  GITHUB_CLIENT_SECRET: z.string().min(1, "GITHUB_CLIENT_SECRET is required"),

  // Cookie expiration time in seconds – must be a positive number
  OAUTH_COOKIE_EXPIRATION_SECONDS: z
    .string() // Read from process.env as string
    .transform(Number) // Convert to number
    .refine((val) => Number.isFinite(val) && val > 0, {
      message: "OAUTH_COOKIE_EXPIRATION_SECONDS must be a positive number",
    }),
  

  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),       // <-- validated by Zod
  REFRESH_SECRET: z.string().min(1, "REFRESH_SECRET is required"),
   // RS256 keys for asymmetric JWT
  PRIVATE_KEY: z.string().min(1, "PRIVATE_KEY is required"),
  PUBLIC_KEY: z.string().min(1, "PUBLIC_KEY is required"),
});


// Validate process.env
export function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
  if (error instanceof z.ZodError) {
    console.error("❌ Zod validation error:", error.errors); 

    const missingVars = error.errors
      .map((err) => `${err.path.join(".")} → ${err.message}`)
      .join("\n")
      .trim();

    console.error("❌ Missing or invalid environment variables:\n" + missingVars);

    if (process.env.NODE_ENV === "production") {
      throw new Error(`Invalid environment variables:\n${missingVars}`);
    }
  }
  throw error;
}
}

// Export validated environment variables
export const env = validateEnv();

