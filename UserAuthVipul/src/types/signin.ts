import { z } from "zod";
import { signinSchema } from "@/lib/zodSchemas";

export type FieldErrors = {
  email?: { _errors: string[] };
  password?: { _errors: string[] };
  _errors?: string[];
};

export type SigninResult = {
  success: boolean;
  errors?: FieldErrors; 
  data?: z.infer<typeof signinSchema>;
  redirectTo?: string;
  accessToken?: string;
  refreshToken?: string;
};
