"use client";

import Link from "next/link";
import {
  useMemo,
  useState,
} from "react";

import DeleteArticleButton from "@/components/articles/DeleteArticleButton";
import SubmitArticleForReviewButton from "@/components/articles/SubmitArticleForReviewButton";

type ArticleStatus =
  | "draft"
  | "under_review"
  | "published"
  | "rejected"
  | "archived";

type Article = {
  id: string;
  title: string;
  slug: string;
  category: string;
  cover_image: string | null;
  status: string;
  featured: boolean;
  review_notes: string | null;
  created_at: string;
};

type ArticlesTableProps = {
  articles: Article[];
  isRepresentative?: boolean;
};

const categories = [
  "All",
  "News",
  "Story",
  "Behind the Scene",
  "Community",
  "Member Spotlight",
];

const statuses: {
  value: string;
  label: string;
}[] = [
  {
    value: "all",
    label: "All Status",
  },
  {
    value: "published",
    label: "Published",
  },
  {
    value: "draft",
    label: "Draft",
  },
  {
    value: "under_review",
    label: "Under Review",
  },
  {
    value: "rejected",
    label: "Rejected",
  },
  {
    value: "archived",
    label: "Archived",
  },
];

function normalizeStatus(
  status: string,
): ArticleStatus | string {
  return status
    .trim()
    .toLowerCase();
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const normalizedStatus =
    normalizeStatus(status);

  const styles: Record<
    string,
    string
  > = {
    published:
      "border border-emerald-200 bg-emerald-50 text-emerald-700",

    draft:
      "border border-amber-200 bg-amber-50 text-amber-700",

    under_review:
      "border border-blue-200 bg-blue-50 text-blue-700",

    rejected:
      "border border-red-200 bg-red-50 text-red-700",

    archived:
      "border border-slate-200 bg-slate-100 text-slate-600",
  };

  const labels: Record<
    string,
    string
  > = {
    published:
      "Published",

    draft:
      "Draft",

    under_review:
      "Under Review",

    rejected:
      "Rejected",

    archived:
      "Archived",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        styles[
          normalizedStatus
        ] ??
        "border border-slate-200 bg-slate-100 text-slate-600"
      }`}
    >
      {labels[
        normalizedStatus
      ] ?? status}
    </span>
  );
}

function RepresentativeStatusHelp({
  status,
}: {
  status: string;
}) {
  const normalizedStatus =
    normalizeStatus(status);

  if (
    normalizedStatus ===
    "under_review"
  ) {
    return (
      <p className="mt-1 text-xs text-blue-600">
        Waiting for staff review
      </p>
    );
  }

  if (
    normalizedStatus ===
    "rejected"
  ) {
    return (
      <p className="mt-1 text-xs text-red-500">
        Revision required
      </p>
    );
  }

  if (
    normalizedStatus ===
    "published"
  ) {
    return (
      <p className="mt-1 text-xs text-emerald-600">
        Published by staff
      </p>
    );
  }

  if (
    normalizedStatus ===
    "archived"
  ) {
    return (
      <p className="mt-1 text-xs text-slate-400">
        Archived
      </p>
    );
  }

  return null;
}

export default function ArticlesTable({
  articles,
  isRepresentative = false,
}: ArticlesTableProps) {
  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("all");

  const [
    categoryFilter,
    setCategoryFilter,
  ] = useState("All");

  const filteredArticles =
    useMemo(() => {
      const normalizedSearch =
        searchQuery
          .trim()
          .toLowerCase();

      return articles.filter(
        (article) => {
          const matchesSearch =
            !normalizedSearch ||
            article.title
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            article.slug
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            article.category
              .toLowerCase()
              .includes(
                normalizedSearch,
              );

          const matchesStatus =
            statusFilter ===
              "all" ||
            normalizeStatus(
              article.status,
            ) ===
              statusFilter;

          const matchesCategory =
            categoryFilter ===
              "All" ||
            article.category ===
              categoryFilter;

          return (
            matchesSearch &&
            matchesStatus &&
            matchesCategory
          );
        },
      );
    }, [
      articles,
      searchQuery,
      statusFilter,
      categoryFilter,
    ]);

  const hasActiveFilters =
    searchQuery.trim() !==
      "" ||
    statusFilter !== "all" ||
    categoryFilter !==
      "All";

  function clearFilters() {
    setSearchQuery("");
    setStatusFilter("all");
    setCategoryFilter("All");
  }

  if (
    articles.length === 0
  ) {
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
            {isRepresentative
              ? "You haven’t created any articles yet. Create your first draft and submit it for staff review when it is ready."
              : "Your article database is connected and ready. Create the first article to begin managing content through 7ICONS Admin."}
          </p>

          <Link
            href="/articles/new"
            className="mt-6 inline-flex h-10 items-center justify-center rounded-xl bg-violet-50 px-4 text-sm font-semibold text-violet-700 transition hover:bg-violet-100"
          >
            {isRepresentative
              ? "Create My First Article"
              : "Create First Article"}
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
              placeholder="Search by title, slug, or category..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            />
          </div>

          {/* Status */}
          <div className="sm:min-w-[170px]">
            <select
              value={
                statusFilter
              }
              onChange={(
                event,
              ) =>
                setStatusFilter(
                  event.target
                    .value,
                )
              }
              aria-label="Filter by status"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            >
              {statuses.map(
                (status) => (
                  <option
                    key={
                      status.value
                    }
                    value={
                      status.value
                    }
                  >
                    {
                      status.label
                    }
                  </option>
                ),
              )}
            </select>
          </div>

          {/* Category */}
          <div className="sm:min-w-[210px]">
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
              aria-label="Filter by category"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            >
              {categories.map(
                (category) => (
                  <option
                    key={
                      category
                    }
                    value={
                      category
                    }
                  >
                    {category ===
                    "All"
                      ? "All Categories"
                      : category}
                  </option>
                ),
              )}
            </select>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={
                clearFilters
              }
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
              {
                filteredArticles.length
              }
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-600">
              {articles.length}
            </span>{" "}
            {isRepresentative
              ? "your articles"
              : "articles"}
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
        {filteredArticles.length ===
        0 ? (
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
              No articles match
              your current search
              or filter settings.
            </p>

            <button
              type="button"
              onClick={
                clearFilters
              }
              className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-violet-50 px-4 text-sm font-semibold text-violet-700 transition hover:bg-violet-100"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px]">
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
                  (article) => {
                    const normalizedStatus =
                      normalizeStatus(
                        article.status,
                      );

                    const representativeCanEdit =
                      isRepresentative &&
                      [
                        "draft",
                        "rejected",
                      ].includes(
                        normalizedStatus,
                      );

                    const representativeCanDelete =
                      representativeCanEdit;

                    const representativeCanSubmit =
                      isRepresentative &&
                      normalizedStatus ===
                        "draft";

                    const representativeIsLocked =
                      isRepresentative &&
                      [
                        "under_review",
                        "published",
                        "archived",
                      ].includes(
                        normalizedStatus,
                      );

                    const showStaffFeedback =
                      isRepresentative &&
                      normalizedStatus ===
                        "rejected" &&
                      Boolean(
                        article.review_notes?.trim(),
                      );

                    return (
                      <tr
                        key={
                          article.id
                        }
                        className="transition hover:bg-violet-50/30"
                      >
                        {/* Article */}
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-4">
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

                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-slate-800">
                                {
                                  article.title
                                }
                              </p>

                              <p className="mt-1 max-w-[320px] truncate text-xs text-slate-400">
                                /
                                {
                                  article.slug
                                }
                              </p>

                              {showStaffFeedback && (
                                <div className="mt-3 max-w-md rounded-xl border border-red-200 bg-red-50 px-3.5 py-3">
                                  <div className="flex items-start gap-2.5">
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                                      <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        className="h-4 w-4"
                                      >
                                        <path d="M12 9v4" />

                                        <path d="M12 17h.01" />

                                        <circle
                                          cx="12"
                                          cy="12"
                                          r="9"
                                        />
                                      </svg>
                                    </div>

                                    <div className="min-w-0">
                                      <p className="text-xs font-bold uppercase tracking-[0.1em] text-red-700">
                                        Staff Feedback
                                      </p>

                                      <p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-red-700/80">
                                        {
                                          article.review_notes
                                        }
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-6 py-5 text-sm text-slate-600">
                          {
                            article.category
                          }
                        </td>

                        {/* Status */}
                        <td className="px-6 py-5 align-top">
                          <StatusBadge
                            status={
                              article.status
                            }
                          />

                          {isRepresentative && (
                            <RepresentativeStatusHelp
                              status={
                                article.status
                              }
                            />
                          )}
                        </td>

                        {/* Featured */}
                        <td className="px-6 py-5 align-top">
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
                        <td className="px-6 py-5 align-top text-sm text-slate-500">
                          {new Intl.DateTimeFormat(
                            "en-GB",
                            {
                              day: "2-digit",
                              month:
                                "short",
                              year: "numeric",
                            },
                          ).format(
                            new Date(
                              article.created_at,
                            ),
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-5 align-top">
                          <div className="flex items-center justify-end gap-2">
                            {/* Internal Staff */}
                            {!isRepresentative && (
                              <>
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
                              </>
                            )}

                            {/* Representative Edit */}
                            {representativeCanEdit && (
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
                            )}

                            {/* Representative Delete */}
                            {representativeCanDelete && (
                              <DeleteArticleButton
                                articleId={
                                  article.id
                                }
                                articleTitle={
                                  article.title
                                }
                              />
                            )}

                            {/* Representative Submit */}
                            {representativeCanSubmit && (
                              <SubmitArticleForReviewButton
                                articleId={
                                  article.id
                                }
                                articleTitle={
                                  article.title
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
      </section>
    </div>
  );
}