"use client";

import {
  ChangeEvent,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export type MediaCategory =
  | "general"
  | "article"
  | "gallery"
  | "member"
  | "representative";

export type MediaAsset = {
  id: string;
  name: string;
  original_name: string;
  category: MediaCategory;
  bucket_id: string;
  storage_path: string;
  public_url: string;
  mime_type: string;
  size_bytes: number;
  alt_text: string;
  created_by: string | null;
  created_at: string;
};

type MediaLibraryProps = {
  assets: MediaAsset[];
  isRepresentative?: boolean;
};

const allowedTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const maxFileSize =
  10 * 1024 * 1024;

const categories: Array<{
  value: MediaCategory;
  label: string;
}> = [
  {
    value: "general",
    label: "General",
  },
  {
    value: "article",
    label: "Article",
  },
  {
    value: "gallery",
    label: "Gallery",
  },
  {
    value: "member",
    label: "Member",
  },
  {
    value: "representative",
    label: "Representative",
  },
];

function getFileExtension(
  file: File,
) {
  const extension =
    file.name
      .split(".")
      .pop()
      ?.toLowerCase();

  if (extension) {
    return extension;
  }

  if (
    file.type ===
    "image/png"
  ) {
    return "png";
  }

  if (
    file.type ===
    "image/webp"
  ) {
    return "webp";
  }

  return "jpg";
}

function removeExtension(
  filename: string,
) {
  return filename.replace(
    /\.[^/.]+$/,
    "",
  );
}

function formatFileSize(
  bytes: number,
) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (
    bytes <
    1024 * 1024
  ) {
    return `${(
      bytes / 1024
    ).toFixed(1)} KB`;
  }

  return `${(
    bytes /
    1024 /
    1024
  ).toFixed(2)} MB`;
}

function formatDate(
  dateString: string,
) {
  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  ).format(
    new Date(dateString),
  );
}

export default function MediaLibrary({
  assets,
  isRepresentative = false,
}: MediaLibraryProps) {
  const router = useRouter();

  const supabase =
    createClient();

  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null,
    );

  const [
    selectedFile,
    setSelectedFile,
  ] = useState<File | null>(
    null,
  );

  const [
    previewUrl,
    setPreviewUrl,
  ] = useState<
    string | null
  >(null);

  const [
    category,
    setCategory,
  ] = useState<MediaCategory>(
    isRepresentative
      ? "representative"
      : "general",
  );

  const [
    assetName,
    setAssetName,
  ] = useState("");

  const [
    altText,
    setAltText,
  ] = useState("");

  const [
    isUploading,
    setIsUploading,
  ] = useState(false);

  const [
    deletingId,
    setDeletingId,
  ] = useState<
    string | null
  >(null);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");

  const [
    categoryFilter,
    setCategoryFilter,
  ] = useState<
    "all" | MediaCategory
  >("all");

  function clearSelectedFile() {
    if (previewUrl) {
      URL.revokeObjectURL(
        previewUrl,
      );
    }

    setSelectedFile(null);
    setPreviewUrl(null);
    setAssetName("");
    setAltText("");

    if (
      fileInputRef.current
    ) {
      fileInputRef.current.value =
        "";
    }
  }

  function handleFileChange(
    event:
      ChangeEvent<HTMLInputElement>,
  ) {
    setErrorMessage("");
    setSuccessMessage("");

    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      !allowedTypes.includes(
        file.type,
      )
    ) {
      setErrorMessage(
        "Only JPG, PNG, and WebP images are supported.",
      );

      event.target.value =
        "";

      return;
    }

    if (
      file.size >
      maxFileSize
    ) {
      setErrorMessage(
        "The image must be 10 MB or smaller.",
      );

      event.target.value =
        "";

      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(
        previewUrl,
      );
    }

    const nextPreview =
      URL.createObjectURL(
        file,
      );

    setSelectedFile(file);
    setPreviewUrl(
      nextPreview,
    );

    const defaultName =
      removeExtension(
        file.name,
      );

    setAssetName(
      defaultName,
    );

    setAltText(
      defaultName,
    );
  }

  async function handleUpload() {
    if (
      !selectedFile
    ) {
      setErrorMessage(
        "Choose an image first.",
      );

      return;
    }

    if (
      !assetName.trim()
    ) {
      setErrorMessage(
        "Media name is required.",
      );

      return;
    }

    setIsUploading(true);
    setErrorMessage("");
    setSuccessMessage("");

    let uploadedStoragePath:
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
          "Your session could not be verified. Please sign in again.",
        );
      }

      const user =
        userData.user;

      const extension =
        getFileExtension(
          selectedFile,
        );

      const storagePath =
        `${user.id}/${crypto.randomUUID()}.${extension}`;

      const {
        error: uploadError,
      } =
        await supabase.storage
          .from(
            "media-library",
          )
          .upload(
            storagePath,
            selectedFile,
            {
              cacheControl:
                "3600",

              upsert: false,
            },
          );

      if (uploadError) {
        throw uploadError;
      }

      uploadedStoragePath =
        storagePath;

      const {
        data: publicUrlData,
      } =
        supabase.storage
          .from(
            "media-library",
          )
          .getPublicUrl(
            storagePath,
          );

      const {
        error: insertError,
      } = await supabase
        .from(
          "media_assets",
        )
        .insert({
          name:
            assetName.trim(),

          original_name:
            selectedFile.name,

          category:
            isRepresentative
              ? "representative"
              : category,

          bucket_id:
            "media-library",

          storage_path:
            storagePath,

          public_url:
            publicUrlData.publicUrl,

          mime_type:
            selectedFile.type,

          size_bytes:
            selectedFile.size,

          alt_text:
            altText.trim(),

          created_by:
            user.id,

          updated_by:
            user.id,
        });

      if (insertError) {
        throw insertError;
      }

      clearSelectedFile();

      setCategory(
        isRepresentative
          ? "representative"
          : "general",
      );

      setSuccessMessage(
        "Media uploaded successfully.",
      );

      router.refresh();
    } catch (error) {
      if (
        uploadedStoragePath
      ) {
        await supabase.storage
          .from(
            "media-library",
          )
          .remove([
            uploadedStoragePath,
          ]);
      }

      console.error(
        "Media upload failed:",
        error,
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to upload media.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDelete(
    asset: MediaAsset,
  ) {
    const confirmed =
      window.confirm(
        `Delete "${asset.name}" from the Media Library?`,
      );

    if (!confirmed) {
      return;
    }

    setDeletingId(
      asset.id,
    );

    setErrorMessage("");
    setSuccessMessage("");

    try {
      const {
        error: deleteRowError,
      } = await supabase
        .from(
          "media_assets",
        )
        .delete()
        .eq(
          "id",
          asset.id,
        );

      if (
        deleteRowError
      ) {
        throw deleteRowError;
      }

      const {
        error: storageError,
      } =
        await supabase.storage
          .from(
            asset.bucket_id,
          )
          .remove([
            asset.storage_path,
          ]);

      if (
        storageError
      ) {
        console.error(
          "Media file cleanup failed:",
          storageError,
        );
      }

      setSuccessMessage(
        "Media deleted successfully.",
      );

      router.refresh();
    } catch (error) {
      console.error(
        "Media delete failed:",
        error,
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to delete media.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  const normalizedSearch =
    searchQuery
      .trim()
      .toLowerCase();

  const filteredAssets =
    assets.filter(
      (asset) => {
        const matchesSearch =
          !normalizedSearch ||
          asset.name
            .toLowerCase()
            .includes(
              normalizedSearch,
            ) ||
          asset.original_name
            .toLowerCase()
            .includes(
              normalizedSearch,
            ) ||
          asset.alt_text
            .toLowerCase()
            .includes(
              normalizedSearch,
            );

        const matchesCategory =
          categoryFilter ===
            "all" ||
          asset.category ===
            categoryFilter;

        return (
          matchesSearch &&
          matchesCategory
        );
      },
    );

  return (
    <div className="space-y-6">
      {/* Messages */}
      {errorMessage && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700">
          {successMessage}
        </div>
      )}

      {/* Upload */}
      <section className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm sm:p-6">
        <div>
          <p className="text-sm font-semibold text-violet-600">
            Upload Media
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-950">
            Add Image
          </h2>

          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
            {isRepresentative
              ? "Upload images to your personal Representative Media Library."
              : "Upload reusable visual assets for the 7ICONS platform."}
          </p>
        </div>

        <input
          ref={
            fileInputRef
          }
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={
            handleFileChange
          }
        />

        {!selectedFile ? (
          <button
            type="button"
            onClick={() =>
              fileInputRef.current?.click()
            }
            className="mt-6 flex min-h-[180px] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-violet-200 bg-violet-50/30 px-6 py-8 text-center transition hover:border-violet-300 hover:bg-violet-50"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl font-semibold text-violet-600 shadow-sm">
              +
            </div>

            <p className="mt-4 text-sm font-semibold text-violet-700">
              Choose Image
            </p>

            <p className="mt-2 text-xs text-slate-400">
              JPG, PNG or WebP •
              Maximum 10 MB
            </p>
          </button>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
            {/* Preview */}
            <div>
              <div
                role="img"
                aria-label={
                  altText ||
                  assetName ||
                  selectedFile.name
                }
                className="aspect-square overflow-hidden rounded-2xl border border-violet-100 bg-slate-100 bg-cover bg-center"
                style={{
                  backgroundImage: `url("${previewUrl}")`,
                }}
              />

              <button
                type="button"
                disabled={
                  isUploading
                }
                onClick={
                  clearSelectedFile
                }
                className="mt-3 text-sm font-semibold text-red-500 transition hover:text-red-700 disabled:opacity-50"
              >
                Remove Selected Image
              </button>
            </div>

            {/* Metadata */}
            <div className="space-y-5">
              <div>
                <label
                  htmlFor="media-name"
                  className="text-sm font-semibold text-slate-700"
                >
                  Media Name
                </label>

                <input
                  id="media-name"
                  type="text"
                  value={
                    assetName
                  }
                  onChange={(
                    event,
                  ) =>
                    setAssetName(
                      event.target
                        .value,
                    )
                  }
                  disabled={
                    isUploading
                  }
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100 disabled:bg-slate-50"
                />
              </div>

              {!isRepresentative && (
                <div>
                  <label
                    htmlFor="media-category"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Category
                  </label>

                  <select
                    id="media-category"
                    value={
                      category
                    }
                    onChange={(
                      event,
                    ) =>
                      setCategory(
                        event.target
                          .value as MediaCategory,
                      )
                    }
                    disabled={
                      isUploading
                    }
                    className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100 disabled:bg-slate-50"
                  >
                    {categories.map(
                      (item) => (
                        <option
                          key={
                            item.value
                          }
                          value={
                            item.value
                          }
                        >
                          {
                            item.label
                          }
                        </option>
                      ),
                    )}
                  </select>
                </div>
              )}

              {isRepresentative && (
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    Category
                  </p>

                  <div className="mt-2 flex h-11 items-center rounded-xl border border-violet-100 bg-violet-50 px-4 text-sm font-semibold text-violet-700">
                    Representative
                  </div>
                </div>
              )}

              <div>
                <label
                  htmlFor="media-alt-text"
                  className="text-sm font-semibold text-slate-700"
                >
                  Alt Text
                </label>

                <input
                  id="media-alt-text"
                  type="text"
                  value={
                    altText
                  }
                  onChange={(
                    event,
                  ) =>
                    setAltText(
                      event.target
                        .value,
                    )
                  }
                  disabled={
                    isUploading
                  }
                  placeholder="Describe the image..."
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 disabled:bg-slate-50"
                />
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500">
                  {
                    selectedFile.name
                  }
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {formatFileSize(
                    selectedFile.size,
                  )}
                </p>
              </div>

              <button
                type="button"
                disabled={
                  isUploading
                }
                onClick={
                  handleUpload
                }
                className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-violet-700 to-purple-500 px-6 text-sm font-semibold text-white shadow-lg shadow-violet-500/15 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUploading
                  ? "Uploading..."
                  : "Upload Media"}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Filters */}
      <section className="rounded-2xl border border-violet-100 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
            >
              <circle
                cx="11"
                cy="11"
                r="7"
              />

              <path d="m20 20-4-4" />
            </svg>

            <input
              type="search"
              value={
                searchQuery
              }
              onChange={(
                event,
              ) =>
                setSearchQuery(
                  event.target
                    .value,
                )
              }
              placeholder="Search media..."
              className="h-11 w-full rounded-xl border border-slate-200 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            />
          </div>

          {!isRepresentative && (
            <select
              value={
                categoryFilter
              }
              onChange={(
                event,
              ) =>
                setCategoryFilter(
                  event.target
                    .value as
                    | "all"
                    | MediaCategory,
                )
              }
              className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100 lg:min-w-[190px]"
            >
              <option value="all">
                All Categories
              </option>

              {categories.map(
                (item) => (
                  <option
                    key={
                      item.value
                    }
                    value={
                      item.value
                    }
                  >
                    {
                      item.label
                    }
                  </option>
                ),
              )}
            </select>
          )}
        </div>
      </section>

      {/* Library */}
      <section className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-violet-600">
              {isRepresentative
                ? "My Media"
                : "Media Library"}
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-950">
              Visual Assets
            </h2>
          </div>

          <p className="text-sm font-medium text-slate-400">
            {
              filteredAssets.length
            }{" "}
            {filteredAssets.length ===
            1
              ? "asset"
              : "assets"}
          </p>
        </div>

        {filteredAssets.length ===
        0 ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-7 w-7"
              >
                <rect
                  x="3"
                  y="4"
                  width="18"
                  height="16"
                  rx="2"
                />

                <circle
                  cx="9"
                  cy="9"
                  r="2"
                />

                <path d="m4 18 5-5 3 3 2-2 6 6" />
              </svg>
            </div>

            <h3 className="mt-4 text-lg font-bold text-slate-900">
              No media yet
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Upload the first image
              to begin building the
              Media Library.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredAssets.map(
              (asset) => (
                <article
                  key={
                    asset.id
                  }
                  className="overflow-hidden rounded-2xl border border-violet-100 bg-white transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div
                    role="img"
                    aria-label={
                      asset.alt_text ||
                      asset.name
                    }
                    className="aspect-[4/3] bg-slate-100 bg-cover bg-center"
                    style={{
                      backgroundImage: `url("${asset.public_url}")`,
                    }}
                  />

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-800">
                          {
                            asset.name
                          }
                        </p>

                        <p className="mt-1 truncate text-xs text-slate-400">
                          {
                            asset.original_name
                          }
                        </p>
                      </div>

                      <span className="shrink-0 rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-semibold capitalize text-violet-700">
                        {
                          asset.category
                        }
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-violet-50 pt-3">
                      <div className="text-xs leading-5 text-slate-400">
                        <p>
                          {formatFileSize(
                            asset.size_bytes,
                          )}
                        </p>

                        <p>
                          {formatDate(
                            asset.created_at,
                          )}
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled={
                          deletingId ===
                          asset.id
                        }
                        onClick={() =>
                          handleDelete(
                            asset,
                          )
                        }
                        className="inline-flex h-9 items-center justify-center rounded-lg border border-red-100 px-3 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingId ===
                        asset.id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  </div>
                </article>
              ),
            )}
          </div>
        )}
      </section>
    </div>
  );
}