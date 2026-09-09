"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

type ApplicationStatus =
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "withdrawn";

type ApplicationReviewPanelProps = {
  applicationId: string;
  currentStatus: ApplicationStatus;
  currentReviewNotes: string | null;
};

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

export default function ApplicationReviewPanel({
  applicationId,
  currentStatus,
  currentReviewNotes,
}: ApplicationReviewPanelProps) {
  const router = useRouter();

  const [reviewNotes, setReviewNotes] =
    useState(
      currentReviewNotes ?? "",
    );

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [activeAction, setActiveAction] =
    useState<ApplicationStatus | null>(
      null,
    );

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  async function updateApplication(
    nextStatus:
      | "under_review"
      | "approved"
      | "rejected",
  ) {
    setIsSubmitting(true);
    setActiveAction(nextStatus);
    setError("");
    setSuccess("");

    const supabase =
      createClient();

    const {
      error: reviewError,
    } = await supabase.rpc(
      "review_application",
      {
        p_application_id:
          applicationId,
        p_status:
          nextStatus,
        p_review_notes:
          reviewNotes.trim() ||
          null,
      },
    );

    if (reviewError) {
      console.error(
        "Unable to review application:",
        reviewError,
      );

      setError(
        reviewError.message ||
          "Unable to update this application.",
      );

      setIsSubmitting(false);
      setActiveAction(null);

      return;
    }

    setSuccess(
      `Application updated to ${getStatusLabel(
        nextStatus,
      )}.`,
    );

    setIsSubmitting(false);
    setActiveAction(null);

    router.refresh();
  }

  if (
    currentStatus ===
    "withdrawn"
  ) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Review
        </p>

        <h2 className="mt-2 text-lg font-semibold text-slate-950">
          Application Withdrawn
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          This application was
          withdrawn by the applicant
          and can no longer be reviewed.
        </p>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-slate-200 px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">
          Application Review
        </p>

        <h2 className="mt-2 text-lg font-semibold text-slate-950">
          Review Decision
        </h2>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          Add internal notes and
          update the application's
          review status.
        </p>
      </div>

      <div className="space-y-6 px-6 py-6">
        {/* Current Status */}
        <div className="rounded-2xl border border-violet-100 bg-violet-50/50 px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-violet-600">
            Current Status
          </p>

          <p className="mt-2 text-sm font-semibold text-slate-900">
            {getStatusLabel(
              currentStatus,
            )}
          </p>
        </div>

        {/* Notes */}
        <div>
          <label
            htmlFor="review-notes"
            className="text-sm font-semibold text-slate-700"
          >
            Internal Review Notes
          </label>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            These notes are for
            internal staff and are not
            shown publicly.
          </p>

          <textarea
            id="review-notes"
            value={reviewNotes}
            disabled={isSubmitting}
            onChange={(event) =>
              setReviewNotes(
                event.target.value,
              )
            }
            placeholder="Add notes about this application..."
            rows={6}
            className="mt-3 w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:ring-4 focus:ring-violet-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-70"
          />
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-700">
            {success}
          </div>
        )}

        {/* Review Actions */}
        <div className="space-y-3">
          {currentStatus ===
            "submitted" && (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() =>
                updateApplication(
                  "under_review",
                )
              }
              className="flex w-full items-center justify-center rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700 transition hover:border-amber-300 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {activeAction ===
              "under_review"
                ? "Starting Review..."
                : "Start Review"}
            </button>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              disabled={
                isSubmitting ||
                currentStatus ===
                  "approved"
              }
              onClick={() =>
                updateApplication(
                  "approved",
                )
              }
              className="flex items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {activeAction ===
              "approved"
                ? "Approving..."
                : currentStatus ===
                    "approved"
                  ? "Approved"
                  : "Approve"}
            </button>

            <button
              type="button"
              disabled={
                isSubmitting ||
                currentStatus ===
                  "rejected"
              }
              onClick={() =>
                updateApplication(
                  "rejected",
                )
              }
              className="flex items-center justify-center rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {activeAction ===
              "rejected"
                ? "Rejecting..."
                : currentStatus ===
                    "rejected"
                  ? "Rejected"
                  : "Reject"}
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs leading-5 text-slate-500">
            Approved and rejected
            applications remain stored
            in the application archive
            for future reference.
          </p>
        </div>
      </div>
    </section>
  );
}