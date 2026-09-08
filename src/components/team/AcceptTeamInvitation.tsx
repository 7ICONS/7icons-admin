"use client";

import { useRouter } from "next/navigation";
import {
  useEffect,
  useState,
} from "react";

import { createClient } from "@/lib/supabase/client";

type AcceptTeamInvitationProps = {
  token: string;
};

type AuthMode =
  | "signin"
  | "signup";

export default function AcceptTeamInvitation({
  token,
}: AcceptTeamInvitationProps) {
  const router = useRouter();

  const [mode, setMode] =
    useState<AuthMode>("signin");

  const [
    displayName,
    setDisplayName,
  ] = useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [
    currentEmail,
    setCurrentEmail,
  ] = useState("");

  const [
    checkingSession,
    setCheckingSession,
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
    const supabase =
      createClient();

    async function loadSession() {
      const {
        data,
      } =
        await supabase.auth.getUser();

      setCurrentEmail(
        data.user?.email ?? "",
      );

      setCheckingSession(false);
    }

    void loadSession();
  }, []);

  async function acceptInvitation() {
    setIsSubmitting(true);
    setError("");
    setMessage("");

    const supabase =
      createClient();

    const {
      data,
      error: acceptError,
    } = await supabase.rpc(
      "accept_team_invitation",
      {
        invite_token: token,
      },
    );

    if (acceptError) {
      console.error(
        "Unable to accept invitation:",
        acceptError,
      );

      setError(
        acceptError.message ||
          "Unable to accept this invitation.",
      );

      setIsSubmitting(false);
      return;
    }

    setMessage(
      `Invitation accepted. Your role is now ${String(
        data,
      )}. Redirecting to the Admin Panel...`,
    );

    router.refresh();

    setTimeout(() => {
      router.replace(
        "/dashboard",
      );
      router.refresh();
    }, 900);
  }

  async function signIn() {
    const normalizedEmail =
      email.trim().toLowerCase();

    if (
      !normalizedEmail ||
      !password
    ) {
      setError(
        "Email and password are required.",
      );
      return;
    }

    setIsSubmitting(true);
    setError("");
    setMessage("");

    const supabase =
      createClient();

    const {
      data,
      error: signInError,
    } =
      await supabase.auth.signInWithPassword(
        {
          email:
            normalizedEmail,
          password,
        },
      );

    if (
      signInError ||
      !data.user
    ) {
      console.error(
        "Sign in failed:",
        signInError,
      );

      setError(
        signInError?.message ||
          "Unable to sign in.",
      );

      setIsSubmitting(false);
      return;
    }

    setCurrentEmail(
      data.user.email ?? "",
    );

    const {
      data: acceptedRole,
      error: acceptError,
    } = await supabase.rpc(
      "accept_team_invitation",
      {
        invite_token: token,
      },
    );

    if (acceptError) {
      console.error(
        "Unable to accept invitation:",
        acceptError,
      );

      setError(
        acceptError.message ||
          "Signed in successfully, but this invitation could not be accepted.",
      );

      setIsSubmitting(false);
      return;
    }

    setMessage(
      `Invitation accepted. Your role is now ${String(
        acceptedRole,
      )}. Redirecting...`,
    );

    router.refresh();

    setTimeout(() => {
      router.replace(
        "/dashboard",
      );
      router.refresh();
    }, 900);
  }

  async function signUp() {
    const normalizedEmail =
      email.trim().toLowerCase();

    if (
      !displayName.trim()
    ) {
      setError(
        "Your name is required.",
      );
      return;
    }

    if (
      !normalizedEmail ||
      !password
    ) {
      setError(
        "Email and password are required.",
      );
      return;
    }

    if (
      password.length < 8
    ) {
      setError(
        "Password must contain at least 8 characters.",
      );
      return;
    }

    setIsSubmitting(true);
    setError("");
    setMessage("");

    const supabase =
      createClient();

    const redirectUrl =
      `${window.location.origin}/accept-invite?token=${encodeURIComponent(
        token,
      )}`;

    const {
      data,
      error: signUpError,
    } =
      await supabase.auth.signUp(
        {
          email:
            normalizedEmail,
          password,
          options: {
            data: {
              display_name:
                displayName.trim(),
            },
            emailRedirectTo:
              redirectUrl,
          },
        },
      );

    if (signUpError) {
      console.error(
        "Sign up failed:",
        signUpError,
      );

      setError(
        signUpError.message ||
          "Unable to create the account.",
      );

      setIsSubmitting(false);
      return;
    }

    if (!data.session) {
      setMessage(
        "Account created. Check your email and confirm the account, then open this invitation link again.",
      );

      setIsSubmitting(false);
      return;
    }

    setCurrentEmail(
      data.user?.email ?? "",
    );

    const {
      data: acceptedRole,
      error: acceptError,
    } = await supabase.rpc(
      "accept_team_invitation",
      {
        invite_token: token,
      },
    );

    if (acceptError) {
      console.error(
        "Unable to accept invitation:",
        acceptError,
      );

      setError(
        acceptError.message ||
          "Account created, but the invitation could not be accepted.",
      );

      setIsSubmitting(false);
      return;
    }

    setMessage(
      `Invitation accepted. Your role is now ${String(
        acceptedRole,
      )}. Redirecting...`,
    );

    router.refresh();

    setTimeout(() => {
      router.replace(
        "/dashboard",
      );
      router.refresh();
    }, 900);
  }

  async function signOut() {
    const supabase =
      createClient();

    await supabase.auth.signOut();

    setCurrentEmail("");
    setError("");
    setMessage("");

    router.refresh();
  }

  if (checkingSession) {
    return (
      <div className="rounded-3xl border border-violet-100 bg-white p-8 text-center shadow-xl shadow-violet-950/5">
        <p className="text-sm text-slate-500">
          Checking your account...
        </p>
      </div>
    );
  }

  if (currentEmail) {
    return (
      <div className="overflow-hidden rounded-3xl border border-violet-100 bg-white shadow-xl shadow-violet-950/5">
        <div className="border-b border-violet-100 px-6 py-6 sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
            Team Invitation
          </p>

          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            Accept your invitation
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            You are currently signed
            in as:
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-800">
            {currentEmail}
          </p>
        </div>

        <div className="space-y-4 px-6 py-6 sm:px-8">
          <div className="rounded-2xl border border-violet-100 bg-violet-50/60 p-4">
            <p className="text-sm leading-6 text-slate-600">
              Continue only if this is
              the email address that
              received the team
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
              acceptInvitation
            }
            className="w-full rounded-xl bg-gradient-to-r from-violet-700 to-purple-500 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/15 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting
              ? "Accepting..."
              : "Accept Invitation"}
          </button>

          <button
            type="button"
            disabled={
              isSubmitting
            }
            onClick={signOut}
            className="w-full rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Use Another Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-violet-100 bg-white shadow-xl shadow-violet-950/5">
      <div className="border-b border-violet-100 px-6 py-6 sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
          7ICONS Team
        </p>

        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
          Team Invitation
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          Sign in with the invited
          email address or create a new
          account to continue.
        </p>
      </div>

      <div className="px-6 py-6 sm:px-8">
        <div className="grid grid-cols-2 rounded-xl bg-violet-50 p-1">
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setError("");
              setMessage("");
            }}
            className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
              mode === "signin"
                ? "bg-white text-violet-700 shadow-sm"
                : "text-slate-500"
            }`}
          >
            Sign In
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setError("");
              setMessage("");
            }}
            className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
              mode === "signup"
                ? "bg-white text-violet-700 shadow-sm"
                : "text-slate-500"
            }`}
          >
            Create Account
          </button>
        </div>

        <div className="mt-6 space-y-5">
          {mode ===
            "signup" && (
            <div>
              <label
                htmlFor="invite-name"
                className="text-sm font-semibold text-slate-700"
              >
                Full Name
              </label>

              <input
                id="invite-name"
                type="text"
                value={
                  displayName
                }
                onChange={(
                  event,
                ) =>
                  setDisplayName(
                    event.target
                      .value,
                  )
                }
                disabled={
                  isSubmitting
                }
                placeholder="Your name"
                className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="invite-email"
              className="text-sm font-semibold text-slate-700"
            >
              Email Address
            </label>

            <input
              id="invite-email"
              type="email"
              value={email}
              onChange={(
                event,
              ) =>
                setEmail(
                  event.target
                    .value,
                )
              }
              disabled={
                isSubmitting
              }
              placeholder="staff@example.com"
              className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            />
          </div>

          <div>
            <label
              htmlFor="invite-password"
              className="text-sm font-semibold text-slate-700"
            >
              Password
            </label>

            <input
              id="invite-password"
              type="password"
              value={password}
              onChange={(
                event,
              ) =>
                setPassword(
                  event.target
                    .value,
                )
              }
              disabled={
                isSubmitting
              }
              placeholder={
                mode ===
                "signup"
                  ? "Minimum 8 characters"
                  : "Your password"
              }
              className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
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
            type="button"
            disabled={
              isSubmitting
            }
            onClick={
              mode === "signin"
                ? signIn
                : signUp
            }
            className="w-full rounded-xl bg-gradient-to-r from-violet-700 to-purple-500 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/15 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting
              ? mode ===
                "signin"
                ? "Signing In..."
                : "Creating Account..."
              : mode ===
                  "signin"
                ? "Sign In & Accept"
                : "Create Account & Accept"}
          </button>
        </div>
      </div>
    </div>
  );
}