import { redirect } from "next/navigation";
import verifyEmailFromToken from "@/lib/verifyEmail";
import { FiAlertCircle } from "react-icons/fi";
import RemoveFromHistory from "@/components/RemoveFromHistory";
import Link from "next/link";

type SearchParams = {
  token?: string;
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const token = params?.token;

  if (!token) {
    redirect("/");
  }

  const { success, message } = await verifyEmailFromToken(token);

  if (success) {
    redirect(
      `/signin?verified=1&message=${encodeURIComponent(message)}`
    );
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6 bg-gradient-to-br from-red-50 to-white text-center">
      <section className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 border border-red-100 animate-fade-in">
        <div className="flex flex-col items-center space-y-4">
          <FiAlertCircle className="text-red-500 text-4xl" />
          <h1 className="text-3xl font-bold text-red-600">
            Email Verification Failed
          </h1>
          <p className="text-gray-700 text-base">
            {message ||
              "The verification link is invalid or has expired. Please try again."}
          </p>

          <div className="mt-6">
            <Link
              href="/signin"
              className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
            >
              Back to Sign In
            </Link>
          </div>
        </div>

        <RemoveFromHistory />
      </section>
    </main>
  );
}
