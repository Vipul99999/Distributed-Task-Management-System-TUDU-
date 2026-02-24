"use client"
import React, { Suspense, useActionState } from 'react'
import FormInput from './FormInput'
import SubmitButton from './SubmitButton'
import { signupSchema } from '@/lib/zodSchemas';
import { localSignupServerAction } from '@/actions/auth/local_signup';
import OAuthButtons from './OAuthButtons';
import { toast } from "react-hot-toast";
import { z } from "zod";

export type FieldErrors = {
  name?: {_errors:string[]};
  email?: {_errors:string[]};
  password?: {_errors:string[]};
  confirm_password?: {_errors:string[]};
  _errors?: string[];
};

type FormState = {
  data: z.infer<typeof signupSchema>;
  errors?: FieldErrors;
};

const initialState: FormState = {
  data: {
    name: "",
    email: "",
    password: "",
    confirm_password: "",
  },
};

export async function formAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  console.log("Signup formAction started"); // log start

  const rawData = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirm_password: formData.get("confirm_password") as string,
  };
  console.log("Raw signup form data:", rawData); // log raw form data

  try {
    const validatedData = signupSchema.safeParse(rawData);
    console.log("Validation result:", validatedData); // log Zod validation

    if (!validatedData.success) {
      toast.error("Please fix the highlighted errors.", { id: "signup-error" });
      console.log("Validation failed, returning errors:", validatedData.error.format());
      return {
        data: rawData,
        errors: validatedData.error.format(),
      };
    }

    const response = await localSignupServerAction(validatedData.data);
    console.log("Server response:", response); // log server response

    if (response.success) {
      toast.success(response.message || "Signup successful!", {
        id: "signup-success",
        duration: 5000,
        icon: "📧",
      });
      console.log("Signup successful, resetting form");
      return initialState;
    } else {
      const fieldError =
        response.errors?.email?._errors?.[0] ||
        response.errors?.password?._errors?.[0] ||
        response.errors?.confirm_password?._errors?.[0] ||
        response.errors?.name?._errors?.[0] ||
        response.errors?._errors?.[0];

      toast.error(fieldError || "Signup failed. Please try again.", {
        id: "signup-error",
      });
      console.log("Signup failed, returning errors:", response.errors);

      return {
        data: validatedData.data,
        errors: response.errors,
      }
    }
  } catch (error) {
    if(error instanceof Error && error.message.includes("NEXT_RESIRECT")){
      console.log("Redirect detected, returning initial state");
      return initialState;
    }

    console.error("Unexpected error during signup:", error);
    toast.error("Something went wrong. Please try again.");
    return  {
      data: rawData,
      errors: {
        _errors: ["An unexpected error occurred. Please try again later."],
      },
    };
  }
}

function hasFieldError(errors: FieldErrors | undefined): errors is FieldErrors {
  if(!errors) return false;
  return Object.keys(errors).some((key) => key !== "_errors");
}

export default function SignupForm() {
  const [state, action, isPending] = useActionState(formAction, initialState);
  console.log("SignupForm render, current state:", state, "isPending:", isPending); // log state on render

  return (
    <form action={action} className='mt-8 space-y-6'>
      <div className="space-y-4">
        <FormInput 
          id='name'
          name='name'
          type='name'
          label="Username"
          autoComplete='name'
          defaultValue={state.data.name}
          error={hasFieldError(state.errors) ? state.errors.name : undefined}
        />
        <FormInput 
          id='email'
          name='email'
          type='email'
          label="Email Address"
          autoComplete='email'
          defaultValue={state.data.email}
          error={hasFieldError(state.errors) ? state.errors.email : undefined}
        />
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormInput 
            id='password'
            name='password'
            type='password'
            label="Password"
            autoComplete='new-password'
            defaultValue={state.data.password}
            error={hasFieldError(state.errors) ? state.errors.password : undefined}
          />
          <FormInput 
            id='confirm-password'
            name='confirm_password'
            type='password'
            label="Confirm Password"
            autoComplete='confirm-password'
            defaultValue={state.data.confirm_password}
            error={hasFieldError(state.errors) ? state.errors.confirm_password : undefined}
          />
        </div>
      </div>

      <div className="space-y-2">
        <SubmitButton
          isPending={isPending}
          pendingText='Sign up...'
          defaultText='Sign up'
        />
      </div>

      <Suspense>
        <OAuthButtons/>
      </Suspense>
    </form>
  )
}
