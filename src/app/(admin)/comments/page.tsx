import type { Metadata } from "next";

import CommentsManagement, {
  type CommentItem,
  type CommentStatus,
} from "@/components/comments/CommentsManagement";

import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Comments",
};

type AdminRole =
  | "super_admin"
  | "admin"
  | "editor"
  | "moderator"
  | "representative";

type RoleDirectoryItem = {
  user_id: string;
  role: AdminRole;
  is_active: boolean;
};

type CommentRow = {
  id: string;
  article_id: string | null;
  gallery_album_id: string | null;
  parent_id: string | null;
  author_id: string;
  body: string;
  status: CommentStatus;
  moderated_by: string | null;
  moderated_at: string | null;
  created_at: string;
};

export default async function CommentsPage() {
  const supabase =
    await createClient();

  /*
   * =========================================================
   * VERIFIED SESSION
   * =========================================================
   */
  const {
    data: claimsData,
    error: claimsError,
  } =
    await supabase.auth.getClaims();

  const userId =
    claimsData?.claims?.sub;

  if (
    claimsError ||
    !userId
  ) {
    return (
      <section>
        <p className="text-sm font-semibold text-violet-600">
          Comments
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Comments
        </h1>

        <div className="mt-8 rounded-2xl border border-red-100 bg-red-50 p-6">
          <p className="font-semibold text-red-700">
            Unable to access Comments
          </p>

          <p className="mt-2 text-sm text-red-600">
            Your admin session could not be verified.
          </p>
        </div>
      </section>
    );
  }

  /*
   * =========================================================
   * CURRENT ROLE
   * =========================================================
   *
   * Gunakan secure role directory RPC.
   * Jangan query admin_roles langsung.
   */
  const {
    data: roleDirectoryData,
    error: roleDirectoryError,
  } =
    await supabase.rpc(
      "get_user_role_directory",
    );

  if (roleDirectoryError) {
    console.error(
      "Unable to load Comments role directory:",
      roleDirectoryError,
    );

    return (
      <section>
        <p className="text-sm font-semibold text-violet-600">
          Comments
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Comments
        </h1>

        <div className="mt-8 rounded-2xl border border-red-100 bg-red-50 p-6">
          <p className="font-semibold text-red-700">
            Unable to access Comments
          </p>

          <p className="mt-2 text-sm text-red-600">
            Your account role could not be loaded.
          </p>
        </div>
      </section>
    );
  }

  const roleDirectory =
    Array.isArray(
      roleDirectoryData,
    )
      ? (roleDirectoryData as RoleDirectoryItem[])
      : [];

  const currentRoleData =
    roleDirectory.find(
      (item) =>
        item.user_id ===
          userId &&
        item.is_active,
    );

  const currentRole =
    currentRoleData?.role ??
    null;

  if (!currentRole) {
    return (
      <section>
        <p className="text-sm font-semibold text-violet-600">
          Comments
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Comments
        </h1>

        <div className="mt-8 rounded-2xl border border-red-100 bg-red-50 p-6">
          <p className="font-semibold text-red-700">
            Unable to access Comments
          </p>

          <p className="mt-2 text-sm text-red-600">
            Your current role could not be verified.
          </p>
        </div>
      </section>
    );
  }

  const isRepresentative =
    currentRole ===
    "representative";

  /*
   * =========================================================
   * COMMENTS
   * =========================================================
   *
   * RLS tetap menjadi security layer terakhir.
   */
  const {
    data: commentsData,
    error: commentsError,
  } =
    await supabase
      .from("comments")
      .select(
        `
          id,
          article_id,
          gallery_album_id,
          parent_id,
          author_id,
          body,
          status,
          moderated_by,
          moderated_at,
          created_at
        `,
      )
      .order(
        "created_at",
        {
          ascending: false,
        },
      );

  if (commentsError) {
    console.error(
      "Unable to load comments:",
      commentsError,
    );

    return (
      <section>
        <p className="text-sm font-semibold text-violet-600">
          {isRepresentative
            ? "Representative Workspace"
            : "Community Management"}
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Comments
        </h1>

        <div className="mt-8 rounded-2xl border border-red-100 bg-red-50 p-6">
          <p className="font-semibold text-red-700">
            Unable to load comments
          </p>

          <p className="mt-2 text-sm text-red-600">
            {commentsError.message}
          </p>
        </div>
      </section>
    );
  }

  const commentRows =
    (commentsData ??
      []) as CommentRow[];

  /*
   * =========================================================
   * RELATED IDS
   * =========================================================
   */
  const authorIds =
    Array.from(
      new Set(
        commentRows.map(
          (comment) =>
            comment.author_id,
        ),
      ),
    );

  const articleIds =
    Array.from(
      new Set(
        commentRows
          .map(
            (comment) =>
              comment.article_id,
          )
          .filter(
            (
              id,
            ): id is string =>
              Boolean(id),
          ),
      ),
    );

  const galleryAlbumIds =
    Array.from(
      new Set(
        commentRows
          .map(
            (comment) =>
              comment.gallery_album_id,
          )
          .filter(
            (
              id,
            ): id is string =>
              Boolean(id),
          ),
      ),
    );

  /*
   * =========================================================
   * AUTHORS
   * =========================================================
   */
  const authorMap =
    new Map<
      string,
      {
        display_name: string;
        email: string;
      }
    >();

  if (
    authorIds.length >
    0
  ) {
    const {
      data: profileData,
    } =
      await supabase
        .from(
          "user_profiles",
        )
        .select(
          `
            id,
            display_name,
            email
          `,
        )
        .in(
          "id",
          authorIds,
        );

    (
      profileData ?? []
    ).forEach(
      (profile) => {
        authorMap.set(
          profile.id,
          {
            display_name:
              profile.display_name ||
              "Community Member",

            email:
              profile.email ||
              "",
          },
        );
      },
    );
  }

  /*
   * =========================================================
   * ARTICLE TITLES
   * =========================================================
   */
  const articleMap =
    new Map<
      string,
      string
    >();

  if (
    articleIds.length >
    0
  ) {
    const {
      data: articleData,
    } =
      await supabase
        .from("articles")
        .select(
          `
            id,
            title
          `,
        )
        .in(
          "id",
          articleIds,
        );

    (
      articleData ?? []
    ).forEach(
      (article) => {
        articleMap.set(
          article.id,
          article.title,
        );
      },
    );
  }

  /*
   * =========================================================
   * GALLERY TITLES
   * =========================================================
   */
  const galleryMap =
    new Map<
      string,
      string
    >();

  if (
    galleryAlbumIds.length >
    0
  ) {
    const {
      data: galleryData,
    } =
      await supabase
        .from(
          "gallery_albums",
        )
        .select(
          `
            id,
            title
          `,
        )
        .in(
          "id",
          galleryAlbumIds,
        );

    (
      galleryData ?? []
    ).forEach(
      (album) => {
        galleryMap.set(
          album.id,
          album.title,
        );
      },
    );
  }

  /*
   * =========================================================
   * COMMENT VIEW MODEL
   * =========================================================
   */
  const comments:
    CommentItem[] =
    commentRows.map(
      (comment) => {
        const author =
          authorMap.get(
            comment.author_id,
          );

        const isArticle =
          Boolean(
            comment.article_id,
          );

        const targetTitle =
          comment.article_id
            ? articleMap.get(
                comment.article_id,
              ) ??
              "Article"

            : comment.gallery_album_id
              ? galleryMap.get(
                  comment.gallery_album_id,
                ) ??
                "Gallery Album"

              : "Unknown Content";

        return {
          id:
            comment.id,

          article_id:
            comment.article_id,

          gallery_album_id:
            comment.gallery_album_id,

          parent_id:
            comment.parent_id,

          author_id:
            comment.author_id,

          body:
            comment.body,

          status:
            comment.status,

          moderated_by:
            comment.moderated_by,

          moderated_at:
            comment.moderated_at,

          created_at:
            comment.created_at,

          author_name:
            author?.display_name ||
            "Community Member",

          author_email:
            author?.email ||
            "",

          target_title:
            targetTitle,

          target_type:
            isArticle
              ? "article"
              : "gallery",
        };
      },
    );

  /*
   * =========================================================
   * UI
   * =========================================================
   */
  return (
    <section>
      <div className="mb-8">
        <p className="text-sm font-semibold text-violet-600">
          {isRepresentative
            ? "Representative Workspace"
            : "Community Management"}
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Comments
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          {isRepresentative
            ? "View community comments on your own Articles and Gallery albums and reply directly as an ICONIA Representative."

            : currentRole ===
                "editor"
              ? "View comments submitted across Articles and Gallery content."

              : "Review, moderate, and manage community comments submitted across Articles and Gallery content."}
        </p>
      </div>

      <CommentsManagement
        comments={
          comments
        }
        currentRole={
          currentRole
        }
      />
    </section>
  );
}