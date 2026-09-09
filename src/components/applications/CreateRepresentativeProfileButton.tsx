"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

type CreateRepresentativeProfileButtonProps = {
  applicationId: string;
  applicantName: string;
};

export default function CreateRepresentativeProfileButton({
  applicationId,
  applicantName,
}: CreateRepresentativeProfileButtonProps) {
  const router = useRouter();

  const [isOpen, setIsOpen] =
    useState(false);

  const [isCreating, setIsCreating] =
    useState(false);

  const [error, setError] =
    useState("");

  function openModal() {
    setError("");
    setIsOpen(true);
  }

  function closeModal() {
    if (isCreating) {
      return;
    }

    setError("");
    setIsOpen(false);
  }

  async function createRepresentativeProfile() {
    setIsCreating(true);
    setError("");

    const supabase =
      createClient();

    const {
      data,
      error: createError,
    } = await supabase.rpc(
      "create_representative_from_application",
      {
        p_application_id:
          applicationId,
      },
    );

    if (
      createError ||
      !data
    ) {
      console.error(
        "Unable to create representative profile:",
        createError,
      );

      setError(
        createError?.message ||
          "Unable to create the representative profile.",
      );

      setIsCreating(false);

      return;
    }

    const representativeId =
      String(data);

    setIsCreating(false);
    setIsOpen(false);

    router.push(
      `/representatives/${representativeId}/edit`,
    );

    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-violet-700 to-purple-500 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-violet-500/20 transition hover:-translate-y-0.5 hover:shadow-lg"
      >
        Create Representative Profile
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
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
            {/* Header */}
            <div className="border-b border-slate-200 px-6 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">
                Representative Onboarding
              </p>

              <h2 className="mt-2 text-xl font-semibold text-slate-950">
                Create Representative Profile?
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                A draft ICONIA
                Representative profile
                will be created for{" "}
                <span className="font-semibold text-slate-700">
                  {applicantName}
                </span>
                .
              </p>
            </div>

            {/* Content */}
            <div className="space-y-4 px-6 py-6">
              <div className="rounded-2xl border border-violet-100 bg-violet-50/60 p-4">
                <p className="text-sm font-semibold text-violet-800">
                  Draft Profile
                </p>

                <p className="mt-2 text-xs leading-5 text-violet-700/80">
                  Basic information from
                  the approved application
                  will be copied into the
                  Fan Representative
                  database.
                </p>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-semibold text-amber-800">
                  Not Published Yet
                </p>

                <p className="mt-2 text-xs leading-5 text-amber-700/80">
                  The new profile will
                  remain unpublished until
                  its photo, biography,
                  mission, profile content,
                  and other information
                  have been reviewed.
                </p>
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                  {error}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50/60 px-6 py-4">
              <button
                type="button"
                disabled={isCreating}
                onClick={closeModal}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isCreating}
                onClick={
                  createRepresentativeProfile
                }
                className="rounded-xl bg-gradient-to-r from-violet-700 to-purple-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-500/20 transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {isCreating
                  ? "Creating Profile..."
                  : "Create Profile"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}