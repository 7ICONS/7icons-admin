import type { Metadata } from "next";

import MediaLibrary, {
  type MediaAsset,
} from "@/components/media/MediaLibrary";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Media",
};

type AdminRole =
  | "super_admin"
  | "admin"
  | "editor"
  | "moderator"
  | "representative";

export default async function MediaPage() {
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

  let mediaQuery =
    supabase
      .from("media_assets")
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
    isRepresentative &&
    currentUser
  ) {
    mediaQuery =
      mediaQuery.eq(
        "created_by",
        currentUser.id,
      );
  }

  const {
    data,
    error,
  } = await mediaQuery;

  if (error) {
    return (
      <section>
        <p className="text-sm font-semibold text-violet-600">
          {isRepresentative
            ? "Representative Workspace"
            : "Media Management"}
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          {isRepresentative
            ? "My Media"
            : "Media Library"}
        </h1>

        <div className="mt-8 rounded-2xl border border-red-100 bg-red-50 p-6">
          <p className="font-semibold text-red-700">
            Unable to load Media Library
          </p>

          <p className="mt-2 text-sm text-red-600">
            {error.message}
          </p>
        </div>
      </section>
    );
  }

  const assets =
    (data ?? []) as MediaAsset[];

  return (
    <section>
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm font-semibold text-violet-600">
          {isRepresentative
            ? "Representative Workspace"
            : "Media Management"}
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          {isRepresentative
            ? "My Media"
            : "Media Library"}
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          {isRepresentative
            ? "Upload and manage your own visual assets for articles, Gallery content, and Representative activities."
            : "Manage reusable images and visual assets used across the 7ICONS platform."}
        </p>
      </div>

      <MediaLibrary
        assets={assets}
        isRepresentative={
          isRepresentative
        }
      />
    </section>
  );
}