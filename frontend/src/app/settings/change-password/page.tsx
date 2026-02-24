"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { FiLock } from "react-icons/fi";
import { useRouter } from "next/navigation";

export default function ChangePasswordPage() {
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

  // ✅ Validation function
  const validate = (
    current: string,
    newPass: string,
    confirm: string
  ) => {
    const newErrors: typeof errors = {};

    if (!current) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!newPass) {
      newErrors.newPassword = "New password is required";
    } else if (!passwordRegex.test(newPass)) {
      newErrors.newPassword =
        "Password must be 8+ chars, include uppercase, lowercase, number & special character";
    }

    if (!confirm) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (newPass !== confirm) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (current && newPass && current === newPass) {
      newErrors.newPassword =
        "New password must be different from current password";
    }

    return newErrors;
  };

  // ✅ Live validation (fixes your issue)
  useEffect(() => {
    const validationErrors = validate(
      currentPassword,
      newPassword,
      confirmPassword
    );
    setErrors(validationErrors);
  }, [currentPassword, newPassword, confirmPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validate(
      currentPassword,
      newPassword,
      confirmPassword
    );

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    console.log("Submitting change password form with data:", {
      currentPassword,
      newPassword,
      confirmPassword,
    });
    try {
      const response = await axios.post(
        "http://localhost:3000/api/change-password",
        {
          currentPassword,
          newPassword,
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success("Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setErrors({});
         setTimeout(() => {
    router.push("/settings");
  }, 1000);
      } else {
        toast.error(response.data.message || "Failed to update password");
      }
    } catch (error: unknown) {
  if (error instanceof Error) {
    toast.error(error.message);
  } else {
    toast.error("Something went wrong");
  }
}  finally {
      setLoading(false);
    }
  };

  const isFormValid =
    currentPassword &&
    newPassword &&
    confirmPassword &&
    Object.keys(errors).length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl border border-gray-100">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <FiLock className="text-indigo-600" />
          Change Password
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Current Password */}
          <div>
            <input
              type="password"
              placeholder="Current Password"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            {errors.currentPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.currentPassword}
              </p>
            )}
          </div>

          {/* New Password */}
          <div>
            <input
              type="password"
              placeholder="New Password"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            {errors.newPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.newPassword}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <input
              type="password"
              placeholder="Confirm New Password"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !isFormValid}
            className="w-full rounded-xl bg-indigo-600 py-3 font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>

        <button
          onClick={() => router.back()}
          className="mt-4 w-full text-sm text-gray-500 hover:text-red-700"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}