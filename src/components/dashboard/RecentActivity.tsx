const activities = [
  {
    id: 1,
    title: "New article published",
    description: "The Journey Continues with ICONIA",
    time: "2 hours ago",
    type: "article",
  },
  {
    id: 2,
    title: "Member profile updated",
    description: "Member 03 profile information",
    time: "4 hours ago",
    type: "member",
  },
  {
    id: 3,
    title: "New schedule added",
    description: "7ICONS Weekly Livestream",
    time: "6 hours ago",
    type: "schedule",
  },
  {
    id: 4,
    title: "Fan representative added",
    description: "DI Yogyakarta · Yogyakarta",
    time: "8 hours ago",
    type: "representative",
  },
  {
    id: 5,
    title: "Article updated",
    description: "ICONIA Across Indonesia",
    time: "Yesterday",
    type: "article",
  },
];

function ActivityIcon({ type }: { type: string }) {
  if (type === "member" || type === "representative") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-5 w-5"
      >
        <circle cx="12" cy="8" r="3" />
        <path d="M5 20c.7-4 3-6 7-6s6.3 2 7 6" />
      </svg>
    );
  }

  if (type === "schedule") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-5 w-5"
      >
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M7 3v4" />
        <path d="M17 3v4" />
        <path d="M3 10h18" />
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
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M8 8h8" />
      <path d="M8 12h8" />
      <path d="M8 16h5" />
    </svg>
  );
}

export default function RecentActivity() {
  return (
    <section className="rounded-2xl border border-violet-100 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-violet-100 px-6 py-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Recent Activity
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Latest changes across the platform
          </p>
        </div>

        <button
          type="button"
          className="text-xs font-semibold text-violet-600 transition hover:text-violet-800"
        >
          View All
        </button>
      </div>

      {/* Activity List */}
      <div className="divide-y divide-violet-50 px-6">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-4 py-5"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <ActivityIcon type={activity.type} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-800">
                {activity.title}
              </p>

              <p className="mt-1 truncate text-xs text-slate-500">
                {activity.description}
              </p>
            </div>

            <p className="shrink-0 text-xs text-slate-400">
              {activity.time}
            </p>
          </div>
        ))}
      </div>

      {/* Development Notice */}
      <div className="border-t border-violet-100 p-4">
        <div className="rounded-xl bg-violet-50/70 px-4 py-3">
          <p className="text-xs leading-5 text-violet-700">
            Activity data is currently using development placeholders.
            Real admin activity will be connected to the database later.
          </p>
        </div>
      </div>
    </section>
  );
}