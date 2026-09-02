import type { Metadata } from "next";
import RecentActivity from "@/components/dashboard/RecentActivity";
import UpcomingSchedule from "@/components/dashboard/UpcomingSchedule";
import QuickActions from "@/components/dashboard/QuickActions";

export const metadata: Metadata = {
  title: "Dashboard",
};

const stats = [
  {
    label: "Total Articles",
    value: "27",
    description: "5 new this month",
    icon: (
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
    ),
  },
  {
    label: "Total Members",
    value: "9",
    description: "6 current · 3 former",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-5 w-5"
      >
        <circle cx="9" cy="8" r="3" />
        <path d="M3.5 19c.6-3.3 2.4-5 5.5-5s4.9 1.7 5.5 5" />
        <circle cx="17" cy="9" r="2.2" />
        <path d="M15.5 14.5c2.7-.4 4.5 1 5 3.5" />
      </svg>
    ),
  },
  {
    label: "Upcoming Events",
    value: "5",
    description: "Next 30 days",
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
        <path d="M8 14h3" />
      </svg>
    ),
  },
  {
    label: "Fan Representatives",
    value: "9",
    description: "9 regions represented",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-5 w-5"
      >
        <circle cx="8" cy="8" r="3" />
        <circle cx="17" cy="9" r="2.4" />
        <path d="M2.5 19c.5-3.5 2.4-5.4 5.5-5.4 3.2 0 5 1.9 5.5 5.4" />
        <path d="M14.5 15c3-.5 5.2 1 6 4" />
      </svg>
    ),
  },
  {
    label: "Registered Users",
    value: "0",
    description: "Authentication pending",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-5 w-5"
      >
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20c.7-4 3-6 7-6s6.3 2 7 6" />
      </svg>
    ),
  },
  {
    label: "Pending Comments",
    value: "0",
    description: "Comment system pending",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-5 w-5"
      >
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v9a2.5 2.5 0 0 1-2.5 2.5H11l-4.5 4v-4A2.5 2.5 0 0 1 4 14.5z" />
      </svg>
    ),
  },
];

export default function DashboardPage() {
  return (
    <section>
      {/* Header */}
      <div>
        <p className="text-sm font-semibold text-violet-600">
          Overview
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Dashboard
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Welcome back, Admin. Here&apos;s what&apos;s happening with the
          7ICONS digital platform today.
        </p>
      </div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3 2xl:grid-cols-6">
        {stats.map((item) => (
          <article
            key={item.label}
            className="rounded-2xl border border-violet-100 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              {item.icon}
            </div>

            <p className="mt-5 text-sm font-semibold text-slate-600">
              {item.label}
            </p>

            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              {item.value}
            </p>

            <p className="mt-2 text-xs leading-5 text-slate-400">
              {item.description}
            </p>
          </article>
        ))}
      </div>

     <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
  <RecentActivity />
  <UpcomingSchedule />
</div>

<div className="mt-6">
  <QuickActions />
</div>
    </section>
  );
}