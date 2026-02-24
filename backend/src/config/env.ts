import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const EnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.string().default("4000"),

  DATABASE_URL: z.string().url(),

  JWT_SECRET: z.string().min(10, "JWT_SECRET must be at least 10 characters"),

  LOG_LEVEL: z
    .enum(["error", "warn", "info", "http", "debug"])
    .default("info"),

  PUBLIC_KEY: z.string().min(1, "PUBLIC_KEY is required"),

  NEXT_PUBLIC_TUDU_APP_FRONTEND_URL: z.string().url(),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "❌ Invalid environment variables:",
    parsed.error.flatten().fieldErrors
  );
  process.exit(1);
}

// 🔥 This guarantees env is NEVER undefined
export const env = parsed.data;
export type Env = typeof env;