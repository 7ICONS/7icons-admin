"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type SubmitGalleryAlbumForReviewButtonProps = {
  albumId: string;
  albumTitle: string;
};

export default function SubmitGalleryAlbumForReviewButton({
  albumId,
  albumTitle,
}: SubmitGalleryAlbumForReviewButtonProps) {
  const router = useRouter();

  const [isOpen, setIsOpen] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  function openModal() {
    setErrorMessage("");
    setIsOpen(true);
  }

  function closeModal() {
    if (isSubmitting) {
      return;
    }

    setIsOpen(false);
    setErrorMessage("");
  }

  async function handleSubmitForReview() {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    const supabase =
      createClient();

    try {
      const {
        data: userData,
        error: userError,
      } =
        await supabase.auth.getUser();

      if (
        userError ||
        !userData.user
      ) {
        throw new Error(
          "Your session could not be verified. Please sign in again.",
        );
      }

      const {
        data,
        error,
      } = await supabase
        .from("gallery_albums")
        .update({
          status:
            "under_review",

          is_published:
            false,

          is_featured:
            false,

          updated_by:
            userData.user.id,

          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          albumId,
        )
        .eq(
          "created_by",
          userData.user.id,
        )
        .eq(
          "status",
          "draft",
        )
        .select("id")
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error(
          "This album could not be submitted for review.",
        );
      }

      setIsOpen(false);

      router.refresh();
    } catch (error) {
      console.error(
        "Gallery review submission failed:",
        error,
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to submit this album for review.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-violet-600 px-3 text-xs font-semibold text-white transition hover:bg-violet-700"
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

        Submit for Review
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }
          }}
        >
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-violet-100 bg-white shadow-2xl">
            <div className="border-b border-violet-100 px-6 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">
                Gallery Review
              </p>

              <h2 className="mt-2 text-xl font-bold text-slate-950">
                Submit for Review?
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Submit{" "}
                <span className="font-semibold text-slate-700">
                  {albumTitle}
                </span>{" "}
                to the 7ICONS staff for
                review.
              </p>
            </div>

            <div className="px-6 py-6">
              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm font-semibold text-blue-800">
                  Album will be locked
                </p>

                <p className="mt-2 text-xs leading-5 text-blue-700/80">
                  After submission, you
                  will not be able to
                  edit the album or its
                  photos until staff
                  completes the review.
                </p>
              </div>

              {errorMessage && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-sm font-semibold text-red-700">
                    Unable to submit
                    album
                  </p>

                  <p className="mt-1 text-xs leading-5 text-red-600">
                    {errorMessage}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-violet-100 bg-violet-50/30 px-6 py-4">
              <button
                type="button"
                disabled={
                  isSubmitting
                }
                onClick={
                  closeModal
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
                  handleSubmitForReview
                }
                className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
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