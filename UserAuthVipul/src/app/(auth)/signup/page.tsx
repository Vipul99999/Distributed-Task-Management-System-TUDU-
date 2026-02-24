"use client"
import React from 'react'
import Link from 'next/link'
import  SignupForm from '@/components/forms/SignupForm'
export default function SignUp() {
  return (
    <main 
    className='flex min-h-[calc(100vh-5rem)] items-center justify-center 
    bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 px-4 py-8' >

      <div className="w-full max-w-lg space-y-8 rounded-xl bg-white
      p-8 shadow-2xl">
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Create Account
        </h2>

        {/* form for the sigining up */}
        <SignupForm/>
        {/* link to sign in  */}
        <p
        className='mt-4 text-center text-sm text-gray-600'>
          Already have and account?{" "}
          <Link
          href="/signin"
          className="font-medium text-gray-600 hover:text-gray-500">
            Sign in 
          </Link>
        </p>
      </div>

    </main>
  )
}
