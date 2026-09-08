import type { Metadata } from "next";

import InviteTeamMemberButton from "@/components/team/InviteTeamMemberButton";
import ManageTeamMemberButton from "@/components/team/ManageTeamMemberButton";
import RevokeTeamInvitationButton from "@/components/team/RevokeTeamInvitationButton";

import {
  getRoleLabel,
  isAdminRole,
  type AdminRole,
} from "@/lib/permissions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Team",
};

export const dynamic = "force-dynamic";

type StaffRole =
  | "admin"
  | "editor"
  | "moderator";

type TeamMember = {
  user_id: string;
  role: AdminRole;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
};

type UserProfile = {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string;
  created_at: string;
};

type InvitationStatus =
  | "pending"
  | "accepted"
  | "revoked"
  | "expired";

type TeamInvitation = {
  id: string;
  email: string;
  role: StaffRole;
  status: InvitationStatus;
  expires_at: string;
  created_at: string;
};

function isManagedStaffRole(
  role: AdminRole,
): role is StaffRole {
  return (
    role === "admin" ||
    role === "editor" ||
    role === "moderator"
  );
}

function formatDate(
  value: string | null,
) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  ).format(new Date(value));
}

function formatDateTime(
  value: string | null,
) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(new Date(value));
}

function getInitials(
  displayName: string,
  email: string,
) {
  const source =
    displayName.trim() ||
    email.split("@")[0] ||
    "A";

  const words = source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  return (
    words
      .map((word) =>
        word
          .charAt(0)
          .toUpperCase(),
      )
      .join("") || "A"
  );
}

function getRoleBadgeClasses(
  role: AdminRole,
) {
  switch (role) {
    case "super_admin":
      return "border-violet-200 bg-violet-50 text-violet-700";

    case "admin":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "editor":
      return "border-cyan-200 bg-cyan-50 text-cyan-700";

    case "moderator":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "representative":
      return "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700";
  }
}

function getInvitationRoleLabel(
  role: StaffRole,
) {
  switch (role) {
    case "admin":
      return "Admin";

    case "editor":
      return "Editor";

    case "moderator":
      return "Moderator";
  }
}

function getInvitationRoleClasses(
  role: StaffRole,
) {
  switch (role) {
    case "admin":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "editor":
      return "border-cyan-200 bg-cyan-50 text-cyan-700";

    case "moderator":
      return "border-amber-200 bg-amber-50 text-amber-700";
  }
}

export default async function TeamPage() {
  const supabase =
    await createClient();

  const [
    {
      data: roleData,
      error: roleError,
    },
    {
      data: profileData,
      error: profileError,
    },
    {
      data: invitationData,
      error: invitationError,
    },
  ] = await Promise.all([
    supabase
      .from("admin_roles")
      .select(
        `
          user_id,
          role,
          is_active,
          created_at,
          updated_at
        `,
      )
      .order("created_at", {
        ascending: true,
      }),

    supabase
      .from("user_profiles")
      .select(
        `
          id,
          email,
          display_name,
          avatar_url,
          created_at
        `,
      ),

    supabase
      .from("team_invitations")
      .select(
        `
          id,
          email,
          role,
          status,
          expires_at,
          created_at
        `,
      )
      .order("created_at", {
        ascending: false,
      }),
  ]);

  if (roleError) {
    console.error(
      "Unable to load team roles:",
      roleError,
    );
  }

  if (profileError) {
    console.error(
      "Unable to load team profiles:",
      profileError,
    );
  }

  if (invitationError) {
    console.error(
      "Unable to load team invitations:",
      invitationError,
    );
  }

  /*
   * Team hanya untuk internal staff.
   * Representative dikelola melalui Applications.
   */
  const teamMembers =
    (roleData ?? [])
      .filter(
        (item) =>
          isAdminRole(
            item.role,
          ) &&
          item.role !==
            "representative",
      )
      .map(
        (item): TeamMember => ({
          user_id:
            item.user_id,
          role: item.role,
          is_active:
            item.is_active,
          created_at:
            item.created_at,
          updated_at:
            item.updated_at,
        }),
      );

  const profiles =
    (profileData ?? []) as UserProfile[];

  const invitations =
    (invitationData ??
      []) as TeamInvitation[];

  const profileMap = new Map(
    profiles.map((profile) => [
      profile.id,
      profile,
    ]),
  );

  const now = Date.now();

  const pendingInvitations =
    invitations.filter(
      (invitation) =>
        invitation.status ===
          "pending" &&
        new Date(
          invitation.expires_at,
        ).getTime() > now,
    );

  const totalStaff =
    teamMembers.length;

  const activeStaff =
    teamMembers.filter(
      (member) =>
        member.is_active,
    ).length;

  const inactiveStaff =
    totalStaff - activeStaff;

  const stats = [
    {
      label: "Total Staff",
      value: totalStaff,
      description:
        "Internal platform staff",
    },
    {
      label: "Active Staff",
      value: activeStaff,
      description:
        "Accounts with active access",
    },
    {
      label: "Inactive Staff",
      value: inactiveStaff,
      description:
        "Access currently disabled",
    },
    {
      label:
        "Pending Invitations",
      value:
        pendingInvitations.length,
      description:
        "Waiting for acceptance",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
            Staff Management
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            Team
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Manage internal staff,
            platform roles, access,
            and team invitations.
          </p>
        </div>

        <InviteTeamMemberButton />
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

      {/* Team Members */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                Team Members
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Internal staff with
                platform access.
              </p>
            </div>

            <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700">
              {totalStaff}{" "}
              {totalStaff === 1
                ? "Member"
                : "Members"}
            </span>
          </div>
        </div>

        {teamMembers.length >
        0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-left">
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Team Member
                  </th>

                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Role
                  </th>

                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Status
                  </th>

                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Added
                  </th>

                  <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {teamMembers.map(
                  (member) => {
                    const profile =
                      profileMap.get(
                        member.user_id,
                      );

                    const email =
                      profile?.email ||
                      "Unknown email";

                    const displayName =
                      profile?.display_name ||
                      email.split(
                        "@",
                      )[0] ||
                      "Team Member";

                    const initials =
                      getInitials(
                        displayName,
                        email,
                      );

                    return (
                      <tr
                        key={
                          member.user_id
                        }
                        className="transition hover:bg-violet-50/30"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-violet-100 bg-gradient-to-br from-violet-100 to-purple-100 text-sm font-semibold text-violet-700">
                              {profile?.avatar_url ? (
                                <div
                                  role="img"
                                  aria-label={
                                    displayName
                                  }
                                  className="absolute inset-0 bg-cover bg-center"
                                  style={{
                                    backgroundImage: `url("${profile.avatar_url}")`,
                                  }}
                                />
                              ) : (
                                initials
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-900">
                                {
                                  displayName
                                }
                              </p>

                              <p className="mt-0.5 truncate text-xs text-slate-500">
                                {email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getRoleBadgeClasses(
                              member.role,
                            )}`}
                          >
                            {getRoleLabel(
                              member.role,
                            )}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
                              member.is_active
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-slate-200 bg-slate-50 text-slate-500"
                            }`}
                          >
                            {member.is_active
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <p className="text-sm text-slate-600">
                            {formatDate(
                              member.created_at,
                            )}
                          </p>
                        </td>

                        <td className="px-6 py-4 text-right">
                          {member.role ===
                          "super_admin" ? (
                            <span className="text-xs font-medium text-slate-400">
                              Protected
                            </span>
                          ) : isManagedStaffRole(
                              member.role,
                            ) ? (
                            <ManageTeamMemberButton
                              userId={
                                member.user_id
                              }
                              userName={
                                displayName
                              }
                              currentRole={
                                member.role
                              }
                              currentIsActive={
                                member.is_active
                              }
                            />
                          ) : (
                            <span className="text-xs text-slate-400">
                              —
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-2xl text-violet-500">
              ♙
            </div>

            <h3 className="mt-4 text-base font-semibold text-slate-900">
              No staff members found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Internal staff accounts
              will appear here after
              receiving platform access.
            </p>
          </div>
        )}
      </section>

      {/* Pending Invitations */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                Pending Invitations
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Staff invitations
                waiting to be accepted.
              </p>
            </div>

            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
              {
                pendingInvitations.length
              }{" "}
              Pending
            </span>
          </div>
        </div>

        {pendingInvitations.length >
        0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-left">
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Email
                  </th>

                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Role
                  </th>

                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Status
                  </th>

                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Created
                  </th>

                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Expires
                  </th>

                  <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {pendingInvitations.map(
                  (invitation) => (
                    <tr
                      key={
                        invitation.id
                      }
                      className="transition hover:bg-violet-50/30"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {
                              invitation.email
                            }
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Staff invitation
                          </p>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getInvitationRoleClasses(
                            invitation.role,
                          )}`}
                        >
                          {getInvitationRoleLabel(
                            invitation.role,
                          )}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                          Pending
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <p className="text-sm text-slate-600">
                          {formatDateTime(
                            invitation.created_at,
                          )}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <p className="text-sm text-slate-600">
                          {formatDateTime(
                            invitation.expires_at,
                          )}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <RevokeTeamInvitationButton
                          invitationId={
                            invitation.id
                          }
                          invitationEmail={
                            invitation.email
                          }
                        />
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-14 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-xl text-violet-500">
              ✉
            </div>

            <h3 className="mt-4 text-base font-semibold text-slate-900">
              No pending invitations
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              New staff invitations will
              appear here until they are
              accepted or expire.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}