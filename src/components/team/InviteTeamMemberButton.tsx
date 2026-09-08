"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

type StaffRole =
  | "admin"
  | "editor"
  | "moderator";

type CreatedInvitation = {
  id: string;
  email: string;
  role: StaffRole;
  token: string;
  expires_at: string;
};

function getRoleLabel(
  role: StaffRole,
) {
  switch (role) {
    case "admin":
      return "Admin";

    case "editor":
      return "Editor";

    case "moderator":
      return "Moderator";
  }
}

function getRoleDescription(
  role: StaffRole,
) {
  switch (role) {
    case "admin":
      return "General platform administration, content management, users, applications, and moderation.";

    case "editor":
      return "Editorial access for articles, gallery, schedule, representatives, and application review.";

    case "moderator":
      return "Community moderation focused on users and comments.";
  }
}

export default function InviteTeamMemberButton() {
  const router = useRouter();

  const [isOpen, setIsOpen] =
    useState(false);

  const [email, setEmail] =
    useState("");

  const [role, setRole] =
    useState<StaffRole>("editor");

  const [isSaving, setIsSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [
    createdInvitation,
    setCreatedInvitation,
  ] =
    useState<CreatedInvitation | null>(
      null,
    );

  const [copied, setCopied] =
    useState(false);

  function openModal() {
    setEmail("");
    setRole("editor");
    setError("");
    setCopied(false);
    setCreatedInvitation(null);
    setIsOpen(true);
  }

  function closeModal() {
    if (isSaving) {
      return;
    }

    setIsOpen(false);
    setError("");
    setCopied(false);
    setCreatedInvitation(null);
  }

  async function createInvitation() {
    const normalizedEmail =
      email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError(
        "Email address is required.",
      );
      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        normalizedEmail,
      )
    ) {
      setError(
        "Please enter a valid email address.",
      );
      return;
    }

    setIsSaving(true);
    setError("");
    setCopied(false);

    const supabase =
      createClient();

    const {
      data: userData,
      error: userError,
    } =
      await supabase.auth.getUser();

    const currentUser =
      userData.user;

    if (
      userError ||
      !currentUser
    ) {
      console.error(
        "Unable to load current admin:",
        userError,
      );

      setError(
        "Your admin session could not be verified. Please sign in again.",
      );

      setIsSaving(false);
      return;
    }

    const {
      data,
      error: insertError,
    } = await supabase
      .from("team_invitations")
      .insert({
        email: normalizedEmail,
        role,
        invited_by:
          currentUser.id,
      })
      .select(
        `
          id,
          email,
          role,
          token,
          expires_at
        `,
      )
      .single();

    if (insertError || !data) {
      console.error(
        "Unable to create team invitation:",
        insertError,
      );

      if (
        insertError?.code ===
        "23505"
      ) {
        setError(
          "A pending invitation already exists for this email address.",
        );
      } else {
        setError(
          "Unable to create the invitation. Please check your permissions and try again.",
        );
      }

      setIsSaving(false);
      return;
    }

    setCreatedInvitation(
      data as CreatedInvitation,
    );

    setIsSaving(false);

    router.refresh();
  }

  function getInvitationUrl() {
    if (
      !createdInvitation
    ) {
      return "";
    }

    return `${window.location.origin}/accept-invite?token=${createdInvitation.token}`;
  }

  async function copyInvitationLink() {
    if (
      !createdInvitation
    ) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        getInvitationUrl(),
      );

      setCopied(true);
    } catch (copyError) {
      console.error(
        "Unable to copy invitation link:",
        copyError,
      );

      setError(
        "The invitation was created, but the link could not be copied automatically.",
      );
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-violet-700 to-purple-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/15 transition hover:-translate-y-0.5 hover:shadow-xl"
      >
        + Invite Team Member
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
          <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
            {!createdInvitation ? (
              <>
                {/* Header */}
                <div className="border-b border-slate-200 px-6 py-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">
                    Staff Management
                  </p>

                  <h2 className="mt-2 text-xl font-semibold text-slate-950">
                    Invite Team Member
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Create a secure
                    invitation for an
                    internal staff member.
                  </p>
                </div>

                {/* Form */}
                <div className="space-y-6 px-6 py-6">
                  <div>
                    <label
                      htmlFor="team-email"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Email Address
                    </label>

                    <input
                      id="team-email"
                      type="email"
                      value={email}
                      disabled={
                        isSaving
                      }
                      onChange={(
                        event,
                      ) =>
                        setEmail(
                          event
                            .target
                            .value,
                        )
                      }
                      placeholder="staff@example.com"
                      className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-700">
                      Staff Role
                    </p>

                    <div className="mt-3 space-y-3">
                      {(
                        [
                          "admin",
                          "editor",
                          "moderator",
                        ] as StaffRole[]
                      ).map(
                        (
                          option,
                        ) => {
                          const selected =
                            role ===
                            option;

                          return (
                            <button
                              key={
                                option
                              }
                              type="button"
                              disabled={
                                isSaving
                              }
                              onClick={() =>
                                setRole(
                                  option,
                                )
                              }
                              className={`w-full rounded-2xl border p-4 text-left transition ${
                                selected
                                  ? "border-violet-300 bg-violet-50 ring-2 ring-violet-100"
                                  : "border-slate-200 bg-white hover:border-violet-200 hover:bg-violet-50/40"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <span
                                  className={`mt-1.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                                    selected
                                      ? "border-violet-600"
                                      : "border-slate-300"
                                  }`}
                                >
                                  {selected && (
                                    <span className="h-2 w-2 rounded-full bg-violet-600" />
                                  )}
                                </span>

                                <div>
                                  <p className="text-sm font-semibold text-slate-900">
                                    {getRoleLabel(
                                      option,
                                    )}
                                  </p>

                                  <p className="mt-1 text-xs leading-5 text-slate-500">
                                    {getRoleDescription(
                                      option,
                                    )}
                                  </p>
                                </div>
                              </div>
                            </button>
                          );
                        },
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-700">
                      Invite-only Staff
                    </p>

                    <p className="mt-2 text-xs leading-5 text-amber-700/80">
                      ICONIA
                      Representatives
                      cannot be invited
                      from Team
                      Management. Their
                      access will be
                      created through the
                      Applications
                      workflow.
                    </p>
                  </div>

                  {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                      {error}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50/60 px-6 py-4">
                  <button
                    type="button"
                    disabled={
                      isSaving
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
                      isSaving
                    }
                    onClick={
                      createInvitation
                    }
                    className="rounded-xl bg-gradient-to-r from-violet-700 to-purple-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-500/15 transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSaving
                      ? "Creating..."
                      : "Create Invitation"}
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Success */}
                <div className="px-6 py-8 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-2xl text-emerald-600">
                    ✓
                  </div>

                  <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">
                    Invitation Created
                  </p>

                  <h2 className="mt-2 text-xl font-semibold text-slate-950">
                    Team invitation is
                    ready.
                  </h2>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                    Send this invitation
                    link only to{" "}
                    <span className="font-semibold text-slate-700">
                      {
                        createdInvitation.email
                      }
                    </span>
                    .
                  </p>

                  <div className="mt-6 rounded-2xl border border-violet-100 bg-violet-50/60 p-4 text-left">
                    <div>
                      <p className="text-xs font-medium text-slate-400">
                        Role
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {getRoleLabel(
                          createdInvitation.role,
                        )}
                      </p>
                    </div>

                    <div className="mt-4">
                      <p className="text-xs font-medium text-slate-400">
                        Invitation Link
                      </p>

                      <div className="mt-2 break-all rounded-xl border border-violet-100 bg-white px-3 py-3 text-xs leading-5 text-slate-600">
                        {getInvitationUrl()}
                      </div>
                    </div>

                    <p className="mt-3 text-xs leading-5 text-slate-400">
                      This invitation
                      expires automatically
                      after 7 days.
                    </p>
                  </div>

                  {error && (
                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                      {error}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 bg-slate-50/60 px-6 py-4">
                  <button
                    type="button"
                    onClick={
                      closeModal
                    }
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    onClick={
                      copyInvitationLink
                    }
                    className="rounded-xl bg-gradient-to-r from-violet-700 to-purple-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-500/15 transition hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    {copied
                      ? "Copied ✓"
                      : "Copy Invitation Link"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}