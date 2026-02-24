'use client';

import React, { Suspense, useState } from 'react';
import FormInput from './FormInput';
import Link from 'next/link';
import SubmitButton from './SubmitButton';
import OAuthButtons from './OAuthButtons';
import { FieldErrors } from './SignupForm';
import { z } from 'zod';
import {env} from "@/lib/env-server";
import { toast } from 'react-hot-toast';
// import { useRouter } from 'next/navigation';
import { signinSchema } from '@/lib/zodSchemas';
// import localSigninServerAction from '@/actions/auth/local_signin';
import axios from "axios";
type FormState = {
  data: z.infer<typeof signinSchema>;
  errors?: Omit<FieldErrors, 'name' | 'confirm_password'>;
};

const initialState: FormState = {
  data: { email: '', password: '' },
};

function hasFieldError(errors: FieldErrors | undefined): errors is FieldErrors {
  if (!errors) return false;
  return Object.keys(errors).some((key) => key !== '_errors');
}

export default function SigninForm() {
  // const router = useRouter();
  const [state, setState] = useState<FormState>(initialState);
  const [isPending, setIsPending] = useState(false);
 const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  console.log('[SigninForm] Form submitted');
  setIsPending(true);

  // 0️⃣ Collect form data
  const formData = new FormData(event.currentTarget);
  const email = formData.get('email')?.toString() ?? '';
  const password = formData.get('password')?.toString() ?? '';
  const rawData = { email, password };
  console.log('[SigninForm] Raw form data:', rawData);

  // 1️⃣ Validate form data with Zod
  const validated = signinSchema.safeParse(rawData);
  if (!validated.success) {
    console.log('[SigninForm] Validation failed:', validated.error.format());
    toast.error('Please fix the highlighted errors.');
    setState({ data: rawData, errors: validated.error.format() });
    setIsPending(false);
    return;
  }
  console.log('[SigninForm] Validation succeeded:', validated.data);

  try {
    // 2️⃣ Send login request via Axios
    console.log('[SigninForm] Calling /api/signin with Axios...');
    const res = await axios.post(
      '/api/signin',
      validated.data,
      {
        withCredentials: true, // important for httpOnly refresh token cookie
      }
    );
    console.log('[SigninForm] Axios response:', res.data);

    const response = res.data;
    
    const {success, token, redirectTo} = res.data;
      console.log("success  ", success)
      console.log("accessToken ", token)
      console.log("redirectTo  ", redirectTo)
      
    // 3️⃣ Handle successful login
    if (response.success) {
      console.log('[SigninForm] Sign-in successful!');
      toast.success('Signed in successfully!');
      setState(initialState);


      // 4️⃣ Redirect user
      if (response.redirectTo) {
        console.log('[SigninForm] Redirecting to:', response.redirectTo);
        toast.success("Signed in successfully!");
        window.location.href = response.redirectTo;
      } else {
         console.log('[SigninForm] Redirecting to dashboard as fallback');
  window.location.href = env.NEXT_PUBLIC_TUDU_APP_FRONTEND_URL;

      }
    } 
    // 5️⃣ Handle server validation errors
    else if (response.errors?._errors?.[0]) {
      console.log('[SigninForm] Sign-in errors:', response.errors);
      toast.error(response.errors._errors[0]);
      setState({ data: rawData, errors: response.errors });
    } 
    // 6️⃣ Catch-all for unexpected server response
    else {
      console.warn('[SigninForm] Unexpected server response:', response);
      toast.error('Unexpected error during sign-in.');
    }
  } catch (err: unknown) {
  setIsPending(false);

  if (axios.isAxiosError(err)) {
    // Axios error: you can access err.response, err.message, etc.
    console.error('[SigninForm] Axios request failed:', err.response || err.message);
    toast.error(err.response?.data?.message || 'Something went wrong. Please try again.');
  } else if (err instanceof Error) {
    // Other JS errors
    console.error('[SigninForm] Unexpected error:', err.message);
    toast.error(err.message);
  } else {
    // Fallback unknown error
    console.error('[SigninForm] Unknown error:', err);
    toast.error('Something went wrong. Please try again.');
  }
} finally {
    setIsPending(false);
    console.log('[SigninForm] handleSubmit finished');
  }
};


  return (
    <form action="#"
  method="post"
  onSubmit={(e) => {
    e.preventDefault();
    console.log('[SigninForm] Form submitted (React handler)');
    handleSubmit(e);
  }}
  className="mt-8 space-y-6">
      <div className="space-y-4">
        <FormInput
          id="email"
          name="email"
          type="email"
          label="Email Address"
          autoComplete="email"
          defaultValue={state.data.email}
          error={hasFieldError(state.errors) ? state.errors.email : undefined}
        />
        <FormInput
          id="password"
          name="password"
          type="password"
          label="Password"
          autoComplete="new-password"
          defaultValue={state.data.password}
          error={hasFieldError(state.errors) ? state.errors.password : undefined}
        />
      </div>

      <div className="space-y-2">
        <SubmitButton
          isPending={isPending}
          pendingText="Signing in..."
          defaultText="Sign in"
        />
      </div>

      <div className="text-right">
        <Link
          href="/forgot-password"
          className="text-sm font-medium text-gray-600 transition-colors hover:text-blue-500"
        >
          Forgot your password?
        </Link>
      </div>

      <Suspense fallback={<div>Loading OAuth options...</div>}>
        <OAuthButtons />
      </Suspense>
    </form>
  );
}
