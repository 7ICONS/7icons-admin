import type { Metadata } from "next";
import Link from "next/link";

import ScheduleEventForm from "@/components/schedule/ScheduleEventForm";

export const metadata: Metadata = {
  title: "New Event",
};

export default function NewScheduleEventPage() {
  return (
    <section>
      <div className="mb-8">
        <Link
          href="/schedule"
          className="inline-flex items-center gap-2 text-sm font-semibold text-violet-600 transition hover:text-violet-800"
        >
          <span aria-hidden="true">←</span>
          Back to Schedule
        </Link>

        <p className="mt-6 text-sm font-semibold text-violet-600">
          Schedule Management
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          New Event
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Add a new 7ICONS performance, fan meeting,
          livestream, TV appearance, or other schedule event.
        </p>
      </div>

      <ScheduleEventForm />
    </section>
  );
}