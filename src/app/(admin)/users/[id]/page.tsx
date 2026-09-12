import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import UserStatusActions from "@/components/users/UserStatusActions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "User Details",
};

export const dynamic = "force-dynamic";

type UserStatus =
  | "active"
  | "suspended"
  | "banned";

type UserProfile = {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string;
  status: UserStatus;
  last_sign_in_at: string | null;
  created_at: string;
  updated_at: string;
};

type CommunityProfile = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  avatar_path: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
};

type AdminRole = {
  user_id: string;
  role: string;
  is_active: boolean;
};

type UserDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatDate(value: string | null) {
  if (!value) {
    return "Never";
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "Never";
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatRole(role?: string) {
  if (!role) {
    return "User";
  }

  if (role === "representative") {
    return "Representative";
  }

  return role
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1),
    )
    .join(" ");
}

function getInitials(
  displayName: string,
  email: string,
) {
  const source =
    displayName.trim() ||
    email.split("@")[0] ||
    "U";

  const words = source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  return (
    words
      .map((word) =>
        word.charAt(0).toUpperCase(),
      )
      .join("") || "U"
  );
}

function getStatusClasses(
  status: UserStatus,
) {
  switch (status) {
    case "active":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "suspended":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "banned":
      return "border-red-200 bg-red-50 text-red-700";

    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
}

function getRoleClasses(role?: string) {
  switch (role) {
    case "super_admin":
      return "border-purple-200 bg-purple-50 text-purple-700";

    case "admin":
      return "border-violet-200 bg-violet-50 text-violet-700";

    case "editor":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "moderator":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "representative":
      return "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700";

    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
}

function canModerateUsers(role?: string) {
  return (
    role === "super_admin" ||
    role === "admin" ||
    role === "moderator"
  );
}

export default async function UserDetailsPage({
  params,
}: UserDetailsPageProps) {
  const { id } = await params;

  const supabase = await createClient();

  /*
   * =========================================================
   * CURRENT ADMIN
   * =========================================================
   */
  const {
    data: claimsData,
  } = await supabase.auth.getClaims();

  const currentUserId =
    claimsData?.claims?.sub;

  /*
   * =========================================================
   * LOAD USER DATA
   * =========================================================
   */
  const [
    accountResult,
    profileResult,
    roleResult,
  ] = await Promise.all([
    supabase
      .from("user_profiles")
      .select(
        `
          id,
          email,
          display_name,
          avatar_url,
          status,
          last_sign_in_at,
          created_at,
          updated_at
        `,
      )
      .eq("id", id)
      .maybeSingle(),

    supabase
      .from("profiles")
      .select(
        `
          id,
          username,
          full_name,
          avatar_url,
          avatar_path,
          bio,
          created_at,
          updated_at
        `,
      )
      .eq("id", id)
      .maybeSingle(),

    supabase.rpc(
      "get_user_role_directory",
    ),
  ]);

  if (accountResult.error) {
    console.error(
      "Unable to load user account:",
      accountResult.error,
    );
  }

  if (profileResult.error) {
    console.error(
      "Unable to load community profile:",
      profileResult.error,
    );
  }

  if (roleResult.error) {
    console.error(
      "Unable to load role directory:",
      roleResult.error,
    );
  }

  const account =
    accountResult.data as UserProfile | null;

  const profile =
    profileResult.data as CommunityProfile | null;

  if (!account) {
    notFound();
  }

  const roles =
    (roleResult.data ??
      []) as AdminRole[];

  const activeRoles =
    roles.filter(
      (item) => item.is_active,
    );

  const roleMap =
    new Map<string, string>(
      activeRoles.map(
        (item) => [
          item.user_id,
          item.role,
        ],
      ),
    );

  const role =
    roleMap.get(account.id);

  const currentAdminRole =
    currentUserId
      ? roleMap.get(currentUserId)
      : undefined;

  const isCurrentUser =
    currentUserId === account.id;

  const hasRole =
    Boolean(role);

  const canManage =
    canModerateUsers(
      currentAdminRole,
    ) &&
    !hasRole &&
    !isCurrentUser;

  const displayName =
    profile?.full_name ||
    account.display_name ||
    account.email;

  const avatarUrl =
    profile?.avatar_url ||
    account.avatar_url ||
    null;

  const initials =
    getInitials(
      displayName,
      account.email,
    );

  return (
    <div className="space-y-8">
      {/* =========================
          TOP NAVIGATION
      ========================= */}
      <section>
        <Link
          href="/users"
          className="inline-flex items-center text-sm font-semibold text-violet-600 transition hover:text-violet-800"
        >
          ← Back to Users
        </Link>
      </section>

      {/* =========================
          PROFILE HEADER
      ========================= */}
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="h-36 bg-gradient-to-r from-violet-700 via-purple-600 to-fuchsia-500" />

        <div className="px-6 pb-7 sm:px-8">
          <div className="-mt-16 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
              {/* Avatar */}
              <div className="relative flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-gradient-to-br from-violet-100 to-purple-100 text-3xl font-semibold text-violet-700 shadow-lg">
                {avatarUrl ? (
                  <div
                    role="img"
                    aria-label={displayName}
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: `url("${avatarUrl}")`,
                    }}
                  />
                ) : (
                  initials
                )}
              </div>

              {/* Identity */}
              <div className="pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
                    {displayName}
                  </h1>

                  {profile && (
                    <span className="rounded-full border border-fuchsia-200 bg-fuchsia-50 px-2.5 py-1 text-xs font-semibold text-fuchsia-700">
                      ICONIA
                    </span>
                  )}

                  {isCurrentUser && (
                    <span className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
                      You
                    </span>
                  )}
                </div>

                {profile?.username && (
                  <p className="mt-1 text-sm font-semibold text-violet-600">
                    @{profile.username}
                  </p>
                )}

                <p className="mt-1 text-sm text-slate-500">
                  {account.email}
                </p>
              </div>
            </div>

            {/* Moderation */}
            <div className="pb-1">
              {canManage ? (
                <UserStatusActions
                  userId={account.id}
                  userName={displayName}
                  currentStatus={
                    account.status
                  }
                />
              ) : hasRole ? (
                <span className="inline-flex rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-500">
                  Protected Account
                </span>
              ) : isCurrentUser ? (
                <span className="inline-flex rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-500">
                  Current Account
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          STATUS SUMMARY
      ========================= */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
            Account Status
          </p>

          <div className="mt-3">
            <span
              className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getStatusClasses(
                account.status,
              )}`}
            >
              {account.status}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
            Role
          </p>

          <div className="mt-3">
            <span
              className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getRoleClasses(
                role,
              )}`}
            >
              {formatRole(role)}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
            Joined
          </p>

          <p className="mt-3 text-sm font-semibold text-slate-900">
            {formatDate(
              account.created_at,
            )}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
            Last Sign In
          </p>

          <p className="mt-3 text-sm font-semibold text-slate-900">
            {formatDateTime(
              account.last_sign_in_at,
            )}
          </p>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        {/* =========================
            COMMUNITY PROFILE
        ========================= */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
            ICONIA Profile
          </p>

          <h2 className="mt-2 text-xl font-semibold text-slate-950">
            Community Profile
          </h2>

          {profile ? (
            <div className="mt-6 divide-y divide-slate-100">
              <div className="py-4 first:pt-0">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Full Name
                </p>

                <p className="mt-2 text-sm font-medium text-slate-900">
                  {profile.full_name ||
                    "Not set"}
                </p>
              </div>

              <div className="py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Username
                </p>

                <p className="mt-2 text-sm font-medium text-slate-900">
                  {profile.username
                    ? `@${profile.username}`
                    : "Not set"}
                </p>
              </div>

              <div className="py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Bio
                </p>

                <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-700">
                  {profile.bio ||
                    "No bio provided."}
                </p>
              </div>

              <div className="py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Profile Created
                </p>

                <p className="mt-2 text-sm text-slate-700">
                  {formatDateTime(
                    profile.created_at,
                  )}
                </p>
              </div>

              <div className="py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Profile Updated
                </p>

                <p className="mt-2 text-sm text-slate-700">
                  {formatDateTime(
                    profile.updated_at,
                  )}
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center">
              <p className="text-sm font-semibold text-slate-700">
                No ICONIA profile
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                This account does not
                currently have a community
                profile.
              </p>
            </div>
          )}
        </section>

        {/* =========================
            ACCOUNT INFORMATION
        ========================= */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
            Account
          </p>

          <h2 className="mt-2 text-xl font-semibold text-slate-950">
            Account Information
          </h2>

          <div className="mt-6 divide-y divide-slate-100">
            <div className="py-4 first:pt-0">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                User ID
              </p>

              <p className="mt-2 break-all font-mono text-xs text-slate-700">
                {account.id}
              </p>
            </div>

            <div className="py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                Email Address
              </p>

              <p className="mt-2 break-all text-sm font-medium text-slate-900">
                {account.email}
              </p>
            </div>

            <div className="py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                Admin Display Name
              </p>

              <p className="mt-2 text-sm text-slate-700">
                {account.display_name ||
                  "Not set"}
              </p>
            </div>

            <div className="py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                Last Sign In
              </p>

              <p className="mt-2 text-sm text-slate-700">
                {formatDateTime(
                  account.last_sign_in_at,
                )}
              </p>
            </div>

            <div className="py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                Account Updated
              </p>

              <p className="mt-2 text-sm text-slate-700">
                {formatDateTime(
                  account.updated_at,
                )}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}