type AdminPlaceholderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export default function AdminPlaceholder({
  eyebrow,
  title,
  description,
}: AdminPlaceholderProps) {
  return (
    <section>
      <div>
        <p className="text-sm font-semibold text-violet-600">
          {eyebrow}
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          {title}
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          {description}
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-violet-100 bg-white p-8 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-6 w-6"
          >
            <path d="M12 3v18" />
            <path d="M3 12h18" />
          </svg>
        </div>

        <h2 className="mt-5 text-lg font-bold text-slate-900">
          Module Coming Soon
        </h2>

        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
          The interface and functionality for this module will be
          developed in an upcoming phase of the 7ICONS Admin project.
        </p>

        <div className="mt-5 inline-flex rounded-full bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-600">
          Development Phase
        </div>
      </div>
    </section>
  );
}