"use client";

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export type RepresentativeSection = {
  heading: string;
  paragraphs: string[];
};

export type RepresentativeFormData = {
  id: string;
  slug: string;
  name: string;
  region: string;
  city: string;
  role: string;
  image_url: string;
  storage_path: string;
  short_bio: string;
  since: string;
  instagram: string;
  instagram_url: string;
  whatsapp: string;
  profile_description: string;
  profile_mission: string;
  profile_motto: string;
  profile_sections: RepresentativeSection[];
  display_order: number;
  is_published: boolean;
};

type RepresentativeFormProps = {
  representative?: RepresentativeFormData;
};

const allowedImageTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const maxImageSize = 10 * 1024 * 1024;

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

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getVisibleImageUrl(
  imageUrl: string,
) {
  if (!imageUrl) {
    return "";
  }

  if (
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://") ||
    imageUrl.startsWith("blob:")
  ) {
    return imageUrl;
  }

  return `https://7icons-web.vercel.app${imageUrl}`;
}

export default function RepresentativeForm({
  representative,
}: RepresentativeFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const isEditing =
    Boolean(representative);

  const [name, setName] = useState(
    representative?.name ?? "",
  );

  const [slug, setSlug] = useState(
    representative?.slug ?? "",
  );

  const [region, setRegion] = useState(
    representative?.region ?? "",
  );

  const [city, setCity] = useState(
    representative?.city ?? "",
  );

  const [role, setRole] = useState(
    representative?.role ??
      "ICONIA Fan Representative",
  );

  const [shortBio, setShortBio] =
    useState(
      representative?.short_bio ?? "",
    );

  const [since, setSince] = useState(
    representative?.since ?? "",
  );

  const [instagram, setInstagram] =
    useState(
      representative?.instagram ?? "",
    );

  const [
    instagramUrl,
    setInstagramUrl,
  ] = useState(
    representative?.instagram_url ?? "",
  );

  const [whatsapp, setWhatsapp] =
    useState(
      representative?.whatsapp ?? "",
    );

  const [
    profileDescription,
    setProfileDescription,
  ] = useState(
    representative?.profile_description ??
      "",
  );

  const [
    profileMission,
    setProfileMission,
  ] = useState(
    representative?.profile_mission ?? "",
  );

  const [
    profileMotto,
    setProfileMotto,
  ] = useState(
    representative?.profile_motto ?? "",
  );

  const [
    profileSections,
    setProfileSections,
  ] = useState<RepresentativeSection[]>(
    representative?.profile_sections ??
      [],
  );

  const [
    displayOrder,
    setDisplayOrder,
  ] = useState(
    representative?.display_order ?? 0,
  );

  const [
    isPublished,
    setIsPublished,
  ] = useState(
    representative?.is_published ?? true,
  );

  const [
    selectedImageFile,
    setSelectedImageFile,
  ] = useState<File | null>(null);

  const [
    selectedImagePreview,
    setSelectedImagePreview,
  ] = useState<string | null>(null);

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    progressMessage,
    setProgressMessage,
  ] = useState("");

  useEffect(() => {
    if (!selectedImageFile) {
      setSelectedImagePreview(null);
      return;
    }

    const objectUrl =
      URL.createObjectURL(
        selectedImageFile,
      );

    setSelectedImagePreview(
      objectUrl,
    );

    return () => {
      URL.revokeObjectURL(
        objectUrl,
      );
    };
  }, [selectedImageFile]);

  function handleNameChange(
    value: string,
  ) {
    setName(value);

    if (!isEditing) {
      setSlug(
        createSlug(
          `${value}-${region}`,
        ),
      );
    }
  }

  function handleRegionChange(
    value: string,
  ) {
    setRegion(value);

    if (!isEditing) {
      setSlug(
        createSlug(
          `${name}-${value}`,
        ),
      );
    }
  }

  function handleImageSelection(
    file: File | null,
  ) {
    setErrorMessage("");

    if (!file) {
      return;
    }

    if (
      !allowedImageTypes.includes(
        file.type,
      )
    ) {
      setErrorMessage(
        "Representative photo must be JPG, PNG, or WebP.",
      );

      if (fileInputRef.current) {
        fileInputRef.current.value =
          "";
      }

      return;
    }

    if (
      file.size >
      maxImageSize
    ) {
      setErrorMessage(
        "Representative photo must be 10 MB or smaller.",
      );

      if (fileInputRef.current) {
        fileInputRef.current.value =
          "";
      }

      return;
    }

    setSelectedImageFile(file);
  }

  function clearSelectedImage() {
    setSelectedImageFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value =
        "";
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
            index ===
            sectionIndex
              ? {
                  ...section,
                  heading: value,
                }
              : section,
        ),
    );
  }

  function addParagraph(
    sectionIndex: number,
  ) {
    setProfileSections(
      (current) =>
        current.map(
          (section, index) =>
            index ===
            sectionIndex
              ? {
                  ...section,
                  paragraphs: [
                    ...section.paragraphs,
                    "",
                  ],
                }
              : section,
        ),
    );
  }

  function updateParagraph(
    sectionIndex: number,
    paragraphIndex: number,
    value: string,
  ) {
    setProfileSections(
      (current) =>
        current.map(
          (section, index) => {
            if (
              index !==
              sectionIndex
            ) {
              return section;
            }

            return {
              ...section,
              paragraphs:
                section.paragraphs.map(
                  (
                    paragraph,
                    index,
                  ) =>
                    index ===
                    paragraphIndex
                      ? value
                      : paragraph,
                ),
            };
          },
        ),
    );
  }

  function removeParagraph(
    sectionIndex: number,
    paragraphIndex: number,
  ) {
    setProfileSections(
      (current) =>
        current.map(
          (section, index) => {
            if (
              index !==
              sectionIndex
            ) {
              return section;
            }

            return {
              ...section,
              paragraphs:
                section.paragraphs.filter(
                  (
                    _,
                    index,
                  ) =>
                    index !==
                    paragraphIndex,
                ),
            };
          },
        ),
    );
  }

  async function removeStorageFile(
    storagePath: string,
  ) {
    if (!storagePath) {
      return;
    }

    const { error } =
      await supabase.storage
        .from(
          "fan-representatives",
        )
        .remove([storagePath]);

    if (error) {
      console.error(
        "Representative storage cleanup failed:",
        error,
      );
    }
  }

  async function uploadImage(
    file: File,
    userId: string,
  ) {
    const extension =
      getFileExtension(file);

    const storagePath =
      `${userId}/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } =
      await supabase.storage
        .from(
          "fan-representatives",
        )
        .upload(
          storagePath,
          file,
          {
            cacheControl: "3600",
            upsert: false,
          },
        );

    if (uploadError) {
      throw uploadError;
    }

    const { data } =
      supabase.storage
        .from(
          "fan-representatives",
        )
        .getPublicUrl(
          storagePath,
        );

    return {
      imageUrl:
        data.publicUrl,
      storagePath,
    };
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setErrorMessage("");
    setProgressMessage("");

    const cleanName =
      name.trim();

    const cleanSlug =
      createSlug(slug);

    if (!cleanName) {
      setErrorMessage(
        "Representative name is required.",
      );
      return;
    }

    if (!cleanSlug) {
      setErrorMessage(
        "Slug is required.",
      );
      return;
    }

    if (!region.trim()) {
      setErrorMessage(
        "Region is required.",
      );
      return;
    }

    if (!city.trim()) {
      setErrorMessage(
        "City is required.",
      );
      return;
    }

    if (
      !representative?.image_url &&
      !selectedImageFile
    ) {
      setErrorMessage(
        "Please select a representative photo.",
      );
      return;
    }

    if (
      !Number.isInteger(
        displayOrder,
      ) ||
      displayOrder < 0
    ) {
      setErrorMessage(
        "Display order must be 0 or greater.",
      );
      return;
    }

    setIsSubmitting(true);

    let newlyUploadedStoragePath:
      | string
      | null = null;

    try {
      const {
        data: userData,
        error: userError,
      } =
        await supabase.auth.getUser();

      if (
        userError ||
        !userData.user
      ) {
        throw new Error(
          "Your admin session could not be verified. Please sign in again.",
        );
      }

      let imageUrl =
        representative?.image_url ??
        "";

      let storagePath =
        representative?.storage_path ??
        "";

      if (selectedImageFile) {
        setProgressMessage(
          "Uploading representative photo...",
        );

        const uploadResult =
          await uploadImage(
            selectedImageFile,
            userData.user.id,
          );

        imageUrl =
          uploadResult.imageUrl;

        storagePath =
          uploadResult.storagePath;

        newlyUploadedStoragePath =
          uploadResult.storagePath;
      }

      const cleanSections =
        profileSections
          .map((section) => ({
            heading:
              section.heading.trim(),

            paragraphs:
              section.paragraphs
                .map(
                  (paragraph) =>
                    paragraph.trim(),
                )
                .filter(Boolean),
          }))
          .filter(
            (section) =>
              section.heading ||
              section.paragraphs
                .length > 0,
          );

      const payload = {
        slug: cleanSlug,
        name: cleanName,

        region:
          region.trim(),

        city:
          city.trim(),

        role:
          role.trim() ||
          "ICONIA Fan Representative",

        image_url:
          imageUrl,

        storage_path:
          storagePath,

        short_bio:
          shortBio.trim(),

        since:
          since.trim(),

        instagram:
          instagram.trim(),

        instagram_url:
          instagramUrl.trim(),

        whatsapp:
          whatsapp.trim(),

        profile_description:
          profileDescription.trim(),

        profile_mission:
          profileMission.trim(),

        profile_motto:
          profileMotto.trim(),

        profile_sections:
          cleanSections,

        display_order:
          displayOrder,

        is_published:
          isPublished,

        updated_by:
          userData.user.id,

        updated_at:
          new Date().toISOString(),
      };

      setProgressMessage(
        isEditing
          ? "Updating representative..."
          : "Creating representative...",
      );

      if (representative) {
        const {
          error: updateError,
        } = await supabase
          .from(
            "fan_representatives",
          )
          .update(payload)
          .eq(
            "id",
            representative.id,
          );

        if (updateError) {
          if (
            newlyUploadedStoragePath
          ) {
            await removeStorageFile(
              newlyUploadedStoragePath,
            );
          }

          throw updateError;
        }

        if (
          selectedImageFile &&
          representative.storage_path &&
          representative.storage_path !==
            storagePath
        ) {
          await removeStorageFile(
            representative.storage_path,
          );
        }
      } else {
        const {
          error: insertError,
        } = await supabase
          .from(
            "fan_representatives",
          )
          .insert({
            ...payload,
            created_by:
              userData.user.id,
          });

        if (insertError) {
          if (
            newlyUploadedStoragePath
          ) {
            await removeStorageFile(
              newlyUploadedStoragePath,
            );
          }

          throw insertError;
        }
      }

      router.push(
        "/representatives",
      );

      router.refresh();
    } catch (error) {
      console.error(
        "Representative save failed:",
        error,
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to save this representative.",
      );
    } finally {
      setIsSubmitting(false);
      setProgressMessage("");
    }
  }

  const visibleImage =
    selectedImagePreview ??
    getVisibleImageUrl(
      representative?.image_url ??
        "",
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

      {/* Progress */}
      {progressMessage && (
        <div className="rounded-2xl border border-violet-100 bg-violet-50 px-5 py-4 text-sm font-semibold text-violet-700">
          {progressMessage}
        </div>
      )}

      {/* Basic Information */}
      <section className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-sm font-semibold text-violet-600">
          Representative Information
        </p>

        <h2 className="mt-1 text-xl font-bold text-slate-950">
          Basic Information
        </h2>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <div>
            <label
              htmlFor="representative-name"
              className="text-sm font-semibold text-slate-700"
            >
              Name
            </label>

            <input
              id="representative-name"
              type="text"
              value={name}
              onChange={(event) =>
                handleNameChange(
                  event.target.value,
                )
              }
              placeholder="Aulia Rahma"
              required
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            />
          </div>

          <div>
            <label
              htmlFor="representative-slug"
              className="text-sm font-semibold text-slate-700"
            >
              Slug
            </label>

            <input
              id="representative-slug"
              type="text"
              value={slug}
              onChange={(event) =>
                setSlug(
                  event.target.value,
                )
              }
              placeholder="aulia-rahma-jakarta"
              required
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            />
          </div>

          <div>
            <label
              htmlFor="representative-region"
              className="text-sm font-semibold text-slate-700"
            >
              Region
            </label>

            <input
              id="representative-region"
              type="text"
              value={region}
              onChange={(event) =>
                handleRegionChange(
                  event.target.value,
                )
              }
              placeholder="DKI Jakarta"
              required
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            />
          </div>

          <div>
            <label
              htmlFor="representative-city"
              className="text-sm font-semibold text-slate-700"
            >
              City
            </label>

            <input
              id="representative-city"
              type="text"
              value={city}
              onChange={(event) =>
                setCity(
                  event.target.value,
                )
              }
              placeholder="Jakarta"
              required
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            />
          </div>

          <div>
            <label
              htmlFor="representative-role"
              className="text-sm font-semibold text-slate-700"
            >
              Role
            </label>

            <input
              id="representative-role"
              type="text"
              value={role}
              onChange={(event) =>
                setRole(
                  event.target.value,
                )
              }
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            />
          </div>

          <div>
            <label
              htmlFor="representative-since"
              className="text-sm font-semibold text-slate-700"
            >
              Since
            </label>

            <input
              id="representative-since"
              type="text"
              value={since}
              onChange={(event) =>
                setSince(
                  event.target.value,
                )
              }
              placeholder="2026"
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            />
          </div>

          <div>
            <label
              htmlFor="representative-order"
              className="text-sm font-semibold text-slate-700"
            >
              Display Order
            </label>

            <input
              id="representative-order"
              type="number"
              min="0"
              step="1"
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
          </div>
        </div>

        <div className="mt-5">
          <label
            htmlFor="representative-short-bio"
            className="text-sm font-semibold text-slate-700"
          >
            Short Bio
          </label>

          <textarea
            id="representative-short-bio"
            value={shortBio}
            onChange={(event) =>
              setShortBio(
                event.target.value,
              )
            }
            rows={4}
            className="mt-2 w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
          />
        </div>
      </section>

      {/* Photo */}
      <section className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-sm font-semibold text-violet-600">
          Profile Photo
        </p>

        <h2 className="mt-1 text-xl font-bold text-slate-950">
          Representative Portrait
        </h2>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          JPG, PNG, or WebP. Maximum
          file size 10 MB.
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(event) =>
            handleImageSelection(
              event.target.files?.[0] ??
                null,
            )
          }
        />

        <div className="mt-6 grid gap-5 lg:grid-cols-[220px_1fr]">
          <div className="overflow-hidden rounded-2xl border border-violet-100 bg-violet-50">
            {visibleImage ? (
              <div
                role="img"
                aria-label={
                  name ||
                  "Representative photo"
                }
                className="aspect-[4/5] bg-contain bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url("${visibleImage}")`,
                }}
              />
            ) : (
              <div className="flex aspect-[4/5] items-center justify-center text-sm text-violet-400">
                No photo
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center">
            <button
              type="button"
              onClick={() =>
                fileInputRef.current?.click()
              }
              className="inline-flex h-11 w-fit items-center justify-center rounded-xl border border-violet-100 px-5 text-sm font-semibold text-violet-700 transition hover:bg-violet-50"
            >
              {visibleImage
                ? "Change Photo"
                : "Select Photo"}
            </button>

            {selectedImageFile && (
              <button
                type="button"
                onClick={
                  clearSelectedImage
                }
                className="mt-3 w-fit text-sm font-semibold text-slate-500 hover:text-slate-700"
              >
                Undo Change
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-sm font-semibold text-violet-600">
          Contact
        </p>

        <h2 className="mt-1 text-xl font-bold text-slate-950">
          Social & Community Contact
        </h2>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <div>
            <label
              htmlFor="representative-instagram"
              className="text-sm font-semibold text-slate-700"
            >
              Instagram
            </label>

            <input
              id="representative-instagram"
              type="text"
              value={instagram}
              onChange={(event) =>
                setInstagram(
                  event.target.value,
                )
              }
              placeholder="@username"
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            />
          </div>

          <div>
            <label
              htmlFor="representative-instagram-url"
              className="text-sm font-semibold text-slate-700"
            >
              Instagram URL
            </label>

            <input
              id="representative-instagram-url"
              type="url"
              value={instagramUrl}
              onChange={(event) =>
                setInstagramUrl(
                  event.target.value,
                )
              }
              placeholder="https://instagram.com/username"
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            />
          </div>

          <div>
            <label
              htmlFor="representative-whatsapp"
              className="text-sm font-semibold text-slate-700"
            >
              WhatsApp
            </label>

            <input
              id="representative-whatsapp"
              type="text"
              value={whatsapp}
              onChange={(event) =>
                setWhatsapp(
                  event.target.value,
                )
              }
              placeholder="6281234567890"
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            />
          </div>
        </div>
      </section>

      {/* Profile */}
      <section className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-sm font-semibold text-violet-600">
          Public Profile
        </p>

        <h2 className="mt-1 text-xl font-bold text-slate-950">
          Profile Content
        </h2>

        <div className="mt-6 space-y-5">
          <div>
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
              className="mt-2 w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            />
          </div>

          <div>
            <label
              htmlFor="profile-mission"
              className="text-sm font-semibold text-slate-700"
            >
              Mission
            </label>

            <textarea
              id="profile-mission"
              value={profileMission}
              onChange={(event) =>
                setProfileMission(
                  event.target.value,
                )
              }
              rows={3}
              className="mt-2 w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            />
          </div>

          <div>
            <label
              htmlFor="profile-motto"
              className="text-sm font-semibold text-slate-700"
            >
              Motto
            </label>

            <input
              id="profile-motto"
              type="text"
              value={profileMotto}
              onChange={(event) =>
                setProfileMotto(
                  event.target.value,
                )
              }
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            />
          </div>
        </div>
      </section>

      {/* Sections */}
      <section className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-violet-600">
              Profile Sections
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-950">
              Additional Sections
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Add sections such as About,
              Community Role, Local
              Community, or Supporting
              ICONIA.
            </p>
          </div>

          <button
            type="button"
            onClick={addSection}
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 px-4 text-sm font-semibold text-violet-700 transition hover:bg-violet-100"
          >
            + Add Section
          </button>
        </div>

        <div className="mt-6 space-y-5">
          {profileSections.length ===
          0 ? (
            <div className="rounded-2xl border border-dashed border-violet-200 bg-violet-50/30 px-5 py-10 text-center text-sm text-slate-500">
              No profile sections yet.
            </div>
          ) : (
            profileSections.map(
              (
                section,
                sectionIndex,
              ) => (
                <div
                  key={sectionIndex}
                  className="rounded-2xl border border-violet-100 bg-violet-50/20 p-5"
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-bold text-slate-800">
                      Section{" "}
                      {sectionIndex +
                        1}
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        removeSection(
                          sectionIndex,
                        )
                      }
                      className="text-xs font-semibold text-red-500 hover:text-red-700"
                    >
                      Remove Section
                    </button>
                  </div>

                  <div className="mt-4">
                    <label className="text-sm font-semibold text-slate-700">
                      Heading
                    </label>

                    <input
                      type="text"
                      value={
                        section.heading
                      }
                      onChange={(
                        event,
                      ) =>
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

                  <div className="mt-5 space-y-4">
                    {section.paragraphs.map(
                      (
                        paragraph,
                        paragraphIndex,
                      ) => (
                        <div
                          key={
                            paragraphIndex
                          }
                        >
                          <div className="flex items-center justify-between gap-4">
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                              Paragraph{" "}
                              {paragraphIndex +
                                1}
                            </label>

                            <button
                              type="button"
                              onClick={() =>
                                removeParagraph(
                                  sectionIndex,
                                  paragraphIndex,
                                )
                              }
                              className="text-xs font-semibold text-red-500 hover:text-red-700"
                            >
                              Remove
                            </button>
                          </div>

                          <textarea
                            value={
                              paragraph
                            }
                            onChange={(
                              event,
                            ) =>
                              updateParagraph(
                                sectionIndex,
                                paragraphIndex,
                                event
                                  .target
                                  .value,
                              )
                            }
                            rows={3}
                            className="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                          />
                        </div>
                      ),
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      addParagraph(
                        sectionIndex,
                      )
                    }
                    className="mt-4 text-sm font-semibold text-violet-600 hover:text-violet-800"
                  >
                    + Add Paragraph
                  </button>
                </div>
              ),
            )
          )}
        </div>
      </section>

      {/* Publishing */}
      <section className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-sm font-semibold text-violet-600">
          Publishing
        </p>

        <h2 className="mt-1 text-xl font-bold text-slate-950">
          Visibility
        </h2>

        <label className="mt-6 flex min-h-[82px] cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-200 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-slate-700">
              Published
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-400">
              Show this representative
              on the public website.
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
      </section>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 pb-6 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() =>
            router.push(
              "/representatives",
            )
          }
          disabled={isSubmitting}
          className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-violet-700 to-purple-500 px-6 text-sm font-semibold text-white shadow-lg shadow-violet-500/15 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting
            ? progressMessage ||
              "Saving..."
            : isEditing
              ? "Update Representative"
              : "Create Representative"}
        </button>
      </div>
    </form>
  );
}