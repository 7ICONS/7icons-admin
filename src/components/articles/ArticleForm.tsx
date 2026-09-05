"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import { createClient } from "@/lib/supabase/client";

const categories = [
  "News",
  "Story",
  "Behind the Scene",
  "Community",
  "Member Spotlight",
];

const allowedCoverTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const maxCoverSize = 5 * 1024 * 1024;

type ArticleStatus = "draft" | "published" | "archived";

type ArticleData = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  cover_image: string | null;
  featured: boolean;
  status: ArticleStatus;
  published_at: string | null;
};

type ArticleFormProps = {
  article?: ArticleData;
};

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

  if (extension === "jpeg") {
    return "jpg";
  }

  if (
    extension === "jpg" ||
    extension === "png" ||
    extension === "webp"
  ) {
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

function getStoragePathFromPublicUrl(url: string) {
  try {
    const parsedUrl = new URL(url);

    const marker =
      "/storage/v1/object/public/article-covers/";

    const markerIndex =
      parsedUrl.pathname.indexOf(marker);

    if (markerIndex === -1) {
      return null;
    }

    const path = parsedUrl.pathname.slice(
      markerIndex + marker.length,
    );

    return decodeURIComponent(path);
  } catch {
    return null;
  }
}

export default function ArticleForm({
  article,
}: ArticleFormProps) {
  const router = useRouter();

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const isEditing = Boolean(article);

  const [title, setTitle] = useState(
    article?.title ?? "",
  );

  const [slug, setSlug] = useState(
    article?.slug ?? "",
  );

  const [excerpt, setExcerpt] = useState(
    article?.excerpt ?? "",
  );

  const [content, setContent] = useState(
    article?.content ?? "",
  );

  const [category, setCategory] = useState(
    article?.category ?? "News",
  );

  const [status, setStatus] =
    useState<ArticleStatus>(
      article?.status ?? "draft",
    );

  const [featured, setFeatured] = useState(
    article?.featured ?? false,
  );

  const [slugEdited, setSlugEdited] =
    useState(isEditing);

  const [selectedCoverFile, setSelectedCoverFile] =
    useState<File | null>(null);

  const [selectedCoverPreview, setSelectedCoverPreview] =
    useState<string | null>(null);

  const [removeExistingCover, setRemoveExistingCover] =
    useState(false);

  const [isSaving, setIsSaving] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const existingCoverUrl =
    article?.cover_image ?? null;

  const coverPreview =
    selectedCoverPreview ??
    (!removeExistingCover
      ? existingCoverUrl
      : null);

  useEffect(() => {
    if (!selectedCoverFile) {
      setSelectedCoverPreview(null);
      return;
    }

    const objectUrl =
      URL.createObjectURL(selectedCoverFile);

    setSelectedCoverPreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedCoverFile]);

  function handleTitleChange(value: string) {
    setTitle(value);

    if (!slugEdited) {
      setSlug(createSlug(value));
    }
  }

  function handleCoverSelection(
    file: File | undefined,
  ) {
    setErrorMessage("");

    if (!file) {
      return;
    }

    if (!allowedCoverTypes.includes(file.type)) {
      setErrorMessage(
        "Cover image must be JPG, PNG, or WebP.",
      );
      return;
    }

    if (file.size > maxCoverSize) {
      setErrorMessage(
        "Cover image must be 5 MB or smaller.",
      );
      return;
    }

    setSelectedCoverFile(file);
    setRemoveExistingCover(false);
  }

  function handleRemoveCover() {
    setSelectedCoverFile(null);
    setSelectedCoverPreview(null);
    setRemoveExistingCover(true);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function removeStorageFile(
    publicUrl: string,
  ) {
    const storagePath =
      getStoragePathFromPublicUrl(publicUrl);

    if (!storagePath) {
      return;
    }

    const supabase = createClient();

    await supabase.storage
      .from("article-covers")
      .remove([storagePath]);
  }

  async function uploadCover(
    file: File,
    userId: string,
  ) {
    const supabase = createClient();

    const extension =
      getFileExtension(file);

    const filePath =
      `${userId}/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } =
      await supabase.storage
        .from("article-covers")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data } = supabase.storage
      .from("article-covers")
      .getPublicUrl(filePath);

    return {
      publicUrl: data.publicUrl,
      filePath,
    };
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setErrorMessage("");

    if (!title.trim()) {
      setErrorMessage(
        "Article title is required.",
      );
      return;
    }

    if (!slug.trim()) {
      setErrorMessage(
        "Article slug is required.",
      );
      return;
    }

    if (!excerpt.trim()) {
      setErrorMessage(
        "Article excerpt is required.",
      );
      return;
    }

    if (!content.trim()) {
      setErrorMessage(
        "Article content is required.",
      );
      return;
    }

    setIsSaving(true);

    let newlyUploadedPath: string | null =
      null;

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setErrorMessage(
          "Your admin session could not be verified. Please sign in again.",
        );

        setIsSaving(false);
        return;
      }

      let coverImageUrl =
        removeExistingCover
          ? null
          : existingCoverUrl;

      if (selectedCoverFile) {
        const uploadedCover =
          await uploadCover(
            selectedCoverFile,
            user.id,
          );

        coverImageUrl =
          uploadedCover.publicUrl;

        newlyUploadedPath =
          uploadedCover.filePath;
      }

      const normalizedSlug =
        createSlug(slug);

      if (isEditing && article) {
        const shouldSetPublishedAt =
          status === "published" &&
          !article.published_at;

        const { error } = await supabase
          .from("articles")
          .update({
            title: title.trim(),
            slug: normalizedSlug,
            excerpt: excerpt.trim(),
            content: content.trim(),
            category,
            cover_image: coverImageUrl,
            featured,
            status,
            published_at:
              status === "published"
                ? shouldSetPublishedAt
                  ? new Date().toISOString()
                  : article.published_at
                : null,
            updated_by: user.id,
            updated_at:
              new Date().toISOString(),
          })
          .eq("id", article.id);

        if (error) {
          if (newlyUploadedPath) {
            await supabase.storage
              .from("article-covers")
              .remove([
                newlyUploadedPath,
              ]);
          }

          if (error.code === "23505") {
            setErrorMessage(
              "This slug is already being used by another article.",
            );
          } else {
            setErrorMessage(
              error.message,
            );
          }

          setIsSaving(false);
          return;
        }

        if (
          existingCoverUrl &&
          (
            selectedCoverFile ||
            removeExistingCover
          )
        ) {
          await removeStorageFile(
            existingCoverUrl,
          );
        }
      } else {
        const { error } = await supabase
          .from("articles")
          .insert({
            title: title.trim(),
            slug: normalizedSlug,
            excerpt: excerpt.trim(),
            content: content.trim(),
            category,
            cover_image: coverImageUrl,
            featured,
            status,
            published_at:
              status === "published"
                ? new Date().toISOString()
                : null,
            created_by: user.id,
            updated_by: user.id,
          });

        if (error) {
          if (newlyUploadedPath) {
            await supabase.storage
              .from("article-covers")
              .remove([
                newlyUploadedPath,
              ]);
          }

          if (error.code === "23505") {
            setErrorMessage(
              "This slug is already being used by another article.",
            );
          } else {
            setErrorMessage(
              error.message,
            );
          }

          setIsSaving(false);
          return;
        }
      }

      router.push("/articles");
      router.refresh();
    } catch (error) {
      const supabase = createClient();

      if (newlyUploadedPath) {
        await supabase.storage
          .from("article-covers")
          .remove([
            newlyUploadedPath,
          ]);
      }

      setErrorMessage(
        error instanceof Error
          ? error.message
          : isEditing
            ? "Something went wrong while updating the article."
            : "Something went wrong while creating the article.",
      );

      setIsSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-6 xl:grid-cols-[1fr_340px]"
    >
      {/* Main Content */}
      <div className="space-y-6">
        {/* Article Information */}
        <section className="rounded-2xl border border-violet-100 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Article Information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Basic information displayed throughout
              the website.
            </p>
          </div>

          <div className="mt-6 space-y-5">
            <div>
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Article Title
              </label>

              <input
                id="title"
                type="text"
                value={title}
                onChange={(event) =>
                  handleTitleChange(
                    event.target.value,
                  )
                }
                placeholder="Enter article title"
                disabled={isSaving}
                className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label
                htmlFor="slug"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Slug
              </label>

              <div className="flex h-12 overflow-hidden rounded-xl border border-slate-200 bg-white focus-within:border-violet-400 focus-within:ring-4 focus-within:ring-violet-100">
                <span className="flex items-center border-r border-slate-200 bg-slate-50 px-4 text-sm text-slate-400">
                  /blog/
                </span>

                <input
                  id="slug"
                  type="text"
                  value={slug}
                  onChange={(event) => {
                    setSlugEdited(true);

                    setSlug(
                      createSlug(
                        event.target.value,
                      ),
                    );
                  }}
                  placeholder="article-slug"
                  disabled={isSaving}
                  className="min-w-0 flex-1 px-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 disabled:bg-slate-50"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="excerpt"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Excerpt
              </label>

              <textarea
                id="excerpt"
                value={excerpt}
                onChange={(event) =>
                  setExcerpt(
                    event.target.value,
                  )
                }
                placeholder="Write a short summary of the article..."
                rows={4}
                disabled={isSaving}
                className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 disabled:bg-slate-50"
              />
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="rounded-2xl border border-violet-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            Article Content
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Write the main content of the article.
          </p>

          <textarea
            value={content}
            onChange={(event) =>
              setContent(event.target.value)
            }
            placeholder="Start writing the article..."
            rows={18}
            disabled={isSaving}
            className="mt-6 w-full resize-y rounded-xl border border-slate-200 px-4 py-4 text-sm leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 disabled:bg-slate-50"
          />
        </section>

        {/* Cover Image */}
        <section className="rounded-2xl border border-violet-100 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Cover Image
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Select a cover image from your computer.
              JPG, PNG, or WebP up to 5 MB.
            </p>
          </div>

          <div className="mt-6">
            {coverPreview ? (
              <div className="overflow-hidden rounded-2xl border border-violet-100 bg-slate-50">
                <div
                  className="aspect-video w-full bg-slate-100 bg-cover bg-center"
                  style={{
                    backgroundImage:
                      `url("${coverPreview}")`,
                  }}
                  role="img"
                  aria-label="Article cover preview"
                />

                <div className="flex flex-col gap-3 border-t border-violet-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-700">
                      {selectedCoverFile
                        ? selectedCoverFile.name
                        : "Current article cover"}
                    </p>

                    {selectedCoverFile && (
                      <p className="mt-1 text-xs text-slate-400">
                        {(
                          selectedCoverFile.size /
                          1024 /
                          1024
                        ).toFixed(2)}{" "}
                        MB
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() =>
                        fileInputRef.current?.click()
                      }
                      className="inline-flex h-10 items-center justify-center rounded-xl border border-violet-100 px-4 text-sm font-semibold text-violet-700 transition hover:bg-violet-50 disabled:opacity-50"
                    >
                      Change Image
                    </button>

                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={
                        handleRemoveCover
                      }
                      className="inline-flex h-10 items-center justify-center rounded-xl border border-red-100 px-4 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                type="button"
                disabled={isSaving}
                onClick={() =>
                  fileInputRef.current?.click()
                }
                className="flex min-h-[260px] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-violet-200 bg-violet-50/30 px-6 text-center transition hover:border-violet-300 hover:bg-violet-50/60 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-violet-600 shadow-sm">
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

                    <path d="M18 3v6" />

                    <path d="M15 6h6" />
                  </svg>
                </div>

                <p className="mt-5 text-sm font-bold text-slate-800">
                  Select Cover Image
                </p>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Choose an image from your computer
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  JPG, PNG or WebP · Max 5 MB ·
                  Recommended 16:9
                </p>
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={isSaving}
              onChange={(event) =>
                handleCoverSelection(
                  event.target.files?.[0],
                )
              }
              className="hidden"
            />
          </div>
        </section>
      </div>

      {/* Sidebar Settings */}
      <aside className="space-y-6">
        {/* Publishing */}
        <section className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
          <h2 className="text-base font-bold text-slate-900">
            Publishing
          </h2>

          <div className="mt-5 space-y-5">
            <div>
              <label
                htmlFor="status"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Status
              </label>

              <select
                id="status"
                value={status}
                onChange={(event) =>
                  setStatus(
                    event.target
                      .value as ArticleStatus,
                  )
                }
                disabled={isSaving}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
              >
                <option value="draft">
                  Draft
                </option>

                <option value="published">
                  Published
                </option>

                <option value="archived">
                  Archived
                </option>
              </select>
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-violet-100 bg-violet-50/40 p-4">
              <input
                type="checkbox"
                checked={featured}
                onChange={(event) =>
                  setFeatured(
                    event.target.checked,
                  )
                }
                disabled={isSaving}
                className="mt-0.5 h-4 w-4 accent-violet-600"
              />

              <div>
                <p className="text-sm font-semibold text-slate-700">
                  Featured Article
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Mark this article for the Featured
                  Articles section.
                </p>
              </div>
            </label>
          </div>
        </section>

        {/* Category */}
        <section className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
          <h2 className="text-base font-bold text-slate-900">
            Category
          </h2>

          <select
            value={category}
            onChange={(event) =>
              setCategory(
                event.target.value,
              )
            }
            disabled={isSaving}
            className="mt-5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
          >
            {categories.map((item) => (
              <option
                key={item}
                value={item}
              >
                {item}
              </option>
            ))}
          </select>
        </section>

        {/* Error */}
        {errorMessage && (
          <div
            role="alert"
            className="rounded-2xl border border-red-100 bg-red-50 p-4"
          >
            <p className="text-sm font-semibold text-red-700">
              Unable to save article
            </p>

            <p className="mt-1 text-xs leading-5 text-red-600">
              {errorMessage}
            </p>
          </div>
        )}

        {/* Actions */}
        <section className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
          <button
            type="submit"
            disabled={isSaving}
            className="flex h-11 w-full items-center justify-center rounded-xl bg-gradient-to-r from-violet-700 to-purple-500 text-sm font-semibold text-white shadow-lg shadow-violet-500/15 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {isSaving
              ? selectedCoverFile
                ? "Uploading & Saving..."
                : isEditing
                  ? "Updating Article..."
                  : "Saving Article..."
              : isEditing
                ? "Update Article"
                : status === "published"
                  ? "Publish Article"
                  : "Save Article"}
          </button>

          <Link
            href="/articles"
            className="mt-3 flex h-11 w-full items-center justify-center rounded-xl border border-violet-100 text-sm font-semibold text-slate-600 transition hover:bg-violet-50 hover:text-violet-700"
          >
            Cancel
          </Link>
        </section>
      </aside>
    </form>
  );
}