"use client";

import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

type InviteRepresentativeButtonProps = {
  applicationId: string;
  representativeId: string;
  applicantName: string;
  applicantEmail: string;
};

type InvitationData = {
  id: string;
  token: string;
  expires_at: string;
};

function formatExpiration(
  value: string,
) {
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

export default function InviteRepresentativeButton({
  applicationId,
  representativeId,
  applicantName,
  applicantEmail,
}: InviteRepresentativeButtonProps) {
  const [isOpen, setIsOpen] =
    useState(false);

  const [isCreating, setIsCreating] =
    useState(false);

  const [error, setError] =
    useState("");

  const [invitationLink, setInvitationLink] =
    useState("");

  const [expiresAt, setExpiresAt] =
    useState("");

  const [copied, setCopied] =
    useState(false);

  function openModal() {
    setError("");
    setCopied(false);
    setIsOpen(true);
  }

  function closeModal() {
    if (isCreating) {
      return;
    }

    setError("");
    setCopied(false);
    setInvitationLink("");
    setExpiresAt("");
    setIsOpen(false);
  }

  function buildInvitationLink(
    token: string,
  ) {
    return `${window.location.origin}/accept-representative-invite?token=${token}`;
  }

  function showInvitation(
    invitation: InvitationData,
  ) {
    setInvitationLink(
      buildInvitationLink(
        invitation.token,
      ),
    );

    setExpiresAt(
      invitation.expires_at,
    );
  }

  async function createInvitation() {
    setIsCreating(true);
    setError("");
    setCopied(false);

    const supabase =
      createClient();

    const {
      data: userData,
      error: userError,
    } = await supabase.auth.getUser();

    if (
      userError ||
      !userData.user
    ) {
      setError(
        "Unable to identify the current admin account.",
      );

      setIsCreating(false);
      return;
    }

    const {
      data,
      error: insertError,
    } = await supabase
      .from(
        "representative_invitations",
      )
      .insert({
        application_id:
          applicationId,

        representative_id:
          representativeId,

        email:
          applicantEmail.trim(),

        invited_by:
          userData.user.id,
      })
      .select(
        `
          id,
          token,
          expires_at
        `,
      )
      .single();

    if (
      !insertError &&
      data
    ) {
      showInvitation(
        data as InvitationData,
      );

      setIsCreating(false);
      return;
    }

    /*
     * Sudah ada pending invitation.
     *
     * Unique partial index database
     * mencegah dua pending invitation
     * untuk representative yang sama.
     */
    if (
      insertError?.code ===
      "23505"
    ) {
      const {
        data:
          existingInvitation,
        error:
          existingError,
      } = await supabase
        .from(
          "representative_invitations",
        )
        .select(
          `
            id,
            token,
            expires_at
          `,
        )
        .eq(
          "representative_id",
          representativeId,
        )
        .eq(
          "status",
          "pending",
        )
        .maybeSingle();

      if (
        existingError ||
        !existingInvitation
      ) {
        console.error(
          "Unable to load existing representative invitation:",
          existingError,
        );

        setError(
          "A pending invitation already exists, but it could not be loaded.",
        );

        setIsCreating(false);
        return;
      }

      showInvitation(
        existingInvitation as InvitationData,
      );

      setIsCreating(false);
      return;
    }

    console.error(
      "Unable to create representative invitation:",
      insertError,
    );

    setError(
      insertError?.message ||
        "Unable to create the representative invitation.",
    );

    setIsCreating(false);
  }

  async function copyInvitationLink() {
    if (!invitationLink) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        invitationLink,
      );

      setCopied(true);

      window.setTimeout(
        () => {
          setCopied(false);
        },
        1800,
      );
    } catch (copyError) {
      console.error(
        "Unable to copy invitation link:",
        copyError,
      );

      setError(
        "Unable to copy the invitation link automatically.",
      );
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-violet-700 to-purple-500 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-violet-500/20 transition hover:-translate-y-0.5 hover:shadow-lg"
      >
        Invite Representative
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
          <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
            {/* Header */}
            <div className="border-b border-slate-200 px-6 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">
                Representative Access
              </p>

              <h2 className="mt-2 text-xl font-semibold text-slate-950">
                Invite Representative
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Create a secure
                platform invitation for{" "}
                <span className="font-semibold text-slate-700">
                  {applicantName}
                </span>
                .
              </p>
            </div>

            <div className="space-y-5 px-6 py-6">
              {/* Recipient */}
              <div className="rounded-2xl border border-violet-100 bg-violet-50/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-violet-600">
                  Invitation Recipient
                </p>

                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {applicantName}
                </p>

                <p className="mt-1 break-all text-xs text-slate-500">
                  {applicantEmail}
                </p>
              </div>

              {!invitationLink && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-semibold text-amber-800">
                    Representative
                    Access
                  </p>

                  <p className="mt-2 text-xs leading-5 text-amber-700/80">
                    After accepting the
                    invitation, this
                    account will receive
                    the limited ICONIA
                    Representative role.
                    It will not become an
                    internal Team
                    account.
                  </p>
                </div>
              )}

              {/* Created Link */}
              {invitationLink && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                    <p className="text-sm font-semibold text-emerald-800">
                      Invitation Ready
                    </p>

                    <p className="mt-2 text-xs leading-5 text-emerald-700/80">
                      Send this link only
                      to the applicant
                      whose email is
                      shown above.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="representative-invitation-link"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Invitation Link
                    </label>

                    <div className="mt-2 flex gap-2">
                      <input
                        id="representative-invitation-link"
                        type="text"
                        readOnly
                        value={
                          invitationLink
                        }
                        className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-600 outline-none"
                      />

                      <button
                        type="button"
                        onClick={
                          copyInvitationLink
                        }
                        className="shrink-0 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2.5 text-xs font-semibold text-violet-700 transition hover:bg-violet-100"
                      >
                        {copied
                          ? "Copied!"
                          : "Copy"}
                      </button>
                    </div>
                  </div>

                  {expiresAt && (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <p className="text-xs text-slate-500">
                        This invitation
                        expires on{" "}
                        <span className="font-semibold text-slate-700">
                          {formatExpiration(
                            expiresAt,
                          )}
                        </span>
                        .
                      </p>
                    </div>
                  )}
                </div>
              )}

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
                disabled={
                  isCreating
                }
                onClick={closeModal}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {invitationLink
                  ? "Done"
                  : "Cancel"}
              </button>

              {!invitationLink && (
                <button
                  type="button"
                  disabled={
                    isCreating
                  }
                  onClick={
                    createInvitation
                  }
                  className="rounded-xl bg-gradient-to-r from-violet-700 to-purple-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-500/20 transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {isCreating
                    ? "Creating Invitation..."
                    : "Create Invitation"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}