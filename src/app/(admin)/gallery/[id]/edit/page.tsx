import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import GalleryAlbumForm, {
  type GalleryAlbumData,
  type GalleryAlbumPhotoData,
  type GalleryAlbumStatus,
  type GalleryCategory,
} from "@/components/gallery/GalleryAlbumForm";
import GalleryAlbumReviewPanel from "@/components/gallery/GalleryAlbumReviewPanel";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Edit Gallery Album",
};

type AdminRole =
  | "super_admin"
  | "admin"
  | "editor"
  | "moderator"
  | "representative";

type EditGalleryAlbumPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function normalizeCategory(
  value: string,
): GalleryCategory {
  if (
    value === "Performance" ||
    value === "Behind the Scenes" ||
    value === "Events" ||
    value === "Fan Moments" ||
    value === "Other"
  ) {
    return value;
  }

  return "Other";
}

function normalizeStatus(
  value: string,
): GalleryAlbumStatus {
  if (
    value === "draft" ||
    value === "under_review" ||
    value === "published" ||
    value === "rejected" ||
    value === "archived"
  ) {
    return value;
  }

  return "draft";
}

export default async function EditGalleryAlbumPage({
  params,
}: EditGalleryAlbumPageProps) {
  const { id } = await params;

  const supabase =
    await createClient();

  /*
   * Current authenticated account.
   */
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

  const canReviewGallery =
    currentRole ===
      "super_admin" ||
    currentRole ===
      "admin" ||
    currentRole ===
      "editor";

  /*
   * Album + photos.
   */
  const [
    albumResult,
    photosResult,
  ] = await Promise.all([
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
          review_notes
        `,
      )
      .eq("id", id)
      .maybeSingle(),

    supabase
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
          sort_order
        `,
      )
      .eq("album_id", id)
      .order(
        "sort_order",
        {
          ascending: true,
        },
      ),
  ]);

  if (albumResult.error) {
    throw new Error(
      `Unable to load Gallery album: ${albumResult.error.message}`,
    );
  }

  if (photosResult.error) {
    throw new Error(
      `Unable to load Gallery album photos: ${photosResult.error.message}`,
    );
  }

  if (!albumResult.data) {
    notFound();
  }

  const albumStatus =
    normalizeStatus(
      albumResult.data.status,
    );

  const albumData: GalleryAlbumData = {
    id:
      albumResult.data.id,

    title:
      albumResult.data.title,

    category:
      normalizeCategory(
        albumResult.data.category,
      ),

    album_date:
      albumResult.data.album_date,

    description:
      albumResult.data.description,

    is_published:
      albumResult.data.is_published,

    is_featured:
      albumResult.data.is_featured,

    sort_order:
      albumResult.data.sort_order,

    status:
      albumStatus,

    review_notes:
      albumResult.data.review_notes,
  };

  const photoData:
    GalleryAlbumPhotoData[] =
    (photosResult.data ?? []).map(
      (photo) => ({
        id:
          photo.id,

        album_id:
          photo.album_id,

        image_url:
          photo.image_url,

        storage_path:
          photo.storage_path,

        alt_text:
          photo.alt_text,

        sort_order:
          photo.sort_order,
      }),
    );

  const showReviewPanel =
    canReviewGallery &&
    albumStatus ===
      "under_review";

  return (
    <section>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/gallery"
          className="inline-flex items-center gap-2 text-sm font-semibold text-violet-600 transition hover:text-violet-800"
        >
          <span aria-hidden="true">
            ←
          </span>

          Back to Gallery
        </Link>

        <p className="mt-6 text-sm font-semibold text-violet-600">
          {showReviewPanel
            ? "Gallery Review"
            : currentRole ===
                "representative"
              ? "Representative Workspace"
              : "Gallery Management"}
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          {showReviewPanel
            ? "Review Album"
            : "Edit Album"}
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          {showReviewPanel
            ? "Review the submitted Gallery album and its photographs before publishing it or returning it to the Representative for revision."
            : currentRole ===
                "representative"
              ? "Update your Gallery album and manage its photographs before submitting it for staff review."
              : "Update this Gallery album, manage its photographs, visibility, category, and public information."}
        </p>
      </div>

      {/* Staff Review */}
      {showReviewPanel && (
        <div className="mb-6">
          <GalleryAlbumReviewPanel
            albumId={
              albumData.id
            }
            albumTitle={
              albumData.title
            }
          />
        </div>
      )}

      {/* Album Form */}
      <GalleryAlbumForm
        album={albumData}
        existingPhotos={
          photoData
        }
      />
    </section>
  );
}