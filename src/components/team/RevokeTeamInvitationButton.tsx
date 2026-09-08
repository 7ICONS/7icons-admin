"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

type RevokeTeamInvitationButtonProps = {
  invitationId: string;
  invitationEmail: string;
};

export default function RevokeTeamInvitationButton({
  invitationId,
  invitationEmail,
}: RevokeTeamInvitationButtonProps) {
  const router = useRouter();

  const [isOpen, setIsOpen] =
    useState(false);

  const [isRevoking, setIsRevoking] =
    useState(false);

  const [error, setError] =
    useState("");

  function openModal() {
    setError("");
    setIsOpen(true);
  }

  function closeModal() {
    if (isRevoking) {
      return;
    }

    setError("");
    setIsOpen(false);
  }

  async function revokeInvitation() {
    setIsRevoking(true);
    setError("");

    const supabase =
      createClient();

    const {
      data,
      error: updateError,
    } = await supabase
      .from("team_invitations")
      .update({
        status: "revoked",
        revoked_at:
          new Date().toISOString(),
      })
      .eq("id", invitationId)
      .eq("status", "pending")
      .select("id, status")
      .single();

    if (updateError || !data) {
      console.error(
        "Unable to revoke team invitation:",
        updateError,
      );

      setError(
        "Unable to revoke this invitation. Please try again.",
      );

      setIsRevoking(false);
      return;
    }

    setIsRevoking(false);
    setIsOpen(false);

    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-50"
      >
        Revoke
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
            <div className="border-b border-slate-200 px-6 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-500">
                Team Invitation
              </p>

              <h2 className="mt-2 text-xl font-semibold text-slate-950">
                Revoke Invitation?
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                The invitation for{" "}
                <span className="font-semibold text-slate-700">
                  {invitationEmail}
                </span>{" "}
                will no longer be usable.
              </p>
            </div>

            <div className="px-6 py-6">
              <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-4">
                <p className="text-sm leading-6 text-red-700">
                  Anyone opening this
                  invitation link after
                  it is revoked will not
                  be able to activate a
                  staff role.
                </p>
              </div>

              {error && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                  {error}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50/60 px-6 py-4">
              <button
                type="button"
                disabled={isRevoking}
                onClick={closeModal}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isRevoking}
                onClick={
                  revokeInvitation
                }
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isRevoking
                  ? "Revoking..."
                  : "Revoke Invitation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}