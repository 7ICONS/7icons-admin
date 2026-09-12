"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

type UserStatus =
  | "active"
  | "suspended"
  | "banned";

type UserStatusActionsProps = {
  userId: string;
  userName: string;
  currentStatus: UserStatus;
};

function formatStatus(status: UserStatus) {
  return (
    status.charAt(0).toUpperCase() +
    status.slice(1)
  );
}

function getStatusDescription(
  status: UserStatus,
) {
  switch (status) {
    case "active":
      return "The account remains active and can use normal community features.";

    case "suspended":
      return "The account is temporarily restricted until an administrator reactivates it.";

    case "banned":
      return "The account is marked as banned and should no longer have normal community access.";
  }
}

function getOptionClasses(
  status: UserStatus,
  selected: boolean,
) {
  if (selected) {
    switch (status) {
      case "active":
        return "border-emerald-300 bg-emerald-50 ring-2 ring-emerald-100";

      case "suspended":
        return "border-amber-300 bg-amber-50 ring-2 ring-amber-100";

      case "banned":
        return "border-red-300 bg-red-50 ring-2 ring-red-100";
    }
  }

  return "border-slate-200 bg-white hover:border-violet-200 hover:bg-violet-50/40";
}

function getDotClasses(
  status: UserStatus,
) {
  switch (status) {
    case "active":
      return "bg-emerald-500";

    case "suspended":
      return "bg-amber-500";

    case "banned":
      return "bg-red-500";
  }
}

export default function UserStatusActions({
  userId,
  userName,
  currentStatus,
}: UserStatusActionsProps) {
  const router = useRouter();

  const [isOpen, setIsOpen] =
    useState(false);

  const [
    selectedStatus,
    setSelectedStatus,
  ] = useState<UserStatus>(
    currentStatus,
  );

  const [isSaving, setIsSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  function openModal() {
    setSelectedStatus(currentStatus);
    setError("");
    setIsOpen(true);
  }

  function closeModal() {
    if (isSaving) {
      return;
    }

    setIsOpen(false);
    setSelectedStatus(currentStatus);
    setError("");
  }

  async function updateStatus() {
    if (
      selectedStatus ===
      currentStatus
    ) {
      closeModal();

      return;
    }

    setIsSaving(true);
    setError("");

    const supabase =
      createClient();

    const { error: updateError } =
      await supabase.rpc(
        "moderate_user_status",
        {
          target_user_id: userId,
          new_status: selectedStatus,
        },
      );

    if (updateError) {
      console.error(
        "Unable to update user status:",
        updateError,
      );

      setError(
        "Unable to update this user. Please check your permissions and try again.",
      );

      setIsSaving(false);

      return;
    }

    setIsSaving(false);
    setIsOpen(false);

    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="inline-flex items-center justify-center rounded-lg border border-violet-200 bg-white px-3 py-2 text-xs font-semibold text-violet-700 shadow-sm transition hover:border-violet-300 hover:bg-violet-50"
      >
        Manage
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
          <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
            <div className="border-b border-slate-200 px-6 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">
                User Moderation
              </p>

              <h2 className="mt-2 text-xl font-semibold text-slate-950">
                Manage Account Status
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Change the moderation
                status for{" "}
                <span className="font-semibold text-slate-700">
                  {userName}
                </span>
                .
              </p>
            </div>

            <div className="space-y-3 px-6 py-6">
              {(
                [
                  "active",
                  "suspended",
                  "banned",
                ] as UserStatus[]
              ).map((status) => {
                const selected =
                  selectedStatus ===
                  status;

                return (
                  <button
                    key={status}
                    type="button"
                    disabled={isSaving}
                    onClick={() =>
                      setSelectedStatus(
                        status,
                      )
                    }
                    className={`w-full rounded-2xl border p-4 text-left transition ${getOptionClasses(
                      status,
                      selected,
                    )}`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${getDotClasses(
                          status,
                        )}`}
                      />

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-slate-900">
                            {formatStatus(
                              status,
                            )}
                          </p>

                          {status ===
                            currentStatus && (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                              Current
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {getStatusDescription(
                            status,
                          )}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                  {error}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50/60 px-6 py-4">
              <button
                type="button"
                onClick={closeModal}
                disabled={isSaving}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={updateStatus}
                disabled={
                  isSaving ||
                  selectedStatus ===
                    currentStatus
                }
                className="rounded-xl bg-gradient-to-r from-violet-700 to-purple-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-500/15 transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {isSaving
                  ? "Saving..."
                  : "Update Status"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}