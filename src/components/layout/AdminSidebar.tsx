"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-5 w-5"
      >
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5.5 9.5V21h13V9.5" />
        <path d="M9.5 21v-6h5v6" />
      </svg>
    ),
  },
  {
    label: "Articles",
    href: "/articles",
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
    label: "Members",
    href: "/members",
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
    label: "Schedule",
    href: "/schedule",
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
      </svg>
    ),
  },
  {
    label: "Fan Representatives",
    href: "/representatives",
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
    label: "Users",
    href: "/users",
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
    label: "Comments",
    href: "/comments",
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
  {
    label: "Media",
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
      </svg>
    ),
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <aside className="hidden h-screen w-[280px] shrink-0 flex-col border-r border-violet-100 bg-white lg:flex">
      {/* Brand */}
      <div className="flex h-24 items-center border-b border-violet-50 px-7">
        <Link href="/dashboard" className="block">
          <Image
            src="/brand/7icons-admin-logo.png"
            alt="7ICONS Admin"
            width={220}
            height={90}
            priority
            className="h-auto w-44 object-contain"
          />
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-6">
        <p className="mb-3 px-4 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
          Management
        </p>

        <nav className="space-y-1.5">
          {navigation.map((item) => {
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  active
                    ? "bg-gradient-to-r from-violet-700 to-purple-500 text-white shadow-lg shadow-violet-500/15"
                    : "text-slate-600 hover:bg-violet-50 hover:text-violet-700"
                }`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                    active ? "bg-white/15" : "bg-violet-50 text-violet-600"
                  }`}
                >
                  {item.icon}
                </span>

                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="mt-auto pt-8">
          <div className="mb-5 border-t border-violet-100" />

          <Link
            href="/settings"
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
              isActive("/settings")
                ? "bg-gradient-to-r from-violet-700 to-purple-500 text-white shadow-lg shadow-violet-500/15"
                : "text-slate-600 hover:bg-violet-50 hover:text-violet-700"
            }`}
          >
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                isActive("/settings")
                  ? "bg-white/15"
                  : "bg-violet-50 text-violet-600"
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21H9.6v-.1A1.7 1.7 0 0 0 9.2 20a1.7 1.7 0 0 0-1-.6 1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 3.8 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H2V9.6h.1A1.7 1.7 0 0 0 3.2 9.2a1.7 1.7 0 0 0 .6-1 1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 8.2 3.8a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V2h4v.1A1.7 1.7 0 0 0 14 3.2a1.7 1.7 0 0 0 1 .6 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 8.2a1.7 1.7 0 0 0 .6 1 1.7 1.7 0 0 0 1.1.4h.1v4h-.1a1.7 1.7 0 0 0-1.1.4 1.7 1.7 0 0 0-.6 1Z" />
              </svg>
            </span>

            <span>Settings</span>
          </Link>

          {/* Admin identity placeholder */}
          <div className="mt-5 rounded-2xl border border-violet-100 bg-violet-50/60 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-700 to-purple-500 text-sm font-bold text-white">
                A
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-800">
                  Admin ICONIA
                </p>

                <p className="truncate text-xs text-slate-500">
                  Super Admin
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}