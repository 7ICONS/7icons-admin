"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

type DeleteArticleButtonProps = {
  articleId: string;
  articleTitle: string;
};

export default function DeleteArticleButton({
  articleId,
  articleTitle,
}: DeleteArticleButtonProps) {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleDelete() {
    setIsDeleting(true);
    setErrorMessage("");

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("articles")
        .delete()
        .eq("id", articleId);

      if (error) {
        setErrorMessage(error.message);
        setIsDeleting(false);
        return;
      }

      setIsOpen(false);

      router.refresh();
    } catch {
      setErrorMessage(
        "Something went wrong while deleting the article.",
      );

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
          <path d="M4 7h16" />
          <path d="M9 7V4h6v3" />
          <path d="M7 7l1 14h8l1-14" />
          <path d="M10 11v6" />
          <path d="M14 11v6" />
        </svg>

        Delete
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-5">
          {/* Overlay */}
          <button
            type="button"
            aria-label="Close delete confirmation"
            disabled={isDeleting}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]"
          />

          {/* Dialog */}
          <div className="relative z-10 w-full max-w-md rounded-3xl border border-red-100 bg-white p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-6 w-6"
              >
                <path d="M4 7h16" />
                <path d="M9 7V4h6v3" />
                <path d="M7 7l1 14h8l1-14" />
              </svg>
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-950">
              Delete article?
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              You are about to permanently delete:
            </p>

            <div className="mt-3 rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-sm font-semibold text-slate-800">
                {articleTitle}
              </p>
            </div>

            <p className="mt-4 text-xs leading-5 text-red-600">
              This action cannot be undone.
            </p>

            {errorMessage && (
              <div
                role="alert"
                className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3"
              >
                <p className="text-xs leading-5 text-red-600">
                  {errorMessage}
                </p>
              </div>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setIsOpen(false)}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? "Deleting..." : "Delete Article"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}