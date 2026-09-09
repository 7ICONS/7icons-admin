"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type AcceptRepresentativeInvitationProps = {
  token: string;
};

type AuthMode =
  | "signin"
  | "signup";

export default function AcceptRepresentativeInvitation({
  token,
}: AcceptRepresentativeInvitationProps) {
  const router = useRouter();

  const [mode, setMode] =
    useState<AuthMode>(
      "signin",
    );

  const [displayName, setDisplayName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [
    currentEmail,
    setCurrentEmail,
  ] = useState<string | null>(
    null,
  );

  const [
    isCheckingSession,
    setIsCheckingSession,
  ] = useState(true);

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    async function checkSession() {
      const supabase =
        createClient();

      const {
        data,
      } =
        await supabase.auth.getUser();

      setCurrentEmail(
        data.user?.email ??
          null,
      );

      setIsCheckingSession(
        false,
      );
    }

    checkSession();
  }, []);

  async function acceptInvitation() {
    const supabase =
      createClient();

    const {
      error:
        acceptError,
    } = await supabase.rpc(
      "accept_representative_invitation",
      {
        invite_token:
          token,
      },
    );

    if (acceptError) {
      throw acceptError;
    }

    setMessage(
      "Representative access activated successfully.",
    );

    window.setTimeout(
      () => {
        router.replace(
          "/dashboard",
        );

        router.refresh();
      },
      900,
    );
  }

  async function handleAcceptExistingAccount() {
    setIsSubmitting(true);
    setError("");
    setMessage("");

    try {
      await acceptInvitation();
    } catch (acceptError) {
      console.error(
        "Unable to accept representative invitation:",
        acceptError,
      );

      setError(
        acceptError instanceof Error
          ? acceptError.message
          : "Unable to accept this invitation.",
      );

      setIsSubmitting(false);
    }
  }

  async function handleSignIn(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setIsSubmitting(true);
    setError("");
    setMessage("");

    const supabase =
      createClient();

    const {
      data,
      error:
        signInError,
    } =
      await supabase.auth.signInWithPassword(
        {
          email:
            email.trim(),
          password,
        },
      );

    if (
      signInError ||
      !data.user
    ) {
      setError(
        signInError?.message ||
          "Unable to sign in.",
      );

      setIsSubmitting(false);
      return;
    }

    try {
      setCurrentEmail(
        data.user.email ??
          email.trim(),
      );

      await acceptInvitation();
    } catch (acceptError) {
      console.error(
        "Unable to accept representative invitation:",
        acceptError,
      );

      setError(
        acceptError instanceof Error
          ? acceptError.message
          : "Unable to accept this invitation.",
      );

      setIsSubmitting(false);
    }
  }

  async function handleSignUp(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setIsSubmitting(true);
    setError("");
    setMessage("");

    if (
      displayName.trim().length <
      2
    ) {
      setError(
        "Please enter your full name.",
      );

      setIsSubmitting(false);
      return;
    }

    if (
      password.length < 8
    ) {
      setError(
        "Password must contain at least 8 characters.",
      );

      setIsSubmitting(false);
      return;
    }

    const supabase =
      createClient();

    const redirectUrl =
      `${window.location.origin}` +
      `/accept-representative-invite?token=${encodeURIComponent(
        token,
      )}`;

    const {
      data,
      error:
        signUpError,
    } =
      await supabase.auth.signUp(
        {
          email:
            email.trim(),

          password,

          options: {
            emailRedirectTo:
              redirectUrl,

            data: {
              display_name:
                displayName.trim(),
            },
          },
        },
      );

    if (signUpError) {
      setError(
        signUpError.message,
      );

      setIsSubmitting(false);
      return;
    }

    /*
     * Jika Email Confirmation aktif,
     * user belum langsung mempunyai
     * session setelah signup.
     */
    if (!data.session) {
      setMessage(
        "Account created. Please check your email and confirm your account, then return to this invitation.",
      );

      setIsSubmitting(false);
      return;
    }

    try {
      setCurrentEmail(
        data.user?.email ??
          email.trim(),
      );

      await acceptInvitation();
    } catch (acceptError) {
      console.error(
        "Unable to accept representative invitation:",
        acceptError,
      );

      setError(
        acceptError instanceof Error
          ? acceptError.message
          : "Unable to accept this invitation.",
      );

      setIsSubmitting(false);
    }
  }

  async function useAnotherAccount() {
    setIsSubmitting(true);
    setError("");
    setMessage("");

    const supabase =
      createClient();

    const {
      error:
        signOutError,
    } =
      await supabase.auth.signOut();

    if (signOutError) {
      setError(
        signOutError.message,
      );

      setIsSubmitting(false);
      return;
    }

    setCurrentEmail(null);
    setEmail("");
    setPassword("");

    setIsSubmitting(false);
  }

  if (
    isCheckingSession
  ) {
    return (
      <div className="rounded-3xl border border-violet-100 bg-white p-8 text-center shadow-xl shadow-violet-950/5">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />

        <p className="mt-4 text-sm text-slate-500">
          Checking your account...
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-violet-100 bg-white shadow-xl shadow-violet-950/5">
      {/* Header */}
      <div className="border-b border-violet-100 px-6 py-6 sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
          Representative Access
        </p>

        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
          Representative Invitation
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Accept your invitation to
          receive limited ICONIA
          Representative access to
          the 7ICONS Admin Panel.
        </p>
      </div>

      <div className="px-6 py-6 sm:px-8">
        {/* Already Logged In */}
        {currentEmail ? (
          <div className="space-y-5">
            <div className="rounded-2xl border border-violet-100 bg-violet-50/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-violet-600">
                Signed In Account
              </p>

              <p className="mt-2 break-all text-sm font-semibold text-slate-900">
                {currentEmail}
              </p>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                This email must match
                the email address used
                for the Representative
                invitation.
              </p>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                {error}
              </div>
            )}

            {message && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-700">
                {message}
              </div>
            )}

            <button
              type="button"
              disabled={
                isSubmitting
              }
              onClick={
                handleAcceptExistingAccount
              }
              className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-violet-700 to-purple-500 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-violet-500/20 transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {isSubmitting
                ? "Accepting Invitation..."
                : "Accept Invitation"}
            </button>

            <button
              type="button"
              disabled={
                isSubmitting
              }
              onClick={
                useAnotherAccount
              }
              className="flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Use Another Account
            </button>
          </div>
        ) : (
          <div>
            {/* Tabs */}
            <div className="grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
              <button
                type="button"
                disabled={
                  isSubmitting
                }
                onClick={() => {
                  setMode(
                    "signin",
                  );

                  setError("");
                  setMessage("");
                }}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  mode ===
                  "signin"
                    ? "bg-white text-violet-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Sign In
              </button>

              <button
                type="button"
                disabled={
                  isSubmitting
                }
                onClick={() => {
                  setMode(
                    "signup",
                  );

                  setError("");
                  setMessage("");
                }}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  mode ===
                  "signup"
                    ? "bg-white text-violet-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Create Account
              </button>
            </div>

            {mode ===
            "signin" ? (
              <form
                onSubmit={
                  handleSignIn
                }
                className="mt-6 space-y-5"
              >
                <div>
                  <label
                    htmlFor="representative-signin-email"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Email
                  </label>

                  <input
                    id="representative-signin-email"
                    type="email"
                    autoComplete="email"
                    required
                    disabled={
                      isSubmitting
                    }
                    value={email}
                    onChange={(
                      event,
                    ) =>
                      setEmail(
                        event
                          .target
                          .value,
                      )
                    }
                    placeholder="you@example.com"
                    className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="representative-signin-password"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Password
                  </label>

                  <input
                    id="representative-signin-password"
                    type="password"
                    autoComplete="current-password"
                    required
                    disabled={
                      isSubmitting
                    }
                    value={
                      password
                    }
                    onChange={(
                      event,
                    ) =>
                      setPassword(
                        event
                          .target
                          .value,
                      )
                    }
                    placeholder="Your password"
                    className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
                  />
                </div>

                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                    {error}
                  </div>
                )}

                {message && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-700">
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={
                    isSubmitting
                  }
                  className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-violet-700 to-purple-500 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-violet-500/20 transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {isSubmitting
                    ? "Signing In..."
                    : "Sign In & Accept"}
                </button>
              </form>
            ) : (
              <form
                onSubmit={
                  handleSignUp
                }
                className="mt-6 space-y-5"
              >
                <div>
                  <label
                    htmlFor="representative-name"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Full Name
                  </label>

                  <input
                    id="representative-name"
                    type="text"
                    autoComplete="name"
                    required
                    disabled={
                      isSubmitting
                    }
                    value={
                      displayName
                    }
                    onChange={(
                      event,
                    ) =>
                      setDisplayName(
                        event
                          .target
                          .value,
                      )
                    }
                    placeholder="Your full name"
                    className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="representative-signup-email"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Email
                  </label>

                  <input
                    id="representative-signup-email"
                    type="email"
                    autoComplete="email"
                    required
                    disabled={
                      isSubmitting
                    }
                    value={email}
                    onChange={(
                      event,
                    ) =>
                      setEmail(
                        event
                          .target
                          .value,
                      )
                    }
                    placeholder="you@example.com"
                    className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="representative-signup-password"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Password
                  </label>

                  <input
                    id="representative-signup-password"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    required
                    disabled={
                      isSubmitting
                    }
                    value={
                      password
                    }
                    onChange={(
                      event,
                    ) =>
                      setPassword(
                        event
                          .target
                          .value,
                      )
                    }
                    placeholder="Minimum 8 characters"
                    className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
                  />

                  <p className="mt-2 text-xs text-slate-400">
                    Minimum 8
                    characters.
                  </p>
                </div>

                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                    {error}
                  </div>
                )}

                {message && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-700">
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={
                    isSubmitting
                  }
                  className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-violet-700 to-purple-500 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-violet-500/20 transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {isSubmitting
                    ? "Creating Account..."
                    : "Create Account & Accept"}
                </button>
              </form>
            )}

            <div className="mt-6 rounded-2xl border border-violet-100 bg-violet-50/60 p-4">
              <p className="text-xs leading-5 text-violet-700/80">
                Use the exact email
                address that received
                the Representative
                invitation. Invitations
                cannot be accepted by a
                different account.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}