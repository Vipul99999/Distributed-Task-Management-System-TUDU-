import { redirect } from "next/navigation";
import VerificationButton from "@/components/auth/VerificationButton";

type SearchParams = {
  type?: string;
  email?: string;
};
export default async function VerificationRequiredPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const type = params?.type;
  const email = params?.email;
  // If params are missing, redirect to signin
  if (!type || !email) {
    redirect("/signin");
  }

  return (
    <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100 px-4 py-8">
      <div className="w-full max-w-lg space-y-6 rounded-xl bg-white p-8 text-center shadow-lg">
        <h1 className="text-2xl font-bold text-gray-900">
          Email Verification Required
        </h1>

        <p className="text-gray-600">
          {type === "signin"
            ? "Your email is not verified. Please check your inbox for the verification email or request a new one."
            : "This email is already registered but not verified. Please verify your email or request a new verification link."}
        </p>

        {/* Verification Button */}
        <div className="mt-6">
          <VerificationButton email={email} />
        </div>
      </div>
    </main>
  );
}
