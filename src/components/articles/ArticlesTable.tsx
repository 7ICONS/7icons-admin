"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import DeleteArticleButton from "@/components/articles/DeleteArticleButton";

type Article = {
  id: string;
  title: string;
  slug: string;
  category: string;
  cover_image: string | null;
  status: string;
  featured: boolean;
  created_at: string;
};

type ArticlesTableProps = {
  articles: Article[];
};

const categories = [
  "All",
  "News",
  "Story",
  "Behind the Scene",
  "Community",
  "Member Spotlight",
];

const statuses = [
  "all",
  "published",
  "draft",
  "archived",
];

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const styles: Record<string, string> = {
    published:
      "bg-emerald-50 text-emerald-700",
    draft:
      "bg-amber-50 text-amber-700",
    archived:
      "bg-slate-100 text-slate-600",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
        styles[status] ??
        "bg-slate-100 text-slate-600"
      }`}
    >
      {status}
    </span>
  );
}

export default function ArticlesTable({
  articles,
}: ArticlesTableProps) {
  const [searchQuery, setSearchQuery] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [categoryFilter, setCategoryFilter] =
    useState("All");

  const filteredArticles = useMemo(() => {
    const normalizedSearch =
      searchQuery.trim().toLowerCase();

    return articles.filter((article) => {
      const matchesSearch =
        !normalizedSearch ||
        article.title
          .toLowerCase()
          .includes(normalizedSearch) ||
        article.slug
          .toLowerCase()
          .includes(normalizedSearch) ||
        article.category
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" ||
        article.status === statusFilter;

      const matchesCategory =
        categoryFilter === "All" ||
        article.category === categoryFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory
      );
    });
  }, [
    articles,
    searchQuery,
    statusFilter,
    categoryFilter,
  ]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    statusFilter !== "all" ||
    categoryFilter !== "All";

  function clearFilters() {
    setSearchQuery("");
    setStatusFilter("all");
    setCategoryFilter("All");
  }

  if (articles.length === 0) {
    return (
      <div className="mt-6 overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-sm">
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
                x="5"
                y="3"
                width="14"
                height="18"
                rx="2"
              />

              <path d="M8 8h8" />
              <path d="M8 12h8" />
              <path d="M8 16h5" />
            </svg>
          </div>

          <h2 className="mt-5 text-lg font-bold text-slate-900">
            No articles yet
          </h2>

          <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
            Your article database is connected and
            ready. Create the first article to begin
            managing content through 7ICONS Admin.
          </p>

          <Link
            href="/articles/new"
            className="mt-6 inline-flex h-10 items-center justify-center rounded-xl bg-violet-50 px-4 text-sm font-semibold text-violet-700 transition hover:bg-violet-100"
          >
            Create First Article
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      {/* Search & Filters */}
      <section className="rounded-2xl border border-violet-100 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          {/* Search */}
          <div className="relative min-w-0 flex-1">
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
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
              placeholder="Search by title, slug, or category..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            />
          </div>

          {/* Status */}
          <div className="sm:min-w-[170px]">
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value,
                )
              }
              aria-label="Filter by status"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            >
              {statuses.map((status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status === "all"
                    ? "All Status"
                    : status
                        .charAt(0)
                        .toUpperCase() +
                      status.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div className="sm:min-w-[210px]">
            <select
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(
                  event.target.value,
                )
              }
              aria-label="Filter by category"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            >
              {categories.map((category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category === "All"
                    ? "All Categories"
                    : category}
                </option>
              ))}
            </select>
          </div>

          {/* Clear */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl border border-violet-100 px-4 text-sm font-semibold text-violet-700 transition hover:bg-violet-50"
            >
              Clear Filters
            </button>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-violet-50 pt-4">
          <p className="text-xs text-slate-400">
            Showing{" "}
            <span className="font-semibold text-slate-600">
              {filteredArticles.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-600">
              {articles.length}
            </span>{" "}
            articles
          </p>

          {hasActiveFilters && (
            <p className="text-xs font-medium text-violet-600">
              Filters active
            </p>
          )}
        </div>
      </section>

      {/* Results */}
      <section className="overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-sm">
        {filteredArticles.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-6 w-6"
              >
                <circle
                  cx="11"
                  cy="11"
                  r="7"
                />

                <path d="m20 20-4-4" />
              </svg>
            </div>

            <h2 className="mt-4 text-lg font-bold text-slate-900">
              No matching articles
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              No articles match your current search
              or filter settings.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-violet-50 px-4 text-sm font-semibold text-violet-700 transition hover:bg-violet-100"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead className="border-b border-violet-100 bg-violet-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Article
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Category
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Featured
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Created
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-violet-50">
                {filteredArticles.map(
                  (article) => (
                    <tr
                      key={article.id}
                      className="transition hover:bg-violet-50/30"
                    >
                      {/* Article */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          {article.cover_image ? (
                            <div
                              role="img"
                              aria-label={`${article.title} cover`}
                              className="h-16 w-28 shrink-0 rounded-xl border border-violet-100 bg-slate-100 bg-cover bg-center shadow-sm"
                              style={{
                                backgroundImage: `url("${article.cover_image}")`,
                              }}
                            />
                          ) : (
                            <div className="flex h-16 w-28 shrink-0 items-center justify-center rounded-xl border border-dashed border-violet-200 bg-violet-50/50 text-violet-400">
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                className="h-6 w-6"
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
                          )}

                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800">
                              {article.title}
                            </p>

                            <p className="mt-1 max-w-[320px] truncate text-xs text-slate-400">
                              /{article.slug}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-5 text-sm text-slate-600">
                        {article.category}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-5">
                        <StatusBadge
                          status={article.status}
                        />
                      </td>

                      {/* Featured */}
                      <td className="px-6 py-5">
                        {article.featured ? (
                          <span className="inline-flex rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
                            Yes
                          </span>
                        ) : (
                          <span className="text-sm text-slate-500">
                            No
                          </span>
                        )}
                      </td>

                      {/* Created */}
                      <td className="px-6 py-5 text-sm text-slate-500">
                        {new Intl.DateTimeFormat(
                          "en-GB",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          },
                        ).format(
                          new Date(
                            article.created_at,
                          ),
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/articles/${article.id}/edit`}
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

                          <DeleteArticleButton
                            articleId={
                              article.id
                            }
                            articleTitle={
                              article.title
                            }
                          />
                        </div>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}