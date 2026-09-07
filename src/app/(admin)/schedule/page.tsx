import type { Metadata } from "next";
import Link from "next/link";

import ScheduleManager, {
  type ScheduleEvent,
} from "@/components/schedule/ScheduleManager";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Schedule",
};

export default async function SchedulePage() {
  const supabase = await createClient();

  const { data: events, error } =
    await supabase
      .from("schedule_events")
      .select(
        `
          id,
          slug,
          title,
          event_date,
          event_time,
          location,
          event_type,
          description,
          is_published,
          is_featured
        `,
      )
      .order("event_date", {
        ascending: true,
      });

  if (error) {
    return (
      <section>
        <p className="text-sm font-semibold text-violet-600">
          Schedule Management
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Schedule
        </h1>

        <div className="mt-8 rounded-2xl border border-red-100 bg-red-50 p-6">
          <p className="font-semibold text-red-700">
            Unable to load schedule
          </p>

          <p className="mt-2 text-sm text-red-600">
            {error.message}
          </p>
        </div>
      </section>
    );
  }

  const safeEvents =
    (events ?? []) as ScheduleEvent[];

  return (
    <section>
      {/* Header */}
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-violet-600">
            Schedule Management
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Schedule
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Manage upcoming and past 7ICONS
            events through a real calendar
            connected to Supabase.
          </p>
        </div>

        <Link
          href="/schedule/new"
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

          New Event
        </Link>
      </div>

      <ScheduleManager
        events={safeEvents}
      />
    </section>
  );
}