"use client"
import React from 'react';
import { LoaderCircle } from 'lucide-react';

interface SubmitButtonProps {
  isPending: boolean;
  pendingText: string;
  defaultText: string;
  className? : string;
}

export default function SubmitButton({
  isPending,
  pendingText,
  defaultText,
  className,
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={isPending}
      className={className ??
        `flex w-full items-center justify-center rounded-lg
                 bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm
                 transition-all duration-300 hover:bg-indigo-700 active:bg-indigo-800
                 disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {isPending ? (
        <>
          <LoaderCircle className="mr-2 w-5 h-5 animate-spin" />
          {pendingText}
        </>
      ) : (
        defaultText
      )}
    </button>
  );
}