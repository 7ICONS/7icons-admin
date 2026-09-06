"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type DeleteMemberButtonProps = {
  memberId: string;
  memberName: string;
  imageUrl: string | null;
};

function getStoragePathFromPublicUrl(
  publicUrl: string,
) {
  const marker =
    "/storage/v1/object/public/member-photos/";

  const markerIndex =
    publicUrl.indexOf(marker);

  if (markerIndex === -1) {
    return null;
  }

  return decodeURIComponent(
    publicUrl.slice(
      markerIndex + marker.length,
    ),
  );
}

export default function DeleteMemberButton({
  memberId,
  memberName,
  imageUrl,
}: DeleteMemberButtonProps) {
  const router = useRouter();
  const supabase = createClient();

  const [isOpen, setIsOpen] =
    useState(false);

  const [isDeleting, setIsDeleting] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  async function handleDelete() {
    if (isDeleting) {
      return;
    }

    setErrorMessage("");
    setIsDeleting(true);

    try {
      const { error: deleteError } =
        await supabase
          .from("members")
          .delete()
          .eq("id", memberId);

      if (deleteError) {
        throw deleteError;
      }

      if (imageUrl) {
        const storagePath =
          getStoragePathFromPublicUrl(
            imageUrl,
          );

        if (storagePath) {
          const { error: storageError } =
            await supabase.storage
              .from("member-photos")
              .remove([storagePath]);

          if (storageError) {
            console.error(
              "Member deleted, but photo cleanup failed:",
              storageError,
            );
          }
        }
      }

      setIsOpen(false);

      router.refresh();
    } catch (error) {
      console.error(
        "Member delete failed:",
        error,
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to delete this member.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setErrorMessage("");
          setIsOpen(true);
        }}
        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-red-100 px-3 text-xs font-semibold text-red-600 transition hover:border-red-200 hover:bg-red-50"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="h-4 w-4"
        >
          <path d="M3 6h18" />
          <path d="M8 6V4h8v2" />
          <path d="M19 6l-1 14H6L5 6" />
          <path d="M10 11v5" />
          <path d="M14 11v5" />
        </svg>

        Delete
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-violet-100 bg-white p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-6 w-6"
              >
                <path d="M3 6h18" />
                <path d="M8 6V4h8v2" />
                <path d="M19 6l-1 14H6L5 6" />
              </svg>
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-950">
              Delete member?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              You are about to permanently
              delete{" "}
              <span className="font-semibold text-slate-700">
                {memberName}
              </span>
              .
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              This action cannot be undone.
              Any profile photo stored in
              Supabase will also be removed.
            </p>

            {errorMessage && (
              <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {errorMessage}
              </div>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  setIsOpen(false)
                }
                disabled={isDeleting}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting
                  ? "Deleting..."
                  : "Delete Member"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}