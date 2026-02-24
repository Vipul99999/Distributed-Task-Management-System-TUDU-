"use client";

import { toast } from "react-hot-toast";
import { resetPasswordSchema } from "@/lib/zodSchemas";
import resetPasswordServerAction from "@/actions/auth/reset_password";

type FieldErrors = {
  password?: string[];
  confirm_password?: string[];
  _errors?: string[];
};

type FormState = {
  data: {
    password: string;
    confirm_password: string;
  };
  errors: FieldErrors;
  success: boolean;
  message: string;
};

export const initialState: FormState = {
  data: {
    password: "",
    confirm_password: "",
  },
  errors: {},
  success: false,
  message: "",
};
export async function formAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const rawData = {
    token: formData.get("token") as string,
    password: formData.get("password") as string,
    confirm_password: formData.get("confirm_password") as string,
  };

  // ✅ Validate with Zod
  const result = resetPasswordSchema.safeParse(rawData);

  if (!result.success) {
    const formatted = result.error.format();

    toast.error("Please fix the highlighted errors.");
    return {
      ...prevState,
      data: rawData,
      errors: {
        password: formatted.password?._errors,
        confirm_password: formatted.confirm_password?._errors,
        _errors: formatted._errors,
      },
      success: false,
      message: "Validation failed",
    };
  }

  try {
    const response = await resetPasswordServerAction(result.data);

    if (!response.success) {
      const errorMsg =
        response.errors?._errors?.[0] ||
        "Failed to reset password. Please try again.";
      toast.error(errorMsg);

      return {
        ...prevState,
        errors: response.errors ?? { _errors: [errorMsg] },
        success: false,
        message: "Request failed",
      };
    }

    toast.success("Password reset successfully!");
    return {
      data: { password: "", confirm_password: "" },
      errors: {},
      success: true,
      message: "Password reset successfully!",
    };
  } catch (error) {
    console.error("Reset password error:", error);
    const msg =
      error instanceof Error ? error.message : "Unexpected server error.";
    toast.error(msg);

    return {
      ...prevState,
      errors: { _errors: [msg] },
      success: false,
      message: msg,
    };
  }
}
