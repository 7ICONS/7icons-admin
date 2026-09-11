"use client";

import {
  ChangeEvent,
  FormEvent,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Camera,
  Check,
  Eye,
  EyeOff,
  ImagePlus,
  Loader2,
  LockKeyhole,
  Mail,
  Save,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";

import type {
  AdminRole,
} from "@/lib/permissions";
import { createClient } from "@/lib/supabase/client";

type AccountSettingsProps = {
  userId: string;
  initialDisplayName: string;
  email: string;
  initialAvatarUrl: string;
  role: AdminRole;
  roleLabel: string;
  roleDescription: string;
  canManagePlatform: boolean;
};

type FeedbackState = {
  type: "success" | "error";
  message: string;
} | null;

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

const ALLOWED_AVATAR_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

function getInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "7I";
  }

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${parts[0][0]}${
    parts[parts.length - 1][0]
  }`.toUpperCase();
}

function getAvatarPathFromUrl(
  avatarUrl: string,
) {
  if (!avatarUrl) {
    return null;
  }

  const marker =
    "/storage/v1/object/public/avatars/";

  const markerIndex =
    avatarUrl.indexOf(marker);

  if (markerIndex === -1) {
    return null;
  }

  const path = avatarUrl.slice(
    markerIndex + marker.length,
  );

  return decodeURIComponent(path);
}

export default function AccountSettings({
  userId,
  initialDisplayName,
  email,
  initialAvatarUrl,
  role,
  roleLabel,
  roleDescription,
  canManagePlatform,
}: AccountSettingsProps) {
  const supabase = useMemo(
    () => createClient(),
    [],
  );

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] =
    useState(initialDisplayName);

  const [avatarUrl, setAvatarUrl] =
    useState(initialAvatarUrl);

  const [avatarFile, setAvatarFile] =
    useState<File | null>(null);

  const [avatarPreview, setAvatarPreview] =
    useState<string | null>(null);

  const [removeAvatar, setRemoveAvatar] =
    useState(false);

  const [profileSaving, setProfileSaving] =
    useState(false);

  const [profileFeedback, setProfileFeedback] =
    useState<FeedbackState>(null);

  const [newPassword, setNewPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showNewPassword,
    setShowNewPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [
    passwordSaving,
    setPasswordSaving,
  ] = useState(false);

  const [
    passwordFeedback,
    setPasswordFeedback,
  ] = useState<FeedbackState>(null);

  const initials =
    getInitials(displayName);

  const displayedAvatar =
    removeAvatar
      ? ""
      : avatarPreview || avatarUrl;

  function chooseAvatar() {
    fileInputRef.current?.click();
  }

  function handleAvatarChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setProfileFeedback(null);

    if (
      !ALLOWED_AVATAR_TYPES.includes(
        file.type,
      )
    ) {
      setProfileFeedback({
        type: "error",
        message:
          "Avatar must be a JPG, PNG, or WebP image.",
      });

      event.target.value = "";
      return;
    }

    if (
      file.size >
      MAX_AVATAR_SIZE
    ) {
      setProfileFeedback({
        type: "error",
        message:
          "Avatar file size cannot exceed 2 MB.",
      });

      event.target.value = "";
      return;
    }

    if (avatarPreview) {
      URL.revokeObjectURL(
        avatarPreview,
      );
    }

    const preview =
      URL.createObjectURL(file);

    setAvatarFile(file);
    setAvatarPreview(preview);
    setRemoveAvatar(false);
  }

  function handleRemoveAvatar() {
    if (avatarPreview) {
      URL.revokeObjectURL(
        avatarPreview,
      );
    }

    setAvatarFile(null);
    setAvatarPreview(null);
    setRemoveAvatar(true);

    if (fileInputRef.current) {
      fileInputRef.current.value =
        "";
    }
  }

  async function handleProfileSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setProfileFeedback(null);

    const normalizedDisplayName =
      displayName.trim();

    if (
      normalizedDisplayName.length <
        2 ||
      normalizedDisplayName.length >
        80
    ) {
      setProfileFeedback({
        type: "error",
        message:
          "Display name must be between 2 and 80 characters.",
      });
      return;
    }

    setProfileSaving(true);

    let nextAvatarUrl =
      removeAvatar
        ? ""
        : avatarUrl;

    let uploadedAvatarPath:
      | string
      | null = null;

    try {
      if (avatarFile) {
        const extension =
          avatarFile.name
            .split(".")
            .pop()
            ?.toLowerCase() ||
          "jpg";

        const filePath =
          `${userId}/avatar-${Date.now()}.${extension}`;

        const {
          error: uploadError,
        } = await supabase.storage
          .from("avatars")
          .upload(
            filePath,
            avatarFile,
            {
              cacheControl: "3600",
              upsert: false,
              contentType:
                avatarFile.type,
            },
          );

        if (uploadError) {
          throw new Error(
            uploadError.message,
          );
        }

        uploadedAvatarPath =
          filePath;

        const {
          data: publicUrlData,
        } = supabase.storage
          .from("avatars")
          .getPublicUrl(
            filePath,
          );

        nextAvatarUrl =
          publicUrlData.publicUrl;
      }

      const {
        error: updateError,
      } = await supabase
        .from("user_profiles")
        .update({
          display_name:
            normalizedDisplayName,
          avatar_url:
            nextAvatarUrl ||
            null,
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", userId);

      if (updateError) {
        if (uploadedAvatarPath) {
          await supabase.storage
            .from("avatars")
            .remove([
              uploadedAvatarPath,
            ]);
        }

        throw new Error(
          updateError.message,
        );
      }

      const oldAvatarPath =
        getAvatarPathFromUrl(
          avatarUrl,
        );

      if (
        oldAvatarPath &&
        oldAvatarPath.startsWith(
          `${userId}/`,
        ) &&
        (
          avatarFile ||
          removeAvatar
        )
      ) {
        await supabase.storage
          .from("avatars")
          .remove([
            oldAvatarPath,
          ]);
      }

      if (avatarPreview) {
        URL.revokeObjectURL(
          avatarPreview,
        );
      }

      setDisplayName(
        normalizedDisplayName,
      );

      setAvatarUrl(
        nextAvatarUrl,
      );

      setAvatarFile(null);
      setAvatarPreview(null);
      setRemoveAvatar(false);

      if (
        fileInputRef.current
      ) {
        fileInputRef.current.value =
          "";
      }

      setProfileFeedback({
        type: "success",
        message:
          "Your profile has been updated successfully.",
      });

      window.location.reload();
    } catch (error) {
      console.error(
        "Unable to update profile:",
        error,
      );

      setProfileFeedback({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to update your profile.",
      });
    } finally {
      setProfileSaving(false);
    }
  }

  async function handlePasswordSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setPasswordFeedback(null);

    if (
      newPassword.length < 8
    ) {
      setPasswordFeedback({
        type: "error",
        message:
          "Password must contain at least 8 characters.",
      });
      return;
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      setPasswordFeedback({
        type: "error",
        message:
          "Password confirmation does not match.",
      });
      return;
    }

    setPasswordSaving(true);

    try {
      const { error } =
        await supabase.auth.updateUser(
          {
            password:
              newPassword,
          },
        );

      if (error) {
        throw new Error(
          error.message,
        );
      }

      setNewPassword("");
      setConfirmPassword("");

      setPasswordFeedback({
        type: "success",
        message:
          "Your password has been updated successfully.",
      });
    } catch (error) {
      console.error(
        "Unable to update password:",
        error,
      );

      setPasswordFeedback({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to update your password.",
      });
    } finally {
      setPasswordSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <section className="overflow-hidden rounded-[28px] border border-violet-100 bg-white shadow-sm">
        <div className="border-b border-violet-100 bg-gradient-to-r from-violet-50 via-white to-fuchsia-50 px-6 py-7 sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-600">
            Account & Preferences
          </p>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Settings
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Manage your profile,
            account information, and
            security preferences.
          </p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]">
        <div className="space-y-6">
          <section className="rounded-[28px] border border-violet-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-7">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                  <UserRound className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
                    Profile
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-slate-950">
                    Personal Information
                  </h2>
                </div>
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Manage the identity shown
                across the 7ICONS
                administration portal.
              </p>
            </div>

            <form
              onSubmit={
                handleProfileSubmit
              }
              className="space-y-7"
            >
              <div className="flex flex-col gap-5 rounded-3xl border border-violet-100 bg-violet-50/50 p-5 sm:flex-row sm:items-center">
                <div className="relative shrink-0">
                  {displayedAvatar ? (
                    <img
                      src={
                        displayedAvatar
                      }
                      alt={
                        displayName
                      }
                      className="h-24 w-24 rounded-3xl border-4 border-white object-cover shadow-sm"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-3xl border-4 border-white bg-violet-600 text-2xl font-bold text-white shadow-sm">
                      {initials}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={
                      chooseAvatar
                    }
                    className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-xl border-4 border-violet-50 bg-slate-950 text-white shadow-sm transition hover:bg-violet-700"
                    aria-label="Choose avatar"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-lg font-bold text-slate-950">
                    {displayName}
                  </p>

                  <p className="mt-1 truncate text-sm text-slate-500">
                    {email}
                  </p>

                  <span className="mt-3 inline-flex rounded-full border border-violet-200 bg-white px-3 py-1 text-xs font-semibold text-violet-700">
                    {roleLabel}
                  </span>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={
                        chooseAvatar
                      }
                      className="inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-white px-3.5 py-2 text-xs font-semibold text-violet-700 transition hover:border-violet-300 hover:bg-violet-50"
                    >
                      <ImagePlus className="h-4 w-4" />

                      Change Photo
                    </button>

                    {displayedAvatar ? (
                      <button
                        type="button"
                        onClick={
                          handleRemoveAvatar
                        }
                        className="inline-flex items-center gap-2 rounded-xl border border-red-100 bg-white px-3.5 py-2 text-xs font-semibold text-red-600 transition hover:border-red-200 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />

                        Remove
                      </button>
                    ) : null}
                  </div>

                  <p className="mt-3 text-xs leading-5 text-slate-400">
                    JPG, PNG or WebP.
                    Maximum file size 2 MB.
                  </p>

                  <input
                    ref={
                      fileInputRef
                    }
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={
                      handleAvatarChange
                    }
                    className="hidden"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="display-name"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Display Name
                </label>

                <input
                  id="display-name"
                  type="text"
                  value={
                    displayName
                  }
                  onChange={(event) =>
                    setDisplayName(
                      event.target.value,
                    )
                  }
                  minLength={2}
                  maxLength={80}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                />
              </div>

              <div>
                <label
                  htmlFor="account-email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email Address
                </label>

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    id="account-email"
                    type="email"
                    value={email}
                    disabled
                    className="w-full cursor-not-allowed rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-500"
                  />
                </div>

                <p className="mt-2 text-xs leading-5 text-slate-400">
                  This is the email used
                  to sign in to your
                  account.
                </p>
              </div>

              {profileFeedback ? (
                <div
                  className={
                    profileFeedback.type ===
                    "success"
                      ? "flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
                      : "rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  }
                >
                  {profileFeedback.type ===
                  "success" ? (
                    <Check className="mt-0.5 h-4 w-4 shrink-0" />
                  ) : null}

                  <span>
                    {
                      profileFeedback.message
                    }
                  </span>
                </div>
              ) : null}

              <div className="flex justify-end border-t border-slate-100 pt-5">
                <button
                  type="submit"
                  disabled={
                    profileSaving
                  }
                  className="inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {profileSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}

                  {profileSaving
                    ? "Saving..."
                    : "Save Profile"}
                </button>
              </div>
            </form>
          </section>

          <section className="rounded-[28px] border border-violet-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-7">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                  <LockKeyhole className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
                    Security
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-slate-950">
                    Change Password
                  </h2>
                </div>
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Update the password used
                to access your 7ICONS
                account.
              </p>
            </div>

            <form
              onSubmit={
                handlePasswordSubmit
              }
              className="space-y-5"
            >
              <div>
                <label
                  htmlFor="new-password"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  New Password
                </label>

                <div className="relative">
                  <input
                    id="new-password"
                    type={
                      showNewPassword
                        ? "text"
                        : "password"
                    }
                    value={
                      newPassword
                    }
                    onChange={(event) =>
                      setNewPassword(
                        event.target.value,
                      )
                    }
                    minLength={8}
                    autoComplete="new-password"
                    required
                    placeholder="Minimum 8 characters"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowNewPassword(
                        (value) =>
                          !value,
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                    aria-label="Toggle password visibility"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirm-password"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Confirm New Password
                </label>

                <div className="relative">
                  <input
                    id="confirm-password"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={
                      confirmPassword
                    }
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value,
                      )
                    }
                    minLength={8}
                    autoComplete="new-password"
                    required
                    placeholder="Repeat your new password"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        (value) =>
                          !value,
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                    aria-label="Toggle password visibility"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {passwordFeedback ? (
                <div
                  className={
                    passwordFeedback.type ===
                    "success"
                      ? "flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
                      : "rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  }
                >
                  {passwordFeedback.type ===
                  "success" ? (
                    <Check className="mt-0.5 h-4 w-4 shrink-0" />
                  ) : null}

                  <span>
                    {
                      passwordFeedback.message
                    }
                  </span>
                </div>
              ) : null}

              <div className="flex justify-end border-t border-slate-100 pt-5">
                <button
                  type="submit"
                  disabled={
                    passwordSaving
                  }
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {passwordSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="h-4 w-4" />
                  )}

                  {passwordSaving
                    ? "Updating..."
                    : "Update Password"}
                </button>
              </div>
            </form>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-[28px] border border-violet-100 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
              Account
            </p>

            <h2 className="mt-2 text-lg font-bold text-slate-950">
              Account Overview
            </h2>

            <div className="mt-6 space-y-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Display Name
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {displayName}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Email
                </p>

                <p className="mt-1 break-all text-sm font-semibold text-slate-800">
                  {email}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Role
                </p>

                <p className="mt-1 text-sm font-semibold text-violet-700">
                  {roleLabel}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-violet-100 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
              Access
            </p>

            <h2 className="mt-2 text-lg font-bold text-slate-950">
              Your Role
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              {roleDescription}
            </p>
          </section>

          {canManagePlatform ? (
            <section className="rounded-[28px] border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 p-6 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-sm">
                <ShieldCheck className="h-5 w-5" />
              </div>

              <span className="mt-5 inline-flex rounded-full bg-violet-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-violet-700">
                Super Admin
              </span>

              <h2 className="mt-4 text-lg font-bold text-slate-950">
                Platform Settings
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Platform-level settings
                and system configuration
                are restricted to the
                Super Admin account.
              </p>

              <p className="mt-4 text-xs leading-5 text-slate-400">
                Account settings above
                are independent from
                platform configuration.
              </p>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}