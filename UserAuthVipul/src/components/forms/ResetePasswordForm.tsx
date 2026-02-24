"use client";

import { useActionState } from "react";
import FormInput from "./FormInput";
import SubmitButton from "./SubmitButton";
import { toast } from "react-hot-toast";
import { resetPasswordSchema } from "@/lib/zodSchemas";
import resetPasswordServerAction from "@/actions/auth/reset_password";
import { useRouter } from "next/navigation";

type FieldErrors = {
  password?: { _errors: string[] };
  confirm_password?: { _errors: string[] };
  _errors: string[];
};

type FormState = {
  data: {
    password: string;
    confirm_password: string;
  };
  errors?: FieldErrors;
};

const initialState: FormState = {
  data: { password: "", confirm_password: "" },
};

type RouterInstance = { push: (pathname: string) => void };

async function formAction(
  router: RouterInstance,
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const rawData = {
    token: formData.get("token") as string,
    password: formData.get("password") as string,
    confirm_password: formData.get("confirm_password") as string,
  };

  const result = resetPasswordSchema.safeParse(rawData);

  if (!result.success) {
    return { data: rawData, errors: result.error.format() };
  }

  try {
    const response = await resetPasswordServerAction(result.data);

    if (!response.success) {
      const errorMsg =
        response.errors?._errors?.[0] || "Failed to reset password";
      toast.error(errorMsg);

      return {
        data: rawData,
        errors: {
          password: response.errors?.password
            ? { _errors: response.errors.password }
            : undefined,
          confirm_password: response.errors?.confirm_password
            ? { _errors: response.errors.confirm_password }
            : undefined,
          _errors: response.errors?._errors || [errorMsg],
        },
      };
    }

    window.history.pushState({}, "", window.location.pathname);
    toast.success("Password reset successfully! Redirecting...");

    setTimeout(() => router.push("/signin"), 3000);

    return initialState;
  } catch (error) {
    const msg =
      error instanceof Error
        ? error.message
        : "Unexpected server error. Try again later.";
    toast.error(msg);
    return { data: rawData };
  }
}

function hasFieldErrors(errors?: FieldErrors): errors is FieldErrors {
  return !!errors && Object.keys(errors).some((key) => key !== "_errors");
}

export default function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [state, action, isPending] = useActionState(
    formAction.bind(null, router),
    initialState
  );

  return (
    <form action={action} className="space-y-4 text-left">
      <input type="hidden" name="token" value={token} />

      <FormInput
        id="password"
        name="password"
        type="password"
        label="New Password"
        defaultValue={state.data.password}
        error={hasFieldErrors(state.errors) ? state.errors.password : undefined}
        className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none ${
          hasFieldErrors(state.errors) && state.errors.password
            ? "border-red-500"
            : "border-gray-300"
        }`}
      />

      <FormInput
        id="confirm_password"
        name="confirm_password"
        type="password"
        label="Confirm Password"
        defaultValue={state.data.confirm_password}
        error={
          hasFieldErrors(state.errors)
            ? state.errors.confirm_password
            : undefined
        }
        className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none ${
          hasFieldErrors(state.errors) && state.errors.confirm_password
            ? "border-red-500"
            : "border-gray-300"
        }`}
      />

      <SubmitButton
        isPending={isPending}
        pendingText="Resetting..."
        defaultText="Reset Password"
        className="mt-10 flex w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-3 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
      />

      {state.errors?._errors && (
        <p className="text-sm text-red-600">{state.errors._errors[0]}</p>
      )}
    </form>
  );
}
