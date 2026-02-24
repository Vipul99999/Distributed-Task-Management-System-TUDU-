import { OAuthProvider } from "@/actions/auth/oauth";
import { z } from "zod";

export const signupSchema = z
  .object({
    name: z.string().min(2, "Please provide your name"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    confirm_password: z.string().min(8, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"], // Highlights the confirm_password field on error
  });

export const signinSchema =
 z.object({
  email: z.string().email(),
  password : z.string().min(1,"Password is required"),
 })

 // Schema for user session
 export const userSessionSchema = z.object({
  id: z.string(), // UUID from DB
  role: z.enum(["admin", "user"]),
});

export type UserSession = z.infer<typeof userSessionSchema>;

  export const resetPasswordSchema = z
  .object({
    token: z.string(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(64, "Password must be less than 64 characters"),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"], 
  });

export const tokenSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  refresh_token: z.string().optional(),
  expires_in: z.number().optional(),
});

export const OAuthUserSchemas: Record<OAuthProvider, z.ZodType> = {
  github: z.object({
    id: z.number().transform(String),
    login: z.string(),
    name: z.string().nullable(),
    email: z.string(),
  }),
  google: z.object({
    id: z.string(), // ✅ fixed (Google returns string id)
    email: z.string(),
    name: z.string().nullable(),
    given_name: z.string().optional(),
    family_name: z.string().optional(),
  }),
};
export const sessionSchema = z.object({
  userId: z.string(),
  deviceName: z.string(),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  expiresAt: z.date(),
});

