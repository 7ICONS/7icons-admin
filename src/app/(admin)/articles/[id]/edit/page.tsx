import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import ArticleForm from "@/components/articles/ArticleForm";
import ArticleReviewPanel from "@/components/articles/ArticleReviewPanel";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Edit Article",
};

type PlatformRole =
  | "super_admin"
  | "admin"
  | "editor"
  | "moderator"
  | "representative";

type ArticleStatus =
  | "draft"
  | "under_review"
  | "published"
  | "rejected"
  | "archived";

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

type EditArticlePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditArticlePage({
  params,
}: EditArticlePageProps) {
  const { id } =
    await params;

  const supabase =
    await createClient();

  /*
   * Current authenticated account.
   */
  const {
    data: authData,
  } = await supabase.auth.getUser();

  let currentRole:
    | PlatformRole
    | null = null;

  if (authData.user) {
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
        authData.user.id,
      )
      .maybeSingle();

    if (
      roleData?.is_active
    ) {
      currentRole =
        roleData.role as PlatformRole;
    }
  }

  const canReviewArticles =
    currentRole ===
      "super_admin" ||
    currentRole ===
      "admin" ||
    currentRole ===
      "editor";

  /*
   * Article.
   */
  const {
    data,
    error,
  } = await supabase
    .from("articles")
    .select(
      `
        id,
        title,
        slug,
        excerpt,
        content,
        category,
        cover_image,
        featured,
        status,
        published_at
      `,
    )
    .eq("id", id)
    .maybeSingle();

  if (
    error ||
    !data
  ) {
    notFound();
  }

  const article =
    data as ArticleData;

  const showReviewPanel =
    article.status ===
      "under_review" &&
    canReviewArticles;

  return (
    <section>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/articles"
          className="inline-flex items-center gap-2 text-sm font-semibold text-violet-600 transition hover:text-violet-800"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-4 w-4"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>

          Back to Articles
        </Link>

        <p className="mt-6 text-sm font-semibold text-violet-600">
          {showReviewPanel
            ? "Article Review"
            : "Article Management"}
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          {showReviewPanel
            ? "Review Article"
            : "Edit Article"}
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          {showReviewPanel
            ? "Review the submitted article, make any necessary content adjustments, and choose whether to publish it or return it for revision."
            : "Update article content and publishing settings."}
        </p>
      </div>

      {/* Staff Review */}
      {showReviewPanel && (
        <div className="mb-6">
          <ArticleReviewPanel
            articleId={
              article.id
            }
            articleTitle={
              article.title
            }
          />
        </div>
      )}

      {/* Article Form */}
      <ArticleForm
        article={
          article
        }
      />
    </section>
  );
}