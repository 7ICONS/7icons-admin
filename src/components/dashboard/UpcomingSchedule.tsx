"use client";

import Link from "next/link";
import {
  useMemo,
  useState,
} from "react";

type ScheduleEvent = {
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

/*
 * Dashboard development preview.
 *
 * Struktur data ini sengaja mengikuti
 * ScheduleEvent yang digunakan oleh
 * ScheduleManager.
 *
 * Nanti saat Dashboard dihubungkan
 * langsung ke data Schedule Supabase,
 * struktur component ini tidak perlu
 * dirombak lagi.
 */
const dashboardScheduleEvents: ScheduleEvent[] =
  [
    {
      id: "dashboard-livestream",
      slug: "7icons-weekly-livestream",
      title:
        "7ICONS Weekly Livestream",
      event_date:
        "2026-09-05",
      event_time:
        "20:00 WIB",
      location:
        "7ICONS Official YouTube",
      event_type:
        "Livestream",
      description:
        "Weekly livestream with 7ICONS.",
      is_published:
        true,
      is_featured:
        false,
    },
    {
      id: "dashboard-tv-program",
      slug: "tv-program-appearance",
      title:
        "TV Program Appearance",
      event_date:
        "2026-09-12",
      event_time:
        "19:00 WIB",
      location:
        "Entertainment TV",
      event_type:
        "TV",
      description:
        "7ICONS television program appearance.",
      is_published:
        true,
      is_featured:
        false,
    },
    {
      id: "dashboard-iconia-night",
      slug: "iconia-community-night",
      title:
        "ICONIA Community Night",
      event_date:
        "2026-09-20",
      event_time:
        "19:30 WIB",
      location:
        "Online",
      event_type:
        "Other",
      description:
        "Online gathering for the ICONIA community.",
      is_published:
        true,
      is_featured:
        false,
    },
    {
      id: "dashboard-performance",
      slug: "7icons-special-performance",
      title:
        "7ICONS Special Performance",
      event_date:
        "2026-09-27",
      event_time:
        "19:00 WIB",
      location:
        "Jakarta",
      event_type:
        "Performance",
      description:
        "Special 7ICONS performance in Jakarta.",
      is_published:
        true,
      is_featured:
        true,
    },
  ];

const weekDays = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];

function parseLocalDate(
  value: string,
) {
  const [
    year,
    month,
    day,
  ] = value
    .split("-")
    .map(Number);

  return new Date(
    year,
    month - 1,
    day,
  );
}

function toDateKey(
  date: Date,
) {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1,
    ).padStart(
      2,
      "0",
    );

  const day =
    String(
      date.getDate(),
    ).padStart(
      2,
      "0",
    );

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
    new Date(
      year,
      month,
      1,
    ),
  );
}

function formatEventDate(
  value: string,
) {
  const date =
    parseLocalDate(
      value,
    );

  return {
    day: String(
      date.getDate(),
    ).padStart(
      2,
      "0",
    ),

    month:
      new Intl.DateTimeFormat(
        "en-US",
        {
          month:
            "short",
        },
      )
        .format(date)
        .toUpperCase(),
  };
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

export default function UpcomingSchedule() {
  const today =
    new Date();

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
    toDateKey(
      today,
    );

  const events =
    useMemo(
      () =>
        dashboardScheduleEvents
          .filter(
            (event) =>
              event.is_published,
          )
          .sort(
            (a, b) =>
              parseLocalDate(
                a.event_date,
              ).getTime() -
              parseLocalDate(
                b.event_date,
              ).getTime(),
          ),
      [],
    );

  const upcomingEvents =
    useMemo(
      () =>
        events
          .filter(
            (event) =>
              event.event_date >=
              todayKey,
          )
          .slice(
            0,
            4,
          ),
      [
        events,
        todayKey,
      ],
    );

  const eventsByDate =
    useMemo(() => {
      const result: Record<
        string,
        ScheduleEvent[]
      > = {};

      events.forEach(
        (event) => {
          if (
            !result[
              event.event_date
            ]
          ) {
            result[
              event.event_date
            ] = [];
          }

          result[
            event.event_date
          ].push(
            event,
          );
        },
      );

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
          selectedMonth +
            1,
          0,
        ).getDate();

      const cells: Array<
        number | null
      > = [];

      for (
        let index = 0;
        index <
        firstDay;
        index += 1
      ) {
        cells.push(
          null,
        );
      }

      for (
        let day = 1;
        day <=
        daysInMonth;
        day += 1
      ) {
        cells.push(
          day,
        );
      }

      while (
        cells.length %
          7 !==
        0
      ) {
        cells.push(
          null,
        );
      }

      return cells;
    }, [
      selectedYear,
      selectedMonth,
    ]);

  function goToPreviousMonth() {
    if (
      selectedMonth ===
      0
    ) {
      setSelectedMonth(
        11,
      );

      setSelectedYear(
        (year) =>
          year - 1,
      );

      return;
    }

    setSelectedMonth(
      (month) =>
        month - 1,
    );
  }

  function goToNextMonth() {
    if (
      selectedMonth ===
      11
    ) {
      setSelectedMonth(
        0,
      );

      setSelectedYear(
        (year) =>
          year + 1,
      );

      return;
    }

    setSelectedMonth(
      (month) =>
        month + 1,
    );
  }

  function goToToday() {
    const now =
      new Date();

    setSelectedYear(
      now.getFullYear(),
    );

    setSelectedMonth(
      now.getMonth(),
    );
  }

  return (
    <section className="w-full min-w-0 overflow-hidden rounded-3xl border border-violet-100 bg-white shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-violet-100 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-600">
            Calendar
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-950">
            Upcoming Schedule
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Upcoming 7ICONS
            activities and
            events.
          </p>
        </div>

        <Link
          href="/schedule"
          className="inline-flex h-10 w-fit shrink-0 items-center justify-center rounded-xl border border-violet-100 px-4 text-xs font-semibold text-violet-700 transition hover:bg-violet-50"
        >
          View Schedule
        </Link>
      </div>

      <div className="grid min-w-0 gap-6 p-4 sm:p-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]">
        {/* Calendar */}
        <div className="min-w-0 overflow-hidden rounded-2xl border border-violet-100 bg-white">
          {/* Calendar Header */}
          <div className="flex flex-col gap-3 border-b border-violet-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-violet-600">
                Calendar View
              </p>

              <h3 className="mt-1 break-words text-lg font-bold text-slate-950 sm:text-xl">
                {formatMonthYear(
                  selectedYear,
                  selectedMonth,
                )}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={
                  goToPreviousMonth
                }
                aria-label="Previous month"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-violet-100 text-violet-700 transition hover:bg-violet-50"
              >
                ←
              </button>

              <button
                type="button"
                onClick={
                  goToToday
                }
                className="inline-flex h-9 shrink-0 items-center justify-center rounded-xl border border-violet-100 px-3 text-xs font-semibold text-violet-700 transition hover:bg-violet-50"
              >
                Today
              </button>

              <button
                type="button"
                onClick={
                  goToNextMonth
                }
                aria-label="Next month"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-violet-100 text-violet-700 transition hover:bg-violet-50"
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
                  key={
                    day
                  }
                  className="min-w-0 px-0.5 py-2.5 text-center text-[9px] font-bold uppercase tracking-wide text-slate-400 sm:px-2 sm:py-3 sm:text-xs"
                >
                  {day}
                </div>
              ),
            )}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7">
            {calendarDays.map(
              (
                day,
                index,
              ) => {
                if (
                  day ===
                  null
                ) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="min-h-[58px] min-w-0 border-b border-r border-violet-50 bg-slate-50/30 sm:min-h-[92px]"
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
                  toDateKey(
                    date,
                  );

                const dayEvents =
                  eventsByDate[
                    dateKey
                  ] ?? [];

                const isToday =
                  dateKey ===
                  todayKey;

                return (
                  <div
                    key={
                      dateKey
                    }
                    className="min-h-[58px] min-w-0 overflow-hidden border-b border-r border-violet-50 p-1 transition hover:bg-violet-50/30 sm:min-h-[92px] sm:p-2"
                  >
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold sm:h-8 sm:w-8 sm:text-sm ${
                        isToday
                          ? "bg-violet-600 text-white shadow-md shadow-violet-500/20"
                          : "text-slate-600"
                      }`}
                    >
                      {
                        day
                      }
                    </div>

                    {dayEvents.length >
                      0 && (
                      <>
                        {/* Mobile indicator */}
                        <div className="mt-1 flex flex-wrap gap-1 sm:hidden">
                          {dayEvents
                            .slice(
                              0,
                              3,
                            )
                            .map(
                              (
                                event,
                              ) => (
                                <span
                                  key={
                                    event.id
                                  }
                                  className="h-1.5 w-1.5 rounded-full bg-violet-500"
                                />
                              ),
                            )}
                        </div>

                        {/* Desktop/tablet event titles */}
                        <div className="mt-1 hidden min-w-0 space-y-1 sm:block">
                          {dayEvents
                            .slice(
                              0,
                              2,
                            )
                            .map(
                              (
                                event,
                              ) => (
                                <div
                                  key={
                                    event.id
                                  }
                                  title={
                                    event.title
                                  }
                                  className="block max-w-full truncate rounded-md bg-violet-50 px-1.5 py-1 text-[9px] font-semibold text-violet-700"
                                >
                                  {
                                    event.title
                                  }
                                </div>
                              ),
                            )}

                          {dayEvents.length >
                            2 && (
                            <p className="px-1 text-[9px] font-semibold text-slate-400">
                              +
                              {dayEvents.length -
                                2}{" "}
                              more
                            </p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              },
            )}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-4 border-t border-violet-100 px-4 py-4 text-[10px] text-slate-500 sm:text-xs">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-violet-600" />

              Today
            </div>

            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-violet-200" />

              Event
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="min-w-0">
          <div className="mb-4 min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-600">
              Coming Up
            </p>

            <h3 className="mt-1 text-xl font-bold text-slate-950">
              Upcoming Events
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Next scheduled
              7ICONS activities.
            </p>
          </div>

          {upcomingEvents.length >
          0 ? (
            <div className="space-y-3">
              {upcomingEvents.map(
                (
                  event,
                ) => {
                  const eventDate =
                    formatEventDate(
                      event.event_date,
                    );

                  return (
                    <article
                      key={
                        event.id
                      }
                      className="min-w-0 rounded-2xl border border-violet-100 bg-white p-3 shadow-sm sm:p-4"
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-violet-50">
                          <span className="text-lg font-bold leading-none text-violet-700">
                            {
                              eventDate.day
                            }
                          </span>

                          <span className="mt-1 text-[9px] font-bold tracking-[0.12em] text-violet-500">
                            {
                              eventDate.month
                            }
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex min-w-0 flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-semibold ${getEventTypeStyle(
                                event.event_type,
                              )}`}
                            >
                              {
                                event.event_type
                              }
                            </span>

                            {event.is_featured && (
                              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-semibold text-amber-700">
                                Featured
                              </span>
                            )}
                          </div>

                          <h4 className="mt-2 break-words text-sm font-bold leading-5 text-slate-900">
                            {
                              event.title
                            }
                          </h4>

                          <div className="mt-2 space-y-1 text-xs leading-5 text-slate-500">
                            <p className="break-words">
                              ◷{" "}
                              {event.event_time ||
                                "Time TBD"}
                            </p>

                            <p className="break-words">
                              ⌖{" "}
                              {event.location ||
                                "Location TBD"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                },
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-violet-200 bg-violet-50/30 px-5 py-10 text-center">
              <p className="text-sm font-semibold text-slate-700">
                No upcoming
                events
              </p>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                New schedule
                items will appear
                here.
              </p>
            </div>
          )}

          <Link
            href="/schedule"
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-violet-700 transition hover:text-violet-900"
          >
            View Full Schedule
            <span aria-hidden>
              →
            </span>
          </Link>
        </div>
      </div>

      <div className="border-t border-violet-100 bg-violet-50/40 px-4 py-3 sm:px-6">
        <p className="break-words text-xs leading-5 text-violet-600">
          Dashboard schedule
          preview is currently
          using development
          placeholder data.
          Schedule management is
          available from the
          Schedule page.
        </p>
      </div>
    </section>
  );
}