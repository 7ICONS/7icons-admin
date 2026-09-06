import type { Metadata } from "next";
import Link from "next/link";

import DeleteMemberButton from "@/components/members/DeleteMemberButton";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Members",
};

function StatusBadge({
  status,
}: {
  status: string;
}) {
  if (status === "current") {
    return (
      <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
        Current Member
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
      Former Member
    </span>
  );
}

export default async function MembersPage() {
  const supabase = await createClient();

  const { data: members, error } =
    await supabase
      .from("members")
      .select(
        `
          id,
          slug,
          name,
          member_status,
          role,
          image_url,
          short_bio,
          display_order,
          is_published,
          created_at
        `,
      )
      .order("display_order", {
        ascending: true,
      })
      .order("created_at", {
        ascending: true,
      });

  if (error) {
    return (
      <section>
        <p className="text-sm font-semibold text-violet-600">
          Member Management
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Members
        </h1>

        <div className="mt-8 rounded-2xl border border-red-100 bg-red-50 p-6">
          <p className="font-semibold text-red-700">
            Unable to load members
          </p>

          <p className="mt-2 text-sm text-red-600">
            {error.message}
          </p>
        </div>
      </section>
    );
  }

  const safeMembers = members ?? [];

  const totalMembers =
    safeMembers.length;

  const currentMembers =
    safeMembers.filter(
      (member) =>
        member.member_status ===
        "current",
    ).length;

  const formerMembers =
    safeMembers.filter(
      (member) =>
        member.member_status ===
        "former",
    ).length;

  const publishedMembers =
    safeMembers.filter(
      (member) =>
        member.is_published,
    ).length;

  return (
    <section>
      {/* Header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-violet-600">
            Member Management
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Members
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Manage current and former
            7ICONS member profiles,
            portraits, stories, and
            profile information.
          </p>
        </div>

        <Link
          href="/members/new"
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-700 to-purple-500 px-5 text-sm font-semibold text-white shadow-lg shadow-violet-500/15 transition hover:-translate-y-0.5 hover:shadow-xl"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-5 w-5"
          >
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>

          New Member
        </Link>
      </div>

      {/* Summary */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">
            Total Members
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            {totalMembers}
          </p>
        </div>

        <div className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">
            Current Members
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            {currentMembers}
          </p>
        </div>

        <div className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">
            Former Members
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            {formerMembers}
          </p>
        </div>

        <div className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">
            Published Profiles
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            {publishedMembers}
          </p>
        </div>
      </div>

      {/* Members */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-sm">
        {safeMembers.length === 0 ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center px-6 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-7 w-7"
              >
                <circle
                  cx="12"
                  cy="8"
                  r="4"
                />

                <path d="M5 21a7 7 0 0 1 14 0" />
              </svg>
            </div>

            <h2 className="mt-5 text-lg font-bold text-slate-900">
              No members yet
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              Your Members database is
              connected and ready. Add
              the first member to begin
              managing 7ICONS profiles.
            </p>

            <Link
              href="/members/new"
              className="mt-6 inline-flex h-10 items-center justify-center rounded-xl bg-violet-50 px-4 text-sm font-semibold text-violet-700 transition hover:bg-violet-100"
            >
              Add First Member
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1150px]">
              <thead className="border-b border-violet-100 bg-violet-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Member
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Role
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Published
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Order
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-violet-50">
                {safeMembers.map(
                  (member) => (
                    <tr
                      key={member.id}
                      className="transition hover:bg-violet-50/30"
                    >
                      {/* Member */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          {member.image_url ? (
                            <div
                              role="img"
                              aria-label={`${member.name} portrait`}
                              className="h-16 w-16 shrink-0 rounded-2xl border border-violet-100 bg-slate-100 bg-cover bg-center shadow-sm"
                              style={{
                                backgroundImage: `url("${member.image_url}")`,
                              }}
                            />
                          ) : (
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-dashed border-violet-200 bg-violet-50/50 text-violet-400">
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                className="h-7 w-7"
                              >
                                <circle
                                  cx="12"
                                  cy="8"
                                  r="4"
                                />

                                <path d="M5 21a7 7 0 0 1 14 0" />
                              </svg>
                            </div>
                          )}

                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800">
                              {member.name}
                            </p>

                            <p className="mt-1 max-w-[320px] truncate text-xs text-slate-400">
                              /members/
                              {member.slug}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-5">
                        <StatusBadge
                          status={
                            member.member_status
                          }
                        />
                      </td>

                      {/* Role */}
                      <td className="px-6 py-5 text-sm text-slate-600">
                        {member.role ||
                          "—"}
                      </td>

                      {/* Published */}
                      <td className="px-6 py-5">
                        {member.is_published ? (
                          <span className="inline-flex rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
                            Yes
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                            No
                          </span>
                        )}
                      </td>

                      {/* Order */}
                      <td className="px-6 py-5 text-sm font-medium text-slate-600">
                        {
                          member.display_order
                        }
                      </td>

                      {/* Actions */}
<td className="px-6 py-5">
  <div className="flex items-center justify-end gap-2">
    <Link
      href={`/members/${member.id}/edit`}
      className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-violet-100 px-3 text-xs font-semibold text-violet-700 transition hover:border-violet-200 hover:bg-violet-50"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-4 w-4"
      >
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
      </svg>

      Edit
    </Link>

    <DeleteMemberButton
      memberId={member.id}
      memberName={member.name}
      imageUrl={member.image_url}
    />
  </div>
</td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}