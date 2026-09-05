import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import ArticleForm from "@/components/articles/ArticleForm";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Edit Article",
};

type EditArticlePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditArticlePage({
  params,
}: EditArticlePageProps) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: article, error } = await supabase
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

  if (error || !article) {
    notFound();
  }

  return (
    <section>
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
          Article Management
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Edit Article
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Update article content and publishing settings.
        </p>
      </div>

      <ArticleForm article={article} />
    </section>
  );
}