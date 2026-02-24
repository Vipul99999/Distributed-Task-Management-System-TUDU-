// Navigation.tsx (Server Component)
import Link from "next/link";
import { FaHome } from "react-icons/fa";

export default async function Navigation() {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-lg bg-white/70 border-b border-purple-100">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        
        {/* Logo / Brand */}
        <Link
          href="/"
          className="group flex items-center gap-2 text-xl font-semibold text-purple-800 transition-all duration-300 hover:text-purple-600"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-md transition-transform duration-300 group-hover:scale-110">
            <FaHome className="size-5" />
          </div>
          <span className="tracking-tight">Tudu Authentication</span>
        </Link>

        {/* Nav Links */}
        <div className="hidden items-center gap-8 text-sm font-medium text-gray-700 md:flex">
          <Link
            href="/signin"
            className="relative transition-colors duration-300 hover:text-purple-600"
          >
            Login
            <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-purple-600 transition-all duration-300 group-hover:w-full"></span>
          </Link>

          <Link
            href="/signup"
            className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-2 text-white shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}