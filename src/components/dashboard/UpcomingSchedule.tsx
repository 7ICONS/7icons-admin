const events = [
  {
    id: 1,
    day: "05",
    month: "SEP",
    title: "7ICONS Weekly Livestream",
    category: "Livestream",
    location: "7ICONS Official YouTube",
    time: "20:00 WIB",
  },
  {
    id: 2,
    day: "12",
    month: "SEP",
    title: "TV Program Appearance",
    category: "TV",
    location: "Entertainment TV",
    time: "19:00 WIB",
  },
  {
    id: 3,
    day: "20",
    month: "SEP",
    title: "ICONIA Community Night",
    category: "Other",
    location: "Online",
    time: "19:30 WIB",
  },
  {
    id: 4,
    day: "27",
    month: "SEP",
    title: "7ICONS Special Performance",
    category: "Performance",
    location: "Jakarta",
    time: "19:00 WIB",
  },
];

export default function UpcomingSchedule() {
  return (
    <section className="rounded-2xl border border-violet-100 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-violet-100 px-6 py-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Upcoming Schedule
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Upcoming 7ICONS activities and events
          </p>
        </div>

        <button
          type="button"
          className="rounded-lg border border-violet-100 px-3 py-2 text-xs font-semibold text-violet-600 transition hover:bg-violet-50 hover:text-violet-800"
        >
          View Schedule
        </button>
      </div>

      {/* Events */}
      <div className="space-y-3 p-6">
        {events.map((event) => (
          <article
            key={event.id}
            className="flex items-center gap-4 rounded-2xl border border-violet-100 bg-white p-4 transition hover:border-violet-200 hover:bg-violet-50/30"
          >
            {/* Date */}
            <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-violet-50">
              <span className="text-[10px] font-bold tracking-[0.15em] text-violet-500">
                {event.month}
              </span>

              <span className="mt-0.5 text-xl font-bold text-violet-800">
                {event.day}
              </span>
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-bold text-slate-800">
                  {event.title}
                </h3>

                <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-semibold text-violet-600">
                  {event.category}
                </span>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-3.5 w-3.5"
                  >
                    <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11Z" />
                    <circle cx="12" cy="10" r="2.5" />
                  </svg>

                  {event.location}
                </span>

                <span className="flex items-center gap-1.5">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-3.5 w-3.5"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                  </svg>

                  {event.time}
                </span>
              </div>
            </div>

            {/* Arrow */}
            <button
              type="button"
              aria-label={`View ${event.title}`}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-violet-100 hover:text-violet-700"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-4 w-4"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </article>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-violet-100 p-4">
        <div className="rounded-xl bg-violet-50/70 px-4 py-3">
          <p className="text-xs leading-5 text-violet-700">
            Schedule data is currently using development placeholders.
            Events will later be managed directly from the Admin Panel.
          </p>
        </div>
      </div>
    </section>
  );
}