import Link from "next/link";

const actions = [
  {
    label: "New Article",
    description: "Create a new blog article",
    href: "/articles/new",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-5 w-5"
      >
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M8 8h5" />
        <path d="M8 12h5" />
        <path d="M16 14v6" />
        <path d="M13 17h6" />
      </svg>
    ),
  },
  {
    label: "Add Member",
    description: "Create a member profile",
    href: "/members/new",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-5 w-5"
      >
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20c.7-4 2.8-6 6-6" />
        <path d="M17 11v8" />
        <path d="M13 15h8" />
      </svg>
    ),
  },
  {
    label: "Add Schedule",
    description: "Create a new event",
    href: "/schedule/new",
    icon: (
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
        <path d="M12 13v5" />
        <path d="M9.5 15.5h5" />
      </svg>
    ),
  },
  {
    label: "Add Fan Rep",
    description: "Add a regional representative",
    href: "/representatives/new",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-5 w-5"
      >
        <circle cx="8" cy="8" r="3" />
        <path d="M2.5 20c.6-4 2.5-6 5.5-6" />
        <circle cx="16" cy="9" r="2.5" />
        <path d="M13 19c.4-2.8 1.8-4.5 4-4.5" />
        <path d="M19 15v6" />
        <path d="M16 18h6" />
      </svg>
    ),
  },
  {
    label: "Upload Media",
    description: "Manage website assets",
    href: "/media",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-5 w-5"
      >
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="m4 18 5-5 3 3 2-2 6 6" />
        <path d="M18 3v6" />
        <path d="M15 6h6" />
      </svg>
    ),
  },
];

export default function QuickActions() {
  return (
    <section className="rounded-2xl border border-violet-100 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-bold text-slate-900">
          Quick Actions
        </h2>

        <p className="mt-1 text-xs text-slate-400">
          Frequently used administration shortcuts
        </p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-5">
        {actions.map((action, index) => (
  <Link
    key={action.label}
    href={action.href}
    className={`group rounded-2xl border border-violet-100 p-4 transition duration-200 hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50/40 hover:shadow-sm ${
      index === actions.length - 1
        ? "col-span-2 xl:col-span-1"
        : ""
    }`}
  >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 transition group-hover:bg-violet-100">
              {action.icon}
            </div>

            <p className="mt-4 text-sm font-bold text-slate-800">
              {action.label}
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-400">
              {action.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}