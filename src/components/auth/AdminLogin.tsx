"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { createClient } from "@/lib/supabase/client";

export default function AdminLogin() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");

    if (!email.trim() || !password) {
      setErrorMessage("Please enter your email address and password.");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMessage(error.message);
        setIsLoading(false);
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setErrorMessage(
        "Something went wrong while signing in. Please try again.",
      );

      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f7ff]">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        {/* Left Brand Panel */}
        <section className="relative hidden overflow-hidden bg-gradient-to-br from-violet-950 via-violet-800 to-purple-600 lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
          {/* Decorative Elements */}
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-fuchsia-300/20 blur-3xl" />

          <div className="relative z-10">
            <div className="max-w-sm">
              <Image
                src="/brand/7icons-admin-logo.png"
                alt="7ICONS Admin"
                width={420}
                height={160}
                priority
                className="h-auto w-full object-contain"
              />
            </div>
          </div>

          <div className="relative z-10 max-w-xl">
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.28em] text-violet-200">
              7ICONS Digital Ecosystem
            </p>

            <h1 className="text-4xl font-bold leading-tight text-white xl:text-5xl">
              Manage the platform.
              <br />
              Preserve the story.
            </h1>

            <p className="mt-6 max-w-lg text-base leading-7 text-violet-100/80">
              Administrative dashboard for managing content, members,
              schedules, community representatives, users, and the
              continuing journey of 7ICONS & ICONIA.
            </p>
          </div>

          <div className="relative z-10">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-violet-200/70">
              Build for ICONIA by ICONIA
            </p>
          </div>
        </section>

        {/* Login Area */}
        <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="mb-10 flex justify-center lg:hidden">
              <Image
                src="/brand/7icons-admin-logo.png"
                alt="7ICONS Admin"
                width={300}
                height={120}
                priority
                className="h-auto w-64 object-contain"
              />
            </div>

            <div className="mb-8">
              <div className="mb-3 inline-flex items-center rounded-full border border-violet-100 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                Admin Access
              </div>

              <h2 className="text-3xl font-bold tracking-tight text-slate-950">
                Welcome back
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Sign in to access the 7ICONS administration dashboard.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email Address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@7icons.com"
                  autoComplete="email"
                  disabled={isLoading}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                />
              </div>

              {/* Password */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    className="text-xs font-semibold text-violet-600 transition hover:text-violet-800"
                  >
                    Forgot password?
                  </button>
                </div>

                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={isLoading}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                />
              </div>

              {/* Remember Me */}
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 accent-violet-600"
                />

                <span className="text-sm text-slate-600">
                  Keep me signed in
                </span>
              </label>

              {/* Error */}
              {errorMessage && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-100 bg-red-50 px-4 py-3"
                >
                  <p className="text-sm font-medium text-red-600">
                    {errorMessage}
                  </p>
                </div>
              )}

              {/* Sign In */}
              <button
                type="submit"
                disabled={isLoading}
                className="flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-violet-700 to-purple-500 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-500/25 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="h-4 w-4 animate-spin"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="9"
                        stroke="currentColor"
                        strokeWidth="3"
                        className="opacity-25"
                      />

                      <path
                        d="M21 12a9 9 0 0 0-9-9"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>

                    Signing In...
                  </span>
                ) : (
                  "Sign In to Dashboard"
                )}
              </button>
            </form>

            {/* Supabase Notice */}
            <div className="mt-8 rounded-2xl border border-violet-100 bg-violet-50/70 p-4">
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-violet-600 shadow-sm">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-4 w-4"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M7 11V8a5 5 0 0 1 10 0v3" />
                    <rect
                      x="5"
                      y="11"
                      width="14"
                      height="10"
                      rx="2"
                    />
                    <path d="M12 15v2" />
                  </svg>
                </div>

                <div>
                  <p className="text-sm font-semibold text-violet-950">
                    Secure Admin Access
                  </p>

                  <p className="mt-1 text-xs leading-5 text-violet-700/70">
                    Authentication is connected to the 7ICONS platform
                    through Supabase.
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-8 text-center text-xs text-slate-400">
              7ICONS Admin · Internal Administration Dashboard
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}