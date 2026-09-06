"use client";

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type MemberSection = {
  heading: string;
  paragraphs: string[];
};

export type MemberFormData = {
  id: string;
  slug: string;
  name: string;
  member_status: "current" | "former";
  role: string;
  image_url: string | null;
  short_bio: string;
  profile_display_name: string;
  profile_position: string;
  profile_description: string;
  profile_sections: MemberSection[];
  display_order: number;
  is_published: boolean;
};

type MemberFormProps = {
  member?: MemberFormData;
};

const allowedPhotoTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const maxPhotoSize = 5 * 1024 * 1024;

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function getFileExtension(file: File) {
  const extension = file.name
    .split(".")
    .pop()
    ?.toLowerCase();

  if (extension) {
    return extension;
  }

  if (file.type === "image/png") {
    return "png";
  }

  if (file.type === "image/webp") {
    return "webp";
  }

  return "jpg";
}

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

export default function MemberForm({
  member,
}: MemberFormProps) {
  const router = useRouter();

  const supabase = createClient();

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const isEditing = Boolean(member);

  const [name, setName] = useState(
    member?.name ?? "",
  );

  const [slug, setSlug] = useState(
    member?.slug ?? "",
  );

  const [slugTouched, setSlugTouched] =
    useState(Boolean(member));

  const [memberStatus, setMemberStatus] =
    useState<"current" | "former">(
      member?.member_status ?? "current",
    );

  const [role, setRole] = useState(
    member?.role ?? "7ICONS Member",
  );

  const [shortBio, setShortBio] =
    useState(member?.short_bio ?? "");

  const [
    profileDisplayName,
    setProfileDisplayName,
  ] = useState(
    member?.profile_display_name ?? "",
  );

  const [
    profilePosition,
    setProfilePosition,
  ] = useState(
    member?.profile_position ??
      "7ICONS Member",
  );

  const [
    profileDescription,
    setProfileDescription,
  ] = useState(
    member?.profile_description ?? "",
  );

  const [
    profileSections,
    setProfileSections,
  ] = useState<MemberSection[]>(
    member?.profile_sections?.length
      ? member.profile_sections
      : [
          {
            heading: "About",
            paragraphs: [""],
          },
        ],
  );

  const [
    displayOrder,
    setDisplayOrder,
  ] = useState(
    member?.display_order ?? 1,
  );

  const [
    isPublished,
    setIsPublished,
  ] = useState(
    member?.is_published ?? true,
  );

  const [
    selectedPhotoFile,
    setSelectedPhotoFile,
  ] = useState<File | null>(null);

  const [
    selectedPhotoPreview,
    setSelectedPhotoPreview,
  ] = useState<string | null>(null);

  const [
    removeExistingPhoto,
    setRemoveExistingPhoto,
  ] = useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    if (
      !isEditing &&
      !slugTouched
    ) {
      setSlug(createSlug(name));
    }
  }, [
    name,
    isEditing,
    slugTouched,
  ]);

  useEffect(() => {
    if (!isEditing) {
      setProfileDisplayName((current) =>
        current.trim() === ""
          ? name
          : current,
      );
    }
  }, [name, isEditing]);

  useEffect(() => {
    if (!selectedPhotoFile) {
      setSelectedPhotoPreview(null);
      return;
    }

    const objectUrl =
      URL.createObjectURL(
        selectedPhotoFile,
      );

    setSelectedPhotoPreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedPhotoFile]);

  function handleSlugChange(
    value: string,
  ) {
    setSlugTouched(true);
    setSlug(createSlug(value));
  }

  function handlePhotoSelection(
    file: File | null,
  ) {
    setErrorMessage("");

    if (!file) {
      return;
    }

    if (
      !allowedPhotoTypes.includes(
        file.type,
      )
    ) {
      setErrorMessage(
        "Profile photo must be JPG, PNG, or WebP.",
      );

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return;
    }

    if (file.size > maxPhotoSize) {
      setErrorMessage(
        "Profile photo must be 5 MB or smaller.",
      );

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return;
    }

    setSelectedPhotoFile(file);
    setRemoveExistingPhoto(false);
  }

  function handleRemovePhoto() {
    setSelectedPhotoFile(null);
    setSelectedPhotoPreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (member?.image_url) {
      setRemoveExistingPhoto(true);
    }
  }

  function addSection() {
    setProfileSections(
      (current) => [
        ...current,
        {
          heading: "",
          paragraphs: [""],
        },
      ],
    );
  }

  function removeSection(
    sectionIndex: number,
  ) {
    setProfileSections(
      (current) =>
        current.filter(
          (_, index) =>
            index !== sectionIndex,
        ),
    );
  }

  function updateSectionHeading(
    sectionIndex: number,
    value: string,
  ) {
    setProfileSections(
      (current) =>
        current.map(
          (section, index) =>
            index === sectionIndex
              ? {
                  ...section,
                  heading: value,
                }
              : section,
        ),
    );
  }

  function updateSectionParagraphs(
    sectionIndex: number,
    value: string,
  ) {
    const paragraphs = value
      .split(/\n\s*\n/)
      .map((paragraph) =>
        paragraph.trim(),
      );

    setProfileSections(
      (current) =>
        current.map(
          (section, index) =>
            index === sectionIndex
              ? {
                  ...section,
                  paragraphs,
                }
              : section,
        ),
    );
  }

  async function removeStorageFile(
    publicUrl: string,
  ) {
    const storagePath =
      getStoragePathFromPublicUrl(
        publicUrl,
      );

    if (!storagePath) {
      return;
    }

    await supabase.storage
      .from("member-photos")
      .remove([storagePath]);
  }

  async function uploadPhoto(
    file: File,
    userId: string,
  ) {
    const extension =
      getFileExtension(file);

    const filePath =
      `${userId}/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } =
      await supabase.storage
        .from("member-photos")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

    if (uploadError) {
      throw uploadError;
    }

    const { data } =
      supabase.storage
        .from("member-photos")
        .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setErrorMessage("");

    const cleanName = name.trim();
    const cleanSlug = slug.trim();

    if (!cleanName) {
      setErrorMessage(
        "Member name is required.",
      );
      return;
    }

    if (!cleanSlug) {
      setErrorMessage(
        "Member slug is required.",
      );
      return;
    }

    if (
      !Number.isInteger(displayOrder) ||
      displayOrder < 0
    ) {
      setErrorMessage(
        "Display order must be 0 or greater.",
      );
      return;
    }

    const cleanedSections =
      profileSections
        .map((section) => ({
          heading:
            section.heading.trim(),
          paragraphs:
            section.paragraphs
              .map((paragraph) =>
                paragraph.trim(),
              )
              .filter(Boolean),
        }))
        .filter(
          (section) =>
            section.heading !== "" ||
            section.paragraphs.length > 0,
        );

    setIsSubmitting(true);

    let newlyUploadedPhoto:
      | string
      | null = null;

    try {
      const {
        data: userData,
        error: userError,
      } = await supabase.auth.getUser();

      if (
        userError ||
        !userData.user
      ) {
        throw new Error(
          "Your admin session could not be verified. Please sign in again.",
        );
      }

      let imageUrl =
        member?.image_url ?? null;

      if (removeExistingPhoto) {
        imageUrl = null;
      }

      if (selectedPhotoFile) {
        newlyUploadedPhoto =
          await uploadPhoto(
            selectedPhotoFile,
            userData.user.id,
          );

        imageUrl =
          newlyUploadedPhoto;
      }

      const payload = {
        slug: cleanSlug,
        name: cleanName,
        member_status:
          memberStatus,
        role: role.trim(),
        image_url: imageUrl,
        short_bio:
          shortBio.trim(),

        profile_display_name:
          profileDisplayName.trim() ||
          cleanName,

        profile_position:
          profilePosition.trim(),

        profile_description:
          profileDescription.trim(),

        profile_sections:
          cleanedSections,

        display_order:
          displayOrder,

        is_published:
          isPublished,

        updated_by:
          userData.user.id,

        updated_at:
          new Date().toISOString(),
      };

      if (member) {
        const {
          error: updateError,
        } = await supabase
          .from("members")
          .update(payload)
          .eq("id", member.id);

        if (updateError) {
          if (newlyUploadedPhoto) {
            await removeStorageFile(
              newlyUploadedPhoto,
            );
          }

          if (
            updateError.code ===
            "23505"
          ) {
            throw new Error(
              "That slug is already used by another member.",
            );
          }

          throw updateError;
        }

        const shouldRemoveOldPhoto =
          Boolean(
            member.image_url,
          ) &&
          (
            removeExistingPhoto ||
            Boolean(
              selectedPhotoFile,
            )
          );

        if (
          shouldRemoveOldPhoto &&
          member.image_url
        ) {
          await removeStorageFile(
            member.image_url,
          );
        }
      } else {
        const {
          error: insertError,
        } = await supabase
          .from("members")
          .insert({
            ...payload,
            created_by:
              userData.user.id,
          });

        if (insertError) {
          if (newlyUploadedPhoto) {
            await removeStorageFile(
              newlyUploadedPhoto,
            );
          }

          if (
            insertError.code ===
            "23505"
          ) {
            throw new Error(
              "That slug is already used by another member.",
            );
          }

          throw insertError;
        }
      }

      router.push("/members");
      router.refresh();
    } catch (error) {
      console.error(
        "Member save failed:",
        error,
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to save this member.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const visiblePhoto =
    selectedPhotoPreview ??
    (
      !removeExistingPhoto
        ? member?.image_url
        : null
    );

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* Error */}
      {errorMessage && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          {errorMessage}
        </div>
      )}

      {/* Basic Information */}
      <section className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm sm:p-6">
        <div>
          <p className="text-sm font-semibold text-violet-600">
            Basic Information
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-950">
            Member Details
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Basic information used across
            member cards and profile pages.
          </p>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="text-sm font-semibold text-slate-700"
            >
              Member Name
            </label>

            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value,
                )
              }
              placeholder="Member name"
              required
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            />
          </div>

          {/* Slug */}
          <div>
            <label
              htmlFor="slug"
              className="text-sm font-semibold text-slate-700"
            >
              Slug
            </label>

            <input
              id="slug"
              type="text"
              value={slug}
              onChange={(event) =>
                handleSlugChange(
                  event.target.value,
                )
              }
              placeholder="member-name"
              required
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            />

            <p className="mt-2 text-xs text-slate-400">
              Public URL:
              {" "}
              /members/
              {slug || "member-name"}
            </p>
          </div>

          {/* Status */}
          <div>
            <label
              htmlFor="member-status"
              className="text-sm font-semibold text-slate-700"
            >
              Member Status
            </label>

            <select
              id="member-status"
              value={memberStatus}
              onChange={(event) => {
                const value =
                  event.target
                    .value as
                    | "current"
                    | "former";

                setMemberStatus(value);

                if (
                  value ===
                  "current"
                ) {
                  setRole(
                    "7ICONS Member",
                  );

                  setProfilePosition(
                    "7ICONS Member",
                  );
                } else {
                  setRole(
                    "Former 7ICONS Member",
                  );

                  setProfilePosition(
                    "Former 7ICONS Member",
                  );
                }
              }}
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            >
              <option value="current">
                Current Member
              </option>

              <option value="former">
                Former Member
              </option>
            </select>
          </div>

          {/* Role */}
          <div>
            <label
              htmlFor="role"
              className="text-sm font-semibold text-slate-700"
            >
              Role
            </label>

            <input
              id="role"
              type="text"
              value={role}
              onChange={(event) =>
                setRole(
                  event.target.value,
                )
              }
              placeholder="7ICONS Member"
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            />
          </div>

          {/* Display Order */}
          <div>
            <label
              htmlFor="display-order"
              className="text-sm font-semibold text-slate-700"
            >
              Display Order
            </label>

            <input
              id="display-order"
              type="number"
              min="0"
              value={displayOrder}
              onChange={(event) =>
                setDisplayOrder(
                  Number(
                    event.target.value,
                  ),
                )
              }
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            />

            <p className="mt-2 text-xs text-slate-400">
              Lower numbers appear first.
            </p>
          </div>

          {/* Published */}
          <div>
            <p className="text-sm font-semibold text-slate-700">
              Public Profile
            </p>

            <label className="mt-2 flex min-h-11 cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-200 px-4">
              <div>
                <p className="text-sm font-medium text-slate-700">
                  Published
                </p>

                <p className="text-xs text-slate-400">
                  Allow this profile to
                  appear on 7icons-web.
                </p>
              </div>

              <input
                type="checkbox"
                checked={isPublished}
                onChange={(event) =>
                  setIsPublished(
                    event.target.checked,
                  )
                }
                className="h-4 w-4 accent-violet-600"
              />
            </label>
          </div>
        </div>

        {/* Short Bio */}
        <div className="mt-5">
          <label
            htmlFor="short-bio"
            className="text-sm font-semibold text-slate-700"
          >
            Short Bio
          </label>

          <textarea
            id="short-bio"
            value={shortBio}
            onChange={(event) =>
              setShortBio(
                event.target.value,
              )
            }
            rows={4}
            placeholder="Short introduction displayed on member cards."
            className="mt-2 w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
          />
        </div>
      </section>

      {/* Profile Photo */}
      <section className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-sm font-semibold text-violet-600">
          Profile Photo
        </p>

        <h2 className="mt-1 text-xl font-bold text-slate-950">
          Member Portrait
        </h2>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          Select a portrait from your
          computer. JPG, PNG, or WebP up
          to 5 MB.
        </p>

        <div className="mt-6">
          {visiblePhoto ? (
            <div className="overflow-hidden rounded-2xl border border-violet-100 bg-violet-50/30">
              <div
                role="img"
                aria-label="Member portrait preview"
                className="mx-auto aspect-[4/5] max-h-[520px] w-full max-w-[420px] bg-slate-100 bg-cover bg-center"
                style={{
                  backgroundImage: `url("${visiblePhoto}")`,
                }}
              />

              <div className="flex flex-col gap-3 border-t border-violet-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    {selectedPhotoFile
                      ? selectedPhotoFile.name
                      : "Current profile photo"}
                  </p>

                  {selectedPhotoFile && (
                    <p className="mt-1 text-xs text-slate-400">
                      {(
                        selectedPhotoFile.size /
                        1024 /
                        1024
                      ).toFixed(2)}
                      {" "}
                      MB
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-violet-100 px-4 text-sm font-semibold text-violet-700 transition hover:bg-violet-50"
                  >
                    Change Photo
                  </button>

                  <button
                    type="button"
                    onClick={
                      handleRemovePhoto
                    }
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-red-100 px-4 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() =>
                fileInputRef.current?.click()
              }
              className="flex min-h-[260px] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-violet-200 bg-violet-50/30 px-6 py-10 text-center transition hover:border-violet-300 hover:bg-violet-50"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-violet-600 shadow-sm">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-7 w-7"
                >
                  <circle
                    cx="12"
                    cy="8"
                    r="4"
                  />

                  <path d="M5 21a7 7 0 0 1 14 0" />
                </svg>
              </div>

              <p className="mt-4 text-sm font-semibold text-violet-700">
                Select Profile Photo
              </p>

              <p className="mt-2 text-xs leading-5 text-slate-400">
                JPG, PNG, or WebP
                <br />
                Maximum 5 MB
                <br />
                Portrait 4:5 recommended
              </p>
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(event) =>
              handlePhotoSelection(
                event.target.files?.[0] ??
                  null,
              )
            }
          />
        </div>
      </section>

      {/* Profile Information */}
      <section className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-sm font-semibold text-violet-600">
          Profile Information
        </p>

        <h2 className="mt-1 text-xl font-bold text-slate-950">
          Public Profile
        </h2>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <div>
            <label
              htmlFor="profile-display-name"
              className="text-sm font-semibold text-slate-700"
            >
              Display Name
            </label>

            <input
              id="profile-display-name"
              type="text"
              value={profileDisplayName}
              onChange={(event) =>
                setProfileDisplayName(
                  event.target.value,
                )
              }
              placeholder="Member display name"
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            />
          </div>

          <div>
            <label
              htmlFor="profile-position"
              className="text-sm font-semibold text-slate-700"
            >
              Position
            </label>

            <input
              id="profile-position"
              type="text"
              value={profilePosition}
              onChange={(event) =>
                setProfilePosition(
                  event.target.value,
                )
              }
              placeholder="7ICONS Member"
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            />
          </div>
        </div>

        <div className="mt-5">
          <label
            htmlFor="profile-description"
            className="text-sm font-semibold text-slate-700"
          >
            Profile Description
          </label>

          <textarea
            id="profile-description"
            value={profileDescription}
            onChange={(event) =>
              setProfileDescription(
                event.target.value,
              )
            }
            rows={4}
            placeholder="Introduction displayed at the top of the member profile."
            className="mt-2 w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
          />
        </div>
      </section>

      {/* Profile Sections */}
      <section className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-violet-600">
              Profile Sections
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-950">
              Member Story
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Add flexible sections such
              as About, Personality,
              Memorable Moments, and The
              Journey.
            </p>
          </div>

          <button
            type="button"
            onClick={addSection}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-violet-100 px-4 text-sm font-semibold text-violet-700 transition hover:bg-violet-50"
          >
            <span className="text-lg">
              +
            </span>
            Add Section
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {profileSections.map(
            (section, sectionIndex) => (
              <div
                key={sectionIndex}
                className="rounded-2xl border border-violet-100 bg-violet-50/20 p-4 sm:p-5"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-bold text-slate-700">
                    Section{" "}
                    {sectionIndex + 1}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      removeSection(
                        sectionIndex,
                      )
                    }
                    className="text-xs font-semibold text-red-500 transition hover:text-red-700"
                  >
                    Remove Section
                  </button>
                </div>

                <div className="mt-4">
                  <label
                    htmlFor={`section-heading-${sectionIndex}`}
                    className="text-sm font-semibold text-slate-700"
                  >
                    Heading
                  </label>

                  <input
                    id={`section-heading-${sectionIndex}`}
                    type="text"
                    value={
                      section.heading
                    }
                    onChange={(event) =>
                      updateSectionHeading(
                        sectionIndex,
                        event.target
                          .value,
                      )
                    }
                    placeholder="About"
                    className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                  />
                </div>

                <div className="mt-4">
                  <label
                    htmlFor={`section-paragraphs-${sectionIndex}`}
                    className="text-sm font-semibold text-slate-700"
                  >
                    Paragraphs
                  </label>

                  <textarea
                    id={`section-paragraphs-${sectionIndex}`}
                    value={section.paragraphs.join(
                      "\n\n",
                    )}
                    onChange={(event) =>
                      updateSectionParagraphs(
                        sectionIndex,
                        event.target
                          .value,
                      )
                    }
                    rows={7}
                    placeholder={
                      "Write the first paragraph here.\n\nStart a new paragraph after an empty line."
                    }
                    className="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                  />

                  <p className="mt-2 text-xs text-slate-400">
                    Separate paragraphs
                    with one empty line.
                  </p>
                </div>
              </div>
            ),
          )}

          {profileSections.length ===
            0 && (
            <div className="rounded-2xl border border-dashed border-violet-200 px-6 py-10 text-center">
              <p className="text-sm font-medium text-slate-500">
                No profile sections.
              </p>

              <button
                type="button"
                onClick={addSection}
                className="mt-3 text-sm font-semibold text-violet-600"
              >
                + Add First Section
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 pb-6 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() =>
            router.push("/members")
          }
          disabled={isSubmitting}
          className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-violet-700 to-purple-500 px-6 text-sm font-semibold text-white shadow-lg shadow-violet-500/15 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {isSubmitting
            ? selectedPhotoFile
              ? "Uploading & Saving..."
              : "Saving..."
            : isEditing
              ? "Update Member"
              : "Create Member"}
        </button>
      </div>
    </form>
  );
}