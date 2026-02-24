"use client";

import { useActionState } from "react";
import { z } from "zod";
import sendPasswordResetEmailServerAction from "@/actions/auth/forgot_password"
import toast from "react-hot-toast";
import SubmitButton from "./SubmitButton";
// 🟢 Define field-specific errors
type FieldErrors = {
  email?: string[];
  _errors?: string[];
};

// 🟢 Define the complete form state
type FormState = {
  data: {
    email: string;
  };
  errors: FieldErrors;
  success: boolean;
  message: string;
};

// 🟢 Initial form state
const initialState: FormState = {
  data: {
    email: "",
  },
  errors: {},
  success: false,
  message: "",
};

// 🟢 Validation schema using Zod
const emailSchema = z.string().email("Please enter a valid email address");

// 🟢 Server action for form submission

async function formAction(prevState: FormState, formData: FormData): Promise<FormState> {
  const email = formData.get("email") as string;

  // ✅ Validate email format using Zod
  const result = emailSchema.safeParse(email);
  if (!result.success) {
    toast.error("Invalid email address. Please enter a valid email.");
    return {
      ...prevState,
      errors: { email: result.error.errors.map((err) => err.message) },
      success: false,
      message: "Invalid email",
    };
  }

  try {
    // ✅ Call server action
    const res = await sendPasswordResetEmailServerAction(email);

    if (!res.success) {
      toast.error(res.message || "Failed to send reset email. Check your internet and try again.");
      return {
        ...prevState,
        errors: { _errors: [res.message || "Failed to send reset email."] },
        success: false,
        message: res.message || "Failed to send reset email",
      };
    }

    // ✅ Success toast
    toast.success("✅ Password reset instructions have been sent to your email!");
    
    return {
      data: { email },
      errors: {},
      success: true,
      message: "Password reset email sent successfully.",
    };
  } catch (error) {
    console.error("Forgot password error:", error);
    toast.error("Unexpected server error. Please try again later.");
    return {
      ...prevState,
      errors: { _errors: ["Unexpected server error. Please try again later."] },
      success: false,
      message: "Unexpected server error",
    };
  }
}



export default function ForgotPasswordForm() {
  const [state, action, isPending] = useActionState(formAction, initialState);
if (state.success) toast.success(state.message);
  if (state.errors._errors) toast.error(state.errors._errors[0]);

  return (
    <form action={action} className="space-y-4">
      {/* Email Input */}
      <div>
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          defaultValue={state.data.email}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-4 py-2 text-gray-900 focus:border-indigo-500 focus:ring focus:ring-indigo-200"
        />

        {/* Field-Specific Error */}
        {state.errors.email && (
          <p className="mt-1 text-left text-sm text-red-500">{state.errors.email[0]}</p>
        )}
      </div>

      {/* Submit Button */}
     < SubmitButton
        isPending={isPending}
        pendingText="Submitting..."
        defaultText="Submit"
        className="flex w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-white transition duration-300 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
      />

      {/* Success Message */}
      {state.success && (
        <p className="text-sm text-green-600">{state.message}</p>
      )}

      {/* Global Errors */}
      {state.errors._errors && (
        <p className="text-sm text-red-600">{state.errors._errors[0]}</p>
      )}
    </form>
  );
}


