"use client";

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export type GalleryCategory =
  | "Performance"
  | "Behind the Scenes"
  | "Events"
  | "Fan Moments"
  | "Other";

export type GalleryAlbumData = {
  id: string;
  title: string;
  category: GalleryCategory;
  album_date: string | null;
  description: string;
  is_published: boolean;
  is_featured: boolean;
  sort_order: number;
};

export type GalleryAlbumPhotoData = {
  id: string;
  album_id: string;
  image_url: string;
  storage_path: string;
  alt_text: string;
  sort_order: number;
};

type GalleryAlbumFormProps = {
  album?: GalleryAlbumData;
  existingPhotos?: GalleryAlbumPhotoData[];
};

const categories: GalleryCategory[] = [
  "Performance",
  "Behind the Scenes",
  "Events",
  "Fan Moments",
  "Other",
];

const allowedPhotoTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const maxPhotoSize = 10 * 1024 * 1024;
const maxPhotosPerAlbum = 20;

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

export default function GalleryAlbumForm({
  album,
  existingPhotos = [],
}: GalleryAlbumFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const isEditing = Boolean(album);

  const [title, setTitle] = useState(
    album?.title ?? "",
  );

  const [category, setCategory] =
    useState<GalleryCategory>(
      album?.category ?? "Performance",
    );

  const [albumDate, setAlbumDate] =
    useState(album?.album_date ?? "");

  const [description, setDescription] =
    useState(album?.description ?? "");

  const [sortOrder, setSortOrder] =
    useState(album?.sort_order ?? 0);

  const [isPublished, setIsPublished] =
    useState(
      album?.is_published ?? true,
    );

  const [isFeatured, setIsFeatured] =
    useState(
      album?.is_featured ?? false,
    );

  const [
    selectedFiles,
    setSelectedFiles,
  ] = useState<File[]>([]);

  const [
    selectedPreviews,
    setSelectedPreviews,
  ] = useState<string[]>([]);

  const [
    removedPhotoIds,
    setRemovedPhotoIds,
  ] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [progressMessage, setProgressMessage] =
    useState("");

  useEffect(() => {
    const previews =
      selectedFiles.map((file) =>
        URL.createObjectURL(file),
      );

    setSelectedPreviews(previews);

    return () => {
      previews.forEach((preview) =>
        URL.revokeObjectURL(preview),
      );
    };
  }, [selectedFiles]);

  const visibleExistingPhotos =
    existingPhotos.filter(
      (photo) =>
        !removedPhotoIds.includes(
          photo.id,
        ),
    );

  const totalPhotoCount =
    visibleExistingPhotos.length +
    selectedFiles.length;

  function handleFileSelection(
    files: FileList | null,
  ) {
    setErrorMessage("");

    if (!files) {
      return;
    }

    const incoming =
      Array.from(files);

    const validFiles: File[] = [];

    for (const file of incoming) {
      if (
        !allowedPhotoTypes.includes(
          file.type,
        )
      ) {
        setErrorMessage(
          `${file.name} is not supported. Use JPG, PNG, or WebP.`,
        );

        continue;
      }

      if (file.size > maxPhotoSize) {
        setErrorMessage(
          `${file.name} is larger than 10 MB.`,
        );

        continue;
      }

      validFiles.push(file);
    }

    setSelectedFiles((current) => {
      const combined = [
        ...current,
        ...validFiles,
      ];

      const unique =
        combined.filter(
          (file, index, array) =>
            array.findIndex(
              (candidate) =>
                candidate.name ===
                  file.name &&
                candidate.size ===
                  file.size &&
                candidate.lastModified ===
                  file.lastModified,
            ) === index,
        );

      const availableSlots =
        maxPhotosPerAlbum -
        visibleExistingPhotos.length;

      if (
        unique.length >
        availableSlots
      ) {
        setErrorMessage(
          `An album can contain a maximum of ${maxPhotosPerAlbum} photos.`,
        );
      }

      return unique.slice(
        0,
        Math.max(
          availableSlots,
          0,
        ),
      );
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function removeSelectedFile(
    index: number,
  ) {
    setSelectedFiles((current) =>
      current.filter(
        (_, fileIndex) =>
          fileIndex !== index,
      ),
    );
  }

  function clearSelectedFiles() {
    setSelectedFiles([]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function toggleRemoveExistingPhoto(
    photoId: string,
  ) {
    setRemovedPhotoIds(
      (current) =>
        current.includes(photoId)
          ? current.filter(
              (id) =>
                id !== photoId,
            )
          : [
              ...current,
              photoId,
            ],
    );
  }

  async function removeStorageFiles(
    storagePaths: string[],
  ) {
    if (storagePaths.length === 0) {
      return;
    }

    const { error } =
      await supabase.storage
        .from("gallery-photos")
        .remove(storagePaths);

    if (error) {
      console.error(
        "Gallery Storage cleanup failed:",
        error,
      );
    }
  }

  async function uploadFile(
    file: File,
    userId: string,
  ) {
    const extension =
      getFileExtension(file);

    const storagePath =
      `${userId}/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } =
      await supabase.storage
        .from("gallery-photos")
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
        .from("gallery-photos")
        .getPublicUrl(
          storagePath,
        );

    return {
      imageUrl:
        data.publicUrl,
      storagePath,
    };
  }

  async function uploadSelectedFiles(
    userId: string,
  ) {
    const uploaded: Array<{
      imageUrl: string;
      storagePath: string;
      file: File;
    }> = [];

    try {
      for (
        let index = 0;
        index < selectedFiles.length;
        index++
      ) {
        setProgressMessage(
          `Uploading ${index + 1} of ${selectedFiles.length} photos...`,
        );

        const result =
          await uploadFile(
            selectedFiles[index],
            userId,
          );

        uploaded.push({
          ...result,
          file:
            selectedFiles[index],
        });
      }

      return uploaded;
    } catch (error) {
      await removeStorageFiles(
        uploaded.map(
          (item) =>
            item.storagePath,
        ),
      );

      throw error;
    }
  }

  async function handleCreate(
    userId: string,
  ) {
    const uploaded =
      await uploadSelectedFiles(
        userId,
      );

    let createdAlbumId:
      | string
      | null = null;

    try {
      setProgressMessage(
        "Creating album...",
      );

      const {
        data: createdAlbum,
        error: albumError,
      } = await supabase
        .from("gallery_albums")
        .insert({
          title:
            title.trim(),

          category,

          album_date:
            albumDate || null,

          description:
            description.trim(),

          is_published:
            isPublished,

          is_featured:
            isFeatured,

          sort_order:
            sortOrder,

          created_by:
            userId,

          updated_by:
            userId,
        })
        .select("id")
        .single();

      if (
        albumError ||
        !createdAlbum
      ) {
        throw (
          albumError ??
          new Error(
            "Album could not be created.",
          )
        );
      }

      createdAlbumId =
        createdAlbum.id;

      const photoRows =
        uploaded.map(
          (item, index) => ({
            album_id:
              createdAlbum.id,

            image_url:
              item.imageUrl,

            storage_path:
              item.storagePath,

            alt_text:
              `${title.trim()} photo ${index + 1}`,

            sort_order:
              index,
          }),
        );

      setProgressMessage(
        "Saving album photos...",
      );

      const { error: photosError } =
        await supabase
          .from(
            "gallery_album_photos",
          )
          .insert(photoRows);

      if (photosError) {
        throw photosError;
      }
    } catch (error) {
      if (createdAlbumId) {
        await supabase
          .from("gallery_albums")
          .delete()
          .eq(
            "id",
            createdAlbumId,
          );
      }

      await removeStorageFiles(
        uploaded.map(
          (item) =>
            item.storagePath,
        ),
      );

      throw error;
    }
  }

  async function handleUpdate(
    userId: string,
  ) {
    if (!album) {
      return;
    }

    const uploaded =
      await uploadSelectedFiles(
        userId,
      );

    try {
      setProgressMessage(
        "Updating album...",
      );

      const { error: albumError } =
        await supabase
          .from("gallery_albums")
          .update({
            title:
              title.trim(),

            category,

            album_date:
              albumDate || null,

            description:
              description.trim(),

            is_published:
              isPublished,

            is_featured:
              isFeatured,

            sort_order:
              sortOrder,

            updated_by:
              userId,

            updated_at:
              new Date().toISOString(),
          })
          .eq("id", album.id);

      if (albumError) {
        throw albumError;
      }

      const maxExistingOrder =
        visibleExistingPhotos.reduce(
          (highest, photo) =>
            Math.max(
              highest,
              photo.sort_order,
            ),
          -1,
        );

      if (uploaded.length > 0) {
        const newPhotoRows =
          uploaded.map(
            (item, index) => ({
              album_id:
                album.id,

              image_url:
                item.imageUrl,

              storage_path:
                item.storagePath,

              alt_text:
                `${title.trim()} photo ${
                  maxExistingOrder +
                  index +
                  2
                }`,

              sort_order:
                maxExistingOrder +
                index +
                1,
            }),
          );

        const { error: insertError } =
          await supabase
            .from(
              "gallery_album_photos",
            )
            .insert(
              newPhotoRows,
            );

        if (insertError) {
          throw insertError;
        }
      }

      if (
        removedPhotoIds.length >
        0
      ) {
        const photosToRemove =
          existingPhotos.filter(
            (photo) =>
              removedPhotoIds.includes(
                photo.id,
              ),
          );

        const { error: deleteError } =
          await supabase
            .from(
              "gallery_album_photos",
            )
            .delete()
            .in(
              "id",
              removedPhotoIds,
            );

        if (deleteError) {
          throw deleteError;
        }

        await removeStorageFiles(
          photosToRemove.map(
            (photo) =>
              photo.storage_path,
          ),
        );
      }
    } catch (error) {
      await removeStorageFiles(
        uploaded.map(
          (item) =>
            item.storagePath,
        ),
      );

      throw error;
    }
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

    if (!title.trim()) {
      setErrorMessage(
        "Album title is required.",
      );

      return;
    }

    if (totalPhotoCount === 0) {
      setErrorMessage(
        "An album must contain at least one photo.",
      );

      return;
    }

    if (
      totalPhotoCount >
      maxPhotosPerAlbum
    ) {
      setErrorMessage(
        `An album can contain a maximum of ${maxPhotosPerAlbum} photos.`,
      );

      return;
    }

    if (
      !Number.isInteger(sortOrder) ||
      sortOrder < 0
    ) {
      setErrorMessage(
        "Sort order must be 0 or greater.",
      );

      return;
    }

    setIsSubmitting(true);

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

      if (album) {
        await handleUpdate(
          userData.user.id,
        );
      } else {
        await handleCreate(
          userData.user.id,
        );
      }

      router.push("/gallery");
      router.refresh();
    } catch (error) {
      console.error(
        "Gallery album save failed:",
        error,
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to save this Gallery album.",
      );
    } finally {
      setIsSubmitting(false);
      setProgressMessage("");
    }
  }

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

      {/* Album Information */}
      <section className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-sm font-semibold text-violet-600">
          Album Information
        </p>

        <h2 className="mt-1 text-xl font-bold text-slate-950">
          Gallery Album
        </h2>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          One album can contain multiple
          photographs from the same
          moment or event.
        </p>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {/* Title */}
          <div>
            <label
              htmlFor="album-title"
              className="text-sm font-semibold text-slate-700"
            >
              Album Title
            </label>

            <input
              id="album-title"
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(
                  event.target.value,
                )
              }
              placeholder="7ICONS Live Performance"
              required
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            />
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="album-category"
              className="text-sm font-semibold text-slate-700"
            >
              Category
            </label>

            <select
              id="album-category"
              value={category}
              onChange={(event) =>
                setCategory(
                  event.target
                    .value as GalleryCategory,
                )
              }
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            >
              {categories.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                ),
              )}
            </select>
          </div>

          {/* Date */}
          <div>
            <label
              htmlFor="album-date"
              className="text-sm font-semibold text-slate-700"
            >
              Album Date
            </label>

            <input
              id="album-date"
              type="date"
              value={albumDate}
              onChange={(event) =>
                setAlbumDate(
                  event.target.value,
                )
              }
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            />
          </div>

          {/* Sort Order */}
          <div>
            <label
              htmlFor="album-order"
              className="text-sm font-semibold text-slate-700"
            >
              Sort Order
            </label>

            <input
              id="album-order"
              type="number"
              min="0"
              step="1"
              value={sortOrder}
              onChange={(event) =>
                setSortOrder(
                  Number(
                    event.target.value,
                  ),
                )
              }
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            />
          </div>
        </div>

        {/* Description */}
        <div className="mt-5">
          <label
            htmlFor="album-description"
            className="text-sm font-semibold text-slate-700"
          >
            Description
          </label>

          <textarea
            id="album-description"
            value={description}
            onChange={(event) =>
              setDescription(
                event.target.value,
              )
            }
            rows={5}
            placeholder="Describe the event or moment represented by this album."
            className="mt-2 w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
          />
        </div>
      </section>

      {/* Photos */}
      <section className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-violet-600">
              Album Photos
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-950">
              Photos
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Add up to{" "}
              {maxPhotosPerAlbum} JPG,
              PNG, or WebP images.
              Maximum 10 MB each.
            </p>
          </div>

          <div className="rounded-full bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700">
            {totalPhotoCount} /{" "}
            {maxPhotosPerAlbum}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(event) =>
            handleFileSelection(
              event.target.files,
            )
          }
        />

        <button
          type="button"
          onClick={() =>
            fileInputRef.current?.click()
          }
          disabled={
            totalPhotoCount >=
            maxPhotosPerAlbum
          }
          className="mt-6 flex min-h-[180px] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-violet-200 bg-violet-50/30 px-6 py-8 text-center transition hover:border-violet-300 hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-xl font-semibold text-violet-600 shadow-sm">
            +
          </div>

          <p className="mt-4 text-sm font-semibold text-violet-700">
            Add Photos
          </p>

          <p className="mt-2 text-xs text-slate-400">
            You can select multiple
            images at once.
          </p>
        </button>

        {/* Existing Photos */}
        {existingPhotos.length > 0 && (
          <div className="mt-7">
            <p className="text-sm font-bold text-slate-700">
              Current Album Photos
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {existingPhotos.map(
                (photo) => {
                  const removed =
                    removedPhotoIds.includes(
                      photo.id,
                    );

                  return (
                    <div
                      key={photo.id}
                      className={[
                        "overflow-hidden rounded-2xl border bg-white transition",
                        removed
                          ? "border-red-200 opacity-50"
                          : "border-violet-100",
                      ].join(" ")}
                    >
                      <div
                        role="img"
                        aria-label={
                          photo.alt_text ||
                          title
                        }
                        className="aspect-[4/3] bg-slate-100 bg-cover bg-center"
                        style={{
                          backgroundImage: `url("${photo.image_url}")`,
                        }}
                      />

                      <div className="p-3">
                        <p className="truncate text-xs text-slate-400">
                          {photo.alt_text ||
                            "Gallery photo"}
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            toggleRemoveExistingPhoto(
                              photo.id,
                            )
                          }
                          className={[
                            "mt-3 text-xs font-semibold",
                            removed
                              ? "text-violet-600"
                              : "text-red-500 hover:text-red-700",
                          ].join(" ")}
                        >
                          {removed
                            ? "Undo Remove"
                            : "Remove Photo"}
                        </button>
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </div>
        )}

        {/* New Photos */}
        {selectedFiles.length > 0 && (
          <div className="mt-7">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-bold text-slate-700">
                New Photos (
                {selectedFiles.length})
              </p>

              <button
                type="button"
                onClick={
                  clearSelectedFiles
                }
                className="text-xs font-semibold text-red-500 hover:text-red-700"
              >
                Clear New Photos
              </button>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {selectedFiles.map(
                (file, index) => (
                  <div
                    key={`${file.name}-${file.lastModified}`}
                    className="overflow-hidden rounded-2xl border border-violet-100 bg-white"
                  >
                    <div
                      className="aspect-[4/3] bg-slate-100 bg-cover bg-center"
                      style={{
                        backgroundImage: `url("${selectedPreviews[index]}")`,
                      }}
                    />

                    <div className="p-3">
                      <p className="truncate text-sm font-semibold text-slate-700">
                        {file.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {(
                          file.size /
                          1024 /
                          1024
                        ).toFixed(2)}{" "}
                        MB
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          removeSelectedFile(
                            index,
                          )
                        }
                        className="mt-3 text-xs font-semibold text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        )}
      </section>

      {/* Publishing */}
      <section className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-sm font-semibold text-violet-600">
          Publishing
        </p>

        <h2 className="mt-1 text-xl font-bold text-slate-950">
          Visibility & Highlight
        </h2>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <label className="flex min-h-[82px] cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-200 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-700">
                Published
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-400">
                Show this album on the
                public Gallery.
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

          <label className="flex min-h-[82px] cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-200 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-700">
                Featured
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-400">
                Mark this album as a
                Gallery highlight.
              </p>
            </div>

            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(event) =>
                setIsFeatured(
                  event.target.checked,
                )
              }
              className="h-4 w-4 accent-violet-600"
            />
          </label>
        </div>
      </section>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 pb-6 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() =>
            router.push("/gallery")
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
              ? "Update Album"
              : "Create Album"}
        </button>
      </div>
    </form>
  );
}