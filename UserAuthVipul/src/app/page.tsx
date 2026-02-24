import Link from "next/link";

export default function Home() {
  return (
    <main className="relative flex min-h-[calc(100vh-5rem)] items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100 px-6 py-12">

      {/* Decorative Blur Circles */}
      <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-purple-300/40 blur-3xl"></div>
      <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-indigo-300/40 blur-3xl"></div>

      {/* Card */}
      <div className="relative w-full max-w-lg space-y-8 rounded-3xl bg-white/70 p-12 text-center shadow-2xl backdrop-blur-xl border border-white/40">

        {/* Heading */}
        <h1 className="text-5xl font-extrabold tracking-tight">
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Welcome
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-gray-600">
          Sign in to continue or create a new account to get started.
        </p>

        {/* Buttons */}
        <div className="space-y-5 pt-4">

          <Link
            href="/signin"
            className="group relative inline-flex w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
          >
            <span className="absolute inset-0 bg-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
            <span className="relative">Sign In</span>
          </Link>

          <Link
            href="/signup"
            className="group relative inline-flex w-full items-center justify-center overflow-hidden rounded-2xl border border-indigo-200 bg-white px-6 py-3 text-base font-semibold text-indigo-700 shadow-md transition-all duration-300 hover:-translate-y-1 hover:bg-indigo-50 hover:shadow-xl"
          >
            Create Account
          </Link>

        </div>
      </div>
    </main>
  );
}