import type { Metadata } from "next";
import Link from "next/link";

import ArticlesTable from "@/components/articles/ArticlesTable";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Articles",
};

type AdminRole =
  | "super_admin"
  | "admin"
  | "editor"
  | "moderator"
  | "representative";

export default async function ArticlesPage() {
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

    if (
      roleData?.is_active
    ) {
      currentRole =
        roleData.role as AdminRole;
    }
  }

  const isRepresentative =
    currentRole ===
    "representative";

  let articlesQuery =
    supabase
      .from("articles")
      .select(
        `
          id,
          title,
          slug,
          category,
          cover_image,
          status,
          featured,
          review_notes,
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
    articlesQuery =
      articlesQuery.eq(
        "created_by",
        currentUser.id,
      );
  }

  const {
    data: articles,
    error,
  } = await articlesQuery;

  if (error) {
    return (
      <section>
        <p className="text-sm font-semibold text-violet-600">
          {isRepresentative
            ? "Representative Workspace"
            : "Content Management"}
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          {isRepresentative
            ? "My Articles"
            : "Articles"}
        </h1>

        <div className="mt-8 rounded-2xl border border-red-100 bg-red-50 p-6">
          <p className="font-semibold text-red-700">
            Unable to load articles
          </p>

          <p className="mt-2 text-sm text-red-600">
            {error.message}
          </p>
        </div>
      </section>
    );
  }

  const safeArticles =
    articles ?? [];

  const totalArticles =
    safeArticles.length;

  const publishedArticles =
    safeArticles.filter(
      (article) =>
        article.status ===
        "published",
    ).length;

  const draftArticles =
    safeArticles.filter(
      (article) =>
        article.status ===
        "draft",
    ).length;

  const underReviewArticles =
    safeArticles.filter(
      (article) =>
        article.status ===
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
              : "Content Management"}
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            {isRepresentative
              ? "My Articles"
              : "Articles"}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            {isRepresentative
              ? "Create and manage your own articles for the 7ICONS platform. Articles must be reviewed before they can be published."
              : "Create, edit, publish, and manage articles displayed on the 7ICONS public website."}
          </p>
        </div>

        <Link
          href="/articles/new"
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

          New Article
        </Link>
      </div>

      {/* Summary */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">
            {isRepresentative
              ? "My Articles"
              : "Total Articles"}
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            {totalArticles}
          </p>
        </div>

        <div className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">
            {isRepresentative
              ? "Under Review"
              : "Published"}
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            {isRepresentative
              ? underReviewArticles
              : publishedArticles}
          </p>
        </div>

        <div className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">
            Drafts
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            {draftArticles}
          </p>
        </div>
      </div>

      {/* Search / Filter / Table */}
      <ArticlesTable
        articles={
          safeArticles
        }
        isRepresentative={
          isRepresentative
        }
      />
    </section>
  );
}