"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { createClient } from "@/lib/supabase/client";

export type MediaPickerAsset = {
  id: string;
  name: string;
  original_name: string;
  category:
    | "general"
    | "article"
    | "gallery"
    | "member"
    | "representative";
  bucket_id: string;
  storage_path: string;
  public_url: string;
  mime_type: string;
  size_bytes: number;
  alt_text: string;
  created_by: string | null;
  created_at: string;
};

type MediaPickerMode =
  | "single"
  | "multiple";

type MediaPickerProps = {
  open: boolean;
  mode?: MediaPickerMode;
  maxSelection?: number;
  isRepresentative?: boolean;
  preferredCategory?:
    | "article"
    | "gallery";
  onClose: () => void;
  onSelect: (
    assets: MediaPickerAsset[],
  ) => void;
};

const categories = [
  {
    value: "all",
    label: "All Categories",
  },
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

export default function MediaPicker({
  open,
  mode = "single",
  maxSelection = 20,
  isRepresentative = false,
  preferredCategory,
  onClose,
  onSelect,
}: MediaPickerProps) {
  const supabase =
    createClient();

  const [
    assets,
    setAssets,
  ] = useState<
    MediaPickerAsset[]
  >([]);

  const [
    selectedIds,
    setSelectedIds,
  ] = useState<string[]>(
    [],
  );

  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");

  const [
    categoryFilter,
    setCategoryFilter,
  ] = useState(
    preferredCategory ??
      "all",
  );

  const [
    isLoading,
    setIsLoading,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    async function loadAssets() {
      setIsLoading(true);
      setErrorMessage("");
      setSelectedIds([]);
      setSearchQuery("");

      setCategoryFilter(
        preferredCategory ??
          "all",
      );

      try {
        let query =
          supabase
            .from(
              "media_assets",
            )
            .select(
              `
                id,
                name,
                original_name,
                category,
                bucket_id,
                storage_path,
                public_url,
                mime_type,
                size_bytes,
                alt_text,
                created_by,
                created_at
              `,
            )
            .order(
              "created_at",
              {
                ascending: false,
              },
            );

        if (
          isRepresentative
        ) {
          const {
            data:
              userData,
            error:
              userError,
          } =
            await supabase.auth.getUser();

          if (
            userError ||
            !userData.user
          ) {
            throw new Error(
              "Your session could not be verified.",
            );
          }

          query =
            query.eq(
              "created_by",
              userData.user.id,
            );
        }

        const {
          data,
          error,
        } = await query;

        if (error) {
          throw error;
        }

        if (!cancelled) {
          setAssets(
            (data ??
              []) as MediaPickerAsset[],
          );
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof
              Error
              ? error.message
              : "Unable to load Media Library.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(
            false,
          );
        }
      }
    }

    loadAssets();

    return () => {
      cancelled = true;
    };
  }, [
    open,
    isRepresentative,
    preferredCategory,
  ]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (
        event.key ===
        "Escape"
      ) {
        onClose();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [
    open,
    onClose,
  ]);

  const filteredAssets =
    useMemo(() => {
      const search =
        searchQuery
          .trim()
          .toLowerCase();

      return assets.filter(
        (asset) => {
          const matchesSearch =
            !search ||
            asset.name
              .toLowerCase()
              .includes(
                search,
              ) ||
            asset.original_name
              .toLowerCase()
              .includes(
                search,
              ) ||
            asset.alt_text
              .toLowerCase()
              .includes(
                search,
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
    }, [
      assets,
      searchQuery,
      categoryFilter,
    ]);

  function toggleAsset(
    assetId: string,
  ) {
    if (
      mode === "single"
    ) {
      setSelectedIds(
        (current) =>
          current.includes(
            assetId,
          )
            ? []
            : [assetId],
      );

      return;
    }

    setSelectedIds(
      (current) => {
        if (
          current.includes(
            assetId,
          )
        ) {
          return current.filter(
            (id) =>
              id !== assetId,
          );
        }

        if (
          current.length >=
          maxSelection
        ) {
          return current;
        }

        return [
          ...current,
          assetId,
        ];
      },
    );
  }

  function handleConfirm() {
    const selectedAssets =
      assets.filter(
        (asset) =>
          selectedIds.includes(
            asset.id,
          ),
      );

    if (
      selectedAssets.length ===
      0
    ) {
      return;
    }

    onSelect(
      selectedAssets,
    );

    setSelectedIds([]);
    onClose();
  }

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Close Media Library"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      <section className="relative z-10 flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-violet-100 bg-white shadow-2xl">
        {/* Header */}
        <header className="flex shrink-0 items-start justify-between gap-6 border-b border-violet-100 px-6 py-5">
          <div>
            <p className="text-sm font-semibold text-violet-600">
              Media Library
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-950">
              Choose Media
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {mode ===
              "single"
                ? "Choose one image from the Media Library."
                : `Choose up to ${maxSelection} images from the Media Library.`}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-xl text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
          >
            ×
          </button>
        </header>

        {/* Filters */}
        <div className="shrink-0 border-b border-violet-100 bg-slate-50/60 px-6 py-4">
          <div className="flex flex-col gap-3 sm:flex-row">
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
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
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
                      .value,
                  )
                }
                className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100 sm:min-w-[190px]"
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
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-slate-400">
              {
                filteredAssets.length
              }{" "}
              {filteredAssets.length ===
              1
                ? "asset"
                : "assets"}{" "}
              available
            </p>

            <p className="text-xs font-semibold text-violet-600">
              {
                selectedIds.length
              }{" "}
              selected
              {mode ===
                "multiple" &&
                ` / ${maxSelection}`}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex min-h-[360px] items-center justify-center">
              <p className="text-sm font-medium text-slate-500">
                Loading Media Library...
              </p>
            </div>
          ) : errorMessage ? (
            <div className="flex min-h-[360px] items-center justify-center">
              <div className="max-w-md rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-center">
                <p className="font-semibold text-red-700">
                  Unable to load Media Library
                </p>

                <p className="mt-2 text-sm text-red-600">
                  {
                    errorMessage
                  }
                </p>
              </div>
            </div>
          ) : filteredAssets.length ===
            0 ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
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
                No media found
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                Upload images to
                the Media Library
                first, or change
                the current search
                and category filter.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {filteredAssets.map(
                (asset) => {
                  const selected =
                    selectedIds.includes(
                      asset.id,
                    );

                  const selectionLimitReached =
                    mode ===
                      "multiple" &&
                    !selected &&
                    selectedIds.length >=
                      maxSelection;

                  return (
                    <button
                      key={
                        asset.id
                      }
                      type="button"
                      disabled={
                        selectionLimitReached
                      }
                      onClick={() =>
                        toggleAsset(
                          asset.id,
                        )
                      }
                      className={`group overflow-hidden rounded-2xl border text-left transition ${
                        selected
                          ? "border-violet-500 bg-violet-50 shadow-md ring-2 ring-violet-200"
                          : "border-violet-100 bg-white hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md"
                      } ${
                        selectionLimitReached
                          ? "cursor-not-allowed opacity-50"
                          : ""
                      }`}
                    >
                      <div className="relative">
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

                        <div
                          className={`absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full border text-sm font-bold shadow-sm ${
                            selected
                              ? "border-violet-600 bg-violet-600 text-white"
                              : "border-white/80 bg-white/90 text-transparent"
                          }`}
                        >
                          ✓
                        </div>
                      </div>

                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2">
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

                          <span className="shrink-0 rounded-full bg-violet-50 px-2 py-1 text-[10px] font-semibold capitalize text-violet-700">
                            {
                              asset.category
                            }
                          </span>
                        </div>

                        <div className="mt-3 border-t border-violet-50 pt-3">
                          <p className="text-xs text-slate-400">
                            {formatFileSize(
                              asset.size_bytes,
                            )}
                          </p>

                          {asset.alt_text && (
                            <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                              {
                                asset.alt_text
                              }
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                },
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="flex shrink-0 flex-col-reverse gap-3 border-t border-violet-100 bg-white px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-400">
            Selected media will
            reuse the existing
            Media Library asset
            without uploading a
            duplicate file.
          </p>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={
                onClose
              }
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={
                selectedIds.length ===
                0
              }
              onClick={
                handleConfirm
              }
              className="inline-flex h-10 items-center justify-center rounded-xl bg-gradient-to-r from-violet-700 to-purple-500 px-5 text-sm font-semibold text-white shadow-lg shadow-violet-500/15 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {mode ===
              "single"
                ? "Use Selected Image"
                : `Use ${selectedIds.length} Selected`}
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}