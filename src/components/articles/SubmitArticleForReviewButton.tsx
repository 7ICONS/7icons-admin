"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type SubmitArticleForReviewButtonProps = {
  articleId: string;
  articleTitle: string;
};

export default function SubmitArticleForReviewButton({
  articleId,
  articleTitle,
}: SubmitArticleForReviewButtonProps) {
  const router =
    useRouter();

  const [
    isOpen,
    setIsOpen,
  ] = useState(false);

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  function openModal() {
    setErrorMessage("");
    setIsOpen(true);
  }

  function closeModal() {
    if (isSubmitting) {
      return;
    }

    setErrorMessage("");
    setIsOpen(false);
  }

  async function submitForReview() {
    setIsSubmitting(true);
    setErrorMessage("");

    const supabase =
      createClient();

    const {
      data: authData,
      error: authError,
    } =
      await supabase.auth.getUser();

    if (
      authError ||
      !authData.user
    ) {
      setErrorMessage(
        "Your session could not be verified. Please sign in again.",
      );

      setIsSubmitting(false);
      return;
    }

    /*
     * Representative RLS remains the
     * final security layer.
     *
     * This query additionally requires:
     * - ownership
     * - current status = draft
     */
    const {
      data,
      error,
    } = await supabase
      .from("articles")
      .update({
        status:
          "under_review",

        updated_by:
          authData.user.id,

        updated_at:
          new Date().toISOString(),
      })
      .eq(
        "id",
        articleId,
      )
      .eq(
        "created_by",
        authData.user.id,
      )
      .eq(
        "status",
        "draft",
      )
      .select("id")
      .maybeSingle();

    if (error) {
      console.error(
        "Unable to submit article for review:",
        error,
      );

      setErrorMessage(
        error.message,
      );

      setIsSubmitting(false);
      return;
    }

    if (!data) {
      setErrorMessage(
        "This article could not be submitted. It may no longer be an editable draft.",
      );

      setIsSubmitting(false);
      return;
    }

    setIsOpen(false);

    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={
          openModal
        }
        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 text-xs font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="h-4 w-4"
        >
          <path d="M4 12h16" />
          <path d="m14 6 6 6-6 6" />
        </svg>

        Submit for Review
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm"
          onMouseDown={(
            event,
          ) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }
          }}
        >
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
            <div className="border-b border-slate-200 px-6 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
                Article Review
              </p>

              <h2 className="mt-2 text-xl font-semibold text-slate-950">
                Submit for Review?
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Submit{" "}
                <span className="font-semibold text-slate-700">
                  {articleTitle}
                </span>{" "}
                to authorized staff
                for review.
              </p>
            </div>

            <div className="space-y-4 px-6 py-6">
              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm font-semibold text-blue-800">
                  The article will
                  become locked
                </p>

                <p className="mt-2 text-xs leading-5 text-blue-700/80">
                  After submission,
                  you will not be
                  able to edit or
                  delete this article
                  until staff
                  completes the
                  review.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-amber-700">
                    Draft
                  </span>

                  <span>
                    →
                  </span>

                  <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-blue-700">
                    Under Review
                  </span>
                </div>
              </div>

              {errorMessage && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-sm font-semibold text-red-700">
                    Unable to submit
                    article
                  </p>

                  <p className="mt-1 text-xs leading-5 text-red-600">
                    {
                      errorMessage
                    }
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50/60 px-6 py-4">
              <button
                type="button"
                disabled={
                  isSubmitting
                }
                onClick={
                  closeModal
                }
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={
                  isSubmitting
                }
                onClick={
                  submitForReview
                }
                className="rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {isSubmitting
                  ? "Submitting..."
                  : "Submit for Review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}