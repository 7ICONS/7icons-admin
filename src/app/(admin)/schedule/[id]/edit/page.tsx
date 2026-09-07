import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import ScheduleEventForm, {
  type ScheduleEventFormData,
} from "@/components/schedule/ScheduleEventForm";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Edit Event",
};

type EditScheduleEventPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditScheduleEventPage({
  params,
}: EditScheduleEventPageProps) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: event, error } =
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
      .eq("id", id)
      .maybeSingle();

  if (error) {
    throw new Error(
      `Unable to load event: ${error.message}`,
    );
  }

  if (!event) {
    notFound();
  }

  const eventData: ScheduleEventFormData = {
    id: event.id,
    slug: event.slug,
    title: event.title,
    event_date: event.event_date,
    event_time: event.event_time,
    location: event.location,

    event_type:
      event.event_type === "Fan Meeting" ||
      event.event_type === "Livestream" ||
      event.event_type === "TV" ||
      event.event_type === "Other"
        ? event.event_type
        : "Performance",

    description: event.description,
    is_published: event.is_published,
    is_featured: event.is_featured,
  };

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
          Edit Event
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Update this event&apos;s schedule information,
          visibility, category, and event details.
        </p>
      </div>

      <ScheduleEventForm event={eventData} />
    </section>
  );
}