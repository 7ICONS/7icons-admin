"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export type ScheduleEventFormData = {
  id: string;
  slug: string;
  title: string;
  event_date: string;
  event_time: string;
  location: string;
  event_type:
    | "Performance"
    | "Fan Meeting"
    | "Livestream"
    | "TV"
    | "Other";
  description: string;
  is_published: boolean;
  is_featured: boolean;
};

type ScheduleEventFormProps = {
  event?: ScheduleEventFormData;
};

const eventTypes: ScheduleEventFormData["event_type"][] = [
  "Performance",
  "Fan Meeting",
  "Livestream",
  "TV",
  "Other",
];

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function ScheduleEventForm({
  event,
}: ScheduleEventFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const isEditing = Boolean(event);

  const [title, setTitle] = useState(
    event?.title ?? "",
  );

  const [slug, setSlug] = useState(
    event?.slug ?? "",
  );

  const [slugTouched, setSlugTouched] =
    useState(Boolean(event));

  const [eventDate, setEventDate] =
    useState(event?.event_date ?? "");

  const [eventTime, setEventTime] =
    useState(event?.event_time ?? "");

  const [location, setLocation] =
    useState(event?.location ?? "");

  const [eventType, setEventType] =
    useState<
      ScheduleEventFormData["event_type"]
    >(event?.event_type ?? "Performance");

  const [description, setDescription] =
    useState(event?.description ?? "");

  const [isPublished, setIsPublished] =
    useState(event?.is_published ?? true);

  const [isFeatured, setIsFeatured] =
    useState(event?.is_featured ?? false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    if (!isEditing && !slugTouched) {
      setSlug(createSlug(title));
    }
  }, [
    title,
    isEditing,
    slugTouched,
  ]);

  function handleSlugChange(value: string) {
    setSlugTouched(true);
    setSlug(createSlug(value));
  }

  async function handleSubmit(
    eventObject: FormEvent<HTMLFormElement>,
  ) {
    eventObject.preventDefault();

    if (isSubmitting) {
      return;
    }

    setErrorMessage("");

    const cleanTitle = title.trim();
    const cleanSlug = slug.trim();

    if (!cleanTitle) {
      setErrorMessage(
        "Event title is required.",
      );
      return;
    }

    if (!cleanSlug) {
      setErrorMessage(
        "Event slug is required.",
      );
      return;
    }

    if (!eventDate) {
      setErrorMessage(
        "Event date is required.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const {
        data: userData,
        error: userError,
      } = await supabase.auth.getUser();

      if (
        userError ||
        !userData.user
      ) {
        throw new Error(
          "Your admin session could not be verified. Please sign in again.",
        );
      }

      const payload = {
        slug: cleanSlug,
        title: cleanTitle,
        event_date: eventDate,
        event_time: eventTime.trim(),
        location: location.trim(),
        event_type: eventType,
        description: description.trim(),

        is_published: isPublished,
        is_featured: isFeatured,

        updated_by: userData.user.id,
        updated_at:
          new Date().toISOString(),
      };

      if (event) {
        const { error: updateError } =
          await supabase
            .from("schedule_events")
            .update(payload)
            .eq("id", event.id);

        if (updateError) {
          if (
            updateError.code === "23505"
          ) {
            throw new Error(
              "That slug is already used by another event.",
            );
          }

          throw updateError;
        }
      } else {
        const { error: insertError } =
          await supabase
            .from("schedule_events")
            .insert({
              ...payload,
              created_by:
                userData.user.id,
            });

        if (insertError) {
          if (
            insertError.code === "23505"
          ) {
            throw new Error(
              "That slug is already used by another event.",
            );
          }

          throw insertError;
        }
      }

      router.push("/schedule");
      router.refresh();
    } catch (error) {
      console.error(
        "Schedule event save failed:",
        error,
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to save this event.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* Error */}
      {errorMessage && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          {errorMessage}
        </div>
      )}

      {/* Main Information */}
      <section className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm sm:p-6">
        <div>
          <p className="text-sm font-semibold text-violet-600">
            Event Information
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-950">
            Schedule Details
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Enter the main information for
            this 7ICONS schedule event.
          </p>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {/* Title */}
          <div>
            <label
              htmlFor="event-title"
              className="text-sm font-semibold text-slate-700"
            >
              Event Title
            </label>

            <input
              id="event-title"
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="7ICONS Fan Meeting"
              required
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            />
          </div>

          {/* Slug */}
          <div>
            <label
              htmlFor="event-slug"
              className="text-sm font-semibold text-slate-700"
            >
              Slug
            </label>

            <input
              id="event-slug"
              type="text"
              value={slug}
              onChange={(event) =>
                handleSlugChange(
                  event.target.value,
                )
              }
              placeholder="7icons-fan-meeting"
              required
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            />

            <p className="mt-2 text-xs text-slate-400">
              Public URL: /schedule/
              {slug || "event-slug"}
            </p>
          </div>

          {/* Date */}
          <div>
            <label
              htmlFor="event-date"
              className="text-sm font-semibold text-slate-700"
            >
              Event Date
            </label>

            <input
              id="event-date"
              type="date"
              value={eventDate}
              onChange={(event) =>
                setEventDate(
                  event.target.value,
                )
              }
              required
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            />
          </div>

          {/* Time */}
          <div>
            <label
              htmlFor="event-time"
              className="text-sm font-semibold text-slate-700"
            >
              Event Time
            </label>

            <input
              id="event-time"
              type="text"
              value={eventTime}
              onChange={(event) =>
                setEventTime(
                  event.target.value,
                )
              }
              placeholder="19:00 WIB"
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            />

            <p className="mt-2 text-xs text-slate-400">
              Leave empty if the time is
              still TBD.
            </p>
          </div>

          {/* Location */}
          <div>
            <label
              htmlFor="event-location"
              className="text-sm font-semibold text-slate-700"
            >
              Location
            </label>

            <input
              id="event-location"
              type="text"
              value={location}
              onChange={(event) =>
                setLocation(
                  event.target.value,
                )
              }
              placeholder="Jakarta Convention Center"
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            />
          </div>

          {/* Event Type */}
          <div>
            <label
              htmlFor="event-type"
              className="text-sm font-semibold text-slate-700"
            >
              Event Type
            </label>

            <select
              id="event-type"
              value={eventType}
              onChange={(event) =>
                setEventType(
                  event.target
                    .value as ScheduleEventFormData["event_type"],
                )
              }
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            >
              {eventTypes.map((type) => (
                <option
                  key={type}
                  value={type}
                >
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div className="mt-5">
          <label
            htmlFor="event-description"
            className="text-sm font-semibold text-slate-700"
          >
            Description
          </label>

          <textarea
            id="event-description"
            value={description}
            onChange={(event) =>
              setDescription(
                event.target.value,
              )
            }
            rows={6}
            placeholder="Describe the event, activity, or schedule details..."
            className="mt-2 w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
          />
        </div>
      </section>

      {/* Publishing */}
      <section className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-sm font-semibold text-violet-600">
          Publishing
        </p>

        <h2 className="mt-1 text-xl font-bold text-slate-950">
          Event Visibility
        </h2>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          Control whether this event is
          visible publicly and whether it
          should receive extra prominence.
        </p>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {/* Published */}
          <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4 transition hover:border-violet-200">
            <div>
              <p className="text-sm font-semibold text-slate-700">
                Published
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-400">
                Allow this event to appear
                on the public 7ICONS
                website.
              </p>
            </div>

            <input
              type="checkbox"
              checked={isPublished}
              onChange={(event) =>
                setIsPublished(
                  event.target.checked,
                )
              }
              className="h-4 w-4 shrink-0 accent-violet-600"
            />
          </label>

          {/* Featured */}
          <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4 transition hover:border-violet-200">
            <div>
              <p className="text-sm font-semibold text-slate-700">
                Featured Event
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-400">
                Mark this event as a
                highlighted schedule entry.
              </p>
            </div>

            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(event) =>
                setIsFeatured(
                  event.target.checked,
                )
              }
              className="h-4 w-4 shrink-0 accent-violet-600"
            />
          </label>
        </div>
      </section>

      {/* Preview Summary */}
      <section className="rounded-2xl border border-violet-100 bg-violet-50/30 p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">
          Event Preview
        </p>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {title.trim() ||
                "Untitled Event"}
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              {eventDate ||
                "Date not selected"}
              {eventTime.trim()
                ? ` · ${eventTime.trim()}`
                : " · Time TBD"}
            </p>

            <p className="mt-1 text-sm text-slate-400">
              {location.trim() ||
                "Location TBD"}
            </p>
          </div>

          <span className="inline-flex w-fit rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-violet-700 shadow-sm">
            {eventType}
          </span>
        </div>
      </section>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 pb-6 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() =>
            router.push("/schedule")
          }
          disabled={isSubmitting}
          className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-violet-700 to-purple-500 px-6 text-sm font-semibold text-white shadow-lg shadow-violet-500/15 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {isSubmitting
            ? "Saving..."
            : isEditing
              ? "Update Event"
              : "Create Event"}
        </button>
      </div>
    </form>
  );
}