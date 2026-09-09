import type { Metadata } from "next";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Applications",
};

export const dynamic = "force-dynamic";

type ApplicationType =
  | "representative"
  | "volunteer"
  | "community"
  | "event";

type ApplicationStatus =
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "withdrawn";

type Application = {
  id: string;
  application_type: ApplicationType;
  status: ApplicationStatus;

  full_name: string;
  email: string;
  phone: string | null;

  region: string | null;
  city: string | null;

  created_at: string;
  updated_at: string;
};

function formatDate(
  value: string,
) {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  ).format(new Date(value));
}

function getApplicationTypeLabel(
  type: ApplicationType,
) {
  switch (type) {
    case "representative":
      return "ICONIA Representative";

    case "volunteer":
      return "Volunteer";

    case "community":
      return "Community Registration";

    case "event":
      return "Event Application";
  }
}

function getApplicationTypeClasses(
  type: ApplicationType,
) {
  switch (type) {
    case "representative":
      return "border-violet-200 bg-violet-50 text-violet-700";

    case "volunteer":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "community":
      return "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700";

    case "event":
      return "border-cyan-200 bg-cyan-50 text-cyan-700";
  }
}

function getStatusLabel(
  status: ApplicationStatus,
) {
  switch (status) {
    case "submitted":
      return "Submitted";

    case "under_review":
      return "Under Review";

    case "approved":
      return "Approved";

    case "rejected":
      return "Rejected";

    case "withdrawn":
      return "Withdrawn";
  }
}

function getStatusClasses(
  status: ApplicationStatus,
) {
  switch (status) {
    case "submitted":
      return "border-violet-200 bg-violet-50 text-violet-700";

    case "under_review":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "approved":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "rejected":
      return "border-red-200 bg-red-50 text-red-700";

    case "withdrawn":
      return "border-slate-200 bg-slate-100 text-slate-600";
  }
}

function getInitials(
  fullName: string,
) {
  const words = fullName
    .trim()
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

export default async function ApplicationsPage() {
  const supabase =
    await createClient();

  const {
    data,
    error,
  } = await supabase
    .from("applications")
    .select(
      `
        id,
        application_type,
        status,
        full_name,
        email,
        phone,
        region,
        city,
        created_at,
        updated_at
      `,
    )
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "Unable to load applications:",
      error,
    );
  }

  const applications =
    (data ?? []) as Application[];

  const totalApplications =
    applications.length;

  const submittedApplications =
    applications.filter(
      (application) =>
        application.status ===
        "submitted",
    ).length;

  const underReviewApplications =
    applications.filter(
      (application) =>
        application.status ===
        "under_review",
    ).length;

  const approvedApplications =
    applications.filter(
      (application) =>
        application.status ===
        "approved",
    ).length;

  const stats = [
    {
      label: "Total Applications",
      value: totalApplications,
      description:
        "All community applications",
    },
    {
      label: "New Submissions",
      value: submittedApplications,
      description:
        "Waiting for initial review",
    },
    {
      label: "Under Review",
      value: underReviewApplications,
      description:
        "Currently being evaluated",
    },
    {
      label: "Approved",
      value: approvedApplications,
      description:
        "Applications accepted",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
            Community Management
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            Applications
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Review applications
            submitted through the
            7ICONS Applications Hub,
            including ICONIA
            Representative, Volunteer,
            Community, and Event
            applications.
          </p>
        </div>

        <div className="rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-xs font-semibold text-violet-700">
          {totalApplications}{" "}
          {totalApplications === 1
            ? "Application"
            : "Applications"}
        </div>
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

      {/* Applications */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                Application Queue
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Review incoming
                applications and track
                their current status.
              </p>
            </div>

            <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700">
              {submittedApplications}{" "}
              New
            </span>
          </div>
        </div>

        {error ? (
          <div className="px-6 py-14 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-xl text-red-500">
              !
            </div>

            <h3 className="mt-4 text-base font-semibold text-slate-900">
              Unable to load
              applications
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              The applications database
              could not be loaded.
              Please refresh the page
              and try again.
            </p>
          </div>
        ) : applications.length >
          0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-left">
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Applicant
                  </th>

                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Application
                  </th>

                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Location
                  </th>

                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Status
                  </th>

                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Submitted
                  </th>

                  <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {applications.map(
                  (application) => {
                    const initials =
                      getInitials(
                        application.full_name,
                      );

                    const location =
                      [
                        application.city,
                        application.region,
                      ]
                        .filter(Boolean)
                        .join(", ");

                    return (
                      <tr
                        key={
                          application.id
                        }
                        className="transition hover:bg-violet-50/30"
                      >
                        {/* Applicant */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-violet-100 bg-gradient-to-br from-violet-100 to-purple-100 text-sm font-semibold text-violet-700">
                              {
                                initials
                              }
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-900">
                                {
                                  application.full_name
                                }
                              </p>

                              <p className="mt-0.5 truncate text-xs text-slate-500">
                                {
                                  application.email
                                }
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Type */}
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getApplicationTypeClasses(
                              application.application_type,
                            )}`}
                          >
                            {getApplicationTypeLabel(
                              application.application_type,
                            )}
                          </span>
                        </td>

                        {/* Location */}
                        <td className="px-4 py-4">
                          <p className="text-sm text-slate-600">
                            {location ||
                              "—"}
                          </p>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                              application.status,
                            )}`}
                          >
                            {getStatusLabel(
                              application.status,
                            )}
                          </span>
                        </td>

                        {/* Submitted */}
                        <td className="px-4 py-4">
                          <p className="text-sm text-slate-600">
                            {formatDate(
                              application.created_at,
                            )}
                          </p>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/applications/${application.id}`}
                            className="inline-flex items-center justify-center rounded-lg border border-violet-200 bg-white px-3 py-2 text-xs font-semibold text-violet-700 transition hover:border-violet-300 hover:bg-violet-50"
                          >
                            View
                          </Link>
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
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-7 w-7"
              >
                <rect
                  x="5"
                  y="4"
                  width="14"
                  height="17"
                  rx="2"
                />

                <path d="M9 4.5V3h6v1.5" />
                <path d="M8 9h8" />
                <path d="M8 13h8" />
                <path d="M8 17h5" />
              </svg>
            </div>

            <h3 className="mt-4 text-base font-semibold text-slate-900">
              No applications yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Applications submitted
              through the 7ICONS
              Applications Hub will
              appear here for review.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}