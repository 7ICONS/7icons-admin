import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import ApplicationReviewPanel from "@/components/applications/ApplicationReviewPanel";
import CreateRepresentativeProfileButton from "@/components/applications/CreateRepresentativeProfileButton";
import InviteRepresentativeButton from "@/components/applications/InviteRepresentativeButton";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Application Detail",
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

type AdminRole =
  | "super_admin"
  | "admin"
  | "editor"
  | "moderator"
  | "representative";

type FormDataValue =
  | string
  | number
  | boolean
  | null
  | string[]
  | number[]
  | Record<string, unknown>;

type ApplicationDetail = {
  id: string;

  application_type: ApplicationType;
  status: ApplicationStatus;

  full_name: string;
  email: string;
  phone: string | null;

  region: string | null;
  city: string | null;

  applicant_user_id: string | null;

  form_data: Record<
    string,
    FormDataValue
  >;

  review_notes: string | null;

  reviewed_by: string | null;
  reviewed_at: string | null;

  representative_id: string | null;

  created_at: string;
  updated_at: string;
};

type ReviewerProfile = {
  id: string;
  display_name: string;
  email: string;
};

type RepresentativeProfile = {
  id: string;
  user_id: string | null;
};

type RepresentativeInvitation = {
  id: string;
  status:
    | "pending"
    | "accepted"
    | "revoked"
    | "expired";
  expires_at: string;
};

type LinkedRepresentativeAccount = {
  id: string;
  display_name: string;
  email: string;
};

type ApplicationPageProps = {
  params: Promise<{
    id: string;
  }>;
};

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

function formatFieldLabel(
  key: string,
) {
  return key
    .replace(/_/g, " ")
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase(),
    );
}

function renderFormValue(
  value: FormDataValue,
) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }

  if (
    typeof value ===
    "boolean"
  ) {
    return value
      ? "Yes"
      : "No";
  }

  if (
    typeof value ===
      "string" ||
    typeof value ===
      "number"
  ) {
    return String(value);
  }

  if (
    Array.isArray(value)
  ) {
    if (
      value.length === 0
    ) {
      return "—";
    }

    return value.join(", ");
  }

  return JSON.stringify(
    value,
    null,
    2,
  );
}

export default async function ApplicationDetailPage({
  params,
}: ApplicationPageProps) {
  const { id } =
    await params;

  const supabase =
    await createClient();

  /*
   * Current authenticated admin.
   */
  const {
    data: authData,
  } =
    await supabase.auth.getUser();

  let currentAdminRole:
    | AdminRole
    | null = null;

  if (authData.user) {
    const {
      data: currentRoleData,
    } = await supabase
      .from("admin_roles")
      .select(
        `
          role,
          is_active
        `,
      )
      .eq(
        "user_id",
        authData.user.id,
      )
      .maybeSingle();

    if (
      currentRoleData?.is_active
    ) {
      currentAdminRole =
        currentRoleData.role as AdminRole;
    }
  }

  const canManageRepresentativeAccess =
    currentAdminRole ===
      "super_admin" ||
    currentAdminRole ===
      "admin";

  /*
   * Application.
   */
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
        applicant_user_id,
        form_data,
        review_notes,
        reviewed_by,
        reviewed_at,
        representative_id,
        created_at,
        updated_at
      `,
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error(
      "Unable to load application:",
      error,
    );

    return (
      <div className="space-y-6">
        <Link
          href="/applications"
          className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700 transition hover:text-violet-900"
        >
          <span>←</span>
          Back to Applications
        </Link>

        <section className="rounded-2xl border border-red-200 bg-white p-8 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-xl text-red-500">
            !
          </div>

          <h1 className="mt-5 text-xl font-semibold text-slate-950">
            Unable to load
            application
          </h1>

          <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">
            The application could not
            be loaded from the
            database. Please return to
            the application queue and
            try again.
          </p>
        </section>
      </div>
    );
  }

  if (!data) {
    notFound();
  }

  const application =
    data as ApplicationDetail;

  /*
   * Reviewer.
   */
  let reviewer:
    | ReviewerProfile
    | null = null;

  if (
    application.reviewed_by
  ) {
    const {
      data:
        reviewerData,
    } = await supabase
      .from("user_profiles")
      .select(
        `
          id,
          display_name,
          email
        `,
      )
      .eq(
        "id",
        application.reviewed_by,
      )
      .maybeSingle();

    if (reviewerData) {
      reviewer =
        reviewerData as ReviewerProfile;
    }
  }

  /*
   * Representative profile.
   */
  let representativeProfile:
    | RepresentativeProfile
    | null = null;

  if (
    application.representative_id
  ) {
    const {
      data:
        representativeData,
      error:
        representativeError,
    } = await supabase
      .from(
        "fan_representatives",
      )
      .select(
        `
          id,
          user_id
        `,
      )
      .eq(
        "id",
        application.representative_id,
      )
      .maybeSingle();

    if (representativeError) {
      console.error(
        "Unable to load representative profile:",
        representativeError,
      );
    }

    if (representativeData) {
      representativeProfile =
        representativeData as RepresentativeProfile;
    }
  }

  /*
   * Linked Representative account.
   */
  let linkedRepresentativeAccount:
    | LinkedRepresentativeAccount
    | null = null;

  if (
    representativeProfile?.user_id
  ) {
    const {
      data:
        accountData,
    } = await supabase
      .from("user_profiles")
      .select(
        `
          id,
          display_name,
          email
        `,
      )
      .eq(
        "id",
        representativeProfile.user_id,
      )
      .maybeSingle();

    if (accountData) {
      linkedRepresentativeAccount =
        accountData as LinkedRepresentativeAccount;
    }
  }

  /*
   * Pending invitation hanya perlu dibaca
   * Super Admin / Admin.
   *
   * Editor tidak memiliki RLS access ke
   * representative_invitations.
   */
  let pendingRepresentativeInvitation:
    | RepresentativeInvitation
    | null = null;

  if (
    canManageRepresentativeAccess &&
    application.representative_id &&
    !representativeProfile?.user_id
  ) {
    const {
      data:
        invitationData,
      error:
        invitationError,
    } = await supabase
      .from(
        "representative_invitations",
      )
      .select(
        `
          id,
          status,
          expires_at
        `,
      )
      .eq(
        "representative_id",
        application.representative_id,
      )
      .eq(
        "status",
        "pending",
      )
      .maybeSingle();

    if (invitationError) {
      console.error(
        "Unable to load representative invitation:",
        invitationError,
      );
    }

    if (invitationData) {
      pendingRepresentativeInvitation =
        invitationData as RepresentativeInvitation;
    }
  }

  const initials =
    getInitials(
      application.full_name,
    );

  const formEntries =
    Object.entries(
      application.form_data ??
        {},
    );

  const reviewerName =
    reviewer?.display_name ||
    reviewer?.email ||
    "Staff Member";

  const isRepresentativeApplication =
    application.application_type ===
    "representative";

  const canCreateRepresentativeProfile =
    isRepresentativeApplication &&
    application.status ===
      "approved" &&
    !application.representative_id;

  const hasRepresentativeProfile =
    isRepresentativeApplication &&
    Boolean(
      application.representative_id,
    );

  const hasLinkedRepresentativeAccount =
    Boolean(
      representativeProfile?.user_id,
    );

  const hasPendingRepresentativeInvitation =
    Boolean(
      pendingRepresentativeInvitation,
    );

  const pendingInvitationExpired =
    pendingRepresentativeInvitation
      ? new Date(
          pendingRepresentativeInvitation.expires_at,
        ).getTime() <=
        Date.now()
      : false;

  return (
    <div className="space-y-8">
      {/* Back */}
      <div>
        <Link
          href="/applications"
          className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700 transition hover:text-violet-900"
        >
          <span>←</span>
          Back to Applications
        </Link>
      </div>

      {/* Header */}
      <section className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
            Application Detail
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            {
              application.full_name
            }
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Review applicant
            information, application
            responses, and the current
            review decision.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold ${getApplicationTypeClasses(
              application.application_type,
            )}`}
          >
            {getApplicationTypeLabel(
              application.application_type,
            )}
          </span>

          <span
            className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusClasses(
              application.status,
            )}`}
          >
            {getStatusLabel(
              application.status,
            )}
          </span>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
        {/* LEFT */}
        <div className="space-y-6">
          {/* Applicant */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5">
              <h2 className="text-lg font-semibold text-slate-950">
                Applicant Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Contact and regional
                information submitted
                by the applicant.
              </p>
            </div>

            <div className="p-6">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-100 to-purple-100 text-lg font-semibold text-violet-700">
                  {initials}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xl font-semibold text-slate-950">
                    {
                      application.full_name
                    }
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {getApplicationTypeLabel(
                      application.application_type,
                    )}
                  </p>
                </div>
              </div>

              <div className="mt-7 grid gap-5 border-t border-slate-100 pt-6 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Email
                  </p>

                  <p className="mt-2 break-all text-sm font-medium text-slate-700">
                    {
                      application.email
                    }
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Phone
                  </p>

                  <p className="mt-2 text-sm font-medium text-slate-700">
                    {application.phone ||
                      "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                    City
                  </p>

                  <p className="mt-2 text-sm font-medium text-slate-700">
                    {application.city ||
                      "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Region
                  </p>

                  <p className="mt-2 text-sm font-medium text-slate-700">
                    {application.region ||
                      "—"}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Application Responses */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5">
              <h2 className="text-lg font-semibold text-slate-950">
                Application Responses
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Additional information
                submitted for this
                application type.
              </p>
            </div>

            {formEntries.length >
            0 ? (
              <div className="divide-y divide-slate-100">
                {formEntries.map(
                  ([
                    key,
                    value,
                  ]) => (
                    <div
                      key={key}
                      className="px-6 py-5"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                        {formatFieldLabel(
                          key,
                        )}
                      </p>

                      {typeof value ===
                        "object" &&
                      value !== null &&
                      !Array.isArray(
                        value,
                      ) ? (
                        <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                          {renderFormValue(
                            value,
                          )}
                        </pre>
                      ) : (
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                          {renderFormValue(
                            value,
                          )}
                        </p>
                      )}
                    </div>
                  ),
                )}
              </div>
            ) : (
              <div className="px-6 py-12 text-center">
                <p className="text-sm text-slate-500">
                  No additional
                  application responses
                  were submitted.
                </p>
              </div>
            )}
          </section>

          {/* Review Information */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5">
              <h2 className="text-lg font-semibold text-slate-950">
                Review Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Current administrative
                review information for
                this submission.
              </p>
            </div>

            <div className="grid gap-5 p-6 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Reviewed By
                </p>

                <p className="mt-2 text-sm font-medium text-slate-700">
                  {application.reviewed_by
                    ? reviewerName
                    : "Not reviewed yet"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Reviewed At
                </p>

                <p className="mt-2 text-sm font-medium text-slate-700">
                  {formatDateTime(
                    application.reviewed_at,
                  )}
                </p>
              </div>

              <div className="sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Internal Notes
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                  {application.review_notes ||
                    "No internal review notes yet."}
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT */}
        <aside className="space-y-6">
          <ApplicationReviewPanel
            applicationId={
              application.id
            }
            currentStatus={
              application.status
            }
            currentReviewNotes={
              application.review_notes
            }
          />

          {/* Representative Onboarding */}
          {isRepresentativeApplication && (
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">
                  Representative
                  Onboarding
                </p>

                <h2 className="mt-2 text-lg font-semibold text-slate-950">
                  Fan Representative
                  Profile
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Continue an approved
                  representative
                  application into the
                  Fan Representative
                  system.
                </p>
              </div>

              <div className="p-6">
                {canCreateRepresentativeProfile ? (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                      <p className="text-sm font-semibold text-emerald-800">
                        Ready for
                        Onboarding
                      </p>

                      <p className="mt-2 text-xs leading-5 text-emerald-700/80">
                        This application
                        is approved and
                        can now be
                        converted into a
                        draft ICONIA Fan
                        Representative
                        profile.
                      </p>
                    </div>

                    <CreateRepresentativeProfileButton
                      applicationId={
                        application.id
                      }
                      applicantName={
                        application.full_name
                      }
                    />
                  </div>
                ) : hasRepresentativeProfile ? (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                      <p className="text-sm font-semibold text-emerald-800">
                        Profile Created
                      </p>

                      <p className="mt-2 text-xs leading-5 text-emerald-700/80">
                        This application
                        is already linked
                        to an ICONIA Fan
                        Representative
                        profile.
                      </p>
                    </div>

                    <Link
                      href={`/representatives/${application.representative_id}/edit`}
                      className="flex w-full items-center justify-center rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm font-semibold text-violet-700 transition hover:border-violet-300 hover:bg-violet-100"
                    >
                      Edit Representative
                      Profile
                    </Link>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm font-semibold text-amber-800">
                      Approval Required
                    </p>

                    <p className="mt-2 text-xs leading-5 text-amber-700/80">
                      The application
                      must be approved
                      before a Fan
                      Representative
                      profile can be
                      created.
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Representative Account */}
          {hasRepresentativeProfile && (
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">
                  Representative Access
                </p>

                <h2 className="mt-2 text-lg font-semibold text-slate-950">
                  Representative Account
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Manage the platform
                  account linked to this
                  Representative
                  profile.
                </p>
              </div>

              <div className="space-y-4 p-6">
                {hasLinkedRepresentativeAccount ? (
                  <>
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                          ✓
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-emerald-800">
                            Account Linked
                          </p>

                          <p className="mt-1 text-xs leading-5 text-emerald-700/80">
                            This
                            Representative
                            profile is
                            connected to
                            an active
                            platform
                            account.
                          </p>
                        </div>
                      </div>
                    </div>

                    {linkedRepresentativeAccount && (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                          Linked Account
                        </p>

                        <p className="mt-2 text-sm font-semibold text-slate-800">
                          {linkedRepresentativeAccount.display_name ||
                            application.full_name}
                        </p>

                        <p className="mt-1 break-all text-xs text-slate-500">
                          {
                            linkedRepresentativeAccount.email
                          }
                        </p>

                        <div className="mt-3">
                          <span className="inline-flex rounded-full border border-fuchsia-200 bg-fuchsia-50 px-2.5 py-1 text-xs font-semibold text-fuchsia-700">
                            ICONIA
                            Representative
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {hasPendingRepresentativeInvitation &&
                    !pendingInvitationExpired ? (
                      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                        <p className="text-sm font-semibold text-amber-800">
                          Waiting for
                          Acceptance
                        </p>

                        <p className="mt-2 text-xs leading-5 text-amber-700/80">
                          A Representative
                          invitation is
                          currently
                          pending for this
                          applicant.
                        </p>

                        {pendingRepresentativeInvitation && (
                          <p className="mt-3 text-xs text-amber-700/80">
                            Expires{" "}
                            <span className="font-semibold">
                              {formatDateTime(
                                pendingRepresentativeInvitation.expires_at,
                              )}
                            </span>
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-violet-100 bg-violet-50/60 p-4">
                        <p className="text-sm font-semibold text-violet-800">
                          Account Not
                          Linked
                        </p>

                        <p className="mt-2 text-xs leading-5 text-violet-700/80">
                          The
                          Representative
                          profile exists,
                          but no platform
                          account has
                          been connected
                          yet.
                        </p>
                      </div>
                    )}

                    {canManageRepresentativeAccess ? (
                      <InviteRepresentativeButton
                        applicationId={
                          application.id
                        }
                        representativeId={
                          application.representative_id!
                        }
                        applicantName={
                          application.full_name
                        }
                        applicantEmail={
                          application.email
                        }
                      />
                    ) : (
                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <p className="text-xs leading-5 text-slate-500">
                          Representative
                          account access
                          can only be
                          managed by a
                          Super Admin or
                          Admin.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </section>
          )}

          {/* Submission Info */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">
              Submission
            </p>

            <h2 className="mt-2 text-lg font-semibold text-slate-950">
              Application Record
            </h2>

            <div className="mt-5 space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Application ID
                </p>

                <p className="mt-2 break-all font-mono text-xs leading-5 text-slate-600">
                  {
                    application.id
                  }
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Submitted
                </p>

                <p className="mt-2 text-sm text-slate-700">
                  {formatDateTime(
                    application.created_at,
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Last Updated
                </p>

                <p className="mt-2 text-sm text-slate-700">
                  {formatDateTime(
                    application.updated_at,
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Applicant Account
                </p>

                <p className="mt-2 text-sm text-slate-700">
                  {application.applicant_user_id
                    ? "Linked User"
                    : "Guest Application"}
                </p>
              </div>

              {application.representative_id && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Representative
                    Profile
                  </p>

                  <p className="mt-2 break-all font-mono text-xs leading-5 text-slate-600">
                    {
                      application.representative_id
                    }
                  </p>
                </div>
              )}

              {representativeProfile?.user_id && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Representative
                    Account
                  </p>

                  <p className="mt-2 break-all font-mono text-xs leading-5 text-slate-600">
                    {
                      representativeProfile.user_id
                    }
                  </p>
                </div>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}