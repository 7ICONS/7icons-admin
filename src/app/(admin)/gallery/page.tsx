import type { Metadata } from "next";
import Link from "next/link";

import DeleteGalleryAlbumButton from "@/components/gallery/DeleteGalleryAlbumButton";
import SubmitGalleryAlbumForReviewButton from "@/components/gallery/SubmitGalleryAlbumForReviewButton";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Gallery",
};

type AdminRole =
  | "super_admin"
  | "admin"
  | "editor"
  | "moderator"
  | "representative";

type GalleryAlbumStatus =
  | "draft"
  | "under_review"
  | "published"
  | "rejected"
  | "archived";

type GalleryAlbum = {
  id: string;
  title: string;
  category: string;
  album_date: string | null;
  description: string | null;
  is_published: boolean;
  is_featured: boolean;
  sort_order: number;
  status: GalleryAlbumStatus;
  review_notes: string | null;
  created_by: string | null;
  created_at: string;
};

type GalleryPhoto = {
  id: string;
  album_id: string;
  image_url: string;
  storage_path: string | null;
  alt_text: string;
  sort_order: number;
  created_at: string;
};

function formatAlbumDate(
  dateString: string | null,
) {
  if (!dateString) {
    return "—";
  }

  const [year, month, day] =
    dateString.split("-").map(Number);

  const date = new Date(
    year,
    month - 1,
    day,
  );

  return date.toLocaleDateString(
    "en-US",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  );
}

function StatusBadge({
  status,
}: {
  status: GalleryAlbumStatus;
}) {
  const styles: Record<
    GalleryAlbumStatus,
    string
  > = {
    draft:
      "border border-amber-200 bg-amber-50 text-amber-700",

    under_review:
      "border border-blue-200 bg-blue-50 text-blue-700",

    published:
      "border border-emerald-200 bg-emerald-50 text-emerald-700",

    rejected:
      "border border-red-200 bg-red-50 text-red-700",

    archived:
      "border border-slate-200 bg-slate-100 text-slate-600",
  };

  const labels: Record<
    GalleryAlbumStatus,
    string
  > = {
    draft: "Draft",
    under_review: "Under Review",
    published: "Published",
    rejected: "Rejected",
    archived: "Archived",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

function RepresentativeStatusHelp({
  status,
}: {
  status: GalleryAlbumStatus;
}) {
  if (status === "under_review") {
    return (
      <p className="mt-1 text-xs text-blue-600">
        Waiting for staff review
      </p>
    );
  }

  if (status === "rejected") {
    return (
      <p className="mt-1 text-xs text-red-500">
        Revision required
      </p>
    );
  }

  if (status === "published") {
    return (
      <p className="mt-1 text-xs text-emerald-600">
        Published by staff
      </p>
    );
  }

  if (status === "archived") {
    return (
      <p className="mt-1 text-xs text-slate-400">
        Archived
      </p>
    );
  }

  return null;
}

export default async function GalleryPage() {
  const supabase =
    await createClient();

  const {
    data: authData,
  } = await supabase.auth.getUser();

  const currentUser =
    authData.user;

  let currentRole:
    | AdminRole
    | null = null;

  if (currentUser) {
    const {
      data: roleData,
    } = await supabase
      .from("admin_roles")
      .select(
        `
          role,
          is_active
        `,
      )
      .eq(
        "user_id",
        currentUser.id,
      )
      .maybeSingle();

    if (roleData?.is_active) {
      currentRole =
        roleData.role as AdminRole;
    }
  }

  const isRepresentative =
    currentRole ===
    "representative";

  let albumsQuery =
    supabase
      .from("gallery_albums")
      .select(
        `
          id,
          title,
          category,
          album_date,
          description,
          is_published,
          is_featured,
          sort_order,
          status,
          review_notes,
          created_by,
          created_at
        `,
      )
      .order(
        "sort_order",
        {
          ascending: true,
        },
      )
      .order(
        "album_date",
        {
          ascending: false,
          nullsFirst: false,
        },
      )
      .order(
        "created_at",
        {
          ascending: false,
        },
      );

  if (
    isRepresentative &&
    currentUser
  ) {
    albumsQuery =
      albumsQuery.eq(
        "created_by",
        currentUser.id,
      );
  }

  const {
    data: albumData,
    error: albumsError,
  } = await albumsQuery;

  if (albumsError) {
    return (
      <section>
        <p className="text-sm font-semibold text-violet-600">
          {isRepresentative
            ? "Representative Workspace"
            : "Gallery Management"}
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          {isRepresentative
            ? "My Gallery"
            : "Gallery"}
        </h1>

        <div className="mt-8 rounded-2xl border border-red-100 bg-red-50 p-6">
          <p className="font-semibold text-red-700">
            Unable to load gallery
          </p>

          <p className="mt-2 text-sm text-red-600">
            {albumsError.message}
          </p>
        </div>
      </section>
    );
  }

  const albums =
    (albumData ??
      []) as GalleryAlbum[];

  let photos: GalleryPhoto[] = [];

  let photosError:
    | { message: string }
    | null = null;

  if (isRepresentative) {
    const albumIds =
      albums.map(
        (album) => album.id,
      );

    if (albumIds.length > 0) {
      const {
        data,
        error,
      } = await supabase
        .from(
          "gallery_album_photos",
        )
        .select(
          `
            id,
            album_id,
            image_url,
            storage_path,
            alt_text,
            sort_order,
            created_at
          `,
        )
        .in(
          "album_id",
          albumIds,
        )
        .order(
          "sort_order",
          {
            ascending: true,
          },
        )
        .order(
          "created_at",
          {
            ascending: true,
          },
        );

      photos =
        (data ??
          []) as GalleryPhoto[];

      photosError = error;
    }
  } else {
    const {
      data,
      error,
    } = await supabase
      .from(
        "gallery_album_photos",
      )
      .select(
        `
          id,
          album_id,
          image_url,
          storage_path,
          alt_text,
          sort_order,
          created_at
        `,
      )
      .order(
        "sort_order",
        {
          ascending: true,
        },
      )
      .order(
        "created_at",
        {
          ascending: true,
        },
      );

    photos =
      (data ??
        []) as GalleryPhoto[];

    photosError = error;
  }

  if (photosError) {
    return (
      <section>
        <p className="text-sm font-semibold text-violet-600">
          {isRepresentative
            ? "Representative Workspace"
            : "Gallery Management"}
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          {isRepresentative
            ? "My Gallery"
            : "Gallery"}
        </h1>

        <div className="mt-8 rounded-2xl border border-red-100 bg-red-50 p-6">
          <p className="font-semibold text-red-700">
            Unable to load gallery
          </p>

          <p className="mt-2 text-sm text-red-600">
            {photosError.message}
          </p>
        </div>
      </section>
    );
  }

  const photoCountMap =
    new Map<string, number>();

  const firstPhotoMap =
    new Map<
      string,
      {
        image_url: string;
        alt_text: string;
      }
    >();

  photos.forEach((photo) => {
    photoCountMap.set(
      photo.album_id,
      (photoCountMap.get(
        photo.album_id,
      ) ?? 0) + 1,
    );

    if (
      !firstPhotoMap.has(
        photo.album_id,
      )
    ) {
      firstPhotoMap.set(
        photo.album_id,
        {
          image_url:
            photo.image_url,

          alt_text:
            photo.alt_text,
        },
      );
    }
  });

  const totalAlbums =
    albums.length;

  const totalPhotos =
    photos.length;

  const publishedAlbums =
    albums.filter(
      (album) =>
        album.status ===
        "published",
    ).length;

  const featuredAlbums =
    albums.filter(
      (album) =>
        album.is_featured,
    ).length;

  const draftAlbums =
    albums.filter(
      (album) =>
        album.status ===
        "draft",
    ).length;

  const underReviewAlbums =
    albums.filter(
      (album) =>
        album.status ===
        "under_review",
    ).length;

  return (
    <section>
      {/* Header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-violet-600">
            {isRepresentative
              ? "Representative Workspace"
              : "Gallery Management"}
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            {isRepresentative
              ? "My Gallery"
              : "Gallery"}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            {isRepresentative
              ? "Create and manage your own Gallery albums. Albums must be reviewed by staff before they can appear on the public 7ICONS website."
              : "Manage Gallery albums, photographs, categories, highlights, and published visual archives for the 7ICONS website."}
          </p>
        </div>

        <Link
          href="/gallery/new"
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-700 to-purple-500 px-5 text-sm font-semibold text-white shadow-lg shadow-violet-500/15 transition hover:-translate-y-0.5 hover:shadow-xl"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-5 w-5"
          >
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>

          New Album
        </Link>
      </div>

      {/* Summary */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">
            {isRepresentative
              ? "My Albums"
              : "Total Albums"}
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            {totalAlbums}
          </p>
        </div>

        <div className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">
            {isRepresentative
              ? "My Photos"
              : "Total Photos"}
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            {totalPhotos}
          </p>
        </div>

        <div className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">
            {isRepresentative
              ? "Under Review"
              : "Published Albums"}
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            {isRepresentative
              ? underReviewAlbums
              : publishedAlbums}
          </p>
        </div>

        <div className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">
            {isRepresentative
              ? "Drafts"
              : "Featured Albums"}
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            {isRepresentative
              ? draftAlbums
              : featuredAlbums}
          </p>
        </div>
      </div>

      {/* Albums */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-sm">
        {albums.length === 0 ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center px-6 py-12 text-center">
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
                  y="5"
                  width="18"
                  height="14"
                  rx="2"
                />

                <circle
                  cx="9"
                  cy="10"
                  r="2"
                />

                <path d="m21 15-5-5L5 19" />
              </svg>
            </div>

            <h2 className="mt-5 text-lg font-bold text-slate-900">
              {isRepresentative
                ? "No albums yet"
                : "No Gallery albums yet"}
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              {isRepresentative
                ? "Create your first Gallery album, add photographs, and submit it for staff review when it is ready."
                : "Create the first Gallery album and add multiple photographs to the same collection."}
            </p>

            <Link
              href="/gallery/new"
              className="mt-6 inline-flex h-10 items-center justify-center rounded-xl bg-violet-50 px-4 text-sm font-semibold text-violet-700 transition hover:bg-violet-100"
            >
              {isRepresentative
                ? "Create My First Album"
                : "Create First Album"}
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1380px]">
              <thead className="border-b border-violet-100 bg-violet-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Album
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Category
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Date
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Photos
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Published
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Featured
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Order
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-violet-50">
                {albums.map(
                  (album) => {
                    const cover =
                      firstPhotoMap.get(
                        album.id,
                      );

                    const photoCount =
                      photoCountMap.get(
                        album.id,
                      ) ?? 0;

                    const representativeCanEdit =
                      isRepresentative &&
                      (
                        album.status ===
                          "draft" ||
                        album.status ===
                          "rejected"
                      );

                    const representativeCanSubmit =
                      isRepresentative &&
                      album.status ===
                        "draft";

                    const representativeIsLocked =
                      isRepresentative &&
                      (
                        album.status ===
                          "under_review" ||
                        album.status ===
                          "published" ||
                        album.status ===
                          "archived"
                      );

                    const showStaffFeedback =
                      isRepresentative &&
                      album.status ===
                        "rejected" &&
                      Boolean(
                        album.review_notes?.trim(),
                      );

                    return (
                      <tr
                        key={album.id}
                        className="transition hover:bg-violet-50/30"
                      >
                        {/* Album */}
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-4">
                            {cover ? (
                              <div
                                role="img"
                                aria-label={
                                  cover.alt_text ||
                                  album.title
                                }
                                className="h-16 w-20 shrink-0 rounded-2xl border border-violet-100 bg-slate-100 bg-cover bg-center shadow-sm"
                                style={{
                                  backgroundImage: `url("${cover.image_url}")`,
                                }}
                              />
                            ) : (
                              <div className="flex h-16 w-20 shrink-0 items-center justify-center rounded-2xl border border-dashed border-violet-200 bg-violet-50/50 text-violet-400">
                                <svg
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.8"
                                  className="h-7 w-7"
                                >
                                  <rect
                                    x="3"
                                    y="5"
                                    width="18"
                                    height="14"
                                    rx="2"
                                  />

                                  <circle
                                    cx="9"
                                    cy="10"
                                    r="2"
                                  />

                                  <path d="m21 15-5-5L5 19" />
                                </svg>
                              </div>
                            )}

                            <div className="min-w-0">
                              <p className="max-w-[300px] truncate font-semibold text-slate-800">
                                {album.title}
                              </p>

                              <p className="mt-1 max-w-[320px] truncate text-xs text-slate-400">
                                {album.description ||
                                  "No description"}
                              </p>

                              {showStaffFeedback && (
                                <div className="mt-3 max-w-sm rounded-xl border border-red-200 bg-red-50 px-3.5 py-3">
                                  <p className="text-xs font-bold uppercase tracking-[0.1em] text-red-700">
                                    Staff Feedback
                                  </p>

                                  <p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-red-700/80">
                                    {
                                      album.review_notes
                                    }
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-6 py-5 align-top">
                          <span className="inline-flex rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
                            {album.category}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-6 py-5 align-top text-sm font-medium text-slate-600">
                          {formatAlbumDate(
                            album.album_date,
                          )}
                        </td>

                        {/* Photos */}
                        <td className="px-6 py-5 align-top">
                          <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                            {photoCount}{" "}
                            {photoCount === 1
                              ? "Photo"
                              : "Photos"}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-5 align-top">
                          <StatusBadge
                            status={
                              album.status
                            }
                          />

                          {isRepresentative && (
                            <RepresentativeStatusHelp
                              status={
                                album.status
                              }
                            />
                          )}
                        </td>

                        {/* Published */}
                        <td className="px-6 py-5 align-top">
                          {album.is_published ? (
                            <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                              Yes
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                              No
                            </span>
                          )}
                        </td>

                        {/* Featured */}
                        <td className="px-6 py-5 align-top">
                          {album.is_featured ? (
                            <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                              Yes
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                              No
                            </span>
                          )}
                        </td>

                        {/* Order */}
                        <td className="px-6 py-5 align-top text-sm font-medium text-slate-600">
                          {album.sort_order}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-5 align-top">
                          <div className="flex items-center justify-end gap-2">
                            {/* Staff */}
                            {!isRepresentative && (
                              <>
                                <Link
                                  href={`/gallery/${album.id}/edit`}
                                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-violet-100 px-3 text-xs font-semibold text-violet-700 transition hover:border-violet-200 hover:bg-violet-50"
                                >
                                  <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    className="h-4 w-4"
                                  >
                                    <path d="M12 20h9" />

                                    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
                                  </svg>

                                  Edit
                                </Link>

                                <DeleteGalleryAlbumButton
                                  albumId={
                                    album.id
                                  }
                                  albumTitle={
                                    album.title
                                  }
                                />
                              </>
                            )}

                            {/* Representative Edit/Delete */}
                            {representativeCanEdit && (
                              <>
                                <Link
                                  href={`/gallery/${album.id}/edit`}
                                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-violet-100 px-3 text-xs font-semibold text-violet-700 transition hover:border-violet-200 hover:bg-violet-50"
                                >
                                  <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    className="h-4 w-4"
                                  >
                                    <path d="M12 20h9" />

                                    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
                                  </svg>

                                  Edit
                                </Link>

                                <DeleteGalleryAlbumButton
                                  albumId={
                                    album.id
                                  }
                                  albumTitle={
                                    album.title
                                  }
                                />
                              </>
                            )}

                            {/* Representative Submit */}
                            {representativeCanSubmit && (
                              <SubmitGalleryAlbumForReviewButton
                                albumId={
                                  album.id
                                }
                                albumTitle={
                                  album.title
                                }
                              />
                            )}

                            {/* Representative Locked */}
                            {representativeIsLocked && (
                              <span className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-500">
                                <svg
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.8"
                                  className="h-4 w-4"
                                >
                                  <rect
                                    x="5"
                                    y="10"
                                    width="14"
                                    height="10"
                                    rx="2"
                                  />

                                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                                </svg>

                                Locked
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}