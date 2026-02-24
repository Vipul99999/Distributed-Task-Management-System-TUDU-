import Link from 'next/link';
import Image from 'next/image';

// Use unique metadata name if conflicts occur
export const pageMetadata = { title: "Page Not Found - 404" };

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-400 text-gray-800 p-4 relative overflow-hidden">

      {/* Animated floating shapes */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-yellow-300 rounded-full opacity-50 animate-bounce-slow"></div>
      <div className="absolute bottom-10 right-10 w-48 h-48 bg-blue-300 rounded-full opacity-40 animate-pulse-slow"></div>
      <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-green-300 rounded-full opacity-30 animate-spin-slow"></div>

      <h1 className="text-8xl font-extrabold text-white drop-shadow-lg mb-4 animate-bounce">404</h1>
      <h2 className="text-3xl font-semibold text-white mb-4">Oops! Page Not Found</h2>
      <p className="text-white mb-6 text-center max-w-md text-lg animate-fadeIn">
        Looks like you took a wrong turn. Don&apos;t worry, even the best explorers get lost sometimes!
      </p>

      <Link
        href="/"
        className="px-8 py-4 bg-white text-purple-600 font-bold rounded-full shadow-lg hover:bg-purple-600 hover:text-white transform hover:scale-105 transition duration-300"
      >
        Go Back Home
      </Link>

      {/* Optimized illustration */}
      <Image 
        src="/images/404-illustration.png" 
        alt="Lost illustration" 
        width={256} 
        height={256} 
        className="absolute bottom-0 opacity-80 animate-float"
      />
    </div>
  );
}
