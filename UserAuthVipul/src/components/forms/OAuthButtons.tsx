"use client"
import { FaGithub, FaGoogle } from "react-icons/fa";
import { usePathname, useSearchParams } from "next/navigation";
import OAuthSignIn from "@/actions/auth/oauth";
import { FiAlertOctagon } from "react-icons/fi";
export default function OAuthButtons() {
 const action = usePathname() === "/signin" ? "signin" : "signup";
 const errorMessage = useSearchParams().get("oerror")
  return (
    <div>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-gray-500">Or continue with</span>
        </div>
      </div>

      {/* OAuth Buttons */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Google button */}
        <button
        onClick={()=>OAuthSignIn("google", action) }
          type="button"
          className="inline-flex w-full items-center justify-center rounded-md border border-gray-300
                     bg-white px-4 py-2 text-sm font-medium text-gray-500 shadow-sm hover:bg-gray-50"
        >
          <FaGoogle className="mr-2 w-5 h-5" />
          Google
        </button>

        {/* Github button */}
        <button
          type="button"
          onClick={()=>OAuthSignIn("github", action) }
          className="inline-flex w-full items-center justify-center rounded-md border border-gray-300
                     bg-white px-4 py-2 text-sm font-medium text-gray-500 shadow-sm hover:bg-gray-50"
        >
          <FaGithub className="mr-2 w-5 h-5" />
          Github
        </button>
      </div>
      {errorMessage &&  <p className="mt-4 flex items-center gap-2 rounded-sm bg-red-50 p-2 text-sm text-red-500">
        <FiAlertOctagon className="size-5"/>
        {errorMessage}</p>}
    </div>
  );
}