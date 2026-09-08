import type { Metadata } from "next";

import UserStatusActions from "@/components/users/UserStatusActions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Users",
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
};

type AdminRole = {
  user_id: string;
  role: string;
  is_active: boolean;
};

function formatDate(value: string | null) {
  if (!value) {
    return "Never";
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
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

  return words
    .map((word) =>
      word.charAt(0).toUpperCase(),
    )
    .join("");
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
  }
}

function getRoleClasses(role?: string) {
  if (!role) {
    return "border-slate-200 bg-slate-50 text-slate-600";
  }

  return "border-violet-200 bg-violet-50 text-violet-700";
}

function canModerateUsers(role?: string) {
  return (
    role === "super_admin" ||
    role === "admin" ||
    role === "moderator"
  );
}

export default async function UsersPage() {
  const supabase = await createClient();

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  const [
    { data: userData, error: userError },
    { data: roleData, error: roleError },
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
          created_at
        `,
      )
      .order("created_at", {
        ascending: false,
      }),

    supabase
      .from("admin_roles")
      .select(
        `
          user_id,
          role,
          is_active
        `,
      ),
  ]);

  if (userError) {
    console.error(
      "Unable to load users:",
      userError,
    );
  }

  if (roleError) {
    console.error(
      "Unable to load admin roles:",
      roleError,
    );
  }

  const users =
    (userData ?? []) as UserProfile[];

  const adminRoles =
    (roleData ?? []) as AdminRole[];

  const activeRoleMap = new Map(
    adminRoles
      .filter((item) => item.is_active)
      .map((item) => [
        item.user_id,
        item.role,
      ]),
  );

  const currentAdminRole = currentUser
    ? activeRoleMap.get(currentUser.id)
    : undefined;

  const currentAdminCanModerate =
    canModerateUsers(currentAdminRole);

  const totalUsers = users.length;

  const activeUsers = users.filter(
    (user) => user.status === "active",
  ).length;

  const adminUsers = users.filter((user) =>
    activeRoleMap.has(user.id),
  ).length;

  const regularUsers =
    totalUsers - adminUsers;

  const stats = [
    {
      label: "Total Users",
      value: totalUsers,
      description:
        "All registered accounts",
    },
    {
      label: "Active Users",
      value: activeUsers,
      description:
        "Accounts in active status",
    },
    {
      label: "Admin Users",
      value: adminUsers,
      description:
        "Active admin role accounts",
    },
    {
      label: "Regular Users",
      value: regularUsers,
      description:
        "Standard community accounts",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
          User Management
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
          Users
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          View registered user accounts,
          account status, admin roles, and
          recent sign-in information.
        </p>
      </section>

      {/* Summary */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-medium text-slate-500">
              {stat.label}
            </p>

            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              {stat.value}
            </p>

            <p className="mt-2 text-xs leading-5 text-slate-400">
              {stat.description}
            </p>
          </div>
        ))}
      </section>

      {/* Users Table */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                Registered Users
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Accounts synchronized from
                Supabase Authentication.
              </p>
            </div>

            <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700">
              {totalUsers}{" "}
              {totalUsers === 1
                ? "User"
                : "Users"}
            </span>
          </div>
        </div>

        {users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-left">
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    User
                  </th>

                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Role
                  </th>

                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Status
                  </th>

                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Last Sign In
                  </th>

                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Joined
                  </th>

                  <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {users.map((user) => {
                  const role =
                    activeRoleMap.get(user.id);

                  const isAdmin =
                    Boolean(role);

                  const isCurrentUser =
                    currentUser?.id ===
                    user.id;

                  const initials =
                    getInitials(
                      user.display_name,
                      user.email,
                    );

                  const userLabel =
                    user.display_name ||
                    user.email;

                  const canManage =
                    currentAdminCanModerate &&
                    !isAdmin &&
                    !isCurrentUser;

                  return (
                    <tr
                      key={user.id}
                      className="transition hover:bg-violet-50/30"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-violet-100 bg-gradient-to-br from-violet-100 to-purple-100 text-sm font-semibold text-violet-700">
                            {user.avatar_url ? (
                              <div
                                role="img"
                                aria-label={
                                  userLabel
                                }
                                className="absolute inset-0 bg-cover bg-center"
                                style={{
                                  backgroundImage: `url("${user.avatar_url}")`,
                                }}
                              />
                            ) : (
                              initials
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="truncate text-sm font-semibold text-slate-900">
                                {user.display_name ||
                                  "Unnamed User"}
                              </p>

                              {isCurrentUser && (
                                <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-violet-600">
                                  You
                                </span>
                              )}
                            </div>

                            <p className="mt-0.5 truncate text-xs text-slate-500">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getRoleClasses(
                            role,
                          )}`}
                        >
                          {formatRole(role)}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${getStatusClasses(
                            user.status,
                          )}`}
                        >
                          {user.status}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <p className="text-sm text-slate-700">
                          {formatDateTime(
                            user.last_sign_in_at,
                          )}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <p className="text-sm text-slate-600">
                          {formatDate(
                            user.created_at,
                          )}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-right">
                        {canManage ? (
                          <UserStatusActions
                            userId={user.id}
                            userName={
                              userLabel
                            }
                            currentStatus={
                              user.status
                            }
                          />
                        ) : isAdmin ? (
                          <span className="text-xs font-medium text-slate-400">
                            Protected
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-2xl text-violet-500">
              ♙
            </div>

            <h3 className="mt-4 text-base font-semibold text-slate-900">
              No users found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Registered accounts will
              appear here automatically
              after they are synchronized
              from Supabase Authentication.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}