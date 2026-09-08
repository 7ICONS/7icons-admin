"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

type StaffRole =
  | "admin"
  | "editor"
  | "moderator";

type ManageTeamMemberButtonProps = {
  userId: string;
  userName: string;
  currentRole: StaffRole;
  currentIsActive: boolean;
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
      return "General platform administration, content management, applications, users, and moderation.";

    case "editor":
      return "Editorial access for articles, gallery, schedule, representatives, and application review.";

    case "moderator":
      return "Community moderation focused on users and comments.";
  }
}

export default function ManageTeamMemberButton({
  userId,
  userName,
  currentRole,
  currentIsActive,
}: ManageTeamMemberButtonProps) {
  const router = useRouter();

  const [isOpen, setIsOpen] =
    useState(false);

  const [
    selectedRole,
    setSelectedRole,
  ] = useState<StaffRole>(
    currentRole,
  );

  const [
    isActive,
    setIsActive,
  ] = useState(
    currentIsActive,
  );

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

  const [error, setError] =
    useState("");

  function openModal() {
    setSelectedRole(
      currentRole,
    );

    setIsActive(
      currentIsActive,
    );

    setError("");

    setIsOpen(true);
  }

  function closeModal() {
    if (isSaving) {
      return;
    }

    setSelectedRole(
      currentRole,
    );

    setIsActive(
      currentIsActive,
    );

    setError("");

    setIsOpen(false);
  }

  async function saveChanges() {
    const noChanges =
      selectedRole ===
        currentRole &&
      isActive ===
        currentIsActive;

    if (noChanges) {
      closeModal();
      return;
    }

    setIsSaving(true);
    setError("");

    const supabase =
      createClient();

    const {
      error: manageError,
    } = await supabase.rpc(
      "manage_team_member",
      {
        p_target_user_id:
          userId,
        p_role:
          selectedRole,
        p_is_active:
          isActive,
      },
    );

    if (manageError) {
      console.error(
        "Unable to manage team member:",
        manageError,
      );

      setError(
        manageError.message ||
          "Unable to update this team member.",
      );

      setIsSaving(false);
      return;
    }

    setIsSaving(false);
    setIsOpen(false);

    router.refresh();
  }

  const hasChanges =
    selectedRole !==
      currentRole ||
    isActive !==
      currentIsActive;

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="rounded-lg border border-violet-200 bg-white px-3 py-2 text-xs font-semibold text-violet-700 transition hover:border-violet-300 hover:bg-violet-50"
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
          <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
            {/* Header */}
            <div className="border-b border-slate-200 px-6 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">
                Staff Management
              </p>

              <h2 className="mt-2 text-xl font-semibold text-slate-950">
                Manage Team Member
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Update the platform
                access for{" "}
                <span className="font-semibold text-slate-700">
                  {userName}
                </span>
                .
              </p>
            </div>

            <div className="space-y-7 px-6 py-6">
              {/* Role */}
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
                      role,
                    ) => {
                      const selected =
                        selectedRole ===
                        role;

                      return (
                        <button
                          key={
                            role
                          }
                          type="button"
                          disabled={
                            isSaving
                          }
                          onClick={() =>
                            setSelectedRole(
                              role,
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
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-semibold text-slate-900">
                                  {getRoleLabel(
                                    role,
                                  )}
                                </p>

                                {role ===
                                  currentRole && (
                                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                                    Current
                                  </span>
                                )}
                              </div>

                              <p className="mt-1 text-xs leading-5 text-slate-500">
                                {getRoleDescription(
                                  role,
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

              {/* Access */}
              <div>
                <p className="text-sm font-semibold text-slate-700">
                  Platform Access
                </p>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    disabled={
                      isSaving
                    }
                    onClick={() =>
                      setIsActive(
                        true,
                      )
                    }
                    className={`rounded-2xl border p-4 text-left transition ${
                      isActive
                        ? "border-emerald-300 bg-emerald-50 ring-2 ring-emerald-100"
                        : "border-slate-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/40"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" />

                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          Active
                        </p>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          Staff member
                          can access
                          permitted admin
                          modules.
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    disabled={
                      isSaving
                    }
                    onClick={() =>
                      setIsActive(
                        false,
                      )
                    }
                    className={`rounded-2xl border p-4 text-left transition ${
                      !isActive
                        ? "border-red-300 bg-red-50 ring-2 ring-red-100"
                        : "border-slate-200 bg-white hover:border-red-200 hover:bg-red-50/40"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-red-500" />

                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          Inactive
                        </p>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          Staff member
                          keeps the
                          account but
                          loses Admin
                          Panel access.
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {!isActive && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-700">
                    Access Disabled
                  </p>

                  <p className="mt-2 text-xs leading-5 text-amber-700/80">
                    This does not delete
                    the user's Supabase
                    account. It only
                    disables their staff
                    role until access is
                    reactivated.
                  </p>
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
                  isSaving ||
                  !hasChanges
                }
                onClick={
                  saveChanges
                }
                className="rounded-xl bg-gradient-to-r from-violet-700 to-purple-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-500/15 transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {isSaving
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}