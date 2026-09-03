"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

export default function UnauthorizedPage() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);

    const supabase = createClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Sign out failed:", error.message);
      setIsSigningOut(false);
      return;
    }

    router.replace("/login");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f7ff] px-5">
      <div className="w-full max-w-lg rounded-3xl border border-violet-100 bg-white p-8 text-center shadow-sm sm:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-7 w-7"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v5" />
            <path d="M12 16.5h.01" />
          </svg>
        </div>

        <p className="mt-6 text-sm font-semibold text-violet-600">
          Access Denied
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Admin access required
        </h1>

        <p className="mt-4 text-sm leading-6 text-slate-500">
          Your account is authenticated, but it does not have permission
          to access the 7ICONS Administration Dashboard.
        </p>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <a
            href="https://7icons-web.vercel.app"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-violet-200 px-6 text-sm font-semibold text-violet-700 transition hover:bg-violet-50"
          >
            Go to 7ICONS Web
          </a>

          <button
            type="button"
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-violet-700 to-purple-500 px-6 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSigningOut ? "Signing Out..." : "Sign Out"}
          </button>
        </div>
      </div>
    </main>
  );
}