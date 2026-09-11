import type { Metadata } from "next";
import Link from "next/link";

import UpcomingSchedule from "@/components/dashboard/UpcomingSchedule";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Dashboard",
};

type AdminRole =
  | "super_admin"
  | "admin"
  | "editor"
  | "moderator"
  | "representative";

type StatIcon =
  | "article"
  | "gallery"
  | "review"
  | "users"
  | "representative"
  | "comment"
  | "media";

type DashboardStat = {
  label: string;
  value: number;
  description: string;
  icon: StatIcon;
};

type ActivityItem = {
  id: string;
  title: string;
  type: "Article" | "Gallery";
  status: string;
  updated_at: string;
};

type ModerationActivity = {
  id: string;
  body: string;
  status: string;
  created_at: string;
};

type QuickAction = {
  label: string;
  description: string;
  href: string;
};

type SupabaseServerClient =
  Awaited<ReturnType<typeof createClient>>;

function formatStatus(
  status: string,
) {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

function formatDate(
  dateString: string,
) {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  ).format(
    new Date(dateString),
  );
}

function getStatusClasses(
  status: string,
) {
  switch (status) {
    case "published":
    case "approved":
      return "bg-emerald-50 text-emerald-700";

    case "under_review":
    case "pending":
      return "bg-amber-50 text-amber-700";

    case "rejected":
    case "spam":
      return "bg-red-50 text-red-700";

    case "hidden":
      return "bg-slate-100 text-slate-600";

    case "draft":
      return "bg-slate-100 text-slate-600";

    case "archived":
      return "bg-slate-100 text-slate-500";

    default:
      return "bg-violet-50 text-violet-700";
  }
}

function getRoleLabel(
  role: AdminRole,
) {
  switch (role) {
    case "super_admin":
      return "Super Admin";

    case "admin":
      return "Admin";

    case "editor":
      return "Editor";

    case "moderator":
      return "Moderator";

    case "representative":
      return "ICONIA Representative";
  }
}

function DashboardIcon({
  type,
}: {
  type: StatIcon;
}) {
  if (type === "article") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-5 w-5"
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
    );
  }

  if (type === "gallery") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-5 w-5"
      >
        <rect
          x="3"
          y="4"
          width="18"
          height="16"
          rx="2"
        />
        <circle
          cx="8.5"
          cy="9"
          r="1.5"
        />
        <path d="m5 17 4-4 3 3 2-2 5 3" />
      </svg>
    );
  }

  if (type === "review") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-5 w-5"
      >
        <circle
          cx="12"
          cy="12"
          r="9"
        />
        <path d="M12 7v5l3 2" />
      </svg>
    );
  }

  if (type === "users") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-5 w-5"
      >
        <circle
          cx="12"
          cy="8"
          r="3.5"
        />
        <path d="M5 20c.7-4 3-6 7-6s6.3 2 7 6" />
      </svg>
    );
  }

  if (
    type === "representative"
  ) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-5 w-5"
      >
        <circle
          cx="8"
          cy="8"
          r="3"
        />
        <circle
          cx="17"
          cy="9"
          r="2.4"
        />
        <path d="M2.5 19c.5-3.5 2.4-5.4 5.5-5.4 3.2 0 5 1.9 5.5 5.4" />
        <path d="M14.5 15c3-.5 5.2 1 6 4" />
      </svg>
    );
  }

  if (type === "media") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-5 w-5"
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
        <path d="m4 17 5-5 3 3 2-2 6 5" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v9a2.5 2.5 0 0 1-2.5 2.5H11l-4.5 4v-4A2.5 2.5 0 0 1 4 14.5z" />
    </svg>
  );
}

function DashboardHeader({
  eyebrow,
  displayName,
  description,
  role,
}: {
  eyebrow: string;
  displayName: string;
  description: string;
  role: AdminRole;
}) {
  return (
    <div className="w-full min-w-0 max-w-full rounded-3xl border border-violet-100 bg-gradient-to-br from-white via-white to-violet-50/70 p-5 shadow-sm sm:p-8">
      <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-violet-600">
            {eyebrow}
          </p>

          <h1 className="mt-2 break-words text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Welcome back,{" "}
            {displayName}
          </h1>

          <p className="mt-3 max-w-2xl break-words text-sm leading-6 text-slate-500">
            {description}
          </p>
        </div>

        <div className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full border border-violet-100 bg-white px-4 py-2 text-xs font-semibold text-violet-700 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />

          {getRoleLabel(role)}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  item,
}: {
  item: DashboardStat;
}) {
  return (
    <article className="w-full min-w-0 max-w-full rounded-2xl border border-violet-100 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
        <DashboardIcon
          type={item.icon}
        />
      </div>

      <p className="mt-5 break-words text-sm font-semibold text-slate-600">
        {item.label}
      </p>

      <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
        {item.value}
      </p>

      <p className="mt-2 break-words text-xs leading-5 text-slate-400">
        {item.description}
      </p>
    </article>
  );
}

function StatsGrid({
  stats,
  columns = "six",
}: {
  stats: DashboardStat[];
  columns?:
    | "four"
    | "five"
    | "six";
}) {
  const gridClass =
    columns === "four"
      ? "xl:grid-cols-4"
      : columns === "five"
        ? "xl:grid-cols-5"
        : "xl:grid-cols-3 2xl:grid-cols-6";

  return (
    <div
      className={`mt-6 grid w-full min-w-0 max-w-full grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 ${gridClass}`}
    >
      {stats.map(
        (item) => (
          <StatCard
            key={item.label}
            item={item}
          />
        ),
      )}
    </div>
  );
}

function QuickActionsPanel({
  eyebrow = "Workspace",
  title = "Quick Actions",
  description,
  actions,
}: {
  eyebrow?: string;
  title?: string;
  description: string;
  actions: QuickAction[];
}) {
  return (
    <article className="w-full min-w-0 max-w-full rounded-3xl border border-violet-100 bg-white p-5 shadow-sm sm:p-6">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
        {eyebrow}
      </p>

      <h2 className="mt-2 break-words text-xl font-bold text-slate-950">
        {title}
      </h2>

      <p className="mt-2 break-words text-sm leading-6 text-slate-500">
        {description}
      </p>

      <div className="mt-6 grid min-w-0 gap-3 sm:grid-cols-2">
        {actions.map(
          (action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-violet-100 bg-violet-50/30 px-4 py-4 transition hover:border-violet-200 hover:bg-violet-50"
            >
              <div className="min-w-0 flex-1">
                <p className="break-words text-sm font-bold text-slate-800">
                  {action.label}
                </p>

                <p className="mt-1 break-words text-xs leading-5 text-slate-500">
                  {action.description}
                </p>
              </div>

              <span className="shrink-0 text-lg text-violet-500 transition group-hover:translate-x-1">
                →
              </span>
            </Link>
          ),
        )}
      </div>
    </article>
  );
}

function RecentContent({
  items,
  eyebrow = "Platform Content",
  title = "Recent Content",
  description = "Latest Article and Gallery activity.",
}: {
  items: ActivityItem[];
  eyebrow?: string;
  title?: string;
  description?: string;
}) {
  return (
    <article className="w-full min-w-0 max-w-full rounded-3xl border border-violet-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
          {eyebrow}
        </p>

        <h2 className="mt-2 break-words text-xl font-bold text-slate-950">
          {title}
        </h2>

        <p className="mt-1 break-words text-sm text-slate-500">
          {description}
        </p>
      </div>

      {items.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-violet-200 bg-violet-50/30 px-5 py-10 text-center">
          <p className="text-sm font-semibold text-slate-700">
            No recent activity
          </p>

          <p className="mt-2 text-xs leading-5 text-slate-500">
            New activity will
            appear here.
          </p>
        </div>
      ) : (
        <div className="mt-5 min-w-0 divide-y divide-violet-50">
          {items.map(
            (item) => (
              <div
                key={`${item.type}-${item.id}`}
                className="min-w-0 py-4 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-violet-600">
                      {item.type}
                    </span>

                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${getStatusClasses(
                        item.status,
                      )}`}
                    >
                      {formatStatus(
                        item.status,
                      )}
                    </span>
                  </div>

                  <p className="mt-2 max-w-full break-words [overflow-wrap:anywhere] text-sm font-semibold leading-5 text-slate-800">
                    {item.title}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Updated{" "}
                    {formatDate(
                      item.updated_at,
                    )}
                  </p>
                </div>
              </div>
            ),
          )}
        </div>
      )}
    </article>
  );
}

function ReviewQueue({
  articleCount,
  galleryCount,
}: {
  articleCount: number;
  galleryCount: number;
}) {
  const total =
    articleCount +
    galleryCount;

  return (
    <article className="w-full min-w-0 max-w-full rounded-3xl border border-violet-100 bg-white p-5 shadow-sm sm:p-6">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
        Staff Review
      </p>

      <h2 className="mt-2 break-words text-xl font-bold text-slate-950">
        Content Awaiting Review
      </h2>

      <p className="mt-1 break-words text-sm leading-6 text-slate-500">
        Representative submissions waiting for a staff decision.
      </p>

      <div className="mt-6 rounded-2xl border border-violet-100 bg-violet-50/30 p-5">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-600">
              Total Waiting
            </p>

            <p className="mt-1 text-3xl font-bold text-slate-950">
              {total}
            </p>
          </div>

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-violet-600 shadow-sm">
            <DashboardIcon
              type="review"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
        <Link
          href="/articles"
          className="min-w-0 rounded-2xl border border-violet-100 p-4 transition hover:bg-violet-50/40"
        >
          <p className="text-xs font-semibold text-slate-500">
            Articles
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-950">
            {articleCount}
          </p>

          <p className="mt-1 text-xs text-violet-600">
            View Articles →
          </p>
        </Link>

        <Link
          href="/gallery"
          className="min-w-0 rounded-2xl border border-violet-100 p-4 transition hover:bg-violet-50/40"
        >
          <p className="text-xs font-semibold text-slate-500">
            Gallery
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-950">
            {galleryCount}
          </p>

          <p className="mt-1 text-xs text-violet-600">
            View Gallery →
          </p>
        </Link>
      </div>
    </article>
  );
}

function ModerationActivityList({
  comments,
}: {
  comments: ModerationActivity[];
}) {
  return (
    <article className="w-full min-w-0 max-w-full rounded-3xl border border-violet-100 bg-white p-5 shadow-sm sm:p-6">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
        Community
      </p>

      <h2 className="mt-2 text-xl font-bold text-slate-950">
        Recent Comments
      </h2>

      <p className="mt-1 break-words text-sm leading-6 text-slate-500">
        Latest community comments visible to the moderation team.
      </p>

      {comments.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-violet-200 bg-violet-50/30 px-5 py-10 text-center">
          <p className="text-sm font-semibold text-slate-700">
            No comments yet
          </p>
        </div>
      ) : (
        <div className="mt-5 min-w-0 divide-y divide-violet-50">
          {comments.map(
            (comment) => (
              <div
                key={comment.id}
                className="min-w-0 py-4 first:pt-0 last:pb-0"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${getStatusClasses(
                      comment.status,
                    )}`}
                  >
                    {formatStatus(
                      comment.status,
                    )}
                  </span>

                  <span className="text-xs text-slate-400">
                    {formatDate(
                      comment.created_at,
                    )}
                  </span>
                </div>

                <p className="mt-2 break-words [overflow-wrap:anywhere] text-sm leading-6 text-slate-700">
                  {comment.body}
                </p>
              </div>
            ),
          )}
        </div>
      )}
    </article>
  );
}

async function loadRecentContent(
  supabase: SupabaseServerClient,
  userId?: string,
) {
  const articleQuery =
    userId
      ? supabase
          .from("articles")
          .select(
            "id, title, status, updated_at",
          )
          .eq(
            "created_by",
            userId,
          )
          .order(
            "updated_at",
            {
              ascending:
                false,
            },
          )
          .limit(4)
      : supabase
          .from("articles")
          .select(
            "id, title, status, updated_at",
          )
          .order(
            "updated_at",
            {
              ascending:
                false,
            },
          )
          .limit(4);

  const galleryQuery =
    userId
      ? supabase
          .from(
            "gallery_albums",
          )
          .select(
            "id, title, status, updated_at",
          )
          .eq(
            "created_by",
            userId,
          )
          .order(
            "updated_at",
            {
              ascending:
                false,
            },
          )
          .limit(4)
      : supabase
          .from(
            "gallery_albums",
          )
          .select(
            "id, title, status, updated_at",
          )
          .order(
            "updated_at",
            {
              ascending:
                false,
            },
          )
          .limit(4);

  const [
    articlesResult,
    galleryResult,
  ] = await Promise.all([
    articleQuery,
    galleryQuery,
  ]);

  const articles: ActivityItem[] =
    (
      articlesResult.data ??
      []
    ).map(
      (article) => ({
        id: article.id,
        title: article.title,
        type: "Article",
        status:
          article.status ??
          "draft",
        updated_at:
          article.updated_at,
      }),
    );

  const gallery: ActivityItem[] =
    (
      galleryResult.data ??
      []
    ).map(
      (album) => ({
        id: album.id,
        title: album.title,
        type: "Gallery",
        status:
          album.status ??
          "draft",
        updated_at:
          album.updated_at,
      }),
    );

  return [
    ...articles,
    ...gallery,
  ]
    .sort(
      (a, b) =>
        new Date(
          b.updated_at,
        ).getTime() -
        new Date(
          a.updated_at,
        ).getTime(),
    )
    .slice(0, 6);
}

/* =========================================================
   SUPER ADMIN
   ========================================================= */

async function SuperAdminDashboard({
  displayName,
}: {
  displayName: string;
}) {
  const supabase =
    await createClient();

  const [
    articlesResult,
    publishedArticlesResult,
    articleReviewResult,
    galleryResult,
    galleryReviewResult,
    usersResult,
    representativesResult,
    pendingCommentsResult,
    recentContent,
  ] = await Promise.all([
    supabase
      .from("articles")
      .select("id", {
        count: "exact",
        head: true,
      }),

    supabase
      .from("articles")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq(
        "status",
        "published",
      ),

    supabase
      .from("articles")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq(
        "status",
        "under_review",
      ),

    supabase
      .from(
        "gallery_albums",
      )
      .select("id", {
        count: "exact",
        head: true,
      }),

    supabase
      .from(
        "gallery_albums",
      )
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq(
        "status",
        "under_review",
      ),

    supabase
      .from(
        "user_profiles",
      )
      .select("id", {
        count: "exact",
        head: true,
      }),

    supabase
      .from(
        "admin_roles",
      )
      .select("user_id", {
        count: "exact",
        head: true,
      })
      .eq(
        "role",
        "representative",
      )
      .eq(
        "is_active",
        true,
      ),

    supabase
      .from("comments")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq(
        "status",
        "pending",
      ),

    loadRecentContent(
      supabase,
    ),
  ]);

  const articleReviewCount =
    articleReviewResult.count ??
    0;

  const galleryReviewCount =
    galleryReviewResult.count ??
    0;

  const stats: DashboardStat[] =
    [
      {
        label:
          "Total Articles",
        value:
          articlesResult.count ??
          0,
        description: `${
          publishedArticlesResult.count ??
          0
        } published`,
        icon: "article",
      },
      {
        label:
          "Gallery Albums",
        value:
          galleryResult.count ??
          0,
        description:
          "Across the platform",
        icon: "gallery",
      },
      {
        label:
          "Content In Review",
        value:
          articleReviewCount +
          galleryReviewCount,
        description:
          "Waiting for staff review",
        icon: "review",
      },
      {
        label:
          "Registered Users",
        value:
          usersResult.count ??
          0,
        description:
          "Platform user profiles",
        icon: "users",
      },
      {
        label:
          "Representatives",
        value:
          representativesResult.count ??
          0,
        description:
          "Active accounts",
        icon:
          "representative",
      },
      {
        label:
          "Pending Comments",
        value:
          pendingCommentsResult.count ??
          0,
        description:
          "Waiting for moderation",
        icon: "comment",
      },
    ];

  const actions: QuickAction[] =
    [
      {
        label: "Articles",
        description:
          "Manage and review Articles.",
        href: "/articles",
      },
      {
        label: "Gallery",
        description:
          "Manage Gallery albums.",
        href: "/gallery",
      },
      {
        label: "Comments",
        description:
          "Moderate conversations.",
        href: "/comments",
      },
      {
        label: "Users",
        description:
          "Manage platform users.",
        href: "/users",
      },
      {
        label: "Media",
        description:
          "Manage media assets.",
        href: "/media",
      },
      {
        label: "Schedule",
        description:
          "Manage upcoming activities.",
        href: "/schedule",
      },
    ];

  return (
    <section className="w-full min-w-0 max-w-full">
      <DashboardHeader
        eyebrow="Platform Overview"
        displayName={
          displayName
        }
        description="Monitor content, community activity, users, and platform workflows across the entire 7ICONS digital ecosystem."
        role="super_admin"
      />

      <StatsGrid
        stats={stats}
      />

      <div className="mt-6 grid w-full min-w-0 max-w-full gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <ReviewQueue
          articleCount={
            articleReviewCount
          }
          galleryCount={
            galleryReviewCount
          }
        />

        <RecentContent
          items={
            recentContent
          }
        />
      </div>

      {/* CALENDAR */}
      <div className="mt-6 w-full min-w-0 max-w-full">
        <UpcomingSchedule />
      </div>

      <div className="mt-6 w-full min-w-0 max-w-full">
        <QuickActionsPanel
          eyebrow="Administration"
          description="Access the main management areas of the 7ICONS platform."
          actions={actions}
        />
      </div>
    </section>
  );
}

/* =========================================================
   ADMIN
   ========================================================= */

async function AdminDashboard({
  displayName,
}: {
  displayName: string;
}) {
  const supabase =
    await createClient();

  const [
    articlesResult,
    articleReviewResult,
    galleryResult,
    galleryReviewResult,
    usersResult,
    representativesResult,
    pendingCommentsResult,
    recentContent,
  ] = await Promise.all([
    supabase
      .from("articles")
      .select("id", {
        count: "exact",
        head: true,
      }),

    supabase
      .from("articles")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq(
        "status",
        "under_review",
      ),

    supabase
      .from(
        "gallery_albums",
      )
      .select("id", {
        count: "exact",
        head: true,
      }),

    supabase
      .from(
        "gallery_albums",
      )
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq(
        "status",
        "under_review",
      ),

    supabase
      .from(
        "user_profiles",
      )
      .select("id", {
        count: "exact",
        head: true,
      }),

    supabase
      .from(
        "admin_roles",
      )
      .select("user_id", {
        count: "exact",
        head: true,
      })
      .eq(
        "role",
        "representative",
      )
      .eq(
        "is_active",
        true,
      ),

    supabase
      .from("comments")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq(
        "status",
        "pending",
      ),

    loadRecentContent(
      supabase,
    ),
  ]);

  const articleReviewCount =
    articleReviewResult.count ??
    0;

  const galleryReviewCount =
    galleryReviewResult.count ??
    0;

  const stats: DashboardStat[] =
    [
      {
        label:
          "Total Articles",
        value:
          articlesResult.count ??
          0,
        description:
          "Platform Articles",
        icon: "article",
      },
      {
        label:
          "Gallery Albums",
        value:
          galleryResult.count ??
          0,
        description:
          "Platform Gallery",
        icon: "gallery",
      },
      {
        label:
          "Content In Review",
        value:
          articleReviewCount +
          galleryReviewCount,
        description:
          "Waiting for review",
        icon: "review",
      },
      {
        label:
          "Registered Users",
        value:
          usersResult.count ??
          0,
        description:
          "Platform users",
        icon: "users",
      },
      {
        label:
          "Representatives",
        value:
          representativesResult.count ??
          0,
        description:
          "Active accounts",
        icon:
          "representative",
      },
      {
        label:
          "Pending Comments",
        value:
          pendingCommentsResult.count ??
          0,
        description:
          "Waiting for moderation",
        icon: "comment",
      },
    ];

  const actions: QuickAction[] =
    [
      {
        label: "Articles",
        description:
          "Manage and review Articles.",
        href: "/articles",
      },
      {
        label: "Gallery",
        description:
          "Manage Gallery albums.",
        href: "/gallery",
      },
      {
        label: "Comments",
        description:
          "Manage community comments.",
        href: "/comments",
      },
      {
        label: "Users",
        description:
          "Manage registered users.",
        href: "/users",
      },
    ];

  return (
    <section className="w-full min-w-0 max-w-full">
      <DashboardHeader
        eyebrow="Operations Overview"
        displayName={
          displayName
        }
        description="Manage daily content, community activity, users, and Representative workflows across the 7ICONS platform."
        role="admin"
      />

      <StatsGrid
        stats={stats}
      />

      <div className="mt-6 grid w-full min-w-0 max-w-full gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <ReviewQueue
          articleCount={
            articleReviewCount
          }
          galleryCount={
            galleryReviewCount
          }
        />

        <RecentContent
          items={
            recentContent
          }
        />
      </div>

      {/* CALENDAR */}
      <div className="mt-6 w-full min-w-0 max-w-full">
        <UpcomingSchedule />
      </div>

      <div className="mt-6 w-full min-w-0 max-w-full">
        <QuickActionsPanel
          eyebrow="Management"
          description="Jump directly to the tools used for daily platform management."
          actions={actions}
        />
      </div>
    </section>
  );
}

/* =========================================================
   EDITOR
   ========================================================= */

async function EditorDashboard({
  displayName,
}: {
  displayName: string;
}) {
  const supabase =
    await createClient();

  const [
    articlesResult,
    articleReviewResult,
    galleryResult,
    galleryReviewResult,
    mediaResult,
    recentContent,
  ] = await Promise.all([
    supabase
      .from("articles")
      .select("id", {
        count: "exact",
        head: true,
      }),

    supabase
      .from("articles")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq(
        "status",
        "under_review",
      ),

    supabase
      .from(
        "gallery_albums",
      )
      .select("id", {
        count: "exact",
        head: true,
      }),

    supabase
      .from(
        "gallery_albums",
      )
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq(
        "status",
        "under_review",
      ),

    supabase
      .from(
        "media_assets",
      )
      .select("id", {
        count: "exact",
        head: true,
      }),

    loadRecentContent(
      supabase,
    ),
  ]);

  const articleReviewCount =
    articleReviewResult.count ??
    0;

  const galleryReviewCount =
    galleryReviewResult.count ??
    0;

  const stats: DashboardStat[] =
    [
      {
        label: "Articles",
        value:
          articlesResult.count ??
          0,
        description:
          "Editorial content",
        icon: "article",
      },
      {
        label:
          "Article Review",
        value:
          articleReviewCount,
        description:
          "Waiting for review",
        icon: "review",
      },
      {
        label:
          "Gallery Albums",
        value:
          galleryResult.count ??
          0,
        description:
          "Gallery content",
        icon: "gallery",
      },
      {
        label:
          "Gallery Review",
        value:
          galleryReviewCount,
        description:
          "Waiting for review",
        icon: "review",
      },
      {
        label:
          "Media Assets",
        value:
          mediaResult.count ??
          0,
        description:
          "Shared media library",
        icon: "media",
      },
    ];

  const actions: QuickAction[] =
    [
      {
        label: "Articles",
        description:
          "Create, edit, and review Articles.",
        href: "/articles",
      },
      {
        label: "Gallery",
        description:
          "Manage Gallery albums.",
        href: "/gallery",
      },
      {
        label: "Media",
        description:
          "Manage shared media assets.",
        href: "/media",
      },
    ];

  return (
    <section className="w-full min-w-0 max-w-full">
      <DashboardHeader
        eyebrow="Editorial Workspace"
        displayName={
          displayName
        }
        description="Focus on editorial content, Gallery submissions, review workflows, and shared media assets."
        role="editor"
      />

      <StatsGrid
        stats={stats}
        columns="five"
      />

      <div className="mt-6 grid w-full min-w-0 max-w-full gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <ReviewQueue
          articleCount={
            articleReviewCount
          }
          galleryCount={
            galleryReviewCount
          }
        />

        <RecentContent
          items={
            recentContent
          }
          eyebrow="Editorial Activity"
          title="Recent Content"
          description="Latest Articles and Gallery activity available to the editorial team."
        />
      </div>

      <div className="mt-6 w-full min-w-0 max-w-full">
        <QuickActionsPanel
          eyebrow="Editorial"
          description="Open the content tools available to your Editor account."
          actions={actions}
        />
      </div>
    </section>
  );
}

/* =========================================================
   MODERATOR
   ========================================================= */

async function ModeratorDashboard({
  displayName,
}: {
  displayName: string;
}) {
  const supabase =
    await createClient();

  const [
    usersResult,
    pendingResult,
    approvedResult,
    hiddenResult,
    spamResult,
    recentResult,
  ] = await Promise.all([
    supabase
      .from(
        "user_profiles",
      )
      .select("id", {
        count: "exact",
        head: true,
      }),

    supabase
      .from("comments")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq(
        "status",
        "pending",
      ),

    supabase
      .from("comments")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq(
        "status",
        "approved",
      ),

    supabase
      .from("comments")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq(
        "status",
        "hidden",
      ),

    supabase
      .from("comments")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq(
        "status",
        "spam",
      ),

    supabase
      .from("comments")
      .select(
        "id, body, status, created_at",
      )
      .order(
        "created_at",
        {
          ascending:
            false,
        },
      )
      .limit(6),
  ]);

  const stats: DashboardStat[] =
    [
      {
        label:
          "Registered Users",
        value:
          usersResult.count ??
          0,
        description:
          "Platform user profiles",
        icon: "users",
      },
      {
        label: "Pending",
        value:
          pendingResult.count ??
          0,
        description:
          "Needs moderation",
        icon: "comment",
      },
      {
        label: "Approved",
        value:
          approvedResult.count ??
          0,
        description:
          "Visible comments",
        icon: "comment",
      },
      {
        label: "Hidden",
        value:
          hiddenResult.count ??
          0,
        description:
          "Hidden comments",
        icon: "comment",
      },
      {
        label: "Spam",
        value:
          spamResult.count ??
          0,
        description:
          "Marked as spam",
        icon: "comment",
      },
    ];

  const comments: ModerationActivity[] =
    (
      recentResult.data ??
      []
    ).map(
      (comment) => ({
        id: comment.id,
        body: comment.body,
        status:
          comment.status,
        created_at:
          comment.created_at,
      }),
    );

  const actions: QuickAction[] =
    [
      {
        label: "Comments",
        description:
          "Review and moderate community comments.",
        href: "/comments",
      },
      {
        label: "Users",
        description:
          "View and manage registered users.",
        href: "/users",
      },
    ];

  return (
    <section className="w-full min-w-0 max-w-full">
      <DashboardHeader
        eyebrow="Moderation Center"
        displayName={
          displayName
        }
        description="Keep community conversations healthy and manage user activity across the 7ICONS platform."
        role="moderator"
      />

      <StatsGrid
        stats={stats}
        columns="five"
      />

      <div className="mt-6 grid w-full min-w-0 max-w-full gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <ModerationActivityList
          comments={
            comments
          }
        />

        <QuickActionsPanel
          eyebrow="Moderation"
          description="Access the tools available to the Moderator role."
          actions={actions}
        />
      </div>
    </section>
  );
}

/* =========================================================
   REPRESENTATIVE
   ========================================================= */

async function RepresentativeDashboard({
  userId,
  displayName,
}: {
  userId: string;
  displayName: string;
}) {
  const supabase =
    await createClient();

  const [
    articlesResult,
    publishedArticlesResult,
    articleReviewResult,
    galleryResult,
    publishedGalleryResult,
    galleryReviewResult,
    commentsResult,
    recentContent,
  ] = await Promise.all([
    supabase
      .from("articles")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq(
        "created_by",
        userId,
      ),

    supabase
      .from("articles")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq(
        "created_by",
        userId,
      )
      .eq(
        "status",
        "published",
      ),

    supabase
      .from("articles")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq(
        "created_by",
        userId,
      )
      .eq(
        "status",
        "under_review",
      ),

    supabase
      .from(
        "gallery_albums",
      )
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq(
        "created_by",
        userId,
      ),

    supabase
      .from(
        "gallery_albums",
      )
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq(
        "created_by",
        userId,
      )
      .eq(
        "status",
        "published",
      ),

    supabase
      .from(
        "gallery_albums",
      )
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq(
        "created_by",
        userId,
      )
      .eq(
        "status",
        "under_review",
      ),

    supabase
      .from("comments")
      .select("id", {
        count: "exact",
        head: true,
      }),

    loadRecentContent(
      supabase,
      userId,
    ),
  ]);

  const articleReviewCount =
    articleReviewResult.count ??
    0;

  const galleryReviewCount =
    galleryReviewResult.count ??
    0;

  const stats: DashboardStat[] =
    [
      {
        label:
          "My Articles",
        value:
          articlesResult.count ??
          0,
        description: `${
          publishedArticlesResult.count ??
          0
        } published`,
        icon: "article",
      },
      {
        label:
          "My Gallery",
        value:
          galleryResult.count ??
          0,
        description: `${
          publishedGalleryResult.count ??
          0
        } published`,
        icon: "gallery",
      },
      {
        label:
          "In Review",
        value:
          articleReviewCount +
          galleryReviewCount,
        description:
          "Waiting for staff review",
        icon: "review",
      },
      {
        label: "Comments",
        value:
          commentsResult.count ??
          0,
        description:
          "On your content",
        icon: "comment",
      },
    ];

  const actions: QuickAction[] =
    [
      {
        label:
          "Create Article",
        description:
          "Write a new community story.",
        href:
          "/articles/new",
      },
      {
        label:
          "Create Gallery",
        description:
          "Share ICONIA community moments.",
        href:
          "/gallery/new",
      },
      {
        label: "Comments",
        description:
          "Read and reply to comments on your content.",
        href: "/comments",
      },
      {
        label:
          "Media Library",
        description:
          "Manage your uploaded media.",
        href: "/media",
      },
    ];

  return (
    <section className="w-full min-w-0 max-w-full">
      <DashboardHeader
        eyebrow="Representative Workspace"
        displayName={
          displayName
        }
        description="Manage your contributions, follow content reviews, and stay connected with conversations from the ICONIA community."
        role="representative"
      />

      <StatsGrid
        stats={stats}
        columns="four"
      />

      <div className="mt-6 grid w-full min-w-0 max-w-full gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <RecentContent
          items={
            recentContent
          }
          eyebrow="Your Content"
          title="Recent Activity"
          description="Your latest Article and Gallery activity."
        />

        <QuickActionsPanel
          description="Jump directly to the tools available for your Representative account."
          actions={actions}
        />
      </div>

      <div className="mt-6 w-full min-w-0 max-w-full rounded-3xl border border-violet-100 bg-gradient-to-r from-violet-600 to-purple-500 p-6 text-white shadow-lg shadow-violet-500/10 sm:p-7">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-100">
          Representative Workflow
        </p>

        <h2 className="mt-2 break-words text-xl font-bold">
          Create. Submit.
          Connect.
        </h2>

        <p className="mt-2 max-w-3xl break-words text-sm leading-6 text-violet-100">
          Create an Article or
          Gallery album, submit it
          for staff review, and once
          published, stay connected
          with ICONIA through
          comments on your content.
        </p>
      </div>
    </section>
  );
}

/* =========================================================
   ROLE ROUTER
   ========================================================= */

export default async function DashboardPage() {
  const supabase =
    await createClient();

  const {
    data: claimsData,
  } =
    await supabase.auth.getClaims();

  const userId =
    claimsData?.claims?.sub;

  if (!userId) {
    return null;
  }

  const [
    roleResult,
    profileResult,
  ] = await Promise.all([
    supabase
      .from("admin_roles")
      .select(
        `
          role,
          is_active
        `,
      )
      .eq(
        "user_id",
        userId,
      )
      .maybeSingle(),

    supabase
      .from(
        "user_profiles",
      )
      .select(
        `
          email,
          display_name
        `,
      )
      .eq(
        "id",
        userId,
      )
      .maybeSingle(),
  ]);

  const adminRole =
    roleResult.data;

  if (
    !adminRole ||
    !adminRole.is_active
  ) {
    return null;
  }

  const profile =
    profileResult.data;

  const email =
    profile?.email?.trim() ||
    "";

  const displayName =
    profile?.display_name?.trim() ||
    email.split("@")[0] ||
    "Admin ICONIA";

  const role =
    adminRole.role as AdminRole;

  switch (role) {
    case "super_admin":
      return (
        <SuperAdminDashboard
          displayName={
            displayName
          }
        />
      );

    case "admin":
      return (
        <AdminDashboard
          displayName={
            displayName
          }
        />
      );

    case "editor":
      return (
        <EditorDashboard
          displayName={
            displayName
          }
        />
      );

    case "moderator":
      return (
        <ModeratorDashboard
          displayName={
            displayName
          }
        />
      );

    case "representative":
      return (
        <RepresentativeDashboard
          userId={userId}
          displayName={
            displayName
          }
        />
      );

    default:
      return null;
  }
}