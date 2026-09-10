"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type GalleryAlbumReviewPanelProps = {
  albumId: string;
  albumTitle: string;
};

type ReviewDecision =
  | "approve"
  | "reject"
  | null;

export default function GalleryAlbumReviewPanel({
  albumId,
  albumTitle,
}: GalleryAlbumReviewPanelProps) {
  const router = useRouter();

  const [
    decision,
    setDecision,
  ] = useState<ReviewDecision>(
    null,
  );

  const [
    reviewNotes,
    setReviewNotes,
  ] = useState("");

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  function openReview(
    nextDecision:
      | "approve"
      | "reject",
  ) {
    setErrorMessage("");
    setReviewNotes("");
    setDecision(
      nextDecision,
    );
  }

  function closeReview() {
    if (isSubmitting) {
      return;
    }

    setDecision(null);
    setErrorMessage("");
    setReviewNotes("");
  }

  async function submitDecision() {
    if (!decision) {
      return;
    }

    if (
      decision === "reject" &&
      !reviewNotes.trim()
    ) {
      setErrorMessage(
        "Please provide revision notes before rejecting this album.",
      );

      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    const supabase =
      createClient();

    try {
      const {
        data,
        error,
      } = await supabase.rpc(
        "review_gallery_album",
        {
          p_album_id:
            albumId,

          p_decision:
            decision,

          p_review_notes:
            reviewNotes.trim() ||
            null,
        },
      );

      if (error) {
        throw error;
      }

      console.log(
        "Gallery review result:",
        data,
      );

      setDecision(null);

      router.push(
        "/gallery",
      );

      router.refresh();
    } catch (error) {
      console.error(
        "Gallery review failed:",
        error,
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to review this Gallery album.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const isApprove =
    decision === "approve";

  const isReject =
    decision === "reject";

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-sm">
        <div className="border-b border-blue-100 bg-blue-50/50 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">
            Staff Review
          </p>

          <h2 className="mt-2 text-base font-bold text-slate-900">
            Gallery Review Decision
          </h2>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            This Representative
            album is waiting for
            staff review.
          </p>
        </div>

        <div className="space-y-3 p-5">
          <button
            type="button"
            onClick={() =>
              openReview(
                "approve",
              )
            }
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-4 w-4"
            >
              <path d="m5 12 4 4L19 6" />
            </svg>

            Approve & Publish
          </button>

          <button
            type="button"
            onClick={() =>
              openReview(
                "reject",
              )
            }
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-4 w-4"
            >
              <path d="M6 6l12 12" />
              <path d="M18 6 6 18" />
            </svg>

            Reject for Revision
          </button>
        </div>
      </section>

      {decision && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm"
          onMouseDown={(
            event,
          ) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeReview();
            }
          }}
        >
          <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
            {/* Header */}
            <div className="border-b border-slate-200 px-6 py-5">
              <p
                className={`text-xs font-semibold uppercase tracking-[0.16em] ${
                  isApprove
                    ? "text-emerald-600"
                    : "text-red-600"
                }`}
              >
                Gallery Review
              </p>

              <h2 className="mt-2 text-xl font-semibold text-slate-950">
                {isApprove
                  ? "Approve & Publish?"
                  : "Reject for Revision?"}
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Review decision for{" "}
                <span className="font-semibold text-slate-700">
                  {albumTitle}
                </span>
                .
              </p>
            </div>

            {/* Body */}
            <div className="space-y-5 px-6 py-6">
              {isApprove && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-sm font-semibold text-emerald-800">
                    Publish Gallery
                    Album
                  </p>

                  <p className="mt-2 text-xs leading-5 text-emerald-700/80">
                    This album will
                    become Published
                    and can appear on
                    the public 7ICONS
                    Gallery.
                  </p>
                </div>
              )}

              {isReject && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                  <p className="text-sm font-semibold text-red-800">
                    Return for
                    Revision
                  </p>

                  <p className="mt-2 text-xs leading-5 text-red-700/80">
                    The Representative
                    will be able to
                    edit the album and
                    its photos again.
                  </p>
                </div>
              )}

              <div>
                <label
                  htmlFor="gallery-review-notes"
                  className="text-sm font-semibold text-slate-700"
                >
                  {isReject
                    ? "Revision Notes *"
                    : "Review Notes"}
                </label>

                <textarea
                  id="gallery-review-notes"
                  value={
                    reviewNotes
                  }
                  onChange={(
                    event,
                  ) =>
                    setReviewNotes(
                      event.target
                        .value,
                    )
                  }
                  rows={5}
                  disabled={
                    isSubmitting
                  }
                  placeholder={
                    isReject
                      ? "Explain what needs to be revised..."
                      : "Optional review notes..."
                  }
                  className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:ring-4 focus:ring-violet-100 disabled:bg-slate-50"
                />

                <p className="mt-2 text-xs leading-5 text-slate-400">
                  {isReject
                    ? "A rejection reason is required."
                    : "Notes are optional when approving."}
                </p>
              </div>

              {errorMessage && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-sm font-semibold text-red-700">
                    Unable to review
                    album
                  </p>

                  <p className="mt-1 text-xs leading-5 text-red-600">
                    {
                      errorMessage
                    }
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50/60 px-6 py-4">
              <button
                type="button"
                disabled={
                  isSubmitting
                }
                onClick={
                  closeReview
                }
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={
                  isSubmitting
                }
                onClick={
                  submitDecision
                }
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-md transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  isApprove
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {isSubmitting
                  ? isApprove
                    ? "Publishing..."
                    : "Rejecting..."
                  : isApprove
                    ? "Approve & Publish"
                    : "Reject for Revision"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}