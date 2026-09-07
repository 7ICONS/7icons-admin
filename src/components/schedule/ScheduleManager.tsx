"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import DeleteScheduleEventButton from "@/components/schedule/DeleteScheduleEventButton";

export type ScheduleEvent = {
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

type ScheduleManagerProps = {
  events: ScheduleEvent[];
};

const weekDays = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];

function parseLocalDate(value: string) {
  const [year, month, day] = value
    .split("-")
    .map(Number);

  return new Date(
    year,
    month - 1,
    day,
  );
}

function toDateKey(date: Date) {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatMonthYear(
  year: number,
  month: number,
) {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "long",
      year: "numeric",
    },
  ).format(
    new Date(year, month, 1),
  );
}

function formatEventDate(
  value: string,
) {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  ).format(parseLocalDate(value));
}

function getEventTypeStyle(
  type: ScheduleEvent["event_type"],
) {
  switch (type) {
    case "Performance":
      return "bg-violet-100 text-violet-700";

    case "Fan Meeting":
      return "bg-pink-100 text-pink-700";

    case "Livestream":
      return "bg-blue-100 text-blue-700";

    case "TV":
      return "bg-amber-100 text-amber-700";

    default:
      return "bg-slate-100 text-slate-600";
  }
}

export default function ScheduleManager({
  events,
}: ScheduleManagerProps) {
  const today = new Date();

  const [
    selectedYear,
    setSelectedYear,
  ] = useState(
    today.getFullYear(),
  );

  const [
    selectedMonth,
    setSelectedMonth,
  ] = useState(
    today.getMonth(),
  );

  const todayKey =
    toDateKey(today);

  const sortedEvents = useMemo(() => {
    return [...events].sort(
      (a, b) =>
        parseLocalDate(
          a.event_date,
        ).getTime() -
        parseLocalDate(
          b.event_date,
        ).getTime(),
    );
  }, [events]);

  const upcomingEvents =
    sortedEvents.filter(
      (event) =>
        event.event_date >=
        todayKey,
    );

  const pastEvents =
    sortedEvents.filter(
      (event) =>
        event.event_date <
        todayKey,
    );

  const thisMonthEvents =
    sortedEvents.filter(
      (event) => {
        const date =
          parseLocalDate(
            event.event_date,
          );

        return (
          date.getFullYear() ===
            today.getFullYear() &&
          date.getMonth() ===
            today.getMonth()
        );
      },
    );

  const selectedMonthEvents =
    useMemo(() => {
      return sortedEvents.filter(
        (event) => {
          const date =
            parseLocalDate(
              event.event_date,
            );

          return (
            date.getFullYear() ===
              selectedYear &&
            date.getMonth() ===
              selectedMonth
          );
        },
      );
    }, [
      sortedEvents,
      selectedYear,
      selectedMonth,
    ]);

  const eventsByDate =
    useMemo(() => {
      const result: Record<
        string,
        ScheduleEvent[]
      > = {};

      events.forEach((event) => {
        if (
          !result[event.event_date]
        ) {
          result[event.event_date] =
            [];
        }

        result[event.event_date].push(
          event,
        );
      });

      return result;
    }, [events]);

  const calendarDays =
    useMemo(() => {
      const firstDay =
        new Date(
          selectedYear,
          selectedMonth,
          1,
        ).getDay();

      const daysInMonth =
        new Date(
          selectedYear,
          selectedMonth + 1,
          0,
        ).getDate();

      const cells: Array<
        number | null
      > = [];

      for (
        let index = 0;
        index < firstDay;
        index += 1
      ) {
        cells.push(null);
      }

      for (
        let day = 1;
        day <= daysInMonth;
        day += 1
      ) {
        cells.push(day);
      }

      while (
        cells.length % 7 !== 0
      ) {
        cells.push(null);
      }

      return cells;
    }, [
      selectedYear,
      selectedMonth,
    ]);

  function goToPreviousMonth() {
    if (selectedMonth === 0) {
      setSelectedMonth(11);

      setSelectedYear(
        (year) => year - 1,
      );

      return;
    }

    setSelectedMonth(
      (month) => month - 1,
    );
  }

  function goToNextMonth() {
    if (selectedMonth === 11) {
      setSelectedMonth(0);

      setSelectedYear(
        (year) => year + 1,
      );

      return;
    }

    setSelectedMonth(
      (month) => month + 1,
    );
  }

  function goToToday() {
    const now = new Date();

    setSelectedYear(
      now.getFullYear(),
    );

    setSelectedMonth(
      now.getMonth(),
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">
            Total Events
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            {events.length}
          </p>
        </div>

        <div className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">
            Upcoming
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            {upcomingEvents.length}
          </p>
        </div>

        <div className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">
            This Month
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            {thisMonthEvents.length}
          </p>
        </div>

        <div className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">
            Past Events
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            {pastEvents.length}
          </p>
        </div>
      </div>

      {/* Calendar + Monthly Schedule */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,0.95fr)]">
        {/* Calendar */}
        <section className="overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-violet-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">
                Calendar View
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-950">
                {formatMonthYear(
                  selectedYear,
                  selectedMonth,
                )}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={
                  goToPreviousMonth
                }
                aria-label="Previous month"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-100 text-violet-700 transition hover:bg-violet-50"
              >
                ←
              </button>

              <button
                type="button"
                onClick={goToToday}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-violet-100 px-4 text-sm font-semibold text-violet-700 transition hover:bg-violet-50"
              >
                Today
              </button>

              <button
                type="button"
                onClick={
                  goToNextMonth
                }
                aria-label="Next month"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-100 text-violet-700 transition hover:bg-violet-50"
              >
                →
              </button>
            </div>
          </div>

          {/* Week Header */}
          <div className="grid grid-cols-7 border-b border-violet-100 bg-violet-50/40">
            {weekDays.map(
              (day) => (
                <div
                  key={day}
                  className="px-2 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400 sm:text-xs"
                >
                  {day}
                </div>
              ),
            )}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7">
            {calendarDays.map(
              (day, index) => {
                if (!day) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="min-h-[92px] border-b border-r border-violet-50 bg-slate-50/30 sm:min-h-[116px]"
                    />
                  );
                }

                const date =
                  new Date(
                    selectedYear,
                    selectedMonth,
                    day,
                  );

                const dateKey =
                  toDateKey(date);

                const dayEvents =
                  eventsByDate[
                    dateKey
                  ] ?? [];

                const isToday =
                  dateKey ===
                  todayKey;

                return (
                  <div
                    key={dateKey}
                    className="min-h-[92px] border-b border-r border-violet-50 p-2 transition hover:bg-violet-50/30 sm:min-h-[116px] sm:p-3"
                  >
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold sm:h-8 sm:w-8 sm:text-sm ${
                        isToday
                          ? "bg-violet-600 text-white shadow-md shadow-violet-500/20"
                          : "text-slate-600"
                      }`}
                    >
                      {day}
                    </div>

                    {dayEvents.length >
                      0 && (
                      <div className="mt-2 space-y-1">
                        {dayEvents
                          .slice(0, 2)
                          .map(
                            (event) => (
                              <Link
                                key={
                                  event.id
                                }
                                href={`/schedule/${event.id}/edit`}
                                title={
                                  event.title
                                }
                                className="block truncate rounded-md bg-violet-50 px-1.5 py-1 text-[9px] font-semibold text-violet-700 transition hover:bg-violet-100 sm:px-2 sm:text-[10px]"
                              >
                                {
                                  event.title
                                }
                              </Link>
                            ),
                          )}

                        {dayEvents.length >
                          2 && (
                          <p className="px-1 text-[9px] font-semibold text-slate-400 sm:text-[10px]">
                            +
                            {dayEvents.length -
                              2}{" "}
                            more
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              },
            )}
          </div>
        </section>

        {/* Monthly Event Schedule */}
        <aside className="flex min-h-[500px] flex-col overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-sm">
          <div className="border-b border-violet-100 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">
                  Event Schedule
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-950">
                  {formatMonthYear(
                    selectedYear,
                    selectedMonth,
                  )}
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  {
                    selectedMonthEvents.length
                  }{" "}
                  {selectedMonthEvents.length ===
                  1
                    ? "event"
                    : "events"}{" "}
                  this month
                </p>
              </div>

              <Link
                href="/schedule/new"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-lg font-semibold text-violet-700 transition hover:bg-violet-100"
                aria-label="Create new event"
              >
                +
              </Link>
            </div>
          </div>

          {selectedMonthEvents.length >
          0 ? (
            <div className="flex-1 divide-y divide-violet-50 overflow-y-auto">
              {selectedMonthEvents.map(
                (event) => {
                  const isPast =
                    event.event_date <
                    todayKey;

                  const eventDate =
                    parseLocalDate(
                      event.event_date,
                    );

                  return (
                    <Link
                      key={event.id}
                      href={`/schedule/${event.id}/edit`}
                      className="group block p-5 transition hover:bg-violet-50/40"
                    >
                      <div className="flex gap-4">
                        <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-violet-50 text-center">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-violet-500">
                            {new Intl.DateTimeFormat(
                              "en-US",
                              {
                                month:
                                  "short",
                              },
                            ).format(
                              eventDate,
                            )}
                          </span>

                          <span className="text-xl font-bold leading-none text-violet-700">
                            {String(
                              eventDate.getDate(),
                            ).padStart(
                              2,
                              "0",
                            )}
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${getEventTypeStyle(
                                event.event_type,
                              )}`}
                            >
                              {
                                event.event_type
                              }
                            </span>

                            {event.is_featured && (
                              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                                Featured
                              </span>
                            )}

                            {isPast && (
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                                Past
                              </span>
                            )}
                          </div>

                          <h3 className="mt-2 line-clamp-2 text-sm font-bold leading-5 text-slate-800 transition group-hover:text-violet-700">
                            {
                              event.title
                            }
                          </h3>

                          <p className="mt-2 text-xs font-medium text-slate-500">
                            {event.event_time ||
                              "Time TBD"}
                          </p>

                          <p className="mt-1 truncate text-xs text-slate-400">
                            {event.location ||
                              "Location TBD"}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                },
              )}
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-500">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  className="h-6 w-6"
                >
                  <rect
                    x="3"
                    y="5"
                    width="18"
                    height="16"
                    rx="2"
                  />

                  <path d="M8 3v4" />
                  <path d="M16 3v4" />
                  <path d="M3 10h18" />
                </svg>
              </div>

              <h3 className="mt-4 text-sm font-bold text-slate-800">
                No events this month
              </h3>

              <p className="mt-2 text-xs leading-5 text-slate-400">
                There are no schedule
                entries for{" "}
                {formatMonthYear(
                  selectedYear,
                  selectedMonth,
                )}
                .
              </p>

              <Link
                href="/schedule/new"
                className="mt-5 text-xs font-semibold text-violet-600 transition hover:text-violet-800"
              >
                + Create Event
              </Link>
            </div>
          )}

          <div className="border-t border-violet-100 bg-violet-50/20 p-4">
            <p className="text-center text-xs text-slate-400">
              Change the calendar month to
              view its schedule.
            </p>
          </div>
        </aside>
      </div>

      {/* All Events */}
      <section className="overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-violet-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">
              All Events
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-950">
              Event List
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Complete schedule for
              management and editing.
            </p>
          </div>

          <Link
            href="/schedule/new"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-violet-50 px-4 text-sm font-semibold text-violet-700 transition hover:bg-violet-100"
          >
            + New Event
          </Link>
        </div>

        {sortedEvents.length ===
        0 ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center px-6 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-7 w-7"
              >
                <rect
                  x="3"
                  y="5"
                  width="18"
                  height="16"
                  rx="2"
                />

                <path d="M8 3v4" />
                <path d="M16 3v4" />
                <path d="M3 10h18" />
              </svg>
            </div>

            <h3 className="mt-5 text-lg font-bold text-slate-900">
              No schedule events yet
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              Create the first event to
              begin managing the 7ICONS
              schedule.
            </p>

            <Link
              href="/schedule/new"
              className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-violet-50 px-4 text-sm font-semibold text-violet-700 transition hover:bg-violet-100"
            >
              Create First Event
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1150px]">
              <thead className="border-b border-violet-100 bg-violet-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Event
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Date
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Time
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Type
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Published
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-violet-50">
                {sortedEvents.map(
                  (event) => {
                    const isPast =
                      event.event_date <
                      todayKey;

                    return (
                      <tr
                        key={event.id}
                        className="transition hover:bg-violet-50/30"
                      >
                        <td className="px-6 py-5">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-semibold text-slate-800">
                                {
                                  event.title
                                }
                              </p>

                              {event.is_featured && (
                                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                                  Featured
                                </span>
                              )}

                              {isPast && (
                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                                  Past
                                </span>
                              )}
                            </div>

                            <p className="mt-1 max-w-[350px] truncate text-xs text-slate-400">
                              {
                                event.location
                              }
                            </p>
                          </div>
                        </td>

                        <td className="px-6 py-5 text-sm font-medium text-slate-600">
                          {formatEventDate(
                            event.event_date,
                          )}
                        </td>

                        <td className="px-6 py-5 text-sm text-slate-500">
                          {event.event_time ||
                            "TBD"}
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getEventTypeStyle(
                              event.event_type,
                            )}`}
                          >
                            {
                              event.event_type
                            }
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          {event.is_published ? (
                            <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                              Yes
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                              No
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/schedule/${event.id}/edit`}
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

                            <DeleteScheduleEventButton
                              eventId={
                                event.id
                              }
                              eventTitle={
                                event.title
                              }
                            />
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